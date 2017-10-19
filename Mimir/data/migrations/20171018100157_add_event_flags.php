<?php

use Phinx\Migration\AbstractMigration;

class AddEventFlags extends AbstractMigration
{

    public function change()
    {
        $this->table('event')
            ->addColumn('hide_results', 'integer', array('default' => 0))
            ->save();
    }
}
