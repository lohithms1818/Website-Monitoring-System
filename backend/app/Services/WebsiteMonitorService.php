<?php

namespace App\Services;

use App\Mail\WebsiteDownMail;
use App\Models\Website;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class WebsiteMonitorService
{
    public function monitorAll(): void
    {
        Website::query()->with('client')->chunkById(100, function ($websites): void {
            foreach ($websites as $website) {
                $this->monitor($website);
            }
        });
    }

    public function monitor(Website $website): void
    {
        $startedAt = now();
        $previousStatus = $website->status;

        try {
            // Try HEAD request first for speed and bandwidth optimization
            $response = Http::timeout(10)->head($website->url);
            
            // If server returns 405 Method Not Allowed, fallback to GET
            if ($response->status() === 405) {
                $response = Http::timeout(10)->get($website->url);
            }
            
            $statusCode = $response->status();
            $newStatus = $statusCode >= 400 ? 'down' : 'up';
            $latencyMs = $startedAt->diffInMilliseconds(now());

            $website->forceFill([
                'status' => $newStatus,
                'status_code' => $statusCode,
                'latency_ms' => $latencyMs,
                'last_checked_at' => now(),
                'last_error' => null,
            ])->save();
        } catch (\Throwable $exception) {
            // Fallback to GET request if HEAD request fails due to connection or stream errors
            try {
                $response = Http::timeout(10)->get($website->url);
                $statusCode = $response->status();
                $newStatus = $statusCode >= 400 ? 'down' : 'up';
                $latencyMs = $startedAt->diffInMilliseconds(now());

                $website->forceFill([
                    'status' => $newStatus,
                    'status_code' => $statusCode,
                    'latency_ms' => $latencyMs,
                    'last_checked_at' => now(),
                    'last_error' => null,
                ])->save();
            } catch (\Throwable $getException) {
                $website->forceFill([
                    'status' => 'down',
                    'status_code' => null,
                    'latency_ms' => $startedAt->diffInMilliseconds(now()),
                    'last_checked_at' => now(),
                    'last_error' => $getException->getMessage(),
                ])->save();
            }
        }

        if ($previousStatus !== 'down' && $website->fresh()->status === 'down') {
            try {
                Mail::to($website->client->email)->send(new WebsiteDownMail($website));
                sleep(10); // Sleep 10s to prevent hitting SMTP rate limits (like Mailtrap 550)
            } catch (\Throwable $mailException) {
                // Log the mail exception so the monitoring loop isn't broken
                logger()->error("Failed to send email for {$website->url}: " . $mailException->getMessage());
            }
        }
    }
}
