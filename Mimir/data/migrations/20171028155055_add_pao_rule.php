<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class AddPaoRule extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('round');
        $table
            ->addColumn('pao_player_id', 'integer', ['null' => true])
            ->addForeignKey('pao_player_id', 'player')
            ->save();
    }
}
