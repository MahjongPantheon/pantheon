<?php

use Phinx\Migration\AbstractMigration;

class AddListedFlag extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('is_listed', 'integer', ['default' => 1])
            ->save();
    }
}
