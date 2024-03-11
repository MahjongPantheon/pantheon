<?php

use Phinx\Migration\AbstractMigration;

class PlayerStatPrecalcRemove extends AbstractMigration
{
    public function change()
    {
        $this->table('player_stats')
            ->removeColumn('need_recalc')
            ->removeIndexByName('stats_need_recalc')
            ->save();
    }
}
