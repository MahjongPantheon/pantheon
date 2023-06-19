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
        $table = $this->table('sys_errors');
        $table
            ->addColumn('source', 'string', ['limit' => 255])
            ->addColumn('created_at', 'datetime')
            ->addColumn('error', 'text')
            ->save();
    }
}
