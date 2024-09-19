<?php

namespace Mimir;

use Common\Notifications;

require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../../../Common/Notifications.php';

class SkirnirClient
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var string
     */
    protected $_apiUrl = '';

    /**
     * @param DataSource $ds
     * @param string $apiUrl
     */
    public function __construct($ds, $apiUrl)
    {
        $this->_ds = $ds;
        $this->_apiUrl = $apiUrl;
    }

    /**
     * @param int[] $playerIds
     * @param int $table
     * @param int $eventId
     * @return void
     * @throws InvalidParametersException
     */
    public function messageSeatingReady($playerIds, $table, $eventId)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::SessionSeatingReady, $settings);
        $winds = ['東', '南', '西', '北'];
        $namesAndWinds = [];
        for ($i = 0; $i < 4; $i++) {
            foreach ($settings as $player) {
                if ($player['id'] === $playerIds[$i]) {
                    $namesAndWinds []= $winds[$i] . ' ' . $player['title'];
                }
            }
        }
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n\n🪑 The seating for next round is ready! " .
            " Your table is #$table - please don't be late!\n\n" .
            "Seating at your table is: \n" .
            implode("\n", $namesAndWinds)
        );
    }

    /**
     * @param int[] $playerIds
     * @param int $eventId
     * @return void
     * @throws InvalidParametersException
     */
    public function messageSessionStartingSoon($playerIds, $eventId)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::SessionStartingSoon, $settings);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n\n🏃 Next session is about to start! Please head to your table now!"
        );
    }

    /**
     * @param int $eventId
     * @param int $tableId
     * @return void
     * @throws InvalidParametersException
     */
    public function messageCallReferee($eventId, int $tableId)
    {
        $refereeIds = $this->_fetchReferees($eventId);
        $settings = $this->_fetchNotificationSettings($refereeIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::RefereeCalled, $settings);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n\n⚠️⚠️ Referee is requested at table # $tableId"
        );
    }

    /**
     * @param string $sessionHash
     * @return void
     */
    public function trackSession($sessionHash)
    {
        $this->_sendMessage(['TRACKER'], $sessionHash);
    }

    /**
     * @param int[] $playerIds
     * @param int $eventId
     * @param array $diff
     * @return void
     * @throws InvalidParametersException
     */
    public function messageHandRecorded($playerIds, $eventId, $diff)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::HandHasBeenRecorded, $settings);
        $diffMsg = [];
        $playerMap = $this->_getPlayersMap($settings);
        foreach ($diff as $player => $scores) {
            if ($scores[0] !== $scores[1]) {
                $diffMsg [] = '<b>' . $playerMap[$player] . '</b>: ' . $scores[0] . '➡️' . $scores[1]
                    . ' (' . ($scores[1] > $scores[0] ? '+' : '') . ($scores[1] - $scores[0]) . ')';
            }
        }
        if (empty($diffMsg)) {
            $diffMsg []= 'No changes';
        }

        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n✍️ New hand has been recorded. Score changes:\n" .
                implode("\n", $diffMsg)
        );
    }

    /**
     * @param int[] $playerIds
     * @param int $eventId
     * @param array $results
     * @return void
     * @throws InvalidParametersException
     */
    public function messageClubSessionEnd($playerIds, $eventId, $results)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::ClubSessionEnded, $settings);
        $playerMap = $this->_getPlayersMap($settings);
        $resultsMsg = [];
        foreach ($results as $player => $score) {
            $resultsMsg []= '<b>' . $playerMap[$player] . '</b>: ' . $score;
        }
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n🏁 Session has ended. Results: \n" . implode("\n", $resultsMsg)
        );
    }

    /**
     * @param int[] $playerIds
     * @param int $eventId
     * @param array $results
     * @return void
     * @throws InvalidParametersException
     */
    public function messageTournamentSessionEnd($playerIds, $eventId, $results)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::TournamentSessionEnded, $settings);
        $playerMap = $this->_getPlayersMap($settings);
        $resultsMsg = [];
        foreach ($results as $player => $score) {
            $resultsMsg []= '<b>' . $playerMap[$player] . '</b>: ' . $score;
        }
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n🏁 Session has ended. Results: \n" . implode("\n", $resultsMsg)
        );
    }

    /**
     * @param string $type
     * @param array $settings
     * @return array
     */
    protected function _getFilteredIdsByPermissions(string $type, $settings)
    {
        $ids = [];
        foreach ($settings as $userSettings) {
            if (empty($userSettings['telegram_id'])) {
                continue;
            }
            $userNotifications = Notifications::get($userSettings['notifications']);
            if (empty($userNotifications[$type])) {
                continue;
            }
            $ids []= $userSettings['telegram_id'];
        }

        return $ids;
    }

    /**
     * @param int $eventId
     * @return array
     * @throws InvalidParametersException
     */
    protected function _fetchEventData($eventId)
    {
        $events = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($events)) {
            throw new InvalidParametersException('Event not found in DB');
        }

        return [mb_strpos($events[0]->getTitle(), 'TEST') !== false, $events[0]->getTitle()];
    }

    /**
     * @param int[] $playerIds
     * @return array
     * @throws \Exception
     */
    protected function _fetchNotificationSettings($playerIds)
    {
        $players = PlayerPrimitive::findById($this->_ds, $playerIds, true);
        return array_values(array_filter(array_map(function ($p) {
            return [
                'id' => $p->getId(),
                'title' => $p->getDisplayName(),
                'telegram_id' => $p->getTelegramId(),
                'notifications' => $p->getNotifications()
            ];
        }, $players)));
    }

    /**
     * @param int $eventId
     * @return array
     */
    protected function _fetchReferees($eventId)
    {
        return array_map(function ($item) {
            return (int)$item['id'];
        }, $this->_ds->remote()->getEventAdmins($eventId));
    }

    /**
     * @param array $settings
     * @return array
     */
    protected function _getPlayersMap($settings)
    {
        $map = [];
        foreach ($settings as $p) {
            $map[$p['id']] = $p['title'];
        }
        return $map;
    }

    /**
     * @param string[] $telegramIds
     * @param string $message
     * @return void
     */
    protected function _sendMessage($telegramIds, string $message)
    {
        $ch = curl_init($this->_apiUrl);
        if ($ch) {
            $payload = json_encode([
                'to' => $telegramIds,
                'message' => $message
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
}
