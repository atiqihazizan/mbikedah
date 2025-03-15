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
      $billing->status_id !== BillingStatus::DRAFT ||
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
      $user->hasAbility(UserAbilities::ADMIN) ||
      ($user->hasAbility(UserAbilities::APPLICANT) &&
        $billing->created_by === $user->id &&
        $billing->status_id === BillingStatus::DRAFT)
    ) {
      return true;
    }
    return false;
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
}
