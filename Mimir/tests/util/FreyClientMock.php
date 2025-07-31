<?php
namespace Mimir;

require_once __DIR__ . '/../../src/interfaces/IFreyClient.php';

class FreyClientMock implements IFreyClient
{

    /**
     * @var array $_mockPlayerNameMap
     */
    private $_mockPlayerNameMap;

    /* @phpstan-ignore-next-line */
    public function __construct(string $apiUrl, $mockPlayerNameMap = array())
    {
        $this->_mockPlayerNameMap = $mockPlayerNameMap;
    }

    /**
     * @param mixed $h
     * @return bool
     */
    public function withHeaders($h)
    {
        return true;
    }

    public function getClient()
    {
        /* @phpstan-ignore-next-line */
        return new class {
            /**
             * @return mixed
             */
            public function getHttpClient()
            {
                return new class {
                    /**
                     * @return void
                     */
                    public function withHeaders()
                    {
                    }
                };
            }
        };
    }

    public function requestRegistration(string $email, string $title, string $password): string
    {
        // TODO: Implement requestRegistration() method.
        return '';
    }

    public function approveRegistration(string $approvalCode): int
    {
        // TODO: Implement approveRegistration() method.
        return 0;
    }

    public function authorize(string $email, string $password): array
    {
        // TODO: Implement authorize() method.
        return [];
    }

    public function quickAuthorize(int $id, string $clientSideToken): bool
    {
        // TODO: Implement quickAuthorize() method.
        return true;
    }

    public function changePassword(string $email, string $password, string $newPassword): string
    {
        // TODO: Implement changePassword() method.
        return '';
    }

    public function requestResetPassword(string $email): string
    {
        // TODO: Implement requestResetPassword() method.
        return '';
    }

    public function approveResetPassword(string $email, string $resetApprovalCode): string
    {
        // TODO: Implement approveResetPassword() method.
        return '';
    }

    public function updatePersonalInfo(int $id, string $title, string $city, string $country, string $email, string $phone, string $tenhouId): bool
    {
        // TODO: Implement updatePersonalInfo() method.
        return true;
    }

    public function getPersonalInfo(array $ids): array
    {
        $ids = array_filter($ids, function ($id) {
            return $id < 1000;
        });
        return array_map(function ($id) {
            return [
                'id' => $id,
                'title' => 'player' . $id,
                'tenhou_id' => $this->resolvePlayerName($id),
                'has_avatar' => false,
                'last_update' => date('Y-m-d H:i:s'),
                'telegram_id' => '',
                'notifications' => ''
            ];
        }, $ids);
    }

    /**
     * @param int $id
     * @return string return player name
     */
    private function resolvePlayerName($id): string
    {
        if (array_key_exists($id, $this->_mockPlayerNameMap)) {
            return $this->_mockPlayerNameMap[$id];
        } else {
            return 'player' . $id;
        }
    }

    // Expect 'playerN' ids here
    public function findByTenhouIds(array $ids): array
    {
        return array_filter(array_map(function ($id) {
            if ($id === 'NoName') {
                return ['id' => 100, 'title' => 'NoName', 'tenhou_id' => 'NoName'];
            }

            if (!empty($this->_mockPlayerNameMap)) {
                if (!in_array($id, $this->_mockPlayerNameMap)) {
                    return null;
                }
            } else if (strpos($id, 'player') !== 0) {
                return null;
            }
            return [
                'id' => $this->resolvePlayerId($id),
                'title' => $id,
                'tenhou_id' => $id,
                'has_avatar' => false,
                'last_update' => date('Y-m-d H:i:s'),
                'telegram_id' => '',
                'notifications' => ''
            ];
        }, $ids));
    }

    /**
     * @param int $tenhouId
     * @return int return player id
     */
    private function resolvePlayerId($tenhouId): int
    {
        if (!empty($this->_mockPlayerNameMap)) {
            return intval(array_keys($this->_mockPlayerNameMap, $tenhouId)[0]);
        }
        return intval(str_replace('player', '', strval($tenhouId)));
    }

    /**
     * @param int $msAccountId
     * @return int return player id
     */
    private function resolvePlayerIdByMsAccountId($msAccountId): int
    {
        if (!empty($this->_mockPlayerNameMap)) {
            if (array_key_exists($msAccountId, $this->_mockPlayerNameMap)) {
                return intval($msAccountId);
            }
        }
        return -1;
    }

    public function findByTitle(string $query): array
    {
        // TODO: Implement findByTitle() method.
        return [];
    }

    public function getSuperadminFlag(int $personId): bool
    {
        // TODO: Implement getSuperadminFlag() method.
        return true;
    }

    public function addRuleForPerson(string $ruleName, int $ruleValue, int $personId, int $eventId)
    {
        return 123;
        // TODO: Implement addRuleForPerson() method.
        /* @phpstan-ignore-line */
    }

    public function deleteRuleForPerson(int $ruleId): bool
    {
        // TODO: Implement deleteRuleForPerson() method.
        return true;
    }

    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId): int
    {
        // TODO: Implement createAccount() method.
        return 0;
    }

    public function getEventAdmins(int $eventId): array
    {
        // TODO: Implement getEventAdmins() method.
        return [['id' => 1]];
    }

    public function getOwnedEventIds(int $personId): array
    {
        // TODO: Implement getOwnedEventIds() method.
        return [];
    }

    public function me(): array
    {
        // TODO: Implement me() method.
        return [];
    }

    public function findByMajsoulAccountId(array $playersMapping): array
    {
        $majsoulMapping = [];
        if (!empty($this->_mockPlayerNameMap)) {
            foreach ($this->_mockPlayerNameMap as $mockAccountId => $mockPlayer) {
                $majsoulMapping[$mockPlayer . "-" . $mockAccountId] = [
                    'player_name' => $mockPlayer,
                    'account_id' => $mockAccountId
                ];
            }
        }

        return array_filter(array_map(function ($item) use ($majsoulMapping) {
            $id = $item['player_name'];

            $msAccountId = -1;
            if (!empty($majsoulMapping)) {
                $key = $id . "-" . $item['account_id'];
                if (!array_key_exists($key, $majsoulMapping)) {
                    return null;
                }
                $msAccountId = $majsoulMapping[$key]['account_id'];
            } else if (strpos($id, 'player') !== 0) {
                return null;
            }

            $playerId = -1;
            if ($msAccountId !== -1) {
                $playerId = $this->resolvePlayerIdByMsAccountId($msAccountId);
            } else {
                $playerId = $this->resolvePlayerId($id);
            }
            return ['id' => $playerId,
                'title' => $id,
                'tenhou_id' => $id,
                'has_avatar' => false,
                'last_update' => date('Y-m-d H:i:s'),
                'telegram_id' => '',
                'notifications' => '',
                'ms_account_id' => $msAccountId,
                'ms_nickname' => $id];
        }, $playersMapping));
    }

    public function getMajsoulNicknames($ids)
    {
        if (!empty($this->_mockPlayerNameMap)) {
            $majsoulNicknames = [];
            foreach ($ids as $id) {
                $majsoulNicknames[$id] = $this->_mockPlayerNameMap[$id];
            }
            return $majsoulNicknames;
        }
        return [];
    }

    public function getEventReferees(int $eventId): array
    {
        return [];
    }
}
