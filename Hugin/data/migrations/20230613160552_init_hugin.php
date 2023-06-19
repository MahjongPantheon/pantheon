<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitHugin extends AbstractMigration
{
    public function up()
    {
        $this->_genEvent();
        $this->_genAggregateDay();
        $this->_genAggregateMonth();
    }

    protected function _genEvent()
    {
        $table = $this->table('event', ['id' => false, 'primary_key' => 'id']);
        $table
            ->addColumn('id', 'biginteger', ['identity' => true, 'signed' => false])
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('session_id', 'string', ['limit' => 255])
            ->addColumn('country', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('city', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('browser', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('hostname', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('os', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('device', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('screen', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('language', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('created_at', 'datetime')
            ->addColumn('event_id', 'integer', ['null' => true])
            ->addColumn('event_type', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('event_meta', 'string', ['limit' => 255, 'null' => true])
            ->addIndex('created_at')
            ->addIndex('session_id')
            ->addIndex('event_id')
            ->save();
    }

    protected function _genAggregateDay()
    {
        $table = $this->table('aggregate_day');
        $table
            ->addColumn('day', 'datetime')
            ->addColumn('event_count', 'integer')
            ->addColumn('uniq_count', 'integer')
            ->addColumn('hostname', 'text')
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('country', 'text')
            ->addColumn('city', 'text')
            ->addColumn('browser', 'text')
            ->addColumn('os', 'text')
            ->addColumn('device', 'text')
            ->addColumn('screen', 'text')
            ->addColumn('language', 'text')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addIndex(['day', 'site_id'],  ['name' => 'agg_day', 'unique' => true])
            ->save();
    }

    protected function _genAggregateMonth()
    {
        $table = $this->table('aggregate_month');
        $table
            ->addColumn('month', 'date')
            ->addColumn('event_count', 'integer')
            ->addColumn('uniq_count', 'integer')
            ->addColumn('site_id', 'string', ['limit' => 255])
            ->addColumn('hostname', 'text')
            ->addColumn('country', 'text')
            ->addColumn('city', 'text')
            ->addColumn('browser', 'text')
            ->addColumn('os', 'text')
            ->addColumn('device', 'text')
            ->addColumn('screen', 'text')
            ->addColumn('language', 'text')
            ->addColumn('event_type', 'string', ['limit' => 255])
            ->addIndex(['month', 'site_id'], ['name' => 'agg_month', 'unique' => true])
            ->save();
    }
}
