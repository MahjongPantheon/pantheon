<?php

use Phinx\Migration\AbstractMigration;

class AddChipsField extends AbstractMigration
{

    public function change()
    {
        $table = $this->table('player_history');
        $table
            ->addColumn('chips', 'integer', ['null' => true])
            ->save();

        $table = $this->table('session_results');
        $table
            ->addColumn('chips', 'integer', ['null' => true])
            ->save();
    }
}
