<?php
// app/Models/User.php (Fixed with working isAdmin method)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Config;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array<int, string>
	 */
	protected $fillable = [
		'name',
		'email',
		'username',
		'password',
		'phone',
		'abilities',
		'department_id',
		'is_active'
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var array<int, string>
	 */
	protected $hidden = [
		'password',
		'remember_token',
	];

	/**
	 * The attributes that should be cast.
	 *
	 * @var array<string, string>
	 */
	protected $casts = [
		'email_verified_at' => 'datetime',
		'password' => 'hashed',
		'abilities' => 'array',  // Cast abilities sebagai array
		'phone' => 'string',
	];

	/**
	 * Get the position that owns the user.
	 */
	public function position()
	{
		return $this->belongsTo(Position::class);
	}

	/**
	 * Get the department that owns the user.
	 */
	public function department()
	{
		return $this->belongsTo(Department::class);
	}

	/**
	 * Check if user has any of the given abilities
	 *
	 * @param array|string|int $abilities ID ability atau array of ability IDs
	 * @return bool
	 */
	public function hasAbility($abilities)
	{
		// Jika user adalah admin
		if ($this->isAdmin()) {
			return true;
		}

		// Jika abilities adalah string atau integer, tukar ke array
		if (!is_array($abilities)) {
			$abilities = [$abilities];
		}

		// Semak jika ada persilangan antara abilities user dan abilities yang diperlukan
		return count(array_intersect($this->abilities ?? [], $abilities)) > 0;
	}

	/**
	 * Get ability names
	 *
	 * @return array
	 */
	public function getAbilityNames()
	{
		$names = [];
		foreach ($this->abilities ?? [] as $ability) {
			// Map ability IDs to names based on your system
			switch ($ability) {
				case 1:
					$names[] = 'admin';
					break;
				case 2:
					$names[] = 'applicant';
					break;
				case 3:
					$names[] = 'hod';
					break;
				case 4:
				case 5:
				case 6:
				case 7:
					if (!in_array('finance', $names)) {
						$names[] = 'finance';
					}
					break;
				default:
					$names[] = 'role_' . $ability;
					break;
			}
		}
		return $names;
	}

	/**
	 * Check if user is admin
	 *
	 * @return bool
	 */
	public function isAdmin()
	{
		// Check if user has admin ability (assuming 1 is admin ability ID)
		return in_array(1, $this->abilities ?? []);
	}

	/**
	 * Check if user has finance role
	 *
	 * @return bool
	 */
	public function isFinance()
	{
		$financeAbilities = [4, 5, 6, 7];  // Finance related abilities
		return !empty(array_intersect($financeAbilities, $this->abilities ?? []));
	}

	/**
	 * Check if user has HOD role
	 *
	 * @return bool
	 */
	public function isHOD()
	{
		return in_array(3, $this->abilities ?? []);
	}

	/**
	 * Check if user has applicant role
	 *
	 * @return bool
	 */
	public function isApplicant()
	{
		return in_array(2, $this->abilities ?? []);
	}

	/**
	 * Check if user has access to given menu
	 *
	 * @param string $menu Menu identifier (e.g. 'billing.create')
	 * @return bool
	 */
	public function hasMenuAccess($menu)
	{
		// Jika user adalah admin
		if ($this->isAdmin()) {
			return true;
		}

		// Define basic menu access based on abilities
		$menuAccess = [
			2 => ['billing.create', 'billing.view', 'profile'],  // Applicant
			3 => ['billing.approve', 'billing.view', 'profile'],  // HOD
			4 => ['billing.check', 'billing.view', 'profile'],  // Finance Checker
			5 => ['billing.verify', 'billing.view', 'profile'],  // Finance Verifier
			6 => ['billing.approve', 'billing.view', 'profile'],  // Finance Approver
			7 => ['billing.payment', 'billing.view', 'profile'],  // Payment Maker
		];

		// Get allowed menus for user's abilities
		$allowedMenus = [];
		foreach ($this->abilities ?? [] as $ability) {
			$menus = $menuAccess[$ability] ?? [];
			$allowedMenus = array_merge($allowedMenus, $menus);
		}

		return in_array($menu, $allowedMenus);
	}

	/**
	 * Get list of allowed menus for user
	 *
	 * @return array
	 */
	public function getAllowedMenus()
	{
		// Jika user adalah admin
		if ($this->isAdmin()) {
			return ['all'];
		}

		// Define menu access based on abilities
		$menuAccess = [
			2 => ['billing.create', 'billing.view', 'profile'],  // Applicant
			3 => ['billing.approve', 'billing.view', 'profile'],  // HOD
			4 => ['billing.check', 'billing.view', 'profile'],  // Finance Checker
			5 => ['billing.verify', 'billing.view', 'profile'],  // Finance Verifier
			6 => ['billing.approve', 'billing.view', 'profile'],  // Finance Approver
			7 => ['billing.payment', 'billing.view', 'profile'],  // Payment Maker
		];

		// Get allowed menus for user's abilities
		$allowedMenus = [];
		foreach ($this->abilities ?? [] as $ability) {
			$menus = $menuAccess[$ability] ?? [];
			$allowedMenus = array_merge($allowedMenus, $menus);
		}

		return array_values(array_unique($allowedMenus));
	}

	/**
	 * Get formatted phone number for display
	 */
	public function getFormattedPhoneAttribute()
	{
		if (!$this->phone)
			return null;

		// Remove + prefix for processing
		$cleaned = ltrim($this->phone, '+');

		// Malaysian phone number formatting
		if (substr($cleaned, 0, 2) === '60') {
			// Format: +60 12-345 6789
			$countryCode = substr($cleaned, 0, 2);
			$operatorCode = substr($cleaned, 2, 2);
			$firstPart = substr($cleaned, 4, 3);
			$secondPart = substr($cleaned, 7);

			return "+{$countryCode} {$operatorCode}-{$firstPart} {$secondPart}";
		}

		return $this->phone;
	}

	/**
	 * Set phone attribute with normalization
	 */
	public function setPhoneAttribute($value)
	{
		if ($value) {
			// Remove all non-numeric characters except +
			$phone = preg_replace('/[^0-9+]/', '', $value);

			// Convert Malaysian local format to international
			if (substr($phone, 0, 1) === '0' && strlen($phone) >= 10) {
				$phone = '6' . substr($phone, 1);
			}

			// Add + prefix if not present and is valid international number
			if (substr($phone, 0, 1) !== '+' && strlen($phone) >= 10) {
				$phone = '+' . $phone;
			}

			$this->attributes['phone'] = $phone;
		} else {
			$this->attributes['phone'] = null;
		}
	}
}
