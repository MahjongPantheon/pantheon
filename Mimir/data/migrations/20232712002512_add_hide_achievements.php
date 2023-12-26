<?php

use Phinx\Migration\AbstractMigration;

class AddHideAchievements extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('hide_achievements', 'integer', ['default' => 0])
            ->save();
    }
}
