<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Website extends Model
{
    protected $fillable = [
        'client_id',
        'url',
        'status',
        'status_code',
        'latency_ms',
        'last_checked_at',
        'last_error',
    ];

    protected $casts = [
        'last_checked_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
