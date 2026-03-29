<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            [
                'first_name'      => 'Juan',
                'middle_name'     => 'Santos',
                'last_name'       => 'Dela Cruz',
                'suffix'          => null,
                'email'           => 'juan.delacruz@example.com',
                'phone'           => '09171234567',
                'address'         => 'Brgy. Tibanga, Iligan City',
                'birthdate'       => '1985-03-15',
                'gender'          => 'male',
                'civil_status'    => 'married',
                'membership_type' => 'regular',
                'status'          => 'active',
                'joined_at'       => '2024-01-10',
            ],
            [
                'first_name'      => 'Maria',
                'middle_name'     => 'Reyes',
                'last_name'       => 'Garcia',
                'suffix'          => null,
                'email'           => 'maria.garcia@example.com',
                'phone'           => '09281234568',
                'address'         => 'Brgy. Pala-o, Iligan City',
                'birthdate'       => '1990-07-22',
                'gender'          => 'female',
                'civil_status'    => 'single',
                'membership_type' => 'regular',
                'status'          => 'active',
                'joined_at'       => '2024-03-05',
            ],
            [
                'first_name'      => 'Roberto',
                'middle_name'     => null,
                'last_name'       => 'Fernandez',
                'suffix'          => 'Jr.',
                'email'           => 'roberto.fernandez@example.com',
                'phone'           => '09391234569',
                'address'         => 'Brgy. Tambacan, Iligan City',
                'birthdate'       => '1978-11-08',
                'gender'          => 'male',
                'civil_status'    => 'married',
                'membership_type' => 'regular',
                'status'          => 'active',
                'joined_at'       => '2023-06-20',
            ],
            [
                'first_name'      => 'Angela',
                'middle_name'     => 'Lopez',
                'last_name'       => 'Santos',
                'suffix'          => null,
                'email'           => 'angela.santos@example.com',
                'phone'           => '09451234570',
                'address'         => 'Brgy. Hinaplanon, Iligan City',
                'birthdate'       => '1995-01-30',
                'gender'          => 'female',
                'civil_status'    => 'single',
                'membership_type' => 'regular',
                'status'          => 'active',
                'joined_at'       => '2025-01-15',
            ],
            [
                'first_name'      => 'Carlos',
                'middle_name'     => 'Bautista',
                'last_name'       => 'Mendoza',
                'suffix'          => null,
                'email'           => 'carlos.mendoza@example.com',
                'phone'           => '09561234571',
                'address'         => 'Brgy. Tubod, Iligan City',
                'birthdate'       => '1988-09-12',
                'gender'          => 'male',
                'civil_status'    => 'widowed',
                'membership_type' => 'regular',
                'status'          => 'active',
                'joined_at'       => '2025-08-01',
            ],
        ];

        foreach ($members as $data) {
            Member::create($data);
        }
    }
}
