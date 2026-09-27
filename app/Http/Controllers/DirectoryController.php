<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DirectoryController extends Controller
{
    /**
     * Show the professionals listed under a category.
     */
    public function category(string $category): Response
    {
        return Inertia::render('public/category', [
            'slug' => $category,
        ]);
    }

    /**
     * Show a professional's public profile.
     */
    public function professional(string $professional): Response
    {
        return Inertia::render('public/professional', [
            'slug' => $professional,
        ]);
    }
}
