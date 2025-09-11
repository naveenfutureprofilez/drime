<?php

namespace Common\Files\Tus;

use Common\Files\Tus\Exceptions\ConnectionException;
use Common\Files\Tus\Exceptions\FileException;
use Common\Files\Tus\Exceptions\OutOfRangeException;
use Common\Files\Tus\TusCache;
use Illuminate\Support\Facades\File;

class TusFile
{
    protected const INPUT_STREAM = 'php://input';
    protected const READ_BINARY = 'rb';
    protected const APPEND_BINARY = 'ab';

    protected int $offset = 0;
    protected int $totalBytes = 0;
    protected string $uploadKey;
    protected string $filePath;
    protected TusCache $cache;

    public function __construct(array $params)
    {
        $this->cache = app(TusCache::class);
        $this->uploadKey = $params['upload_key'];
        $this->totalBytes = $params['total_bytes'];
        $this->filePath = $params['file_path'];
        $this->offset = $params['offset'];
    }

    public function upload(): int
    {
        if ($this->offset === $this->totalBytes) {
            return $this->offset;
        }

        $method = config('common.site.uploads_tus_method') ?: 'wait';

        $input = $this->open(self::INPUT_STREAM, self::READ_BINARY);
        $output = $this->open($this->filePath, self::APPEND_BINARY);

        try {
            if ($method === 'loop') {
                $this->uploadUsingLoop($input, $output);
            } else {
                $this->uploadUsingCopyToStream($input, $output);
            }
        } finally {
            $this->cache->merge($this->uploadKey, [
                'offset' => $this->offset,
            ]);
            fclose($input);
            fclose($output);
        }

        return $this->offset;
    }

    /**
     * @param resource $input
     * @param resource $output
     */
    protected function uploadUsingLoop($input, $output): void
    {
        $chunkSize = 262144; // 256KB to match frontend chunk size
        $this->seek($output, $this->offset);
        $updateInterval = max(2097152, $chunkSize * 8); // Update cache every 2MB or 8 chunks
        $lastUpdate = $this->offset;

        while (!feof($input)) {
            if (CONNECTION_NORMAL !== connection_status()) {
                throw new ConnectionException('Connection aborted by user.');
            }

            // read
            $data = fread($input, $chunkSize);
            if ($data === false) {
                throw new FileException('Cannot read file.');
            }

            // write
            $bytesWritten = fwrite($output, $data, $chunkSize);
            if ($bytesWritten === false) {
                throw new FileException('Cannot write to a file.');
            }

            $this->offset += $bytesWritten;

            if ($this->offset > $this->totalBytes) {
                throw new OutOfRangeException('The uploaded file is corrupt.');
            }

            // Update cache periodically for progress tracking
            if ($this->offset - $lastUpdate >= $updateInterval || $this->offset === $this->totalBytes) {
                $this->cache->merge($this->uploadKey, [
                    'offset' => $this->offset,
                ]);
                $lastUpdate = $this->offset;
                
                // Add small delay to prevent rate limiting
                if ($this->offset < $this->totalBytes) {
                    usleep(5000); // 5ms delay to prevent overwhelming the client
                }
            }

            if ($this->offset === $this->totalBytes) {
                break;
            }
        }
    }

    /**
     * @param resource $input
     * @param resource $output
     */
    protected function uploadUsingCopyToStream($input, $output): void
    {
        $this->seek($output, $this->offset);

        $bytesWritten = stream_copy_to_stream($input, $output, null);

        if ($bytesWritten === false) {
            throw new FileException('Cannot write to a file.');
        }

        $this->offset += $bytesWritten;

        if ($this->offset > $this->totalBytes) {
            throw new OutOfRangeException('The uploaded file is corrupt.');
        }
    }

    protected function open(string $filePath, string $mode)
    {
        $this->exists($filePath, $mode);

        $resource = @fopen($filePath, $mode);

        if ($resource === false) {
            throw new FileException("Unable to open $filePath.");
        }

        return $resource;
    }

    public function exists(
        string $filePath,
        string $mode = self::READ_BINARY,
    ): bool {
        if (self::INPUT_STREAM === $filePath) {
            return true;
        }

        File::ensureDirectoryExists(storage_path('tus'));

        if (self::READ_BINARY === $mode && !file_exists($filePath)) {
            throw new FileException('File not found.');
        }

        return true;
    }

    public function seek($handle, int $offset): int
    {
        $position = fseek($handle, $offset);

        if (-1 === $position) {
            throw new FileException('Cannot move pointer to desired position.');
        }

        return $position;
    }
}
