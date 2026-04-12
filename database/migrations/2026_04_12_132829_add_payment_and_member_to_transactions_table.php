<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('payment_id')->nullable()->after('amount')->constrained('payments')->nullOnDelete();
            $table->foreignId('member_id')->nullable()->after('payment_id')->constrained('members')->nullOnDelete();
            $table->dropColumn(['reference_number', 'notes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
            $table->dropForeign(['member_id']);
            $table->dropColumn(['payment_id', 'member_id']);
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
        });
    }
};
