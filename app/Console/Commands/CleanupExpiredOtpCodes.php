<?php

namespace App\Console\Commands;

use App\Services\MfaService;
use Illuminate\Console\Command;

class CleanupExpiredOtpCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mfa:cleanup-expired-codes {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired OTP codes from the database';

    public function __construct(
        private MfaService $mfaService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for expired OTP codes...');
        
        // Get statistics before cleanup
        $stats = $this->mfaService->getOtpStats();
        $expiredCount = $stats['total_expired'] ?? 0;
        
        if ($expiredCount === 0) {
            $this->info('✅ No expired OTP codes found.');
            return Command::SUCCESS;
        }
        
        $this->warn("Found {$expiredCount} expired OTP codes.");
        
        // Ask for confirmation unless --force is used
        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to delete these expired codes?')) {
                $this->info('❌ Cleanup cancelled.');
                return Command::SUCCESS;
            }
        }
        
        // Perform cleanup
        $this->info('🧹 Cleaning up expired OTP codes...');
        $deletedCount = $this->mfaService->cleanupExpiredOtps();
        
        if ($deletedCount > 0) {
            $this->info("✅ Successfully deleted {$deletedCount} expired OTP codes.");
            
            // Show updated statistics
            $newStats = $this->mfaService->getOtpStats();
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total OTP Codes', $newStats['total_generated']],
                    ['Used Codes', $newStats['total_used']],
                    ['Active Codes', $newStats['active_codes']],
                    ['Expired Codes', $newStats['total_expired']],
                ]
            );
        } else {
            $this->warn('⚠️  No codes were deleted. They may have been cleaned up already.');
        }
        
        return Command::SUCCESS;
    }
}
