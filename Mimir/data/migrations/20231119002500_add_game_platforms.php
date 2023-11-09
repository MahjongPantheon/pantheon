<?php

use Phinx\Migration\AbstractMigration;

class AddGamePlatforms extends AbstractMigration
{
    public function up()
    {
        $this->_genGamePlatforms();
        $this->_populateGamePlatforms();
        $this->_addPlatformIdToEvent();
    }

    protected function _genGamePlatforms()
    {
        $table = $this->table('game_platforms', ['id' => false, 'primary_key' => 'platform_id']);
        $table
            ->addColumn('platform_id', 'integer')
            ->addColumn('platform_name', 'string', ['limit' => 255, 'null' => false])
            ->addIndex('platform_id', ['name' => 'game_platform_id_idx'])
            ->save();
        $this->getAdapter()->commitTransaction();
    }

    protected function _populateGamePlatforms()
    {
        $gamePlatforms = [
            ['platform_id' => 1, 'platform_name' => 'TENHOU'],
            ['platform_id' => 2, 'platform_name' => 'MAJSOUL']
        ];
        $this->adapter->query('INSERT INTO game_platforms ("platform_id", "platform_name") VALUES ' .
            implode(', ', array_map(function ($gamePlatform) {
                return "({$gamePlatform['platform_id']}, '{$gamePlatform['platform_name']}')";
            }, $gamePlatforms))
        );
        $this->getAdapter()->commitTransaction();
    }

    protected function _addPlatformIdToEvent()
    {
        $table = $this->table('event');
        $table
            ->addColumn('platform_id', 'integer' , ['null' => true])
            ->save();
        $this->getAdapter()->commitTransaction();

        $this->adapter->query('ALTER TABLE IF EXISTS event
            ADD CONSTRAINT game_platforms_platform_id FOREIGN KEY (platform_id)
            REFERENCES game_platforms (platform_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION');
        $this->getAdapter()->commitTransaction();
    }
}
