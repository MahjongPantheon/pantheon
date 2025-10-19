<?php

use Phinx\Migration\AbstractMigration;

class ManualAddReplay extends AbstractMigration
{
    public function change()
    {
        $this->table("event")
            ->addColumn("manual_add_replay", "integer", [
                "null" => false,
                "default" => 1,
            ])
            ->save();
    }
}
