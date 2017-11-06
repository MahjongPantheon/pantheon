<?php

use Phinx\Migration\AbstractMigration;

class AddEventGamesSyncEnd extends AbstractMigration
{

    public function change()
    {
        $this->table('event')
            ->addColumn('sync_end', 'integer', array('default' => 0))
            ->save();
    }
}
