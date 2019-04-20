<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class IntegrateFreyVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person_access');
        $table
            ->removeColumn('event_ids')
            ->addColumn('allowed_values', 'string')
            ->addColumn('event_id', 'integer', ['null' => true])
            ->addIndex('event_id', ['name' => 'access_event_id_person'])
            ->save();

        $table = $this->table('group_access');
        $table
            ->removeColumn('event_ids')
            ->addColumn('allowed_values', 'string')
            ->addColumn('event_id', 'integer', ['null' => true])
            ->addIndex('event_id', ['name' => 'access_event_id_group'])
            ->save();

        $this->getAdapter()->commitTransaction();
    }

    protected function _getConnection()
    {
        $cfg = new \Frey\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $_SERVER['PHINX_DB_FREY_PORT']
                    . 'dbname=' . $_SERVER['PHINX_DB_FREY_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_FREY_USER'],
                    'password' => $_SERVER['PHINX_DB_FREY_PASS']
                ]
            ],
            'admin'     => [
                'debug_token' => '2-839489203hf2893'
            ],
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => 1,
                'version_minor' => 0
            ],
            'testing_token' => 'not_used_here'
        ]);

        return [new \Frey\Db($cfg), $cfg];
    }
}
