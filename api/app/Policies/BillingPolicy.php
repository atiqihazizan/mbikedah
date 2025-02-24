<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Billing;
use Illuminate\Auth\Access\HandlesAuthorization;

class BillingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can create a billing.
     */
    public function create(User $user): bool
    {
        // Allow admin and applicant to create billings
        return $user->hasAbility([1, 2]); // admin = 1, applicant = 2
    }

    /**
     * Determine whether the user can update the billing status.
     */
    public function process(User $user, Billing $billing): bool
    {
    return $user->hasAbility([1,3, 4, 5, 6, 7]); 
    }
}
