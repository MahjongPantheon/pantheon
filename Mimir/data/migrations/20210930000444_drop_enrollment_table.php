<?php

use Phinx\Migration\AbstractMigration;

class DropEnrollmentTable extends AbstractMigration
{

    public function change()
    {
        $this->table('event_enrolled_players')->drop();
    }
}
