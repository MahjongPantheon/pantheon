<?php

use Phinx\Migration\AbstractMigration;

class ReworkPenalties extends AbstractMigration
{
    public function change()
    {
        $this->table('penalty')
            ->addColumn('player_id', 'integer', ['null' => false])
            ->addColumn('event_id', 'integer', ['null' => false])
            ->addColumn('session_id', 'integer', ['null' => true])
            ->addColumn('created_at', 'datetime')
            ->addColumn('assigned_by', 'integer', ['null' => false])
            ->addColumn('amount', 'integer', ['null' => false])
            ->addColumn('reason', 'text', ['null' => false, 'default' => ''])
            ->addColumn('cancelled', 'integer', ['null' => false, 'default' => '0'])
            ->addColumn('cancelled_reason', 'text', ['null' => true])

            ->addIndex('created_at', ['name' => 'penalty_created_at'])
            ->addIndex('player_id', ['name' => 'penalty_player_id'])
            ->addIndex('assigned_by', ['name' => 'penalty_assigned_by'])
            ->addIndex('cancelled', ['name' => 'penalty_cancelled'])

            ->addForeignKey('event_id', 'event')

            ->save();
    }
}
