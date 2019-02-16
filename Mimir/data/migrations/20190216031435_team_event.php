<?php

use Phinx\Migration\AbstractMigration;

class TeamEvent extends AbstractMigration
{

    public function change()
    {
        $this->table('event_registered_players')
            ->addColumn('team_name', 'text', ['null' => true])
            ->save();

        $this->table('event')
            ->addColumn('is_team', 'integer', ['default' => 0])
            ->save();
    }
}
