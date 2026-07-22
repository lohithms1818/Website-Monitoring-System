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
            'https://www.stackoverflow.com',
            'https://www.youtube.com',
            'https://www.amazon.com',
            'https://www.reddit.com',
            'https://www.github.com',
            'https://www.apple.com',
            'https://thisiscompletelyfake.com',
            'https://notarealwebsite.com',
            'https://totallymadeup.com',
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
