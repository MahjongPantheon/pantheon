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

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../models/Account.php';
require_once __DIR__ . '/../models/Groups.php';

class PersonsController extends Controller
{
    /**
     * Create new account by administrator (no email checks).
     *
     * @param string $email
     * @param string $password
     * @param string $title
     * @param string $city
     * @param string $phone
     * @param string $tenhouId
     * @return int  new account id
     * @throws \Exception
     */
    public function createAccount($email, $password, $title, $city, $phone, $tenhouId)
    {
        $this->_logStart(__METHOD__, [$email, $password, $title, $city, $phone, $tenhouId]);
        // TODO: check admin rights here. Auth layer should be present to do this...

        $personId = $this->_getAccountModel()
            ->createAccount($email, $password, $title, $city, $phone, $tenhouId);
        $this->_logSuccess(__METHOD__, [$email, $password, $title, $city, $phone, $tenhouId]);
        return $personId;
    }

    /**
     * Get personal info by id list.
     * May or may not include private data (depending on admin rights of requesting user).
     *
     * @param array $ids
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPersonalInfo($ids)
    {
        $this->_logStart(__METHOD__, [$ids]);
        $isAdmin = true; // TODO: check admin rights here. Auth layer should be present to do this...
        $personalInfo = $this->_getAccountModel()->getPersonalInfo($ids, !$isAdmin);
        $this->_logSuccess(__METHOD__, [$ids]);
        return $personalInfo;
    }

    /**
     * @param string $id
     * @param string $title
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @return bool  success
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePersonalInfo($id, $title, $city, $email, $phone, $tenhouId)
    {
        $this->_logStart(__METHOD__, [$id, $title, $city, $email, $phone, $tenhouId]);
        // TODO: check if this is admin or user himself
        $success = $this->_getAccountModel()->updatePersonalInfo($id, $title, $city, $email, $phone, $tenhouId);
        $this->_logSuccess(__METHOD__, [$id, $title, $city, $email, $phone, $tenhouId]);
        return $success;
    }

    /**
     * Fuzzy (pattern) search by title.
     * Query should not contain % or _ characters (they will be cut though)
     * Query should be more than 2 characters long.
     *
     * @param string $query
     * @return array
     * @throws InvalidParametersException
     */
    public function findByTitle($query)
    {
        $this->_logStart(__METHOD__, [$query]);
        $results = $this->_getAccountModel()->findByTitleFuzzy($query);
        $this->_logSuccess(__METHOD__, [$query]);
        return $results;
    }

    /**
     * Create new group in admin interface
     * Returns new group id
     *
     * @param string $title
     * @param string $description
     * @param string $color
     * @return int
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function createGroup($title, $description, $color)
    {
        $this->_logStart(__METHOD__, [$title, $description, $color]);
        // TODO: check group admin rights here...
        $groupId = $this->_getGroupsModel()->createGroup($title, $description, $color);
        $this->_logSuccess(__METHOD__, [$title, $description, $color]);
        return $groupId;
    }

    /**
     * Update group info in admin interface
     *
     * @param integer $id
     * @param string $title
     * @param string $description
     * @param string $color
     * @return bool success
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updateGroup($id, $title, $description, $color)
    {
        $this->_logStart(__METHOD__, [$id, $title, $description, $color]);
        // TODO: check group admin rights here...
        $success = $this->_getGroupsModel()->updateGroup($id, $title, $description, $color);
        $this->_logSuccess(__METHOD__, [$id, $title, $description, $color]);
        return $success;
    }

    /**
     * Get info of groups by id list
     *
     * @param array $ids
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getGroups($ids)
    {
        $this->_logStart(__METHOD__, [$ids]);
        $groups = $this->_getGroupsModel()->getGroups($ids);
        $this->_logSuccess(__METHOD__, [$ids]);
        return $groups;
    }

    /**
     * Delete group and all of its linked dependencies
     *
     * @param integer $id
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function deleteGroup($id)
    {
        $this->_logStart(__METHOD__, [$id]);
        // TODO: check group admin rights here...
        $this->_getGroupsModel()->deleteGroup($id);
        $this->_logSuccess(__METHOD__, [$id]);
        return true;
    }

    /**
     * Add person to group
     *
     * @param integer $personId
     * @param integer $groupId
     * @return bool  success
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function addPersonToGroup($personId, $groupId)
    {
        $this->_logStart(__METHOD__, [$personId, $groupId]);
        // TODO: check group admin rights here...
        $success = $this->_getGroupsModel()->addPersonToGroup($personId, $groupId);
        $this->_logSuccess(__METHOD__, [$personId, $groupId]);
        return $success;
    }

    /**
     * Remove person from group
     *
     * @param int $personId
     * @param int $groupId
     * @return bool  success
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function removePersonFromGroup($personId, $groupId)
    {
        $this->_logStart(__METHOD__, [$personId, $groupId]);
        // TODO: check group admin rights here...
        $success = $this->_getGroupsModel()->removePersonFromGroup($personId, $groupId);
        $this->_logSuccess(__METHOD__, [$personId, $groupId]);
        return $success;
    }

    /**
     * List persons of group
     *
     * @param int $groupId
     * @return array
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPersonsOfGroup($groupId)
    {
        $this->_logStart(__METHOD__, [$groupId]);
        // TODO: check group admin rights here...
        $data = $this->_getGroupsModel()->getPersonsOfGroup($groupId);
        $this->_logSuccess(__METHOD__, [$groupId]);
        return $data;
    }

    /**
     * List groups of person
     *
     * @param int $personId
     * @return array
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getGroupsOfPerson($personId)
    {
        $this->_logStart(__METHOD__, [$personId]);
        // TODO: check group admin rights here...
        $data = $this->_getGroupsModel()->getGroupsOfPerson($personId);
        $this->_logSuccess(__METHOD__, [$personId]);
        return $data;
    }

    /**
     * @return AccountModel
     */
    protected function _getAccountModel()
    {
        return new AccountModel($this->_db, $this->_config, $this->_meta);
    }

    /**
     * @return GroupsModel
     */
    protected function _getGroupsModel()
    {
        return new GroupsModel($this->_db, $this->_config, $this->_meta);
    }
}
