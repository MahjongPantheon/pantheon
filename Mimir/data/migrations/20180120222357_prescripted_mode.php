<?php

use Phinx\Migration\AbstractMigration;

class PrescriptedMode extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('is_prescripted', 'integer', ['default' => 0])
            ->save();

        $this->table('event_registered_players')
            ->addColumn('local_id', 'integer', ['null' => true])
            ->save();

        $this->table('event_prescript')
            ->addColumn('event_id', 'integer')
            ->addColumn('script', 'text', ['comment' => 'predefined event seating script'])
            ->addColumn('next_game', 'integer')
            ->addForeignKey('event_id', 'event')
            ->save();
    }
}
