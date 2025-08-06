<?php

namespace Common\Settings\Validators;

use Illuminate\Support\Arr;

class GuestUploadSettingsValidator
{
    const KEYS = [
        'guest_uploads.enabled',
        'guest_uploads.max_size_mb', 
        'guest_uploads.retention_days',
    ];

    public function fails(array $settings): ?array
    {
        $errors = [];

        // Validate enabled flag
        if (Arr::has($settings, 'guest_uploads.enabled')) {
            $enabled = Arr::get($settings, 'guest_uploads.enabled');
            if (!is_bool($enabled) && !in_array($enabled, ['true', 'false', '1', '0', 1, 0])) {
                $errors['guest_uploads.enabled'] = __('Guest uploads enabled must be true or false.');
            }
        }

        // Validate max file size
        if (Arr::has($settings, 'guest_uploads.max_size_mb')) {
            $maxSize = Arr::get($settings, 'guest_uploads.max_size_mb');
            
            if (!is_numeric($maxSize)) {
                $errors['guest_uploads.max_size_mb'] = __('Maximum file size must be a number.');
            } elseif ($maxSize < 1) {
                $errors['guest_uploads.max_size_mb'] = __('Maximum file size must be at least 1 MB.');
            } elseif ($maxSize > 2048) {
                $errors['guest_uploads.max_size_mb'] = __('Maximum file size cannot exceed 2048 MB.');
            }
        }

        // Validate retention period
        if (Arr::has($settings, 'guest_uploads.retention_days')) {
            $retentionDays = Arr::get($settings, 'guest_uploads.retention_days');
            
            if (!is_numeric($retentionDays)) {
                $errors['guest_uploads.retention_days'] = __('Retention period must be a number.');
            } elseif ($retentionDays < 1) {
                $errors['guest_uploads.retention_days'] = __('Retention period must be at least 1 day.');
            } elseif ($retentionDays > 365) {
                $errors['guest_uploads.retention_days'] = __('Retention period cannot exceed 365 days.');
            }
        }

        return empty($errors) ? null : $errors;
    }
}
