<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Models\GuestUpload;
use Common\Files\Actions\CreateFileEntry;
use Common\Files\Actions\StoreFile;
use Common\Files\Actions\ValidateFileUpload;
use Common\Files\FileEntryPayload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Mail\GuestUploadSent;
use App\Events\GuestUploadDownloaded;
use Illuminate\Support\Facades\Storage;
use Common\Core\BaseController;

class QuickShareController extends BaseController
{
    /**
     * Initiate/complete guest uploads
     * Reuses FileEntriesController::store logic but skips auth
     */
    public function store(Request $request): JsonResponse
    {
        $parentId = (int) $request->input('parentId') ?: null;
        $request->merge(['parentId' => $parentId]);

        $file = $request->file('file');
        $payload = new FileEntryPayload($request->all());

        // Validate file upload without auth
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                function ($attribute, $value, $fail) use ($payload) {
                    $errors = app(ValidateFileUpload::class)->execute([
                        'extension' => $payload->clientExtension,
                        'size' => $payload->size,
                    ]);
                    if ($errors) {
                        $fail($errors->first());
                    }
                },
            ],
            'parentId' => 'nullable|exists:file_entries,id',
            'relativePath' => 'nullable|string',
            'retention_hours' => 'nullable|integer|min:1|max:168', // Max 7 days
            'sender_email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store file using the same logic as FileEntriesController
            app(StoreFile::class)->execute($payload, ['file' => $file]);

            // Create FileEntry with user_id = null (guest upload)
            $payload->ownerId = null; // Flag as guest
            $fileEntry = app(CreateFileEntry::class)->execute($payload);

            // Calculate expiration time
            $retentionHours = $request->input('retention_hours', config('app.guest_upload_default_expiry_hours', 72));
            $maxHours = config('app.guest_upload_max_expiry_hours', 168);
            $expiresAt = Carbon::now()->addHours(min($retentionHours, $maxHours));

            // Immediately create ShareableLink
            $shareableLink = ShareableLink::create([
                'entry_id' => $fileEntry->id,
                'hash' => Str::random(30),
                'is_guest' => true,
                'expires_at' => $expiresAt,
                'allow_download' => true,
                'allow_edit' => false,
            ]);

            // Persist guest_uploads meta row
            $guestUpload = GuestUpload::create([
                'hash' => Str::random(32),
                'file_entry_id' => $fileEntry->id,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'expires_at' => $expiresAt,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'link_id' => $shareableLink->hash,
                'sender_email' => $request->input('sender_email'),
                'total_size' => $file->getSize(),
                'metadata' => [
                    'upload_method' => 'quick-share',
                    'original_extension' => $file->getClientOriginalExtension(),
                ],
                'recipient_emails' => [],
            ]);

            // Return link URL in JSON
            $linkUrl = url("/quick-share/link/{$shareableLink->hash}");

