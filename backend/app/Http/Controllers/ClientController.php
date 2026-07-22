<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::query()
            ->select('id', 'email')
            ->with(['websites' => function ($query): void {
                $query->orderBy('url');
            }])
            ->orderBy('email')
            ->get()
            ->map(function (Client $client): array {
                return [
                    'id' => $client->id,
                    'email' => $client->email,
                    'websites' => $client->websites->map(function ($website): array {
                        return [
                            'id' => $website->id,
                            'url' => $website->url,
                            'status' => $website->status,
                            'status_code' => $website->status_code,
                            'latency_ms' => $website->latency_ms,
                            'last_checked_at' => $website->last_checked_at?->toIso8601String(),
                            'last_error' => $website->last_error,
                        ];
                    })->values(),
                ];
            });

        return response()->json($clients);
    }
}
