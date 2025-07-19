<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Config;
use App\Constants\UserAbilities;

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
    'abilities' => 'array', // Cast abilities sebagai array
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
    if (in_array(UserAbilities::ADMIN, $this->abilities)) {
      return true;
    }

    // Jika abilities adalah string atau integer, tukar ke array
    if (!is_array($abilities)) {
      $abilities = [$abilities];
    }

    // Semak jika ada persilangan antara abilities user dan abilities yang diperlukan
    return count(array_intersect($this->abilities, $abilities)) > 0;
  }

  /**
   * Get ability names
   * 
   * @return array
   */
  public function getAbilityNames()
  {
    $names = [];
    foreach ($this->abilities as $ability) {
      // $name = UserAbilities::getAbilitiesName()[$ability];
      // if ($name) {
      //   $names[] = $name;
      // }
      $finance = [
        UserAbilities::FINANCE_CHECKER,
        UserAbilities::FINANCE_VERIFIER,
        UserAbilities::FINANCE_APPROVER,
        UserAbilities::PAYMENT_MAKER,
      ];

      if($ability === UserAbilities::ADMIN) $names[] = 'admin';
      if($ability === UserAbilities::APPLICANT) $names[] = 'applicant';
      if($ability === UserAbilities::HOD) $names[] = 'hod';
      if(in_array($ability,$finance) && !in_array('finance',$names)) $names[] = 'finance';
    }
    return $names;
  }

  /**
   * Check if user is admin
   */
  public function isAdmin()
  {
    return in_array(UserAbilities::ADMIN, $this->abilities);
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

    // Dapatkan menu yang dibenarkan untuk setiap ability
    $allowedMenus = [];
    foreach ($this->abilities as $ability) {
      $menus = UserAbilities::ABILITIES_MENU[$ability] ?? [];
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

    // Dapatkan menu yang dibenarkan untuk setiap ability
    $allowedMenus = [];
    foreach ($this->abilities as $ability) {
      $menus = UserAbilities::ABILITIES_MENU[$ability] ?? [];
      $allowedMenus = array_merge($allowedMenus, $menus);
    }

    return array_values(array_unique($allowedMenus));
  }
}
