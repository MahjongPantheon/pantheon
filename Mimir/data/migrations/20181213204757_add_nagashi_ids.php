<?php

use Phinx\Migration\AbstractMigration;

class AddNagashiIds extends AbstractMigration
{

    public function change()
    {
        $this->table('round')
            ->addColumn('nagashi', 'string', ['limit' => 255, 'null' => true,
                'comment' => 'comma-separated list of nagashi user ids'])
            ->save();
    }
}
