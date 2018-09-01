<?php

use Phinx\Migration\AbstractMigration;

class AddMinGamesCount extends AbstractMigration
{

    public function change()
    {
        $this->table('event')
            ->addColumn('min_games_count', 'integer', ['default' => 0])
            ->save();
    }
}
