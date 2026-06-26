<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HelperController extends Controller
{
  /**
   * Format days into weeks and months
   * Now handles both integer and float values properly
   *
   * @param int|float $days
   * @return string
   */
  public static function formatDaysPending($days)
  {
    // Handle null or invalid values
    if (is_null($days) || !is_numeric($days)) {
      return 'Tidak diketahui';
    }

    // Convert to integer to avoid decimal places in display
    $days = (int) round($days);

    // Handle zero or negative days
    if ($days <= 0) {
      return 'Baru sahaja';
    }

    if ($days < 7) {
      return $days . ' hari';
    } elseif ($days < 30) {
      $weeks = floor($days / 7);
      $remainingDays = $days % 7;
      return $weeks . ' minggu' . ($remainingDays > 0 ? ' ' . $remainingDays . ' hari' : '');
    } else {
      $months = floor($days / 30);
      $remainingDays = $days % 30;
      
      if ($months > 12) {
        $years = floor($months / 12);
        $remainingMonths = $months % 12;
        return $years . ' tahun' . ($remainingMonths > 0 ? ' ' . $remainingMonths . ' bulan' : '');
      }
      
      return $months . ' bulan' . ($remainingDays > 0 ? ' ' . $remainingDays . ' hari' : '');
    }
  }

  /**
   * Format currency amount to Malaysian Ringgit
   *
   * @param float $amount
   * @return string
   */
  public static function formatCurrency($amount)
  {
    if (!is_numeric($amount)) {
      return 'RM 0.00';
    }

    return 'RM ' . number_format($amount, 2, '.', ',');
  }

  /**
   * Format percentage with proper rounding
   *
   * @param float $value
   * @param int $decimals
   * @return string
   */
  public static function formatPercentage($value, $decimals = 1)
  {
    if (!is_numeric($value)) {
      return '0%';
    }

    return round($value, $decimals) . '%';
  }

  /**
   * Format days with decimal for more precise display when needed
   *
   * @param float $days
   * @return string
   */
  public static function formatDaysWithDecimal($days)
  {
    if (is_null($days) || !is_numeric($days)) {
      return 'Tidak diketahui';
    }

    $days = round($days, 1);

    if ($days < 1) {
      $hours = round($days * 24, 0);
      return $hours . ' jam';
    } elseif ($days < 7) {
      return $days . ' hari';
    } else {
      return self::formatDaysPending($days);
    }
  }

  /**
   * Get status color class for UI
   *
   * @param int $statusId
   * @return string
   */
  public static function getStatusColorClass($statusId)
  {
    switch ($statusId) {
      case 1: // Draft
        return 'bg-gray-100 text-gray-800';
      case 2: // HOD Approval
        return 'bg-yellow-100 text-yellow-800';
      case 3: // Finance Review
        return 'bg-blue-100 text-blue-800';
      case 4: // Finance Verify
        return 'bg-indigo-100 text-indigo-800';
      case 5: // Finance Approval (if exists)
        return 'bg-purple-100 text-purple-800';
      case 6: // Processing Payment
        return 'bg-orange-100 text-orange-800';
      case 7: // Completed
        return 'bg-green-100 text-green-800';
      case 8: // Rejected
        return 'bg-red-100 text-red-800';
      case 9: // Returned
        return 'bg-yellow-100 text-yellow-800';
      case 10: // Cancelled
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get priority color class based on days pending
   *
   * @param int $days
   * @return string
   */
  public static function getPriorityColorClass($days)
  {
    if ($days >= 14) {
      return 'bg-red-100 text-red-800'; // Very High Priority
    } elseif ($days >= 7) {
      return 'bg-orange-100 text-orange-800'; // High Priority
    } elseif ($days >= 3) {
      return 'bg-yellow-100 text-yellow-800'; // Medium Priority
    } else {
      return 'bg-green-100 text-green-800'; // Normal Priority
    }
  }

  /**
   * Get priority text based on days pending
   *
   * @param int $days
   * @return string
   */
  public static function getPriorityText($days)
  {
    if ($days >= 14) {
      return 'Sangat Segera';
    } elseif ($days >= 7) {
      return 'Segera';
    } elseif ($days >= 3) {
      return 'Sederhana';
    } else {
      return 'Biasa';
    }
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   *
   * @param \Carbon\Carbon $startDate
   * @param \Carbon\Carbon $endDate
   * @return int
   */
  public static function getBusinessDays($startDate, $endDate)
  {
    $businessDays = 0;
    $currentDate = $startDate->copy();

    while ($currentDate->lte($endDate)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (!in_array($currentDate->dayOfWeek, [0, 6])) {
        $businessDays++;
      }
      $currentDate->addDay();
    }

    return $businessDays;
  }

  /**
   * Format time ago in Malay
   *
   * @param \Carbon\Carbon $date
   * @return string
   */
  public static function timeAgo($date)
  {
    if (!$date) {
      return 'Tidak diketahui';
    }

    $now = now();
    $diffInMinutes = $date->diffInMinutes($now);

    if ($diffInMinutes < 1) {
      return 'Baru sahaja';
    } elseif ($diffInMinutes < 60) {
      return $diffInMinutes . ' minit yang lalu';
    } elseif ($diffInMinutes < 1440) { // Less than 24 hours
      $hours = floor($diffInMinutes / 60);
      return $hours . ' jam yang lalu';
    } elseif ($diffInMinutes < 10080) { // Less than 7 days
      $days = floor($diffInMinutes / 1440);
      return $days . ' hari yang lalu';
    } else {
      return $date->format('d/m/Y');
    }
  }

  /**
   * Truncate text with proper handling of Malay characters
   *
   * @param string $text
   * @param int $length
   * @param string $suffix
   * @return string
   */
  public static function truncateText($text, $length = 50, $suffix = '...')
  {
    if (mb_strlen($text) <= $length) {
      return $text;
    }

    return mb_substr($text, 0, $length) . $suffix;
  }
}