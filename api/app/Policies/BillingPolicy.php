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
     * Tentukan sama ada pengguna boleh menghantar billing kepada HOD.
     */
    public function sendToHod(User $user, Billing $billing): bool
    {
        // Benarkan admin dan kerani sahaja
        if (!$user->hasAbility([1, 2])) { // admin = 1, clerk = 2
            return false;
        }

        // Pastikan billing dalam status draft
        if ($billing->status_id !== 1) { // 1 = Draft
            return false;
        }

        // Pastikan kerani hanya boleh hantar billing yang dia buat
        if ($user->hasAbility(2) && $billing->created_by !== $user->id) {
            return false;
        }

        return true;
    }

    /**
     * Tentukan sama ada pengguna boleh mengemaskini status billing.
     * Nota: Ini tidak termasuk penghantaran kepada HOD (guna sendToHod)
     */
    public function process(User $user, Billing $billing): bool
    {
        // Benarkan HOD dan pegawai kewangan sahaja
        return $user->hasAbility([1,3, 4, 5, 6, 7]); // admin=1, hod=3, finance=4,5,6, payment=7
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
