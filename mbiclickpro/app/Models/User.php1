<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Config;

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
    'ability_id',
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
  ];

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
   * @param array|string $abilities
   * @return bool
   */
  public function hasAbility($abilities)
  {
    if (is_array($abilities)) {
      return in_array($this->ability_id, $abilities);
    }
    return $this->ability_id === $abilities;
  }

  /**
   * Get the ability name
   *
   * @return string
   */
  public function getAbilityName()
  {
    return Config::get('constants.abilities')[$this->ability_id] ?? 'Unknown';
  }

  /**
   * Check if user is admin
   */
  public function isAdmin()
  {
    $abilities = Config::get('constants.abilities');
    return $this->ability_id === $abilities['admin'];
  }
}
