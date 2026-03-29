<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PositionHistory extends Model
{
    protected $fillable = [
        'member_id',
        'position',
        'term_year',
    ];

    protected $casts = [
        'term_year' => 'integer',
    ];

    public const OFFICER_POSITIONS = [
        'president',
        'vice_president',
        'secretary',
        'treasurer',
        'collector',
        'coordinator',
    ];

    public const POSITION_LABELS = [
        'president'      => 'President',
        'vice_president' => 'Vice-President',
        'secretary'      => 'Secretary',
        'treasurer'      => 'Treasurer',
        'collector'      => 'Collector',
        'coordinator'    => 'Coordinator',
        'member'         => 'Member',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
