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

class InternalRules
{
    const IS_SUPER_ADMIN = '__isSuperAdmin'; // Separate special property, not in list

    const GET_PERSON_ACCESS = '__getPersonAccess';
    const GET_GROUP_ACCESS = '__getGroupAccess';
    const GET_ALL_PERSON_RULES = '__getAllPersonRules';
    const GET_ALL_GROUP_RULES = '__getAllGroupRules';
    const ADD_RULE_FOR_PERSON = '__addRuleForPerson';
    const ADD_RULE_FOR_GROUP = '__addRuleForGroup';
    const ADD_SYSTEM_WIDE_RULE_FOR_PERSON = '__addSystemWideRuleForPerson';
    const ADD_SYSTEM_WIDE_RULE_FOR_GROUP= '__addSystemWideRuleForGroup';
    const UPDATE_RULE_FOR_PERSON = '__updateRuleForPerson';
    const UPDATE_RULE_FOR_GROUP = '__updateRuleForGroup';
    const DELETE_RULE_FOR_PERSON = '__deleteRuleForPerson';
    const DELETE_RULE_FOR_GROUP = '__deleteRuleForGroup';
    const CLEAR_ACCESS_CACHE = '__clearAccessCache';
    const CREATE_ACCOUNT = '__createAccount';
    const GET_PERSONAL_INFO_WITH_PRIVATE_DATA = '__getPersonalInfoWithPrivateData';
    const UPDATE_PERSONAL_INFO = '__updatePersonalInfo';
    const CREATE_GROUP = '__createGroup';
    const UPDATE_GROUP = '__updateGroup';
    const DELETE_GROUP = '__deleteGroup';
    const ADD_PERSON_TO_GROUP = '__addPersonToGroup';
    const REMOVE_PERSON_FROM_GROUP = '__removePersonFromGroup';

    public static function isInternal(string $name)
    {
        return defined(__CLASS__ . '::' . $name);
    }

    public static function getNames()
    {
        return array_keys(self::getTranslations()); // ¯\_(ツ)_/¯
    }

    protected static $_translations;
    public static function getTranslations()
    {
        if (empty(self::$_translations)) {
            self::$_translations = [
                self::GET_PERSON_ACCESS => _t('Get access rules for a single person'),
                self::GET_GROUP_ACCESS => _t('Get access rules for a single group'),
                self::GET_ALL_PERSON_RULES => _t('Get all access rules for a single person'),
                self::GET_ALL_GROUP_RULES => _t('Get all access rules for a single group'),
                self::ADD_RULE_FOR_PERSON => _t('Add new access rule for a person'),
                self::ADD_RULE_FOR_GROUP => _t('Add new access rule for a group'),
                self::ADD_SYSTEM_WIDE_RULE_FOR_PERSON => _t('Add new system-wide access rule for a person'),
                self::ADD_SYSTEM_WIDE_RULE_FOR_GROUP => _t('Add new system-wide access rule for a group'),
                self::UPDATE_RULE_FOR_PERSON => _t('Modify access rule value for a person'),
                self::UPDATE_RULE_FOR_GROUP => _t('Modify access rule value for a group'),
                self::DELETE_RULE_FOR_PERSON => _t('Delete access rule for a person'),
                self::DELETE_RULE_FOR_GROUP => _t('Delete access rule for a group'),
                self::CLEAR_ACCESS_CACHE => _t('Clear access rules cache for a single event'),
                self::CREATE_ACCOUNT => _t('Create new person account'),
                self::GET_PERSONAL_INFO_WITH_PRIVATE_DATA => _t('Get personal info including private data'),
                self::UPDATE_PERSONAL_INFO => _t('Update personal info of a single person'),
                self::CREATE_GROUP => _t('Create new group'),
                self::UPDATE_GROUP => _t('Update a group'),
                self::DELETE_GROUP => _t('Delete a group'),
                self::ADD_PERSON_TO_GROUP => _t('Add person to a group'),
                self::REMOVE_PERSON_FROM_GROUP => _t('Remove person from a group'),
            ];
        }
        return self::$_translations;
    }
}
