<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class UpdateVersion1m2m0 extends AbstractMigration
{
    public function up()
    {
        $this->query("ALTER SEQUENCE user_id_seq RENAME TO player_id_seq");
        $this->query("ALTER SEQUENCE event_enrolled_users_id_seq RENAME TO event_enrolled_players_id_seq");
        $this->query("ALTER SEQUENCE event_registered_users_id_seq RENAME TO event_registered_players_id_seq");
        $this->query("ALTER SEQUENCE formation_user_id_seq RENAME TO formation_player_id_seq");
        $this->query("ALTER SEQUENCE session_user_id_seq RENAME TO session_player_id_seq");
    }
}
