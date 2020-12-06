<?php

use Phinx\Migration\AbstractMigration;

class UniqReprHash extends AbstractMigration
{

    public function change()
    {
        $this->table('session')
            ->removeIndex(['representational_hash'])
            ->save();

        $this->table('session')
            ->addIndex(['representational_hash'], ['unique' => true])
            ->save();
    }
}
