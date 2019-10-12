<?php
/*  Frey: ACL & user data storage
 *  Copyright (C) 2018  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Frey;

require_once __DIR__ . '/../../src/primitives/Registrant.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class RegistrantPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
    }

    public function testNewRegistrant()
    {
        $newRegistrant = new RegistrantPrimitive($this->_db);
        $newRegistrant
            ->setAuthHash('hash')
            ->setAuthSalt('salt')
            ->setEmail('email')
            ->setApprovalCode('12345');

        $this->assertEquals('hash', $newRegistrant->getAuthHash());
        $this->assertEquals('salt', $newRegistrant->getAuthSalt());
        $this->assertEquals('email', $newRegistrant->getEmail());
        $this->assertEquals('12345', $newRegistrant->getApprovalCode());

        $success = $newRegistrant->save();
        $this->assertTrue($success, "Saved registrant");
        $this->assertGreaterThan(0, $newRegistrant->getId());
    }

    /**
     * @throws \Exception
     */
    public function testFindRegistrantById()
    {
        $newRegistrant = new RegistrantPrimitive($this->_db);
        $newRegistrant
            ->setAuthHash('hash')
            ->setAuthSalt('salt')
            ->setEmail('email')
            ->setApprovalCode('12345')
            ->save();

        $registrantCopy = RegistrantPrimitive::findById($this->_db, [$newRegistrant->getId()]);
        $this->assertEquals(1, count($registrantCopy));
        $this->assertEquals('email', $registrantCopy[0]->getEmail());
        $this->assertTrue($newRegistrant !== $registrantCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testFindRegistrantByEmail()
    {
        $newRegistrant = new RegistrantPrimitive($this->_db);
        $newRegistrant
            ->setAuthHash('hash')
            ->setAuthSalt('salt')
            ->setEmail('email')
            ->setApprovalCode('12345')
            ->save();

        $registrantCopy = RegistrantPrimitive::findByEmail($this->_db, [$newRegistrant->getEmail()]);
        $this->assertEquals(1, count($registrantCopy));
        $this->assertEquals('12345', $registrantCopy[0]->getApprovalCode());
        $this->assertTrue($newRegistrant !== $registrantCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testFindRegistrantByApprovalCode()
    {
        $newRegistrant = new RegistrantPrimitive($this->_db);
        $newRegistrant
            ->setAuthHash('hash')
            ->setAuthSalt('salt')
            ->setEmail('email')
            ->setApprovalCode('12345')
            ->save();

        $registrantCopy = RegistrantPrimitive::findByApprovalCode($this->_db, [$newRegistrant->getApprovalCode()]);
        $this->assertEquals(1, count($registrantCopy));
        $this->assertEquals('email', $registrantCopy[0]->getEmail());
        $this->assertTrue($newRegistrant !== $registrantCopy[0]); // different objects!
    }

    /**
     * @throws \Exception
     */
    public function testUpdateRegistrant()
    {
        $newRegistrant = new RegistrantPrimitive($this->_db);
        $newRegistrant
            ->setAuthHash('hash')
            ->setAuthSalt('salt')
            ->setEmail('email')
            ->setApprovalCode('12345')
            ->save();

        $registrantCopy = RegistrantPrimitive::findById($this->_db, [$newRegistrant->getId()]);
        $registrantCopy[0]->setEmail('anotherEmail')->save();

        $anotherRegistrantCopy = RegistrantPrimitive::findById($this->_db, [$newRegistrant->getId()]);
        $this->assertEquals('anotherEmail', $anotherRegistrantCopy[0]->getEmail());
    }
}
