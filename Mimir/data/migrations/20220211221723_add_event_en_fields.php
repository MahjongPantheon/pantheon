<?php

use Idiorm\IdiormResultSet;
use Phinx\Migration\AbstractMigration;

require __DIR__ . '/../../src/Config.php';
require __DIR__ . '/../../src/Db.php';
require __DIR__ . '/../../src/DataSource.php';
require __DIR__ . '/../../src/FreyClient.php';

class AddEventEnFields extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('title_en', 'text', ['default' => '', 'after' => 'title'])
            ->addColumn('description_en', 'text', ['default' => '', 'after' => 'description'])
            ->addColumn('default_language', 'string', ['default' => 'en', 'after' => 'title'])
            ->save();

        $this->getAdapter()->commitTransaction();

        /** @var $db \Frey\Db */
        [$db, $cfg] = $this->_getConnection();

        /** @var IdiormResultSet $events */
        $events = $db->table('event')
            ->select('id')
            ->select('title')
            ->select('description')
            ->findMany();
        /** @var \Idiorm\ORM $event */
        foreach ($events as $event) {
            $event
                ->set('title_en', $this->_transliterate($event->get('title')))
                ->set('description_en', $this->_transliterate($event->get('description')))
                ->save();
        }

        $this->getAdapter()->commitTransaction();
    }

    protected function _transliterate(string $data)
    {
        $tr = \Transliterator::create('Cyrillic-Latin; Latin-ASCII');
        if (!empty($tr)) {
            $data = $tr->transliterate($data);
        }
        return $data;
    }

    protected function _getConnection()
    {
        $cfg = new \Mimir\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $_SERVER['PHINX_DB_PORT']
                    . ';dbname=' . $_SERVER['PHINX_DB_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_USER'],
                    'password' => $_SERVER['PHINX_DB_PASS']
                ]
            ],
            'admin'     => [
                'debug_token' => '2-839489203hf2893'
            ],
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'freyUrl'   => getenv('FREY_URL'),
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => '1',
                'version_minor' => '0'
            ]
        ]);

        $db = new \Mimir\Db($cfg);
        $frey = new \Mimir\FreyClient($cfg->getStringValue('freyUrl'));
        $frey->getClient()->getHttpClient()->withHeaders([
            'X-Debug-Token: CHANGE_ME',
        ]);
        return [new \Mimir\DataSource($db, $frey), $cfg];
    }
}
