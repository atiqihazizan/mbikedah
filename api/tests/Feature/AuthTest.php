<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected $department;
    protected $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a department
        $this->department = Department::create([
            'name' => 'Test Department',
            'code' => 'TEST'
        ]);

        // Create a test user
        $this->testUser = User::create([
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'department_id' => $this->department->id,
            'role_id' => 1 // Assuming 1 is a valid role_id
        ]);
    }

    public function test_user_can_login_with_correct_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'success',
                'token',
                'user' => [
                    'id',
                    'name',
                    'username',
                    'email',
                    'role_id',
                    'department_id',
                    'department'
                ]
            ]);
    }

    public function test_user_cannot_login_with_incorrect_password()
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_user_cannot_login_with_nonexistent_username()
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'nonexistentuser',
            'password' => 'password123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_user_cannot_login_without_credentials()
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'username',
                'password'
            ]);
    }
}
