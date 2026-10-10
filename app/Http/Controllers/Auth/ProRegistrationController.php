<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ProRegistrationRequest;
use App\Models\Category;
use App\Models\City;
use App\Models\ProApplication;
use App\Models\User;
use App\Notifications\NewProApplication;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ProRegistrationController extends Controller
{
    /**
     * Show the join form, with every category a pro can offer and the
     * places they can be based.
     */
    public function create(): Response
    {
        return Inertia::render('public/become-a-pro', [
            'categoryGroups' => Category::groupedOptions(),
            'cities' => City::options(),
            'maxCustomServices' => ProApplication::MAX_CUSTOM_SERVICES,
        ]);
    }

    /**
     * Create the pro's account and their application. The dashboard stays
     * locked until an admin approves the application.
     */
    public function store(ProRegistrationRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->validated('full_name'),
                'email' => $request->validated('email'),
                'phone' => User::normalizePhone($request->validated('phone')),
                'password' => $request->validated('password'),
            ]);

            $application = new ProApplication($request->safe()->only([
                'provider_type',
                'full_name',
                'business_name',
                'phone',
                'is_on_whatsapp',
                'description',
            ]));
            $application->placeIn($request->validated('city'), $request->validated('commune'));
            $application->user()->associate($user);
            $application->save();

            $application->categories()->sync(Category::idsForSlugs($request->validated('categories', [])));
            $application->customServices()->createMany(
                collect($request->validated('custom_services', []))
                    ->map(fn (string $name) => ['name' => $name])
                    ->all(),
            );

            return $user;
        });

        event(new Registered($user));

        Notification::send(
            User::where('role', User::ROLE_ADMIN)->get(),
            new NewProApplication($user->proApplication),
        );

        Auth::login($user);
        $request->session()->regenerate();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks for applying! We will review your application shortly.')]);

        return to_route('dashboard');
    }
}
