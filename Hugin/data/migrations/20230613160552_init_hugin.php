<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitHugin extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event');
        $table
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('session_id', 'string', ['limit' => 255])
            ->addColumn('country', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255])
            ->addColumn('hostname', 'string', ['limit' => 255])
            ->addColumn('os', 'string', ['limit' => 255])
            ->addColumn('device', 'string', ['limit' => 255])
            ->addColumn('screen', 'string', ['limit' => 255])
            ->addColumn('language', 'string', ['limit' => 255])
            ->addColumn('created_at', 'datetime')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addColumn('event_meta', 'string', ['limit' => 255])
            ->addIndex('created_at')
            ->save();
    }
}
