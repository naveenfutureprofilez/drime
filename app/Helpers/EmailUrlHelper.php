<?php

namespace App\Helpers;

class EmailUrlHelper
{
    /**
     * Get the proper domain URL for email links.
     * Uses DOMAIN_URL from env if current APP_URL is localhost
     */
    public static function getEmailDomain(): string
    {
        $appUrl = config('app.url');
        $domainUrl = env('DOMAIN_URL');
        
        // If APP_URL contains localhost and we have a DOMAIN_URL, use the domain URL
        if (str_contains($appUrl, 'localhost') && $domainUrl) {
            return rtrim($domainUrl, '/');
        }
        
        return rtrim($appUrl, '/');
    }
    
    /**
     * Generate a URL for email using the proper domain
     */
    public static function emailUrl(string $path): string
    {
        return self::getEmailDomain() . '/' . ltrim($path, '/');
    }
}
