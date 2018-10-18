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

/**
 * Configure entry points for api methods.
 *
 * The following will cause execution of Implementation_class::someMethodAlias
 * when user requests someMethod.
 *
 * [
 *      'someMethod' => ['Implementation_class', 'someMethodAlias']
 *      ...
 * ]
 *
 */
return [
    // client
    'requestRegistration'  => ['AuthController', 'requestRegistration'],
    'approveRegistration'  => ['AuthController', 'approveRegistration'],
    'authorize'            => ['AuthController', 'authorize'],
    'quickAuthorize'       => ['AuthController', 'quickAuthorize'],
    'changePassword'       => ['AuthController', 'changePassword'],
    'requestResetPassword' => ['AuthController', 'requestResetPassword'],
    'approveResetPassword' => ['AuthController', 'approveResetPassword'],
    'getAccessRules'       => ['AccessController', 'getAccessRules'],
    'getRuleValue'         => ['AccessController', 'getRuleValue'],
    'updatePersonalInfo'   => ['PersonsController', 'updatePersonalInfo'],
    'getPersonalInfo'      => ['PersonsController', 'getPersonalInfo'],
    'findByTitle'          => ['PersonsController', 'findByTitle'],
    'getGroups'            => ['PersonsController', 'getGroups'],

    // admin
    'getPersonAccess'        => ['AccessController', 'getPersonAccess'],
    'getGroupAccess'         => ['AccessController', 'getGroupAccess'],
    'addRuleForPerson'       => ['AccessController', 'addRuleForPerson'],
    'addRuleForGroup'        => ['AccessController', 'addRuleForGroup'],
    'updateRuleForPerson'    => ['AccessController', 'updateRuleForPerson'],
    'updateRuleForGroup'     => ['AccessController', 'updateRuleForGroup'],
    'deleteRuleForPerson'    => ['AccessController', 'deleteRuleForPerson'],
    'deleteRuleForGroup'     => ['AccessController', 'deleteRuleForGroup'],
    'clearAccessCache'       => ['AccessController', 'clearAccessCache'],
    'createAccount'          => ['PersonsController', 'createAccount'],
    'createGroup'            => ['PersonsController', 'createGroup'],
    'updateGroup'            => ['PersonsController', 'updateGroup'],
    'deleteGroup'            => ['PersonsController', 'deleteGroup'],
    'addPersonToGroup'       => ['PersonsController', 'addPersonToGroup'],
    'removePersonFromGroup'  => ['PersonsController', 'removePersonFromGroup'],
    'getPersonsOfGroup'      => ['PersonsController', 'getPersonsOfGroup'],
    'getGroupsOfPerson'      => ['PersonsController', 'getGroupsOfPerson'],
];
