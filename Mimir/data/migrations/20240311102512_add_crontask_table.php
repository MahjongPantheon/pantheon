<?php

use Phinx\Migration\AbstractMigration;

class AddCrontaskTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('jobs_queue');
        $table
            ->addColumn('created_at', 'datetime')
            ->addColumn('job_name', 'string')
            ->addColumn('job_arguments', 'text', ['default' => '{}'])
            ->addIndex('created_at', ['name' => 'job_created_at'])
            ->save();
    }
}
