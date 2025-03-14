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
  const PAYMENT_MAKER = 7;

  const ABILITIES_MENU = [
    // Admin boleh akses semua menu
    1 => ['all'],
    // Pemohon
    2 => ['billing.create', 'billing.incomplete', 'billing.archive'],
    // Ketua Jabatan
    3 => ['billing.hod'],
    // Penyemak Kewangan
    4 => ['billing.finance'],
    // Pengesah Kewangan
    5 => ['billing.finance'],
    // Pelulus Kewangan
    6 => ['billing.finance'],
    // Pembayar
    7 => ['billing.finance'],
  ];

  public static function getAbilitiesName()
  {
    return [
      self::ADMIN => 'Pentadbir',
      self::APPLICANT => 'Pemohon',
      self::HOD => 'Ketua Jabatan',
      self::FINANCE_CHECKER => 'Pemeriksa Kewangan',
      self::FINANCE_VERIFIER => 'Penyemak Kewangan',
      self::FINANCE_APPROVER => 'Pengesah Kewangan',
      self::PAYMENT_MAKER => 'Pembuat Bayaran',
    ];
  }
}
