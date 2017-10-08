<?php

use Phinx\Migration\AbstractMigration;

class AddUsePenaltyFlag extends AbstractMigration
{

    public function up()
    {
        $table = $this->table('event');
        $table
            ->addColumn('use_penalty', 'integer')
            ->update();

        $this->query("UPDATE event SET use_penalty = 1 where use_timer = 1;");
    }
}
