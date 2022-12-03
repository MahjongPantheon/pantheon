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
require_once __DIR__ . '/../helpers/InternalRules.php';
require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/AccessDenied.php';

class AccountModel extends Model
{
    /**
     * Create new account by administrator (no email checks).
     * Admin rights should be checked in controller layer.
     *
     * @param string $email
     * @param string $password
     * @param string $title
     * @param string $city
     * @param string $phone
     * @param string|null $tenhouId
     * @param bool $superadmin
     *
     * @return int id
     *
     * @throws InvalidParametersException
     */
    public function createAccount(string $email, string $password, string $title, string $city, string $phone, $tenhouId = null, $superadmin = false): int
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
            ->setIsSuperadmin($superadmin)
            ->setTenhouId($tenhouId);
        if (!$person->save()) {
            throw new \Exception('Couldn\'t save person to DB', 403);
        }

        // TODO: do something with this workaround for docker debug
        $token = empty($_SERVER['HTTP_X_DEBUG_TOKEN']) ? '' : $_SERVER['HTTP_X_DEBUG_TOKEN'];
        if ($token === $this->_config->getValue('admin.debug_token') && $token === 'CHANGE_ME') {
            $content = file_get_contents('/tmp/frey_tokens_debug') ?: '';
            file_put_contents('/tmp/frey_tokens_debug', $content .
                "New user: $title [id: {$person->getId()}] [hash: {$tokens['client_hash']}]" . PHP_EOL);
        }

        return (int)$person->getId();
    }

    /**
     * Get personal info by id list.
     * May or may not include private data.
     *
     * @param int[] $ids
     * @return array
     * @throws \Exception
     */
    public function getPersonalInfo($ids)
    {
        $filterPrivateData = false;
        try {
            $this->_checkAccessRights(InternalRules::GET_PERSONAL_INFO_WITH_PRIVATE_DATA);
        } catch (AccessDeniedException $e) {
            // No access, filter out private data
            $filterPrivateData = true;
        }

        if (empty($ids)) {
            return [];
        }

        $persons = PersonPrimitive::findById($this->_db, $ids);
        $authPersonId = empty($this->_authorizedPerson) ? 0 : $this->_authorizedPerson->getId();
        return array_map(function (PersonPrimitive $person) use ($filterPrivateData, $authPersonId) {
            return [
                'id' => $person->getId(),
                'country' => $person->getCountry(),
                'city' => $person->getCity(),
                'email' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getEmail(),
                'phone' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
            ];
        }, $persons);
    }

    /**
     * Update personal info of selected account
     *
     * @param string $id
     * @param string $title
     * @param string $country
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string|null $tenhouId
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePersonalInfo(string $id, string $title, string $country, string $city, string $email, string $phone, $tenhouId = null)
    {
        if (empty($this->_authorizedPerson) || $this->_authorizedPerson->getId() != $id) {
            $this->_checkAccessRights(InternalRules::UPDATE_PERSONAL_INFO);
        }

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
            ->setCountry($country)
            ->setCity($city)
            ->setEmail($email)
            ->setPhone($phone)
            ->setTenhouId($tenhouId)
            ->save();
    }

    /**
     * Fuzzy search by title.
     * Query should be 3 or more characters long.
     *
     * @param string $query
     * @return array
     * @throws InvalidParametersException
     */
    public function findByTitleFuzzy(string $query)
    {
        $persons = PersonPrimitive::findByTitleFuzzy($this->_db, $query);
        if ($persons === null) { // bad query or too short query
            throw new InvalidParametersException('Query is too short', 409);
        }

        return array_map(function (PersonPrimitive $person) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'tenhou_id' => $person->getTenhouId(),
                'title' => $person->getTitle(),
            ];
        }, $persons);
    }

    /**
     * Find accounts by tenhou ids list.
     * If tenhou id is not found, resulting empty result
     * is not included into result set at all. Maintaining
     * positional mapping id -> data is expected at client side.
     *
     * @param array $ids
     * @return array
     * @throws \Exception
     */
    public function findByTenhouId($ids)
    {
        $filterPrivateData = false;
        try {
            $this->_checkAccessRights(InternalRules::GET_PERSONAL_INFO_WITH_PRIVATE_DATA);
        } catch (AccessDeniedException $e) {
            // No access, filter out private data
            $filterPrivateData = true;
        }

        $persons = PersonPrimitive::findByTenhouId($this->_db, $ids);
        $authPersonId = empty($this->_authorizedPerson) ? 0 : $this->_authorizedPerson->getId();
        return array_map(function (PersonPrimitive $person) use ($filterPrivateData, $authPersonId) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'email' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getEmail(),
                'phone' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
            ];
        }, $persons);
    }
}
