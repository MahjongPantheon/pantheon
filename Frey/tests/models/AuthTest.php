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

require_once __DIR__ . '/../../src/models/Auth.php';
require_once __DIR__ . '/../../src/Db.php';

class AuthModelTest extends \PHPUnit_Framework_TestCase
{
    protected $_db;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
    }

    public function testRequestRegistration()
    {

    }

    public function testApproveRegistration()
    {

    }

    public function testAuthorize()
    {

    }

    public function testQuickAuthorize()
    {

    }

    public function testChangePassword()
    {

    }

    public function testRequestResetPassword()
    {

    }

    public function testApproveResetPassword()
    {

    }

    public function testMakePasswordTokens()
    {

    }
}
