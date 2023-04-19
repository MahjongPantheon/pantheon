<?php
/*  Frey: ACL & user data storage
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

namespace Frey;

require_once __DIR__ . '/../helpers/i18n.php';
require_once __DIR__ . '/../helpers/Db.php';
require_once __DIR__ . '/../helpers/Config.php';
require_once __DIR__ . '/../helpers/Meta.php';
require_once __DIR__ . '/InternalRules.php';
require_once __DIR__ . '/../models/Account.php';
require_once __DIR__ . '/../models/Groups.php';
require_once __DIR__ . '/../models/AccessManagement.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class BootstrapAccess
{
    /**
     * @param Db $db
     * @param Config $config
     * @param Meta $meta
     * @param string $adminEmail
     * @param string $adminPassword
     * @throws \Exception
     * @return array
     */
    public static function create(Db $db, Config $config, Meta $meta, string $adminEmail, string $adminPassword)
    {
        $accountModel = new AccountModel($db, $config, $meta);
        $groupModel = new GroupsModel($db, $config, $meta);
        $accessModel = new AccessManagementModel($db, $config, $meta);

        $adminId = $accountModel->createAccount($adminEmail, $adminPassword, 'Administrator', '', '', null, true, true);
        $adminGroupId = $groupModel->createGroup('Administrators', 'System administrators', '#990000');
        foreach (InternalRules::getNames() as $name) {
            $accessModel->addSystemWideRuleForPerson($name, true, AccessPrimitive::TYPE_BOOL, $adminId, true);
            $accessModel->addSystemWideRuleForGroup($name, true, AccessPrimitive::TYPE_BOOL, $adminGroupId, true);
        }

        return [$adminId, $adminGroupId];
    }
}
