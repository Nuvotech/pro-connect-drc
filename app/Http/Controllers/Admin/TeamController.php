<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Professional;
use App\Models\User;
use App\Models\VehicleProvider;
use App\Notifications\StaffInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The capturers: staff who add professionals and fleets for review.
 */
class TeamController extends Controller
{
    /**
     * List the capturers and how much each has captured.
     */
    public function index(): Response
    {
        $capturers = User::query()
            ->where('role', User::ROLE_CAPTURER)
            ->orderBy('name')
            ->get();

        $professionalCounts = Professional::query()
            ->whereIn('onboarded_by_id', $capturers->pluck('id'))
            ->selectRaw('onboarded_by_id, count(*) as total')
            ->groupBy('onboarded_by_id')
            ->pluck('total', 'onboarded_by_id');

        $fleetCounts = VehicleProvider::query()
            ->whereIn('onboarded_by_id', $capturers->pluck('id'))
            ->selectRaw('onboarded_by_id, count(*) as total')
            ->groupBy('onboarded_by_id')
            ->pluck('total', 'onboarded_by_id');

        return Inertia::render('admin/team', [
            'capturers' => $capturers->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'isActive' => $user->isActive(),
                'captures' => (int) ($professionalCounts[$user->id] ?? 0) + (int) ($fleetCounts[$user->id] ?? 0),
                'addedAt' => $user->created_at?->isoFormat('ll'),
            ])->all(),
        ]);
    }

    /**
     * Add a capturer and email them a link to set their password.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'email')],
        ], [
            'email.unique' => __('An account with this email already exists.'),
        ]);

        $user = new User([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Str::password(32),
        ]);
        $user->forceFill(['role' => User::ROLE_CAPTURER, 'email_verified_at' => now()])->save();

        $user->notify(new StaffInvitation(Password::createToken($user)));

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name was added. They will get an email to set their password.', ['name' => $user->name])]);

        return back();
    }

    /**
     * Deactivate a capturer, or let them sign in again.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->isCapturer(), 404);

        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $user->forceFill(['deactivated_at' => $validated['is_active'] ? null : now()])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => $validated['is_active']
            ? __(':name can sign in again.', ['name' => $user->name])
            : __(':name has been deactivated.', ['name' => $user->name])]);

        return back();
    }
}
