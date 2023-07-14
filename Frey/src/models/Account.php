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
     * @param string $country
     * @param string $phone
     * @param string|null $tenhouId
     * @param bool $superadmin
     * @param bool $bootstrap if true, don't check any access rights
     *
     * @return int id
     *
     * @throws InvalidParametersException|AccessDeniedException
     */
    public function createAccount(string $email, string $password, string $title, string $city, string $country, string $phone, $tenhouId = null, $superadmin = false, $bootstrap = false): int
    {
        if (!$bootstrap) {
            $this->_checkAccessRightsWithInternal(InternalRules::IS_SUPER_ADMIN);
        }
        if (empty($email) || empty($password) || empty($title)) {
            throw new InvalidParametersException('Some of required fields are empty (email, password, title)', 401);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidParametersException('Invalid email provided', 402);
        }

        $auth = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $tokens = $auth->makePasswordTokens($password);
        $person = (new PersonPrimitive($this->_db))
            ->setTitle($title)
            ->setAuthHash($tokens['auth_hash'])
            ->setAuthSalt($tokens['salt'])
            ->setCity($city)
            ->setCountry($country)
            ->setEmail($email)
            ->setPhone($phone)
            ->setIsSuperadmin($superadmin)
            ->setHasAvatar(false)
            ->setLastUpdate(date('Y-m-d H:i:s'))
            ->setTenhouId($tenhouId);
        if (!$person->save()) {
            throw new \Exception('Couldn\'t save person to DB', 403);
        }

        // TODO: do something with this workaround for docker debug
        $token = empty($_SERVER['HTTP_X_DEBUG_TOKEN']) ? '' : $_SERVER['HTTP_X_DEBUG_TOKEN'];
        if ($token === $this->_config->getValue('admin.debug_token') && $token === 'CHANGE_ME') {
            $content = file_get_contents('/tmp/frey_tokens_debug') ?: '';
            $url = getenv('FORSETI_URL');
            @chmod('/tmp/frey_tokens_debug', 0777);
            file_put_contents('/tmp/frey_tokens_debug', $content .
                "New user: $title (impersonate: {$url}/profile/impersonate/{$person->getId()}/{$tokens['client_hash']} )" . PHP_EOL);
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
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
            ];
        }, $persons);
    }

    /**
     * Update personal info of selected account
     *
     * @param int $id
     * @param string $title
     * @param string $country
     * @param string $city
     * @param string $email
     * @param string $phone
     * @param string $tenhouId
     * @param bool $hasAvatar
     * @param string $avatarData
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePersonalInfo(int $id, string $title, string $country, string $city, string $email, string $phone, $tenhouId, $hasAvatar, $avatarData)
    {
        if (empty($this->_authorizedPerson) || $this->_authorizedPerson->getId() != $id) {
            $this->_checkAccessRights(InternalRules::UPDATE_PERSONAL_INFO);
        }

        $persons = PersonPrimitive::findById($this->_db, [$id]);
        if (empty($persons)) {
            throw new InvalidParametersException('Person id #' . $id . ' not found in DB', 406);
        }

        if (empty($title)) {
            throw new InvalidParametersException('Title cannot be empty', 407);
        }

        if (!empty($this->_authorizedPerson) && $this->_authorizedPerson->getIsSuperadmin()) {
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidParametersException('Invalid email provided', 408);
            }
            $persons[0]->setEmail($email);
        }

        $webhook = $this->_config->getValue('userinfoHook');
        if (!empty($webhook)) {
            $ch = curl_init($webhook);
            if ($ch) {
                $payload = json_encode([
                    'city' => $city,
                    'country' => $country,
                    'title' => $title,
                    'person_id' => $persons[0]->getId(),
                    'tenhou_id' => $tenhouId,
                ]);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'X-Api-Key: ' . $this->_config->getValue('userinfoHookApiKey')
                ]);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_exec($ch);
                curl_close($ch);
            }
        }

        $ch = curl_init($this->_config->getValue('gullveigUrl'));
        if ($ch) {
            $payload = json_encode([
                'userId' => $id,
                'avatar' => $avatarData
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_exec($ch);
            curl_close($ch);
        }

        // Schedule player stats cache update in mimir
        $mimirClient = new \Common\MimirClient(
            $this->_config->getValue('mimirUrl'),
            null,
            null,
            null,
            '/v2'
        );
        $mimirClient->ClearStatCache([], (new \Common\ClearStatCachePayload())->setPlayerId($id));

        return $persons[0]->setTitle($title)
            ->setCountry($country)
            ->setCity($city)
            ->setPhone($phone)
            ->setTenhouId($tenhouId)
            ->setHasAvatar($hasAvatar)
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
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
            ];
        }, $persons);
    }
}
