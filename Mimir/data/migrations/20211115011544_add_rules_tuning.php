<?php

use Phinx\Migration\AbstractMigration;

class AddRulesTuning extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('ruleset_changes')
            ->save();
    }
}
