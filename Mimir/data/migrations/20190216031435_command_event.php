<?php

use Phinx\Migration\AbstractMigration;

class CommandEvent extends AbstractMigration
{

    public function change()
    {
        $this->table('event_registered_players')
            ->addColumn('command_name', 'text', ['null' => true])
            ->save();

        $this->table('event')
            ->addColumn('is_command', 'integer', ['default' => 0])
            ->save();
    }
}
