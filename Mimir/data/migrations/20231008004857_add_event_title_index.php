<?php

use Phinx\Migration\AbstractMigration;

class AddEventTitleIndex extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addIndex('title')
            ->save();
    }
}
