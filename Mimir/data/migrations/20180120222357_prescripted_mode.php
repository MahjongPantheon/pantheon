<?php

use Phinx\Migration\AbstractMigration;

class PrescriptedMode extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('is_prescripted', 'integer', ['default' => 0])
            ->save();

        $this->table('event_registered_players')
            ->addColumn('local_id', 'integer', ['null' => true])
            ->save();
    }
}
