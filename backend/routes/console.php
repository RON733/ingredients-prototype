<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Synchronize Loyverse POS receipts every minute to keep online dashboard and physical store in sync
Schedule::command('loyverse:sync')->everyMinute();
