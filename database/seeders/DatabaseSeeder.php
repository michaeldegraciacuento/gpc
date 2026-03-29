<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);

        // Create test users with roles
        $admin = User::factory()->create([
            'name' => 'Michael Cuento',
            'email' => 'amfufu.michael@gmail.com',
            'password' => 'password',
            'mfa_enabled' => '0',
        ]);
        $admin->assignRole('admin');

        // $serviceManager = User::factory()->create([
        //     'name' => 'Service Manager',
        //     'email' => 'service@example.com',
        //     'password' => 'password',
        // ]);
        // $serviceManager->assignRole('service_manager');

        // $salesRep = User::factory()->create([
        //     'name' => 'Sales Rep',
        //     'email' => 'sales@example.com',
        //     'password' => 'password',
        // ]);
        // $salesRep->assignRole('sales_rep');

        // $technician = User::factory()->create([
        //     'name' => 'Technician',
        //     'email' => 'tech@example.com',
        //     'password' => 'password',
        // ]);
        // $technician->assignRole('technician');
    }
}
