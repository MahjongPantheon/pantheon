<?php

use Phinx\Migration\AbstractMigration;

class PlayerStatPrecalc extends AbstractMigration
{
    public function change()
    {
        $this->table('player_stats')
            ->addColumn('event_id', 'integer')
            ->addColumn('player_id', 'integer')
            ->addColumn('data', 'text', ['comment' => 'stats precalculated data'])
            ->addColumn('last_update', 'datetime', ['null' => true])
            ->addColumn('need_recalc', 'integer')
            ->addForeignKey('event_id', 'event')
            ->addIndex(['event_id', 'player_id'], ['name' => 'stats_event_player_id', 'unique' => true])
            ->addIndex('need_recalc', ['name' => 'stats_need_recalc'])
            ->save();
    }
}
