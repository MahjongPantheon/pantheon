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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../primitives/Group.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class GroupsModel extends Model
{
    /**
     * Create new group in admin interface
     *
     * @param $title
     * @param $description
     * @param $color
     * @return int
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function createGroup($title, $description, $color)
    {
        if (empty($title)) {
            throw new InvalidParametersException('Title is required to be non-empty', 401);
        }

        $group = (new GroupPrimitive($this->_db))
            ->setTitle($title)
            ->setDescription($description)
            ->setLabelColor($color);
        if (!$group->save()) {
            throw new \Exception('Failed to save group to DB', 402);
        }

        return $group->getId();
    }

    /**
     * Get info of groups by id list
     *
     * @param $ids
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getGroups($ids)
    {
        if (empty($ids)) {
            throw new InvalidParametersException('ID list is empty', 403);
        }

        $groups = GroupPrimitive::findById($this->_db, $ids);
        return array_map(function (GroupPrimitive $group) {
            return [
                'id' => $group->getId(),
                'title' => $group->getTitle(),
                'label_color' => $group->getLabelColor(),
                'description' => $group->getDescription()
            ];
        }, $groups);
    }

    /**
     * Update group info
     *
     * @param $id
     * @param $title
     * @param $description
     * @param $color
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updateGroup($id, $title, $description, $color)
    {
        $id = intval($id);
        if (empty($id)) {
            throw new InvalidParametersException('Id is empty or non-numeric', 404);
        }

        $groups = GroupPrimitive::findById($this->_db, [$id]);
        if (empty($groups)) {
            throw new InvalidParametersException('Group id #' . $id . ' not found in DB', 405);
        }

        if (empty($title)) {
            throw new InvalidParametersException('Group title is required to be non-empty', 406);
        }

        return $groups[0]
            ->setTitle($title)
            ->setDescription($description)
            ->setLabelColor($color)
            ->save();
    }

    /**
     * Delete group and all of its linked dependencies
     *
     * @param $id
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function deleteGroup($id)
    {
        $id = intval($id);
        if (empty($id)) {
            throw new InvalidParametersException('Id is empty or non-numeric', 407);
        }

        $groups = GroupPrimitive::findById($this->_db, [$id]);
        if (empty($groups)) {
            throw new InvalidParametersException('Group id #' . $id . ' not found in DB', 408);
        }

        $groups[0]->drop();
    }

    /**
     * Add person to group
     *
     * @param $personId
     * @param $groupId
     * @return bool
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function addPersonToGroup($personId, $groupId)
    {
        $groupId = intval($groupId);
        $personId = intval($personId);
        if (empty($groupId) || empty($personId)) {
            throw new InvalidParametersException('Group id or person id is empty or non-numeric', 407);
        }

        $groups = GroupPrimitive::findById($this->_db, [$groupId]);
        if (empty($groups)) {
            throw new InvalidParametersException('Group id #' . $groupId . ' not found in DB', 408);
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new InvalidParametersException('Person id #' . $personId . ' not found in DB', 409);
        }

        // Actually we might fetch persons from group too,
        // but we assume that any person has less groups than persons any group might have.
        $currentGroups = $persons[0]->getGroups();
        $currentGroups []= $groups[0];
        return $persons[0]->setGroups($currentGroups)->save();
    }

    /**
     * Remove person from group
     *
     * @param $personId
     * @param $groupId
     * @return bool
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function removePersonFromGroup($personId, $groupId)
    {
        $groupId = intval($groupId);
        $personId = intval($personId);
        if (empty($groupId) || empty($personId)) {
            throw new InvalidParametersException('Group id or person id is empty or non-numeric', 410);
        }

        $groups = GroupPrimitive::findById($this->_db, [$groupId]);
        if (empty($groups)) {
            throw new InvalidParametersException('Group id #' . $groupId . ' not found in DB', 411);
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new InvalidParametersException('Person id #' . $personId . ' not found in DB', 412);
        }

        // Actually we might fetch persons from group too,
        // but we assume that any person has less groups than persons any group might have.
        $currentGroups = array_filter($persons[0]->getGroups(), function (GroupPrimitive $g) use ($groups) {
            return $g->getId() != $groups[0]->getId();
        });
        return $persons[0]->setGroups($currentGroups)->save();
    }

    /**
     * @param $personId
     * @return array
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getGroupsOfPerson($personId)
    {
        $personId = intval($personId);
        if (empty($personId)) {
            throw new InvalidParametersException('Id is empty or non-numeric', 413);
        }

        $persons = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($persons)) {
            throw new InvalidParametersException('Person id #' . $personId . ' not found in DB', 414);
        }

        return array_map(function(GroupPrimitive $group) {
            return [
                'id' => $group->getId(),
                'title' => $group->getTitle(),
                'label_color' => $group->getLabelColor(),
                'description' => $group->getDescription()
            ];
        }, $persons[0]->getGroups());

    }

    /**
     * @param $groupId
     * @return array
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPersonsOfGroup($groupId)
    {
        $groupId = intval($groupId);
        if (empty($groupId)) {
            throw new InvalidParametersException('Id is empty or non-numeric', 415);
        }

        $groups = GroupPrimitive::findById($this->_db, [$groupId]);
        if (empty($groups)) {
            throw new InvalidParametersException('Group id #' . $groupId . ' not found in DB', 416);
        }

        return array_map(function(PersonPrimitive $person) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'tenhou_id' => $person->getTenhouId(),
                'title' => $person->getTitle(),
            ];
        }, $groups[0]->getPersons());
    }
}
