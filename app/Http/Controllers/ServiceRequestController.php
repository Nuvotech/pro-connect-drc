<?php

namespace App\Http\Controllers;

use App\Actions\ResolveCustomer;
use App\Http\Requests\StoreServiceRequestRequest;
use App\Http\Resources\PublicCategoryResource;
use App\Models\Category;
use App\Models\City;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\NewCustomerRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Business service requests sent from the public form.
 */
class ServiceRequestController extends Controller
{
    /**
     * Show the business service request form.
     */
    public function create(): Response
    {
        return Inertia::render('public/service-request', [
            'businessCategories' => PublicCategoryResource::collection(
                Category::query()->inGroup(Category::GROUP_BUSINESS)->where('is_active', true)->orderBy('name')->get(),
            )->resolve(),
        ]);
    }

    /**
     * Save the request and its optional attachment for the team to handle.
     */
    public function store(StoreServiceRequestRequest $request, ResolveCustomer $resolveCustomer): RedirectResponse
    {
        $province = $request->validated('province');
        $cityName = $province === StoreServiceRequestRequest::OTHER_PROVINCE ? null : $province;

        $serviceRequest = DB::transaction(function () use ($request, $resolveCustomer, $cityName) {
            $customer = $resolveCustomer([
                ...$request->safe()->only(['full_name', 'phone', 'email', 'organization', 'contact_channel']),
                'city' => $cityName,
            ], $request->user());

            $serviceRequest = new ServiceRequest([
                'description' => $request->validated('description'),
                'timeline' => $request->validated('timeline'),
                'status' => ServiceRequest::STATUS_NEW,
            ]);
            $serviceRequest->customer()->associate($customer);
            $serviceRequest->category()->associate(Category::where('slug', $request->validated('category'))->sole());
            $serviceRequest->city()->associate($cityName ? City::where('name', $cityName)->first() : null);

            if ($request->hasFile('attachment')) {
                $serviceRequest->attachment_path = $request->file('attachment')->store('service-requests', 'local');
            }

            $serviceRequest->save();

            return $serviceRequest;
        });

        Notification::send(User::where('role', User::ROLE_ADMIN)->get(), new NewCustomerRequest($serviceRequest->refresh()));

        Inertia::flash('reference', $serviceRequest->reference);

        return back();
    }
}
