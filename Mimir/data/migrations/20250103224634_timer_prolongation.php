<?php

use Phinx\Migration\AbstractMigration;

class TimerProlongation extends AbstractMigration
{
    public function change()
    {
        $this->table('session')
            ->addColumn('extra_time', 'integer', ['null' => false, 'default' => 0])
            ->save();
    }
}
