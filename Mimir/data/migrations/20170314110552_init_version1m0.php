<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class InitVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $this->_genUser();
        $this->_genFormation();
        $this->_genFormationUser();
        $this->_genEvent();
        $this->_genEventEnrolledUsers();
        $this->_genEventRegisteredUsers();
        $this->_genSession();
        $this->_genSessionResults();
        $this->_genSessionUser();
        $this->_genPlayerHistory();
        $this->_genRound();
        $this->_genYaku();
    }

    /**
     * Players, orgs, etc
     */
    protected function _genUser()
    {
        $table = $this->table('user');
        $table
            ->addColumn('ident', 'string', ['limit' => 255,
                'comment' => 'oauth ident info, for example'])
            ->addColumn('alias', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'user alias for text-mode game log'])
            ->addColumn('display_name', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tenhou_id', 'string', ['limit' => 255, 'null' => true])

            ->addIndex('alias', ['name' => 'user_alias'])
            ->addIndex('ident', ['name' => 'user_ident', 'unique' => true])
            ->addIndex('tenhou_id', ['name' => 'user_tenhou'])

            ->save();
    }

    /**
     * Local clubs, leagues, etc
     */
    protected function _genFormation()
    {
        $table = $this->table('formation');
        $table
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('city', 'string', ['limit' => 255])
            ->addColumn('description', 'text')
            ->addColumn('logo', 'text', ['null' => true])
            ->addColumn('contact_info', 'text')
            ->addColumn('primary_owner', 'integer')

            ->addForeignKey('primary_owner', 'user')

            ->save();
    }

    /**
     * Many-to-many relation, primarily for administrative needs.
     * By default user is a player in formation.
     * User may have more than one role in formation, so no unique index is created.
     */
    protected function _genFormationUser()
    {
        $table = $this->table('formation_user');
        $table
            ->addColumn('formation_id', 'integer')
            ->addColumn('user_id', 'integer')
            ->addColumn('role', 'string', ['limit' => 255,
                'comment' => 'who is this user in this group?'])

            ->addForeignKey('formation_id', 'formation')
            ->addForeignKey('user_id', 'user')

            ->save();
    }

    /**
     * Local ratings, tournaments, including online ones
     */
    protected function _genEvent()
    {
        $table = $this->table('event');
        $table
            ->addColumn('title', 'string', ['limit' => 255])
            ->addColumn('description', 'text')
            ->addColumn('start_time', 'datetime', ['null' => true])
            ->addColumn('end_time', 'datetime', ['null' => true])
            ->addColumn('game_duration', 'integer', ['null' => true,
                'comment' => 'for timer, duration in seconds'])
            ->addColumn('last_timer', 'integer', ['null' => true,
                'comment' => 'for timer, unix datetime of last started timer'])
            ->addColumn('red_zone', 'integer', ['null' => true,
                'comment' => 'timer red zone amount in seconds, or null to disable red zone'])
            ->addColumn('owner_formation', 'integer', ['null' => true,
                'comment' => 'at least one owner id (user or formation) should be set!'])
            ->addColumn('owner_user', 'integer', ['null' => true])
            ->addColumn('type', 'string', ['limit' => 255,
                'comment' => 'online or offline, tournament or local rating, interactive or simple'])
            ->addColumn('stat_host', 'string', ['limit' => 255,
                'comment' => 'host of statistics frontend'])
            ->addColumn('lobby_id', 'integer', ['null' => true,
                'comment' => 'tenhou lobby id for online events'])
            ->addColumn('ruleset', 'text', [
                'comment' => 'table rules, either in JSON or as a predefined ID'])

            ->addIndex('owner_formation')
            ->addIndex('lobby_id', ['name' => 'event_lobby'])

            ->addForeignKey('owner_formation', 'formation')
            ->addForeignKey('owner_user', 'user')

            ->save();
    }

    /**
     * Users to be registered in event (tournament-type auth)
     */
    protected function _genEventEnrolledUsers()
    {
        $table = $this->table('event_enrolled_users');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('user_id', 'integer')
            ->addColumn('reg_pin', 'integer')

            ->addIndex(['event_id', 'user_id'], ['unique' => true])
            ->addIndex('reg_pin', ['name' => 'eeu_pin'])

            ->addForeignKey('event_id', 'event')
            ->addForeignKey('user_id', 'user')

            ->save();
    }

    /**
     * Users registered in event
     */
    protected function _genEventRegisteredUsers()
    {
        $table = $this->table('event_registered_users');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('user_id', 'integer')
            ->addColumn('auth_token', 'string', ['limit' => 48])

            ->addIndex(['event_id', 'user_id'], ['unique' => true])
            ->addIndex('auth_token', ['name' => 'eru_auth_token'])

            ->addForeignKey('event_id', 'event')
            ->addForeignKey('user_id', 'user')

            ->save();
    }

    /**
     * Game session: tonpuusen, hanchan, either online or offline
     */
    protected function _genSession()
    {
        $table = $this->table('session');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('representational_hash', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'hash to find this game from client mobile app'])
            ->addColumn('replay_hash', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'tenhou game hash, for deduplication'])
            ->addColumn('table_index', 'integer', ['null' => true,
                'comment' => 'table number in tournament'])
            ->addColumn('orig_link', 'text', ['null' => true,
                'comment' => 'original tenhou game link, for access to replay'])
            ->addColumn('start_date', 'datetime', ['null' => true])
            ->addColumn('end_date', 'datetime', ['null' => true])
            ->addColumn('status', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'planned / inprogress / finished'])
            ->addColumn('intermediate_results', 'text', ['null' => true,
                'comment' => 'json-encoded results for in-progress sessions'])

            ->addIndex('replay_hash', ['name' => 'session_replay'])
            ->addIndex('status', ['name' => 'session_status'])
            ->addIndex('table_index', ['name' => 'session_table_index'])
            ->addIndex('representational_hash', ['name' => 'session_rephash'])

            ->addForeignKey('event_id', 'event')

            ->save();
    }

    /**
     * Session results, entry should exist only for finished sessions
     */
    protected function _genSessionResults()
    {
        $table = $this->table('session_results');
        $table
            ->addColumn('event_id', 'integer')
            ->addColumn('session_id', 'integer')
            ->addColumn('player_id', 'integer')
            ->addColumn('score', 'integer', [
                'comment' => 'how many points player has at the end, before any uma/oka calc'])
            ->addColumn('rating_delta', 'float', [
                'comment' => 'resulting score after uma/oka and starting points subtraction'])
            ->addColumn('place', 'integer')

            ->addForeignKey('event_id', 'event')
            ->addForeignKey('session_id', 'session')
            ->addForeignKey('player_id', 'user')

            ->save();
    }

    /**
     * Many-to-many relation: user participation in session
     */
    protected function _genSessionUser()
    {
        $table = $this->table('session_user');
        $table
            ->addColumn('session_id', 'integer')
            ->addColumn('user_id', 'integer')
            ->addColumn('order', 'integer')

            ->addIndex(['session_id', 'user_id'], ['name' => 'session_user_uniq', 'unique' => true])

            ->addForeignKey('session_id', 'session')
            ->addForeignKey('user_id', 'user')

            ->save();
    }

    /**
     * User rating history in context of every event
     */
    protected function _genPlayerHistory()
    {
        $table = $this->table('player_history');
        $table
            ->addColumn('user_id', 'integer')
            ->addColumn('session_id', 'integer')
            ->addColumn('event_id', 'integer')
            ->addColumn('rating', 'float')
            ->addColumn('avg_place', 'float')
            ->addColumn('games_played', 'integer')

            ->addForeignKey('user_id', 'user')
            ->addForeignKey('event_id', 'event')
            ->addForeignKey('session_id', 'session')

            ->save();
    }

    /**
     * Session round results
     */
    protected function _genRound()
    {
        $table = $this->table('round');
        $table
            ->addColumn('session_id', 'integer')
            ->addColumn('event_id', 'integer')
            ->addColumn('outcome', 'string', ['limit' => 255,
                'comment' => 'ron, tsumo, draw, abortive draw or chombo'])
            ->addColumn('winner_id', 'integer', ['null' => true,
                'comment' => 'not null only on ron or tsumo'])
            ->addColumn('loser_id', 'integer', ['null' => true,
                'comment' => 'not null only on ron or chombo'])
            ->addColumn('han', 'integer', ['null' => true])
            ->addColumn('fu', 'integer', ['null' => true])
            ->addColumn('round', 'integer', [
                'comment' => '1-4 means east1-4, 5-8 means south1-4, etc'])
            ->addColumn('tempai', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'comma-separated list of tempai user ids'])
            ->addColumn('yaku', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'comma-separated yaku id list'])
            ->addColumn('dora', 'integer', ['null' => true,
                'comment' => 'dora count'])
            ->addColumn('uradora', 'integer', ['null' => true]) // TODO: not sure if we really need this
            ->addColumn('kandora', 'integer', ['null' => true]) // TODO: not sure if we really need this
            ->addColumn('kanuradora', 'integer', ['null' => true]) // TODO: not sure if we really need this
            ->addColumn('riichi', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'comma-separated list of user ids who called riichi'])
            ->addColumn('multi_ron', 'integer', ['null' => true,
                'comment' => 'double or triple ron flag to properly display results of round'])
            ->addColumn('last_session_state', 'text', ['null' => true,
                'comment' => 'session intermediate results before this round was registered'])
            ->addColumn('open_hand', 'integer', ['null' => true,
                'comment' => 'boolean, was winner\'s hand opened or not'])

            ->addIndex('outcome', ['name' => 'round_outcome'])

            ->addForeignKey('session_id', 'session')
            ->addForeignKey('event_id', 'event')
            ->addForeignKey('winner_id', 'user')
            ->addForeignKey('loser_id', 'user')

            ->save();
    }

    /**
     * Helper table for simpler reports building
     */
    protected function _genYaku()
    {
        $table = $this->table('yaku');
        $table
            ->addColumn('name', 'string', ['limit' => 255])
            ->save();

        // TODO: i18n?
        $table->insert(['id' => 1, 'name' => 'Тойтой'])
            ->insert(['id' => 2, 'name' => 'Хонрото'])
            ->insert(['id' => 3, 'name' => 'Сананко'])
            ->insert(['id' => 4, 'name' => 'Саншоку доко'])
            ->insert(['id' => 5, 'name' => 'Санканцу'])
            ->insert(['id' => 6, 'name' => 'Сууканцу'])
            ->insert(['id' => 7, 'name' => 'Сууанко'])
            ->insert(['id' => 8, 'name' => 'Пин-фу'])
            ->insert(['id' => 9, 'name' => 'Иипейко'])
            ->insert(['id' => 10, 'name' => 'Рянпейко'])
            ->insert(['id' => 11, 'name' => 'Саншоку'])
            ->insert(['id' => 12, 'name' => 'Иццу'])
            ->insert(['id' => 13, 'name' => 'Якухай х1'])
            ->insert(['id' => 14, 'name' => 'Якухай х2'])
            ->insert(['id' => 15, 'name' => 'Якухай х3'])
            ->insert(['id' => 16, 'name' => 'Якухай х4'])
            ->insert(['id' => 17, 'name' => 'Якухай х5'])
            ->insert(['id' => 18, 'name' => 'Шосанген'])
            ->insert(['id' => 19, 'name' => 'Дайсанген'])
            ->insert(['id' => 20, 'name' => 'Шосуши'])
            ->insert(['id' => 21, 'name' => 'Дайсуши'])
            ->insert(['id' => 22, 'name' => 'Цуисо'])
            ->insert(['id' => 23, 'name' => 'Таняо'])
            ->insert(['id' => 24, 'name' => 'Чанта'])
            ->insert(['id' => 25, 'name' => 'Джунчан'])
            ->insert(['id' => 26, 'name' => 'Чинрото'])
            ->insert(['id' => 27, 'name' => 'Хоницу'])
            ->insert(['id' => 28, 'name' => 'Чиницу'])
            ->insert(['id' => 29, 'name' => 'Чууренпото'])
            ->insert(['id' => 30, 'name' => 'Рюисо'])
            ->insert(['id' => 31, 'name' => 'Чиитойцу'])
            ->insert(['id' => 32, 'name' => 'Кокушимусо'])
            ->insert(['id' => 33, 'name' => 'Риичи'])
            ->insert(['id' => 34, 'name' => 'Дабл риичи'])
            ->insert(['id' => 35, 'name' => 'Иппацу'])
            ->insert(['id' => 36, 'name' => 'Мендзен цумо'])
            ->insert(['id' => 37, 'name' => 'Хайтей'])
            ->insert(['id' => 38, 'name' => 'Риншан кайхо'])
            ->insert(['id' => 39, 'name' => 'Тенхо'])
            ->insert(['id' => 40, 'name' => 'Чихо'])
            ->insert(['id' => 41, 'name' => 'Хотей'])
            ->insert(['id' => 42, 'name' => 'Чанкан'])
            ->insert(['id' => 43, 'name' => 'Ренхо'])
            ->insert(['id' => 44, 'name' => 'Опен риичи']);
    }
}
