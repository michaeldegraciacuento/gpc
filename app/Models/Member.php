<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'phone',
        'address',
        'birthdate',
        'gender',
        'civil_status',
        'membership_type',
        'position',
        'status',
        'joined_at',
        'notes',
        'member_image',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'joined_at' => 'date',
    ];

    protected $appends = ['full_name', 'member_image_url'];

    /**
     * Auto-generate member_id (GPC-MDC-26001) on creation.
     * Format: GPC-{initials}-{YY}{sequence}
     * Initials = first letter of first_name + middle_name + last_name
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Member $member) {
            if (empty($member->member_id)) {
                $f = strtoupper(substr($member->first_name ?? '', 0, 1));
                $m = strtoupper(substr($member->middle_name ?? '', 0, 1)) ?: 'X';
                $l = strtoupper(substr($member->last_name ?? '', 0, 1));
                $initials = $f . $m . $l;

                $year = date('y'); // e.g. "26"
                $prefix = "GPC-{$initials}-{$year}";

                // Find the highest sequence number for this prefix
                $last = static::where('member_id', 'like', "{$prefix}%")
                    ->orderByRaw("CAST(SUBSTRING(member_id, " . (strlen($prefix) + 1) . ") AS UNSIGNED) DESC")
                    ->first();

                $next = $last ? (int) substr($last->member_id, strlen($prefix)) + 1 : 1;
                $member->member_id = $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function getFullNameAttribute(): string
    {
        return collect([$this->first_name, $this->middle_name, $this->last_name, $this->suffix])
            ->filter()
            ->implode(' ');
    }

    public function getMemberImageUrlAttribute(): ?string
    {
        if (!$this->member_image) {
            return null;
        }

        return asset('storage/' . $this->member_image);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function positionHistories(): HasMany
    {
        return $this->hasMany(PositionHistory::class);
    }
}
