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
    if (!$user->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT]) || 
        $billing->status_id !== BillingStatus::DRAFT || 
        ($user->hasAbility(UserAbilities::APPLICANT) && $billing->created_by !== $user->id)) {
      return false;
    }
    return true;
  }

  public function process(User $user, Billing $billing, $statusId = null): bool
  {
    if (!$user->hasAbility([
      UserAbilities::ADMIN,
      UserAbilities::HOD,
      UserAbilities::FINANCE_CHECKER,
      UserAbilities::FINANCE_VERIFIER,
      UserAbilities::FINANCE_APPROVER,
      UserAbilities::PAYMENT_MAKER
    ]) || $billing->status_id !== $statusId) {
      return false;
    }
    return true;
  }

  public function update(User $user, Billing $billing): bool
  {
    if ($user->hasAbility(UserAbilities::ADMIN) || 
        ($user->hasAbility(UserAbilities::APPLICANT) && 
         $billing->created_by === $user->id && 
         $billing->status_id === BillingStatus::DRAFT)) {
      return true;
    }
    return false;
  }
}
