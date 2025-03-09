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

    /**
     * Tentukan sama ada pengguna boleh kemaskini billing.
     */
    public function update(User $user, Billing $billing): bool
    {
        // Benarkan admin kemaskini apa-apa billing
        if ($user->hasAbility(1)) {
            return true;
        }

        // Benarkan pemohon kemaskini billing sendiri yang masih dalam status draft
        if ($user->hasAbility(2) && 
            $billing->created_by === $user->id && 
            $billing->status_id === 1) { // 1 = Draft
            return true;
        }

        return false;
    }
}
