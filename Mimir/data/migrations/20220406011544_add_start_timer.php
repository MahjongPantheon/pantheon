<?php

use Phinx\Migration\AbstractMigration;

class AddRulesTuning extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('next_game_start_time', 'int', ['default' => 0])
            ->addColumn('time_to_start', 'int', ['default' => 600])
            ->save();
    }
}
