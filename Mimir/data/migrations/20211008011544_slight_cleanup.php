<?php

use Phinx\Migration\AbstractMigration;

class SlightCleanup extends AbstractMigration
{
    public function change()
    {
        $this->table('__deprecated_formation')->drop();
        $this->table('__deprecated_formation_player')->drop();
        $this->table('__deprecated_player')->drop();
        $this->table('event_registered_players')
            ->removeColumn('auth_token')
            ->addColumn('replacement_id', 'integer', ['null' => true])
            ->save();
    }
}
