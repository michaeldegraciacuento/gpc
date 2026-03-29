<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for PMS (Preventive Maintenance Service)
        // $pmsPermissions = [
        //     'pms.view',
        //     'pms.create',
        //     'pms.edit',
        //     'pms.delete',
        //     'pms.assign_technician',
        //     'pms.complete',
        //     'pms.override_schedule',
        // ];

        // Create permissions for Inventory Management
        // $inventoryPermissions = [
        //     'inventory.view',
        //     'inventory.create',
        //     'inventory.edit',
        //     'inventory.delete',
        //     'inventory.approve',
        //     'inventory.issue',
        //     'inventory.return',
        //     'inventory.audit',
        //     'inventory.reorder',
        // ];

        // Create permissions for Warranty Claims
        // $warrantyPermissions = [
        //     'warranty.view',
        //     'warranty.create',
        //     'warranty.edit',
        //     'warranty.delete',
        //     'warranty.approve',
        //     'warranty.audit',
        //     'warranty.reconcile',
        // ];

        // Create permissions for Sales & CRM
        // $salesPermissions = [
        //     'sales.view',
        //     'sales.create',
        //     'sales.edit',
        //     'sales.delete',
        //     'sales.assign_lead',
        //     'sales.manage_pipeline',
        //     'sales.test_drive',
        //     'sales.close_deal',
        // ];

        // Create permissions for Customer Management
        // $customerPermissions = [
        //     'customer.view',
        //     'customer.create',
        //     'customer.edit',
        //     'customer.delete',
        //     'customer.send_survey',
        //     'customer.view_history',
        // ];

        // Create permissions for Reporting & Analytics
        // $reportingPermissions = [
        //     'reports.view',
        //     'reports.create',
        //     'reports.export',
        //     'reports.kpi_dashboard',
        //     'reports.financial',
        // ];

        // Create permissions for Membership Management
        $memberPermissions = [
            'members.view',
            'members.create',
            'members.edit',
            'members.delete',
        ];

        // Create permissions for Payment Management
        $paymentPermissions = [
            'payments.view',
            'payments.create',
            'payments.edit',
            'payments.delete',
        ];

        // Create permissions for User Management
        $userPermissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.assign_roles',
            'users.reset_password',
        ];

        // Create permissions for Audit & Compliance
        // $auditPermissions = [
        //     'audit.view',
        //     'audit.export',
        //     'audit.supervisor_override',
        //     'compliance.view',
        //     'compliance.manage_checklists',
        // ];

        // Create permissions for System Administration
        $systemPermissions = [
            'system.settings',
            'system.backup',
            'system.maintenance',
            'system.logs',
        ];

        // Combine all permissions
        $allPermissions = array_merge(
            $memberPermissions,
            $paymentPermissions,
            // $pmsPermissions,
            // $inventoryPermissions,
            // $warrantyPermissions,
            // $salesPermissions,
            // $customerPermissions,
            // $reportingPermissions,
            $userPermissions,
            // $auditPermissions,
            $systemPermissions
        );

        // Create permissions
        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin role - has all permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo($allPermissions);

        // Service Manager role
        // $serviceManagerRole = Role::create(['name' => 'service_manager']);
        // $serviceManagerRole->givePermissionTo([
        //     // PMS permissions
        //     ...$pmsPermissions,
        //     // Warranty permissions
        //     ...$warrantyPermissions,
        //     // Customer permissions
        //     'customer.view',
        //     'customer.edit',
        //     'customer.send_survey',
        //     'customer.view_history',
        //     // Inventory view permissions
        //     'inventory.view',
        //     'inventory.issue',
        //     'inventory.return',
        //     // Reporting permissions
        //     'reports.view',
        //     'reports.kpi_dashboard',
        //     // Audit permissions
        //     'audit.view',
        //     'audit.supervisor_override',
        // ]);

        // // Parts Head role
        // $partsHeadRole = Role::create(['name' => 'parts_head']);
        // $partsHeadRole->givePermissionTo([
        //     // Full inventory permissions
        //     ...$inventoryPermissions,
        //     // Warranty reconciliation
        //     'warranty.view',
        //     'warranty.reconcile',
        //     // Reporting permissions
        //     'reports.view',
        //     'reports.kpi_dashboard',
        //     // Audit permissions
        //     'audit.view',
        // ]);

        // // Sales Representative role
        // $salesRepRole = Role::create(['name' => 'sales_rep']);
        // $salesRepRole->givePermissionTo([
        //     // Sales permissions
        //     'sales.view',
        //     'sales.create',
        //     'sales.edit',
        //     'sales.manage_pipeline',
        //     'sales.test_drive',
        //     'sales.close_deal',
        //     // Customer permissions
        //     'customer.view',
        //     'customer.create',
        //     'customer.edit',
        //     'customer.send_survey',
        //     'customer.view_history',
        //     // Basic reporting
        //     'reports.view',
        // ]);

        // // Technician role
        // $technicianRole = Role::create(['name' => 'technician']);
        // $technicianRole->givePermissionTo([
        //     // PMS permissions (limited)
        //     'pms.view',
        //     'pms.edit',
        //     'pms.complete',
        //     // Warranty permissions (limited)
        //     'warranty.view',
        //     'warranty.create',
        //     // Inventory permissions (limited)
        //     'inventory.view',
        //     'inventory.issue',
        //     'inventory.return',
        //     // Customer view
        //     'customer.view',
        // ]);

        // // Auditor role
        // $auditorRole = Role::create(['name' => 'auditor']);
        // $auditorRole->givePermissionTo([
        //     // Audit permissions
        //     ...$auditPermissions,
        //     // View-only permissions for most modules
        //     'pms.view',
        //     'inventory.view',
        //     'inventory.audit',
        //     'warranty.view',
        //     'warranty.audit',
        //     'sales.view',
        //     'customer.view',
        //     // Full reporting access
        //     ...$reportingPermissions,
        // ]);

        // // Sales Manager role
        // $salesManagerRole = Role::create(['name' => 'sales_manager']);
        // $salesManagerRole->givePermissionTo([
        //     // Full sales permissions
        //     ...$salesPermissions,
        //     // Customer permissions
        //     ...$customerPermissions,
        //     // Lead assignment
        //     'sales.assign_lead',
        //     // Reporting permissions
        //     'reports.view',
        //     'reports.create',
        //     'reports.kpi_dashboard',
        //     // Audit permissions
        //     'audit.view',
        // ]);

        // // Parts Clerk role
        // $partsClerkRole = Role::create(['name' => 'parts_clerk']);
        // $partsClerkRole->givePermissionTo([
        //     // Limited inventory permissions
        //     'inventory.view',
        //     'inventory.issue',
        //     'inventory.return',
        //     // Warranty view
        //     'warranty.view',
        //     // Customer view
        //     'customer.view',
        // ]);

        $this->command->info('Roles and permissions created successfully!');
    }
}
