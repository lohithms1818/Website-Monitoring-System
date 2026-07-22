<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Website;
use Illuminate\Database\Seeder;

class ClientWebsiteSeeder extends Seeder
{
    public function run(): void
    {
        Client::truncate();
        Website::truncate();

        $client = Client::create(['email' => 'lohithms098@gmail.com']);

        $urls = [
            'https://www.google.com',
            'https://www.github.com',
            'https://www.stackoverflow.com',
            'https://invalid-nonexistent-domain-test-12345.local',
            'https://this-website-does-not-exist-fake.test',
        ];

        foreach ($urls as $url) {
            Website::create([
                'client_id' => $client->id,
                'url' => $url,
                'status' => 'pending'
            ]);
        }
    }
}
