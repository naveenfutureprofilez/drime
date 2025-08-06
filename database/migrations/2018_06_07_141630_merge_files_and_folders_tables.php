<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MergeFilesAndFoldersTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // First add new columns
        Schema::table('file_entries', function (Blueprint $table) {
            $column = $table
                ->string('path', 255)
                ->nullable()
                ->index();
            if (config('database.default') === 'mysql') {
                $column->collation = 'latin1_bin';
            }

            $table->string('public_path', 255)->nullable();
            $table
                ->string('type', 20)
                ->nullable()
                ->index();
            $table->string('extension', 10)->nullable();
            $table
                ->boolean('public')
                ->default(0)
                ->index();

            $table->index('name');
        });

        // Then drop columns in separate operation for SQLite compatibility
        Schema::table('file_entries', function (Blueprint $table) {
            if (Schema::hasColumn('file_entries', 'attach_id')) {
                $table->dropColumn('attach_id');
            }
        });

        Schema::table('file_entries', function (Blueprint $table) {
            if (Schema::hasColumn('file_entries', 'share_id')) {
                $table->dropColumn('share_id');
            }
        });

        // Finally modify existing columns
        Schema::table('file_entries', function (Blueprint $table) {
            $table
                ->string('mime', 100)
                ->nullable()
                ->change();
        });

        Schema::table('file_entries', function (Blueprint $table) {
            $table->string('file_name', 36)->change();
        });

        Schema::table('file_entries', function (Blueprint $table) {
            $table
                ->bigInteger('file_size')
                ->nullable()
                ->unsigned()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('files_entries', function (Blueprint $table) {
            $table->removeColumn('type');
            $table->string('mime', 50)->nullable();
            $table
                ->string('uuid', 20)
                ->unique()
                ->change();
        });
    }
}
