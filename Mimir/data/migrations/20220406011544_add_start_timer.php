<?php

use Phinx\Migration\AbstractMigration;

class AddStartTimer extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('next_game_start_time', 'integer', ['default' => 0])
            ->addColumn('time_to_start', 'integer', ['default' => 600])
            ->save();
    }
}
