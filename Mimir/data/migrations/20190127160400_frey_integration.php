<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class FreyIntegration extends AbstractMigration
{
    public function up()
    {
        // ========= New columns in event ==========

        $table = $this->table('event');
        $table
            ->renameColumn('owner_formation', '__deprecated_owner_formation')
            ->renameColumn('owner_player', '__deprecated_owner_player')
            ->changeColumn('type', 'string', ['null' => true])
            ->renameColumn('type', '__deprecated_type')
            ->update();

        $this->table('formation')
            ->rename('__deprecated_formation')
            ->update();

        $this->table('formation_player')
            ->rename('__deprecated_formation_player')
            ->update();

        $this->table('session_player')
            ->dropForeignKey('player_id');

        $this->table('event_registered_players')
            ->dropForeignKey('player_id');

        $this->table('event_enrolled_players')
            ->dropForeignKey('player_id');

        $this->table('round')
            ->dropForeignKey('pao_player_id')
            ->dropForeignKey('winner_id')
            ->dropForeignKey('loser_id');

        $this->table('player_history')
            ->dropForeignKey('player_id');

        $this->table('session_results')
            ->dropForeignKey('player_id');
    }
}
