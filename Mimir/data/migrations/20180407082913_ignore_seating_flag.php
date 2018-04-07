<?php

use Phinx\Migration\AbstractMigration;

class IgnoreSeatingFlag extends AbstractMigration
{

    public function change()
    {
        $this->table('event_registered_players')
            ->addColumn('ignore_seating', 'integer', ['default' => 0])
            ->addIndex('ignore_seating', ['name' => 'registered_players_ignore'])
            ->save();
    }
}
