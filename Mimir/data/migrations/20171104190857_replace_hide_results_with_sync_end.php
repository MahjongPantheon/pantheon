<?php

use Phinx\Migration\AbstractMigration;

class ReplaceHideResultsWithSyncEnd extends AbstractMigration
{

    public function change()
    {
        $this->table('event')
            ->renameColumn('hide_results', 'sync_end')
            ->save();
    }
}
