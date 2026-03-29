<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    /**
     * Record an activity log entry.
     */
    protected function logActivity(
        string $action,
        Model $subject,
        string $description,
        ?array $properties = null,
    ): ActivityLog {
        return ActivityLog::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'subject_type' => get_class($subject),
            'subject_id'   => $subject->getKey(),
            'description'  => $description,
            'properties'   => $properties,
        ]);
    }

    /**
     * Build a human-readable changes description from old vs new model values.
     *
     * Returns something like:
     *   "first_name: Mac Story → MAC STORIES, status: active → inactive"
     *
     * @param  array<string, mixed>  $old  Original attribute values (before update)
     * @param  array<string, mixed>  $new  New attribute values (after update)
     * @param  array<string, string> $labels  Optional field→label map for prettier output
     * @return array{description: string, changes: array}
     */
    protected function buildChanges(array $old, array $new, array $labels = []): array
    {
        $changes = [];

        foreach ($new as $key => $newValue) {
            // Skip internal/non-display fields
            if (in_array($key, ['proof_image', 'remove_proof_image', 'recorded_by', 'updated_at', 'created_at'])) {
                continue;
            }

            $oldValue = $old[$key] ?? null;

            // Cast to string first (handles Carbon objects, etc.)
            $oldNorm = $oldValue !== null ? (string) $oldValue : '';
            $newNorm = $newValue !== null ? (string) $newValue : '';

            // Normalise dates — strip time portion so
            // "1996-11-20T00:00:00.000000Z" or "1996-11-20 00:00:00" matches "1996-11-20"
            if (preg_match('/^(\d{4}-\d{2}-\d{2})[T ]/', $oldNorm, $m)) {
                $oldNorm = $m[1];
            }
            if (preg_match('/^(\d{4}-\d{2}-\d{2})[T ]/', $newNorm, $m)) {
                $newNorm = $m[1];
            }

            // Compare normalised values
            if ($oldNorm !== $newNorm) {
                $label = $labels[$key] ?? str_replace('_', ' ', $key);
                $from  = $oldNorm !== null && $oldNorm !== '' ? $oldNorm : '(empty)';
                $to    = $newNorm !== null && $newNorm !== '' ? $newNorm : '(empty)';

                $changes[] = [
                    'field' => $label,
                    'from'  => $from,
                    'to'    => $to,
                ];
            }
        }

        $parts = array_map(
            fn ($c) => "{$c['field']}: {$c['from']} → {$c['to']}",
            $changes
        );

        return [
            'description' => implode(', ', $parts),
            'changes'     => $changes,
        ];
    }
}
