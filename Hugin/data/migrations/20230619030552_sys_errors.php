<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class SysErrors extends AbstractMigration
{
    public function up()
    {
        $this->_genSysErrors();
    }

    protected function _genSysErrors()
    {
        $table = $this->table('sys_errors', ['id' => false, 'primary_key' => 'id']);
        $table
            ->addColumn('id', 'biginteger', ['identity' => true, 'signed' => false])
            ->addColumn('source', 'string', ['limit' => 255])
            ->addColumn('created_at', 'datetime')
            ->addColumn('error', 'text')
            ->save();
    }
}