            return response()->json([
                'message' => 'File uploaded successfully',
                'data' => [
                    'file_entry' => $fileEntry->load('users'),
                    'shareable_link' => [
                        'hash' => $shareableLink->hash,
                        'url' => $linkUrl,
                        'expires_at' => $shareableLink->expires_at,
                    ],
                    'guest_upload' => [
                        'hash' => $guestUpload->hash,
                        'filename' => $guestUpload->original_filename,
                        'size' => $guestUpload->file_size,
                        'mime_type' => $guestUpload->mime_type,
                    ],
                    'link_url' => $linkUrl,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send link emails
     */
    public function emailShare(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'link_hash' => 'required|string|exists:shareable_links,hash',
            'sender_email' => 'required|email',
            'recipient_emails' => 'required|array|min:1|max:10',
            'recipient_emails.*' => 'required|email',
            'message' => 'nullable|string|max:500',
            'sender_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $shareableLink = ShareableLink::where('hash', $request->input('link_hash'))
                ->where('is_guest', true)
                ->with('entry')
                ->first();

            if (!$shareableLink) {
                return response()->json([
                    'message' => 'Shareable link not found or invalid'
                ], 404);
            }

            if ($shareableLink->isExpired()) {
                return response()->json([
                    'message' => 'Shareable link has expired'
                ], 410);
            }

            $senderEmail = $request->input('sender_email');
            $recipientEmails = $request->input('recipient_emails');
            $message = $request->input('message');
            $senderName = $request->input('sender_name', $senderEmail);

            // Update guest upload record with email information
            $guestUpload = GuestUpload::where('link_id', $shareableLink->hash)->first();
            if ($guestUpload) {
                $guestUpload->update([
                    'sender_email' => $senderEmail,
                    'recipient_emails' => $recipientEmails,
                ]);
            }

            $linkUrl = url("/quick-share/link/{$shareableLink->hash}");
            $fileEntry = $shareableLink->entry;

            // Send emails to recipients using proper Mailable
            foreach ($recipientEmails as $recipientEmail) {
                Mail::to($recipientEmail)->queue(
                    new GuestUploadSent($shareableLink, $guestUpload, $senderName, $linkUrl, $message)
                );
            }

            return response()->json([
                'message' => 'Email(s) sent successfully',
                'data' => [
                    'sender_email' => $senderEmail,
                    'recipient_count' => count($recipientEmails),
                    'link_url' => $linkUrl,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send emails',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch lightweight payload for guest share page
     */
    public function showLink(string $hash): JsonResponse
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->with(['entry'])
            ->first();

        if (!$shareableLink) {
            return response()->json([
                'message' => 'Shareable link not found'
            ], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $fileEntry = $shareableLink->entry;
        $guestUpload = GuestUpload::where('link_id', $shareableLink->hash)->first();

        // Lightweight payload for guest share page
        $data = [
            'link' => [
                'hash' => $shareableLink->hash,
                'expires_at' => $shareableLink->expires_at,
                'allow_download' => $shareableLink->allow_download,
                'allow_edit' => $shareableLink->allow_edit,
                'has_password' => !is_null($shareableLink->password),
            ],
            'file' => [
                'id' => $fileEntry->id,
                'name' => $fileEntry->name,
                'size' => $fileEntry->file_size,
                'mime_type' => $fileEntry->mime,
                'extension' => $fileEntry->extension,
                'type' => $fileEntry->type,
                'created_at' => $fileEntry->created_at,
            ],
        ];

        // Add guest upload specific data if available
        if ($guestUpload) {
            $data['guest_upload'] = [
                'hash' => $guestUpload->hash,
                'original_filename' => $guestUpload->original_filename,
                'download_count' => $guestUpload->download_count,
                'max_downloads' => $guestUpload->max_downloads,
                'sender_email' => $guestUpload->sender_email,
                'last_downloaded_at' => $guestUpload->last_downloaded_at,
            ];
        }

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Download file through quick-share link
     */
    public function download(string $hash, Request $request): mixed
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->with('entry')
            ->first();

        if (!$shareableLink) {
            return response()->json(['message' => 'Shareable link not found'], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $guestUpload = GuestUpload::where('link_id', $shareableLink->hash)->first();
        if (!$guestUpload || !$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Check password if required
        if ($shareableLink->password) {
            $request->validate([
                'password' => 'required|string'
            ]);

            if (!password_verify($request->password, $shareableLink->password)) {
                return response()->json(['message' => 'Invalid password'], 401);
            }
        }

        try {
            $fileEntry = $shareableLink->entry;
            if (!$fileEntry) {
                return response()->json(['message' => 'File not found'], 404);
            }

            // Get file from storage
            $disk = Storage::disk(config('common.site.uploads_disk'));
            
            if (!$disk->exists($fileEntry->file_name)) {
                return response()->json(['message' => 'File not found in storage'], 404);
            }

            // Fire event for download tracking and notifications
            GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);

            return $disk->download(
                $fileEntry->file_name,
                $guestUpload->original_filename ?: $fileEntry->name
            );
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
