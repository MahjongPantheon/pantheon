<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Mimir;

require_once __DIR__ . '/../../src/primitives/Formation.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class FormationPrimitiveTest extends \PHPUnit_Framework_TestCase
{
    protected $_db;
    /**
     * @var PlayerPrimitive
     */
    protected $_owner;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_owner = (new PlayerPrimitive($this->_db))
            ->setDisplayName('player')
            ->setIdent('oauth')
            ->setTenhouId('tenhou');
        $this->_owner->save();
    }

    public function testNewFormation()
    {
        $newFormation = new FormationPrimitive($this->_db);
        $newFormation
            ->setTitle('f1')
            ->setDescription('fdesc1')
            ->setCity('city')
            ->setContactInfo('someinfo')
            ->setPrimaryOwner($this->_owner);

        $this->assertEquals('f1', $newFormation->getTitle());
        $this->assertEquals('fdesc1', $newFormation->getDescription());
        $this->assertEquals('city', $newFormation->getCity());
        $this->assertEquals('someinfo', $newFormation->getContactInfo());
        $this->assertTrue($this->_owner === $newFormation->getPrimaryOwner());

        $success = $newFormation->save();
        $this->assertTrue($success, "Saved formation");
        $this->assertGreaterThan(0, $newFormation->getId());
    }

    public function testFindFormationById()
    {
        $newFormation = new FormationPrimitive($this->_db);
        $newFormation
            ->setTitle('f1')
            ->setDescription('fdesc1')
            ->setCity('city')
            ->setContactInfo('someinfo')
            ->setPrimaryOwner($this->_owner)
            ->save();

        $formationCopy = FormationPrimitive::findById($this->_db, [$newFormation->getId()]);
        $this->assertEquals(1, count($formationCopy));
        $this->assertEquals('f1', $formationCopy[0]->getTitle());
        $this->assertTrue($newFormation !== $formationCopy[0]); // different objects!
    }

    public function testUpdateFormation()
    {
        $newFormation = new FormationPrimitive($this->_db);
        $newFormation
            ->setTitle('f1')
            ->setDescription('fdesc1')
            ->setCity('city')
            ->setContactInfo('someinfo')
            ->setPrimaryOwner($this->_owner)
            ->save();

        $formationCopy = FormationPrimitive::findById($this->_db, [$newFormation->getId()]);
        $formationCopy[0]->setDescription('someanotherdesc')->save();

        $anotherFormationCopy = FormationPrimitive::findById($this->_db, [$newFormation->getId()]);
        $this->assertEquals('someanotherdesc', $anotherFormationCopy[0]->getDescription());
    }

    public function testRelationPrimaryOwner()
    {
        $newFormation = new FormationPrimitive($this->_db);
        $newFormation
            ->setTitle('f1')
            ->setDescription('fdesc1')
            ->setCity('city')
            ->setContactInfo('someinfo')
            ->setPrimaryOwner($this->_owner)
            ->save();

        $formationCopy = FormationPrimitive::findById($this->_db, [$newFormation->getId()])[0];
        $this->assertEquals($this->_owner->getId(), $formationCopy->getPrimaryOwnerId()); // before fetch
        $this->assertNotEmpty($formationCopy->getPrimaryOwner());
        $this->assertEquals($this->_owner->getId(), $formationCopy->getPrimaryOwner()->getId());
        $this->assertTrue($this->_owner !== $formationCopy->getPrimaryOwner()); // different objects!
    }
}
