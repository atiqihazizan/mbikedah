<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingSequence extends Model
{
    protected $fillable = [
        'prefix',
        'sequence',
        'year',
        'padding'
    ];

    /**
     * Dapatkan nombor seterusnya untuk tahun tertentu
     */
    public static function getNextNumber(string $prefix = 'INV', int $year = null): string
    {
        if ($year === null) {
            $year = now()->year;
        }

        $sequence = self::firstOrCreate(
            ['prefix' => $prefix, 'year' => $year],
            ['sequence' => 0, 'padding' => 3]
        );

        $sequence->increment('sequence');

        return $prefix . str_pad($sequence->sequence, $sequence->padding, '0', STR_PAD_LEFT);
    }

    /**
     * Set semula sequence untuk tahun tertentu
     */
    public static function resetSequence(string $prefix = 'INV', int $year = null): void
    {
        if ($year === null) {
            $year = now()->year;
        }

        self::updateOrCreate(
            ['prefix' => $prefix, 'year' => $year],
            ['sequence' => 0]
        );
    }

    /**
     * Tukar prefix untuk tahun tertentu
     */
    public static function updatePrefix(string $oldPrefix, string $newPrefix, int $year = null): void
    {
        if ($year === null) {
            $year = now()->year;
        }

        $sequence = self::where('prefix', $oldPrefix)
            ->where('year', $year)
            ->first();

        if ($sequence) {
            $sequence->update(['prefix' => $newPrefix]);
        }
    }

    /**
     * Tukar padding untuk tahun tertentu
     */
    public static function updatePadding(string $prefix = 'INV', int $padding = 3, int $year = null): void
    {
        if ($year === null) {
            $year = now()->year;
        }

        self::updateOrCreate(
            ['prefix' => $prefix, 'year' => $year],
            ['padding' => $padding]
        );
    }
}
