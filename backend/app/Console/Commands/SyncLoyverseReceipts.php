<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\LoyverseService;

class SyncLoyverseReceipts extends Command
{
    protected $signature = 'loyverse:sync {--since= : ISO timestamp to sync receipts from}';
    protected $description = 'Synchronize receipts from Loyverse POS and deduct kitchen ingredient inventory';

    public function handle(LoyverseService $loyverse)
    {
        $this->info('Starting Loyverse POS sync...');
        $since = $this->option('since');

        try {
            $results = $loyverse->syncRecentReceipts($since);
            $this->info("Found: {$results['total_found']} receipts.");
            $this->info("Newly Synced: {$results['synced']} receipts.");
            $this->info("Already Synced: {$results['already_synced']} receipts.");
            $this->info("Skipped: {$results['skipped']} receipts.");

            if (!empty($results['details'])) {
                foreach ($results['details'] as $detail) {
                    if (($detail['status'] ?? '') === 'success') {
                        $this->line(" - Synced Order: {$detail['order_number']} (?{$detail['total']})");
                        foreach ($detail['deductions'] as $ded) {
                            $this->line("   * {$ded}");
                        }
                    }
                }
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Loyverse sync failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
