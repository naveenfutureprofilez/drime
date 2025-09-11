<?php

namespace App\Http\Middleware;

use Common\Core\BaseVerifyCsrfToken;

class VerifyCsrfToken extends BaseVerifyCsrfToken
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'api/v1/guest/upload',
        'api/v1/guest/tus/entries',
        'api/v1/guest/upload/*/verify-password',
        'api/v1/quick-share/uploads',
        'api/v1/quick-share/email-share',
        'api/v1/tus/*', // TUS protocol endpoints
    ];
}
