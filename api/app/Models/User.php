<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Config;

class User extends Authenticatable
{
	/** @use HasFactory<\Database\Factories\UserFactory> */
	use HasApiTokens, HasFactory, Notifiable;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var list<string>
	 */
	protected $fillable = [
		'name',
		'username',
		'email',
		'password',
		'dept_id',
		'role_id',
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var list<string>
	 */
	protected $hidden = [
		'password',
		'remember_token',
	];

	/**
	 * Get the attributes that should be cast.
	 *
	 * @return array<string, string>
	 */
	protected function casts(): array
	{
		return [
			'email_verified_at' => 'datetime',
			'password' => 'hashed',
		];
	}


	public function department()
	{
		return $this->belongsTo(Department::class,'dept_id');
	}

	// Menetapkan role berdasarkan konstanta
	public function setRoleIdAttribute($value)
	{
		$roles = Config::get('constants.roles');

		// Menetapkan default ke 'user' jika tidak ada nilai yang diberikan
		$this->attributes['role_id'] = $value ?? $roles['user']; // Menggunakan 'user' sebagai default
	}

	// Menampilkan role dari ID
	public function getRoleAttribute()
	{
		$roles = Config::get('constants.roles');
		return array_search($this->role_id, $roles) ?: 'unknown';
	}

	public function isAdmin()
	{
		return $this->role_id === 1; // Assuming role_id 1 is for admin
	}
}
