<?php
namespace Mimir;

require_once __DIR__ . '/../../src/interfaces/IFreyClient.php';

class FreyClientMock implements IFreyClient
{
    /* @phpstan-ignore-next-line */
    public function __construct(string $apiUrl)
    {
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

    public function requestRegistration(string $email, string $password): string
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

    public function getAccessRules(int $personId, int $eventId): array
    {
        if ($personId === 1) {
            return [
                FreyClient::PRIV_ADMIN_EVENT => true
            ];
        }
        return [];
    }

    public function getRuleValue(int $personId, int $eventId, string $ruleName)
    {
        // TODO: Implement getRuleValue() method.
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
            return ['id' => $id, 'title' => 'player' . $id, 'tenhou_id' => 'player' . $id];
        }, $ids);
    }

    // Expect 'playerN' ids here
    public function findByTenhouIds(array $ids): array
    {
        return array_filter(array_map(function ($id) {
            if ($id === 'NoName') {
                return ['id' => 100, 'title' => 'NoName', 'tenhou_id' => 'NoName'];
            }
            if (strpos($id, 'player') !== 0) {
                return null;
            }
            return ['id' => intval(str_replace('player', '', $id)), 'title' => $id, 'tenhou_id' => $id];
        }, $ids));
    }

    public function findByTitle(string $query): array
    {
        // TODO: Implement findByTitle() method.
        return [];
    }

    public function getGroups(array $ids): array
    {
        // TODO: Implement getGroups() method.
        return [];
    }

    public function getSuperadminFlag(int $personId): bool
    {
        // TODO: Implement getSuperadminFlag() method.
        return true;
    }

    public function getRulesList(): array
    {
        // TODO: Implement getRulesList() method.
        return [];
    }

    public function getPersonAccess(int $personId, $eventId): array
    {
        // TODO: Implement getPersonAccess() method.
        return [];
    }

    public function getGroupAccess(int $groupId, $eventId): array
    {
        // TODO: Implement getGroupAccess() method.
        return [];
    }

    public function getAllPersonAccess(int $personId): array
    {
        // TODO: Implement getAllPersonAccess() method.
        return [];
    }

    public function getAllGroupAccess(int $groupId): array
    {
        // TODO: Implement getAllGroupAccess() method.
        return [];
    }

    public function addRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId, int $eventId)
    {
        // TODO: Implement addRuleForPerson() method.
        /* @phpstan-ignore-line */
    }

    public function addRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId, int $eventId)
    {
        // TODO: Implement addRuleForGroup() method.
        /* @phpstan-ignore-line */
    }

    public function updateRuleForPerson(int $ruleId, $ruleValue, string $ruleType): bool
    {
        // TODO: Implement updateRuleForPerson() method.
        return true;
    }

    public function updateRuleForGroup(int $ruleId, $ruleValue, string $ruleType): bool
    {
        // TODO: Implement updateRuleForGroup() method.
        return true;
    }

    public function deleteRuleForPerson(int $ruleId): bool
    {
        // TODO: Implement deleteRuleForPerson() method.
        return true;
    }

    public function deleteRuleForGroup(int $ruleId): bool
    {
        // TODO: Implement deleteRuleForGroup() method.
        return true;
    }

    public function clearAccessCache(int $personId, int $eventId): bool
    {
        // TODO: Implement clearAccessCache() method.
        return true;
    }

    public function createAccount(string $email, string $password, string $title, string $city, string $phone, string $tenhouId): int
    {
        // TODO: Implement createAccount() method.
        return 0;
    }

    public function createGroup(string $title, string $description, string $color): int
    {
        // TODO: Implement createGroup() method.
        return 0;
    }

    public function updateGroup(int $id, string $title, string $description, string $color): bool
    {
        // TODO: Implement updateGroup() method.
        return true;
    }

    public function deleteGroup(int $id): bool
    {
        // TODO: Implement deleteGroup() method.
        return true;
    }

    public function addPersonToGroup(int $personId, int $groupId): bool
    {
        // TODO: Implement addPersonToGroup() method.
        return true;
    }

    public function removePersonFromGroup(int $personId, int $groupId): bool
    {
        // TODO: Implement removePersonFromGroup() method.
        return true;
    }

    public function getPersonsOfGroup(int $groupId): array
    {
        // TODO: Implement getPersonsOfGroup() method.
        return [];
    }

    public function getGroupsOfPerson(int $personId): array
    {
        // TODO: Implement getGroupsOfPerson() method.
        return [];
    }

    public function addSystemWideRuleForPerson(string $ruleName, $ruleValue, string $ruleType, int $personId)
    {
        // TODO: Implement addSystemWideRuleForPerson() method.
        /* @phpstan-ignore-line */
    }

    public function addSystemWideRuleForGroup(string $ruleName, $ruleValue, string $ruleType, int $groupId)
    {
        // TODO: Implement addSystemWideRuleForGroup() method.
        /* @phpstan-ignore-line */
    }

    public function getEventAdmins(int $eventId): array
    {
        // TODO: Implement getEventAdmins() method.
        return [];
    }

    public function getOwnedEventIds(int $personId): array
    {
        // TODO: Implement getOwnedEventIds() method.
        return [];
    }

    public function getAllEventRules(int $eventId): array
    {
        // TODO: Implement getAllEventRules() method.
        return [];
    }
}
