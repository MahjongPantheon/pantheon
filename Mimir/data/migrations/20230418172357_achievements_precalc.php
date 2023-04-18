<?php

use Phinx\Migration\AbstractMigration;

class AchievementsPrecalc extends AbstractMigration
{
    public function change()
    {
        $this->table('achievements')
            ->addColumn('event_id', 'integer')
            ->addColumn('data', 'text', ['comment' => 'achievements precalculated data'])
            ->addColumn('last_update', 'datetime', ['null' => true])
            ->addForeignKey('event_id', 'event')
            ->addIndex('event_id', ['name' => 'achievement_event_id', 'unique' => true])
            ->save();

        $this->table('session')
            ->addIndex('end_date')
            ->save();
    }
}
