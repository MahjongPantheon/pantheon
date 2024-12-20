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
require_once __DIR__ . '/../primitives/MajsoulPlatformAccountsPrimitive.php';
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
        $personMap = [];
        foreach ($persons as $person) {
            $personMap[$person->getId()] = '';
        }
        $majsoulAccounts = MajsoulPlatformAccountsPrimitive::findByPersonIds($this->_db, array_keys($personMap));

        $personMap = [];
        foreach ($majsoulAccounts as $majsoulAccount) {
            $personMap[$majsoulAccount->getPersonId()] = $majsoulAccount;
        }

        $authPersonId = empty($this->_authorizedPerson) ? 0 : $this->_authorizedPerson->getId();
        return array_map(function (PersonPrimitive $person) use ($personMap, $filterPrivateData, $authPersonId) {
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
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
                'ms_account_id' => $this->_safeExistsKey($person->getId(), $personMap) ? $personMap[$person->getId()]->getAccountId() : null,
                'ms_nickname' => $this->_safeExistsKey($person->getId(), $personMap) ? $personMap[$person->getId()]->getNickname() : null
            ];
        }, $persons);
    }

    /**
     * Depersonalize current account
     *
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function depersonalizeMyAccount()
    {
        if (empty($this->_authorizedPerson)) {
            throw new InvalidParametersException('Should be logged in to depersonalize', 401);
        }

        $id = $this->_authorizedPerson->getId();

        if (empty($id)) {
            throw new InvalidParametersException('Should be logged in to depersonalize', 401);
        }

        $city = '';
        $country = '';
        $title = '[Deleted account #' . $id . ']';
        $tenhouId = '';
        $hasAvatar = false;
        $phone = '';

        $webhook = $this->_config->getValue('userinfoHook');
        if (!empty($webhook)) {
            $ch = curl_init($webhook);
            if ($ch) {
                $payload = json_encode([
                    'city' => $city,
                    'country' => $country,
                    'title' => $title,
                    'person_id' => $id,
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

        $gullveigUrl = $this->_config->getValue('gullveigUrl');
        if (!empty($gullveigUrl)) {
            $ch = curl_init($gullveigUrl);
            if ($ch) {
                $payload = json_encode([
                    'userId' => $id,
                    'avatar' => 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' // empty image
                ]);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json'
                ]);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_exec($ch);
                curl_close($ch);
            }
        }

        $mimirUrl = $this->_config->getValue('mimirUrl');
        if (!empty($mimirUrl)) {
            // Schedule player stats cache update in mimir
            $mimirClient = new \Common\MimirClient(
                $mimirUrl,
                null,
                null,
                null,
                '/v2'
            );
            $mimirClient->ClearStatCache([], (new \Common\ClearStatCachePayload())->setPlayerId($id));
        }

        return $this->_authorizedPerson->setTitle($title)
            ->setCountry($country)
            ->setCity($city)
            ->setPhone($phone)
            ->setTenhouId($tenhouId)
            ->setHasAvatar($hasAvatar)
            ->setTelegramId('')
            ->setAuthHash(sha1(time() . mt_rand(0, 9999999)))
            ->setAuthResetToken(sha1(time() . mt_rand(0, 9999999)))
            ->save();
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
     * @param string $msNickname
     * @param int $msAccountId
     * @param int $msFriendId
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function updatePersonalInfo(int $id, string $title, string $country, string $city, string $email, string $phone, $tenhouId, $hasAvatar, $avatarData, $msNickname, $msAccountId, $msFriendId)
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

        if (!empty($tenhouId) && mb_strlen(trim($tenhouId), 'UTF-8') > 8) {
            throw new InvalidParametersException('Tenhou ID cannot be longer that 8 symbols', 410);
        }

        $superadminOtherEdit = !empty($this->_authorizedPerson) && $this->_authorizedPerson->getIsSuperadmin() && $this->_authorizedPerson->getId() !== $id;
        if ($superadminOtherEdit) {
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidParametersException('Invalid email provided', 408);
            }
            $persons[0]->setEmail($email);
        }

        if (!empty($msNickname) || !$this->_isEmptyNumber($msAccountId) || !$this->_isEmptyNumber($msFriendId)) {
            $currentPersonId = $persons[0]->getId();
            if (!is_null($currentPersonId)) {
                $msAccounts = MajsoulPlatformAccountsPrimitive::findByPersonIds($this->_db, [$currentPersonId]);
                if (empty($msAccounts)) {
                    if (!empty($msNickname) && !$this->_isEmptyNumber($msAccountId) && !$this->_isEmptyNumber($msFriendId)) {
                        $newMsAccount = (new MajsoulPlatformAccountsPrimitive($this->_db))
                            ->setPersonId($currentPersonId)
                            ->setNickname($msNickname)
                            ->setAccountId($msAccountId)
                            ->setFriendId($msFriendId);
                        if (!$newMsAccount->save()) {
                            throw new \Exception('Couldn\'t save MS account to DB', 403);
                        }
                    }
                } else {
                    $currentMsAccount = $msAccounts[0];
                    $needUpdate = false;
                    if (!empty($msNickname)) {
                        $currentMsAccount->setNickname($msNickname);
                        $needUpdate = true;
                    }
                    if (!$this->_isEmptyNumber($msAccountId)) {
                        $currentMsAccount->setAccountId($msAccountId);
                        $needUpdate = true;
                    }
                    if (!$this->_isEmptyNumber($msFriendId)) {
                        $currentMsAccount->setFriendId($msFriendId);
                        $needUpdate = true;
                    }

                    if ($needUpdate) {
                        if (!$currentMsAccount->save()) {
                            throw new \Exception('Couldn\'t update MS account to DB', 403);
                        }
                    }
                }
            }
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

        $gullveigUrl = $this->_config->getValue('gullveigUrl');
        if (!empty($gullveigUrl)) {
            $ch = curl_init($gullveigUrl);
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
        }

        $mimirUrl = $this->_config->getValue('mimirUrl');
        if (!empty($mimirUrl)) {
            // Schedule player stats cache update in mimir
            $mimirClient = new \Common\MimirClient(
                $mimirUrl,
                null,
                null,
                null,
                '/v2'
            );
            $mimirClient->ClearStatCache([], (new \Common\ClearStatCachePayload())->setPlayerId($id));
        }

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
        $personMap = [];
        foreach ($persons as $person) {
            $personMap[$person->getId()] = null;
        }
        $majsoulAccounts = MajsoulPlatformAccountsPrimitive::findByPersonIds($this->_db, array_keys($personMap));

        $personMap = [];
        foreach ($majsoulAccounts as $majsoulAccount) {
            $personMap[$majsoulAccount->getPersonId()] = $majsoulAccount;
        }

        $authPersonId = empty($this->_authorizedPerson) ? 0 : $this->_authorizedPerson->getId();
        return array_map(function (PersonPrimitive $person) use ($personMap, $filterPrivateData, $authPersonId) {
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
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
                'ms_account_id' => $this->_safeExistsKey($person->getId(), $personMap) ? $personMap[$person->getId()]->getAccountId() : null,
                'ms_nickname' => $this->_safeExistsKey($person->getId(), $personMap) ? $personMap[$person->getId()]->getNickname() : null
            ];
        }, $persons);
    }

    /**
     * Find accounts by id list.
     *
     * @param int[] $ids
     * @return array
     * @throws \Frey\AccessDeniedException
     */
    public function findById($ids): array
    {
        $filterPrivateData = false;
        try {
            $this->_checkAccessRights(InternalRules::GET_PERSONAL_INFO_WITH_PRIVATE_DATA);
        } catch (AccessDeniedException $e) {
            // No access, filter out private data
            $filterPrivateData = true;
        }

        $persons = PersonPrimitive::findById($this->_db, $ids);
        $authPersonId = empty($this->_authorizedPerson) ? 0 : $this->_authorizedPerson->getId();
        return array_map(function (PersonPrimitive $person) use ($filterPrivateData, $authPersonId) {
            return [
                'id' => $person->getId(),
                'city' => $person->getCity(),
                'email' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getEmail(),
                'phone' => $filterPrivateData && $person->getId() !== $authPersonId ? null : $person->getPhone(),
                'tenhou_id' => $person->getTenhouId(),
                'telegram_id' => $person->getTelegramId(),
                'notifications' => $person->getNotifications(),
                'groups' => $person->getGroupIds(),
                'title' => $person->getTitle(),
                'has_avatar' => $person->getHasAvatar(),
                'last_update' => $person->getLastUpdate(),
            ];
        }, $persons);
    }

    /**
     * @param int[] $ids
     * @return array[]
     */
    public function getMajsoulNicknames($ids)
    {
        $accounts = MajsoulPlatformAccountsPrimitive::findByPersonIds($this->_db, $ids);
        return array_map(function ($acc) {
            return ['id' => $acc->getPersonId(), 'nickname' => $acc->getNickname()];
        }, $accounts);
    }

    /**
     * Get person's notifications settings
     *
     * @param int $personId
     * @return array
     * @throws AccessDeniedException|InvalidParametersException
     */
    public function getNotificationsSettings($personId)
    {
        if ($this->_meta->getCurrentPersonId() === null || $this->_meta->getCurrentPersonId() !== $personId) {
            throw new AccessDeniedException('You are not allowed to view notifications settings');
        }
        $person = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($person)) {
            throw new InvalidParametersException('Person is not found in DB');
        }

        return [
            'telegram_id' => $person[0]->getTelegramId(),
            'notifications' => $person[0]->getNotifications()
        ];
    }

    /**
     * Set person's notifications settings
     *
     * @param int $personId
     * @param string $telegramId
     * @param string $notifications
     * @return bool
     * @throws AccessDeniedException
     * @throws InvalidParametersException
     */
    public function setNotificationsSettings($personId, string $telegramId, string $notifications)
    {
        if ($this->_meta->getCurrentPersonId() === null || $this->_meta->getCurrentPersonId() !== $personId) {
            throw new AccessDeniedException('You are not allowed to update notifications settings');
        }
        $person = PersonPrimitive::findById($this->_db, [$personId]);
        if (empty($person)) {
            throw new InvalidParametersException('Person is not found in DB');
        }

        return $person[0]->setTelegramId($telegramId)->setNotifications($notifications)->save();
    }
}
