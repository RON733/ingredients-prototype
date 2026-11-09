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

            // 2. Auto-pull inventory levels from Loyverse (PO receipts & counts)
            try {
                $invRes = $loyverse->pullInventoryFromLoyverse();
                if (!empty($invRes['updated_count'])) {
                    $this->info("Stock levels updated for {$invRes['updated_count']} ingredient(s).");
                }
            } catch (\Exception $e) {
                // Non-blocking
            }

            // 3. Auto-pull new or updated menu items from Loyverse into website catalog
            try {
                $itemsRes = $loyverse->pullItemsFromLoyverse();
                if (!empty($itemsRes['created_count'])) {
                    $this->info("Auto-imported {$itemsRes['created_count']} new menu item(s) from Loyverse: " . implode(', ', $itemsRes['created']));
                }
                if (!empty($itemsRes['updated_count'])) {
                    $this->info("Updated {$itemsRes['updated_count']} menu item(s) from Loyverse: " . implode(', ', $itemsRes['updated']));
                }
            } catch (\Exception $e) {
                // Non-blocking
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Loyverse sync failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
