<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user')->latest();

        // Filter by action
        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        // Filter by subject type
        if ($type = $request->input('type')) {
            $typeMap = [
                'member'       => 'App\\Models\\Member',
                'payment'      => 'App\\Models\\Payment',
                'payment_type' => 'App\\Models\\PaymentType',
            ];
            if (isset($typeMap[$type])) {
                $query->where('subject_type', $typeMap[$type]);
            }
        }

        // Search description
        if ($search = $request->input('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        $logs = $query->paginate(20)->withQueryString();

        // Transform for frontend
        $logs->getCollection()->transform(function (ActivityLog $log) {
            return [
                'id'              => $log->id,
                'action'          => $log->action,
                'subject_type'    => $log->subject_label,
                'subject_id'      => $log->subject_id,
                'description'     => $log->description,
                'changes'         => $log->properties,
                'user_name'       => $log->user?->name ?? 'System',
                'created_at'      => $log->created_at->diffForHumans(),
                'created_at_full' => $log->created_at->format('M d, Y h:i A'),
            ];
        });

        return Inertia::render('activity-logs/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['search', 'action', 'type']),
        ]);
    }
}
