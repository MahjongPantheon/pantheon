<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class UpdateVersion1m1 extends AbstractMigration
{
    public function up()
    {
        // ========= New columns in event ==========

        $table = $this->table('event');
        $table
            ->addColumn('sync_start', 'integer')
            ->addColumn('auto_seating', 'integer')
            ->addColumn('sort_by_games', 'integer')
            ->addColumn('use_timer', 'integer')
            ->addColumn('allow_player_append', 'integer')
            ->addColumn('is_online', 'integer')
            ->addColumn('is_textlog', 'integer')
            ->update();

        $this->query("
            UPDATE event SET
                sync_start = 1,
                auto_seating = 1,
                sort_by_games = 1,
                allow_player_append = 0,
                is_online = 0,
                use_timer = 1,
                is_textlog = 0
                WHERE type = 'offline_interactive_tournament';
        ");

        $this->query("
            UPDATE event SET
                sync_start = 0,
                auto_seating = 0,
                sort_by_games = 0,
                allow_player_append = 1,
                is_online = 0,
                use_timer = 0,
                is_textlog = 0
                WHERE type = 'offline';
        ");

        $this->query("
            UPDATE event SET
                sync_start = 1,
                auto_seating = 1,
                sort_by_games = 1,
                allow_player_append = 1,
                is_online = 1,
                use_timer = 0,
                is_textlog = 0
                WHERE type = 'online';
        ");

        // ========= Rename user to player everywhere ==========

        /*
         * Basic rules:
         * - Rename tables first, modify second
         * - Work with foreign keys and indexes separately
         * - Rename columns in the middle of foreign keys manipulations.
         * - Call save() after all modifications of indexes and FKs.
         * - Changing field name in table causes sqlite to drop all indexes in table (sic!).
         * So after column rename you should recreate all indexes.
         * - But, postgres doesn't drop indexes like sqlite does %) So we should drop them manually.
         * Any added index should be dropped first.
         */

        $this->getOutput()->setVerbosity(256);

        $this->table('user')->rename('player');
        $this->table('event_enrolled_users')->rename('event_enrolled_players');
        $this->table('event_registered_users')->rename('event_registered_players');
        $this->table('session_user')->rename('session_player');
        $this->table('formation_user')->rename('formation_player');

        $this->table('event')
            ->dropForeignKey('owner_user')
            ->renameColumn('owner_user', 'owner_player')
            ->addForeignKey('owner_player', 'player')
            ->save();
        $this->table('event')
            ->removeIndex(['lobby_id'])
            ->addIndex('lobby_id', ['name' => 'event_lobby'])
            ->save();
        $this->table('event_enrolled_players')
            ->dropForeignKey('user_id')
            ->renameColumn('user_id', 'player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('event_enrolled_players')
            ->removeIndex(['event_id', 'user_id'])
            ->removeIndex(['reg_pin'])
            ->addIndex(['event_id', 'player_id'], ['unique' => true])
            ->addIndex('reg_pin', ['name' => 'eep_pin'])
            ->save();
        $this->table('event_registered_players')
            ->dropForeignKey('user_id')
            ->renameColumn('user_id', 'player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('event_registered_players')
            ->removeIndex(['event_id', 'user_id'])
            ->addIndex(['event_id', 'player_id'], ['name' => 'erp_event_player', 'unique' => true])
            ->save();
        $this->table('session_player')
            ->dropForeignKey('user_id')
            ->renameColumn('user_id', 'player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('session_player')
            ->addIndex('session_id') // for FK
            // don't add explicit index for player_id - it's created when foreign key is recreated
            ->save();
        $this->table('session_player')
            ->removeIndexByName('session_user_uniq')
            ->addIndex(['session_id', 'player_id'], ['name' => 'sp_session_player', 'unique' => true])
            ->save();
        $this->table('player_history')
            ->dropForeignKey('user_id')
            ->renameColumn('user_id', 'player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('formation_player')
            ->dropForeignKey('user_id')
            ->renameColumn('user_id', 'player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('formation')
            ->dropForeignKey('primary_owner')
            ->addForeignKey('primary_owner', 'player')
            ->save();
        $this->table('session_results')
            ->dropForeignKey('player_id')
            ->addForeignKey('player_id', 'player')
            ->save();
        $this->table('round')
            ->dropForeignKey('winner_id')
            ->dropForeignKey('loser_id')
            ->addForeignKey('winner_id', 'player')
            ->addForeignKey('loser_id', 'player')
            ->save();
    }
}
