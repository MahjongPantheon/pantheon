<?php

namespace Hugin;

use PHPUnit\Framework\TestCase;

class DbTest extends TestCase
{
    public function testDatabaseHelperLoadsAndInitializes(): void
    {
        require_once __DIR__ . '/../src/helpers/Db.php';

        $config = new Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;dbname=hugin_unit',
                'credentials' => [],
            ],
        ]);

        $this->assertInstanceOf(IDb::class, new Db($config));
    }
}
