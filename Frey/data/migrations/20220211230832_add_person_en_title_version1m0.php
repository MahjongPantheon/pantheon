<?php
// @codingStandardsIgnoreFile
use Idiorm\IdiormResultSet;
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddPersonEnTitleVersion1m0 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('person');
        $table
            ->addColumn('title_en', 'string', ['after' => 'title', 'default' => ''])
            ->save();
        $this->getAdapter()->commitTransaction();

        /** @var $db \Frey\Db */
        [$db, $cfg] = $this->_getConnection();
        $db->rawExec("CREATE INDEX titlesearch_en_idx ON person USING GIN (to_tsvector('simple', title_en));");

        /** @var IdiormResultSet $persons */
        $persons = $db->table('person')->select('id')->select('title')->findMany();
        /** @var \Idiorm\ORM $person */
        foreach ($persons as $person) {
            $person->set('title_en', $this->_transliterate($person->get('title')))->save();
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
        $opts = $this->getAdapter()->getOptions();
        $cfg = new \Frey\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $opts['port']
                    . ';dbname=' . $opts['name'],
                'credentials' => [
                    'username' => $opts['user'],
                    'password' => $opts['pass']
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
