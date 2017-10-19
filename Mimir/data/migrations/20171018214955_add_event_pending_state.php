<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class AddEventPendingState extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event');
        $table
            ->addColumn('games_status', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'seating_ready / started'])
            ->save();
    }
}
