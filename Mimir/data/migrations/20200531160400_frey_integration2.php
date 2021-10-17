<?php
// @codingStandardsIgnoreFile
use Phinx\Migration\AbstractMigration;

class FreyIntegration2 extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('event');
        $table
            ->changeColumn('is_textlog', 'string', ['null' => true])
            ->renameColumn('is_textlog', '__deprecated_is_textlog')
            ->update();
    }
}
