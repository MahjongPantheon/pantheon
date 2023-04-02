<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

require_once __DIR__ . '/../../src/helpers/BootstrapAccess.php';

class AddCreateEventPriv extends AbstractMigration
{
    public function up()
    {
        $userIds = $this->adapter->fetchAll('SELECT id FROM person');
        $existingAccess = $this->adapter->fetchAll("SELECT person_id FROM person_access WHERE acl_name='CREATE_EVENT'");
        $ids = array_diff(
            array_map(function ($id) { return $id['id']; }, $userIds),
            array_map(function ($id) { return $id['id']; }, $existingAccess)
        );
        $this->adapter->query('INSERT INTO person_access ("person_id", "acl_type", "acl_name", "acl_value", "allowed_values") VALUES ' .
            implode(', ', array_map(function ($id) {
                return "({$id}, 'bool', 'CREATE_EVENT', 'true', '')";
            }, $ids))
        );
    }
}
