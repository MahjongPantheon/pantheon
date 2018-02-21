<?php

use Phinx\Migration\AbstractMigration;

class IgnoreGameFlag extends AbstractMigration
{
    public function change()
    {
        // TODO: revert this & delete field after all duplicate accounts are merged together
        $this->table('session')
            ->addColumn('okr_ignore', 'integer', ['default' => 0])
            ->save();
    }
}
