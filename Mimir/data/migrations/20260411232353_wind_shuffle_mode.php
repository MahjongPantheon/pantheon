<?php

use Phinx\Migration\AbstractMigration;

class WindShuffleMode extends AbstractMigration
{

    public function change()
    {
        $this->table('event')
            ->addColumn('wind_shuffle_mode', 'string', ['null' => true])
            ->save();
    }
}
