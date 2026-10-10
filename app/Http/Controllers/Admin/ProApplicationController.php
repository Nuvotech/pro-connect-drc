<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveProApplicationRequest;
use App\Http\Requests\Admin\DeclineProApplicationRequest;
use App\Http\Resources\ProApplicationResource;
use App\Models\Category;
use App\Models\ProApplication;
use App\Notifications\ProApplicationReviewed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * People asking to join as pros. Approving one unlocks their dashboard.
 */
class ProApplicationController extends Controller
{
    /**
     * Show the sign-up queue for one status, oldest first, with the
     * selected application's details.
     */
    public function index(Request $request): Response
    {
        $selected = $request->integer('application') ?: null;
        $status = $selected
            ? ProApplication::whereKey($selected)->value('status')
            : $request->string('status')->toString();
        $status = in_array($status, ProApplication::STATUSES, true) ? $status : ProApplication::STATUS_PENDING;

        $applications = ProApplication::query()
            ->where('status', $status)
            ->with(['user:id,email,phone,email_verified_at', 'city:id,name', 'commune:id,name', 'categories', 'customServices.category', 'reviewedBy:id,name'])
            ->oldest()
            ->get();

        return Inertia::render('admin/sign-ups', [
            'status' => $status,
            'selectedId' => $selected,
            'applications' => ProApplicationResource::collection($applications)->resolve(),
            'counts' => collect(ProApplication::STATUSES)
                ->mapWithKeys(fn (string $tabStatus) => [$tabStatus => ProApplication::where('status', $tabStatus)->count()]),
            'categoryGroups' => Category::groupedOptions(),
        ]);
    }

    /**
     * Approve the applicant, resolving the services they typed in.
     */
    public function approve(ApproveProApplicationRequest $request, ProApplication $application): RedirectResponse
    {
        $application->load('customServices', 'user');
        $application->approve($request->user(), $request->validated('custom_services', []));
        $application->user->notify(new ProApplicationReviewed($application));

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name can now set up their listing.', ['name' => $application->full_name])]);

        return to_route('admin.sign-ups.index', ['status' => ProApplication::STATUS_PENDING]);
    }

    /**
     * Decline the applicant with a reason.
     */
    public function decline(DeclineProApplicationRequest $request, ProApplication $application): RedirectResponse
    {
        $application->decline($request->user(), $request->validated('message'));
        $application->user->notify(new ProApplicationReviewed($application));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Application declined. :name has been told why.', ['name' => $application->full_name])]);

        return to_route('admin.sign-ups.index', ['status' => ProApplication::STATUS_PENDING]);
    }
}
