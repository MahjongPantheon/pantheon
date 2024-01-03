<?php

use Phinx\Migration\AbstractMigration;

class AddAllowViewOtherTables extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('allow_view_other_tables', 'integer', ['default' => 0])
            ->save();
    }
}
