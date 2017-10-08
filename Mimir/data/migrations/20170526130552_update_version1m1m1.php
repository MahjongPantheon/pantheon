<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class UpdateVersion1m1m1 extends AbstractMigration
{
    public function up()
    {
        // ========= New columns in event ==========

        $table = $this->table('event');
        $table
            ->addColumn('timezone', 'string', ['limit' => 255])
            ->update();

        $this->query("UPDATE event SET timezone = 'Europe/Moscow';");
    }
}
