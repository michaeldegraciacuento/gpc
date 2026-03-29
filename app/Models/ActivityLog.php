<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * Human-readable labels for subject types.
     */
    public const SUBJECT_LABELS = [
        'App\\Models\\Member'      => 'Member',
        'App\\Models\\Payment'     => 'Payment',
        'App\\Models\\PaymentType' => 'Payment Type',
    ];

    /**
     * The user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The subject of the activity (polymorphic).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get a human-readable subject type label.
     */
    public function getSubjectLabelAttribute(): string
    {
        return self::SUBJECT_LABELS[$this->subject_type] ?? class_basename($this->subject_type);
    }
}
