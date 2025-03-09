<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RedisTest extends TestCase
{
    /**
     * Uji fungsi simpan dan ambil data dari Redis.
     */
    public function test_redis_can_store_and_retrieve_data()
    {
        // Data ujian
        $key = 'test_key';
        $value = 'Ini adalah data ujian';

        // Simpan data dalam Redis
        Cache::put($key, $value, 60);

        // Ambil data dari Redis
        $retrieved = Cache::get($key);

        // Pastikan data yang diambil sama dengan data yang disimpan
        $this->assertEquals($value, $retrieved);
    }

    /**
     * Uji fungsi hapus data dari Redis
     */
    public function test_redis_can_delete_data()
    {
        // Data ujian
        $key = 'delete_test_key';
        $value = 'Data yang akan dihapus';

        // Simpan data dalam Redis
        Cache::put($key, $value, 60);

        // Hapus data
        Cache::forget($key);

        // Pastikan data sudah tiada
        $this->assertNull(Cache::get($key));
    }

    /**
     * Uji fungsi expire time Redis
     */
    public function test_redis_respects_expiration_time()
    {
        // Data ujian
        $key = 'expire_test_key';
        $value = 'Data yang akan expire';

        // Simpan data dengan expire time 1 saat
        Cache::put($key, $value, 1);

        // Tunggu 2 saat
        sleep(2);

        // Pastikan data sudah expire
        $this->assertNull(Cache::get($key));
    }

    /**
     * Uji fungsi increment/decrement Redis
     */
    public function test_redis_can_increment_and_decrement()
    {
        $key = 'counter_test';
        
        // Set nilai awal
        Cache::put($key, 1, 60);

        // Increment
        Cache::increment($key);
        $this->assertEquals(2, Cache::get($key));

        // Increment dengan nilai tertentu
        Cache::increment($key, 3);
        $this->assertEquals(5, Cache::get($key));

        // Decrement
        Cache::decrement($key);
        $this->assertEquals(4, Cache::get($key));
    }
}
