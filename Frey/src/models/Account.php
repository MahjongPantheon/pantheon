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
require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class AccountModel extends Model
{
    /**
     * Create new account by administrator (no email checks).
     * Admin rights should be checked in controller layer.
     *
     * @param $email
     * @param $password
     * @param $title
     * @param $city
     * @param $phone
     * @param null $tenhouId
     * @return integer id
     * @throws \Exception
     */
    public function createAccount($email, $password, $title, $city, $phone, $tenhouId = null)
    {
        if (empty($email) || empty($password) || empty($title)) {
            throw new InvalidParametersException('Some of required fields are empty (email, password, title)', 401);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidParametersException('Invalid email provided', 402);
        }

        $auth = new AuthModel($this->_db, $this->_config, $this->_meta);
        $tokens = $auth->makePasswordTokens($password);
        $person = (new PersonPrimitive($this->_db))
            ->setTitle($title)
            ->setAuthHash($tokens['auth_hash'])
            ->setAuthSalt($tokens['salt'])
            ->setCity($city)
            ->setEmail($email)
            ->setPhone($phone)
            ->setTenhouId($tenhouId);
        if (!$person->save()) {
            throw new \Exception('Couldn\'t save person to DB', 403);
        }
        return $person->getId();
    }

    /**
     * Get personal info by id list.
     * May or may not include private data. This should be decided on controller layer.
     *
     * @param int[] $ids
     * @param bool $filterPrivateData
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function getPersonalInfo($ids, $filterPrivateData = true)
    {
        if (empty($ids)) {
            throw new InvalidParametersException('ID list is empty', 404);
        }

        $persons = PersonPrimitive::findById($this->_db, $ids);
        return array_map(function(PersonPrimitive $person) use ($filterPrivateData) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'email' => $filterPrivateData ? null : $person->getEmail(),
                'phone' => $filterPrivateData ? null : $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
            ];
        }, $persons);
    }

    /**
     * Update personal info of selected account
     *
     * @param $id
     * @param $title
     * @param $city
     * @param $email
     * @param $phone
     * @param null $tenhouId
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePersonalInfo($id, $title, $city, $email, $phone, $tenhouId = null)
    {
        $id = intval($id);
        if (empty($id)) {
            throw new InvalidParametersException('Id is empty or non-numeric', 405);
        }

        $persons = PersonPrimitive::findById($this->_db, [$id]);
        if (empty($persons)) {
            throw new InvalidParametersException('Person id #' . $id . ' not found in DB', 406);
        }

        if (empty($title) || empty($email)) {
            throw new InvalidParametersException('Title and email cannot be empty', 407);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidParametersException('Invalid email provided', 408);
        }

        return $persons[0]->setTitle($title)
            ->setCity($city)
            ->setEmail($email)
            ->setPhone($phone)
            ->setTenhouId($tenhouId)
            ->save();
    }

    /**
     * Fuzzy (pattern) search by title.
     * Query should not contain % or _ characters (they will be cut though)
     * Query should be more than 2 characters long.
     *
     * @param $query
     * @return array
     * @throws InvalidParametersException
     */
    public function findByTitleFuzzy($query)
    {
        $persons = PersonPrimitive::findByTitleFuzzy($this->_db, $query);
        if ($persons === null) { // bad query or too short query
            throw new InvalidParametersException('Query is too short', 409);
        }

        return array_map(function(PersonPrimitive $person) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'tenhou_id' => $person->getTenhouId(),
                'title' => $person->getTitle(),
            ];
        }, $persons);
    }
}
