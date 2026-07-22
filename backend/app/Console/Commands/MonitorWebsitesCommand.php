<?php

namespace App\Console\Commands;

use App\Services\WebsiteMonitorService;
use Illuminate\Console\Command;

class MonitorWebsitesCommand extends Command
{
    protected $signature = 'monitor:websites';

    protected $description = 'Check website homepages and email clients when a site is down';

    public function handle(WebsiteMonitorService $service): int
    {
        $service->monitorAll();

        return self::SUCCESS;
    }
}
