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
    2 => ['dashboard.view', 'billing.create', 'billing.incomplete', 'billing.archive'],
    // Ketua Jabatan
    3 => ['dashboard.view', 'billing.hod'],
    // Penyemak Kewangan
    4 => ['dashboard.view', 'billing.finance'],
    // Pengesah Kewangan - UPDATED: Added report access
    5 => ['dashboard.view', 'billing.finance', 'report.budget.summary', 'report.income.statement', 'report.revenue.breakdown', 'report.expense.breakdown', 'report.detail'],
    // Pelulus Kewangan - UPDATED: Added report + settings access
    6 => ['dashboard.view', 'billing.finance', 'report.budget.summary', 'report.income.statement', 'report.revenue.breakdown', 'report.expense.breakdown', 'report.detail', 'settings.view', 'settings.bank', 'settings.code', 'settings.budget'],
    // Pembayar
    7 => ['dashboard.view', 'billing.finance'],

    // OLD CODE (for reference):
    // 2 => ['dashboard.view', 'billing.create', 'billing.incomplete', 'billing.archive'], // Pemohon
    // 3 => ['dashboard.view', 'billing.hod'], // Ketua Jabatan  
    // 4 => ['dashboard.view', 'billing.finance'], // Penyemak Kewangan
    // 5 => ['dashboard.view', 'billing.finance'], // Pengesah Kewangan
    // 6 => ['dashboard.view', 'billing.finance'], // Pelulus Kewangan
    // 7 => ['dashboard.view', 'billing.finance'], // Pembayar
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
