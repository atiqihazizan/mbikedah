<?php

namespace App\Constants;

class UserAbilities
{
  const ADMIN = 1;
  const APPLICANT = 2;
  const HOD = 3;
  const FINANCE_CHECKER = 4;
  const FINANCE_VERIFIER = 5;
  const FINANCE_APPROVER = 6;
  const FINANCE_PAYMENT = 7;

  public static function getAbilitiesName()
  {
    return [
      self::ADMIN => 'Admin',
      self::APPLICANT => 'Applicant',
      self::HOD => 'HOD',
      self::FINANCE_CHECKER => 'Finance Checker',
      self::FINANCE_VERIFIER => 'Finance Verifier',
      self::FINANCE_APPROVER => 'Finance Approver',
      self::FINANCE_PAYMENT => 'Finance Payment',
    ];
  }
}
