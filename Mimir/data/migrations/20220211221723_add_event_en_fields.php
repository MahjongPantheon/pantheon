<?php

use Phinx\Migration\AbstractMigration;

class AddEventEnFields extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('title_en', 'text', ['default' => '', 'after' => 'title'])
            ->addColumn('description_en', 'text', ['default' => '', 'after' => 'description'])
            ->save();
    }
}
