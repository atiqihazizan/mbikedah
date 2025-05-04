<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Billing;
use App\Constants\UserAbilities;
use App\Constants\BillingStatus;
use Illuminate\Auth\Access\HandlesAuthorization;

class BillingPolicy
{
  use HandlesAuthorization;

  public function create(User $user): bool
  {
    return $user->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT]);
  }

  public function sendToHod(User $user, Billing $billing): bool
  {
    if (
      !$user->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT]) ||
      !in_array($billing->status_id, [BillingStatus::DRAFT, BillingStatus::RETURNED]) ||
      ($user->hasAbility(UserAbilities::APPLICANT) && $billing->created_by !== $user->id)
    ) {
      return false;
    }
    return true;
  }

  public function process(User $user, Billing $billing, $statusId = null): bool
  {
    if (
      !$user->hasAbility([UserAbilities::ADMIN, UserAbilities::HOD, UserAbilities::FINANCE_CHECKER, UserAbilities::FINANCE_VERIFIER, UserAbilities::FINANCE_APPROVER, UserAbilities::PAYMENT_MAKER])
      || in_array($statusId, [BillingStatus::DRAFT, BillingStatus::COMPLETED, BillingStatus::CANCELLED, BillingStatus::REJECTED, BillingStatus::RETURNED])
      || $billing->status_id !== $statusId
    ) {
      return false;
    }
    return true;
  }

  public function reject(User $user, Billing $billing): bool
  {
    if (
      !$user->hasAbility([UserAbilities::ADMIN, UserAbilities::HOD, UserAbilities::FINANCE_CHECKER, UserAbilities::FINANCE_VERIFIER, UserAbilities::FINANCE_APPROVER, UserAbilities::PAYMENT_MAKER])
      || in_array($billing->status_id, [BillingStatus::DRAFT, BillingStatus::COMPLETED, BillingStatus::CANCELLED])
    ) {
      return false;
    }
    return true;
  }

  public function update(User $user, Billing $billing): bool
  {
    if (
      !$user->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT]) ||
      !in_array($billing->status_id, [BillingStatus::DRAFT, BillingStatus::RETURNED]) ||
      ($user->hasAbility(UserAbilities::APPLICANT) && $billing->created_by !== $user->id)
    ) {
      return false;
    }
    return true;
  }
  public function delete(User $user, Billing $billing): bool
  {
    if (
      $user->hasAbility(UserAbilities::ADMIN) ||
      ($user->hasAbility(UserAbilities::APPLICANT) &&
        $billing->created_by === $user->id &&
        $billing->status_id === BillingStatus::DRAFT)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Determine whether the user can view the billing.
   * Ini juga digunakan untuk menentukan sama ada pengguna boleh mencetak billing.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Billing  $billing
   * @return bool
   */
  public function view(User $user, Billing $billing): bool
  {
    // Semua pengguna yang mempunyai akses ke sistem boleh melihat dan mencetak billing
    // Tambah syarat tambahan jika perlu
    return true;
  }
}
