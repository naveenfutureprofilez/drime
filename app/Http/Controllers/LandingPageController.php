<?php

namespace App\Http\Controllers;

use Common\Billing\Models\Product;
use Common\Core\BaseController;

class LandingPageController extends BaseController
{
    public function __invoke()
    {
        // Temporarily override homepage settings to show transfer page
        settings()->set('homepage.type', 'transfer-homepage');
        
        return $this->renderClientOrApi([
            'data' => []
        ]);
    }
}
