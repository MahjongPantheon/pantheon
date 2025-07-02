<?php

namespace Mimir;

use Common\Notifications;
use Common\YakuMap;

require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/MultiRound.php';
require_once __DIR__ . '/../../../Common/Notifications.php';
require_once __DIR__ . '/../../../Common/YakuMap.php';

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
     * @param int $han
     * @param int $fu
     * @param bool $withKiriage
     * @param bool $withKazoe
     * @return string
     */
    protected function _toReadableHanFu($han, $fu, $withKiriage = false, $withKazoe = false)
    {
        switch ($han) {
            case 1:
            case 2:
            case 3:
            case 4:
                if ($withKiriage && ($han === 4 && $fu === 30) || ($han === 3 && $fu === 60)) {
                    return 'Mangan';
                }
                return $han . ' han ' . $fu . ' fu';
            case 5:
                return 'Mangan';
            case 6:
            case 7:
                return 'Haneman';
            case 8:
            case 9:
            case 10:
                return 'Baiman';
            case 11:
            case 12:
                return 'Sanbaiman';
            case 13:
                if ($withKazoe) {
                    return 'Yakuman';
                } else {
                    return 'Sanbaiman';
                }
            default:
                if ($han < 0) {
                    return 'Yakuman';
                }
        }
        return '';
    }

    /**
     * @param string $yaku
     * @return string
     */
    protected function _toReadableYaku($yaku)
    {
        $names = YakuMap::getTranslations();
        $list = array_map('intval', explode(',', $yaku));
        return implode(', ', array_map(function ($y) use (&$names) {
            return $names[$y];
        }, $list));
    }

    /**
     * @param int[] $playerIds
     * @param int $eventId
     * @param array $diff
     * @param RoundPrimitive $round
     * @return void
     * @throws InvalidParametersException
     */
    public function messageHandRecorded($playerIds, $eventId, $diff, $round)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        [$disabledForEvent, $eventTitle, $ruleset] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }

        $ids = $this->_getFilteredIdsByPermissions(Notifications::HandHasBeenRecorded, $settings);
        $diffMsg = [];
        $playerMap = $this->_getPlayersMap($settings);

        if ($round instanceof MultiRoundPrimitive) {
            $rounds = $round->rounds();
        } else {
            $rounds = [$round];
        }

        foreach ($diff as $player => $scores) {
            if ($scores[0] !== $scores[1]) {
                $diffMsg [] = '<b>' . $playerMap[$player] . '</b>: ' . $scores[0] . '➡️' . $scores[1]
                    . ' (' . ($scores[1] > $scores[0] ? '+' : '') . ($scores[1] - $scores[0]) . ')';
            }
        }

        if ($rounds[0]->getOutcome() === 'ron' || $rounds[0]->getOutcome() === 'multiron' || $rounds[0]->getOutcome() === 'tsumo') {
            $diffMsg []= '';
            foreach ($rounds as $win) {
                $diffMsg [] = '<b>' . $playerMap[$win->getWinnerId()] . '</b>: - <b>' . $this->_toReadableHanFu(
                    $win->getHan(),
                    $win->getFu(),
                    $ruleset->rules()->getWithKiriageMangan(),
                    $ruleset->rules()->getWithKazoe()
                ) . '</b>, ' . $this->_toReadableYaku($win->getYaku());
            }
        } else {
            if ($rounds[0]->getOutcome() === 'draw') {
                $diffMsg []= 'Exhaustive draw';
            } else if ($rounds[0]->getOutcome() === 'abort') {
                $diffMsg []= 'Abortive draw';
            } else if ($rounds[0]->getOutcome() === 'chombo') {
                $diffMsg []= 'Chombo (' . $playerMap[$rounds[0]->getLoserId()] . ')';
            }
        }

        if (empty($diffMsg)) {
            $diffMsg []= 'No changes';
        }

        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n✍️ New hand has been recorded.\n" .
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
     * @param int $playerId
     * @param int $eventId
     * @param float $amount
     * @param string $reason
     * @return void
     * @throws InvalidParametersException
     */
    public function messagePenaltyApplied($playerId, $eventId, $amount, $reason)
    {
        $settings = $this->_fetchNotificationSettings([$playerId]);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::PenaltyApplied, $settings);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n⚠ A penalty of $amount points has been assigned to you. Reason: $reason\n"
        );
    }

    /**
     * @param int $playerId
     * @param int $eventId
     * @param float $amount
     * @param string $reason
     * @return void
     * @throws InvalidParametersException
     */
    public function messagePenaltyCancelled($playerId, $eventId, $amount, $reason)
    {
        $settings = $this->_fetchNotificationSettings([$playerId]);
        [$disabledForEvent, $eventTitle] = $this->_fetchEventData($eventId);
        if ($disabledForEvent) {
            return;
        }
        $ids = $this->_getFilteredIdsByPermissions(Notifications::PenaltyApplied, $settings);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n⚠ A penalty of $amount points has been cancelled. Reason: $reason\n"
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

        return [mb_strpos($events[0]->getTitle(), 'TEST') !== false, $events[0]->getTitle(), $events[0]->getRulesetConfig()];
    }

    /**
     * @param int[] $playerIds
     * @return array
     * @throws \Exception
     */
    protected function _fetchNotificationSettings($playerIds)
    {
        $players = PlayerPrimitive::findById($this->_ds, $playerIds, true);
        $players = array_filter(array_map(function ($id) use (&$players) {
            // Re-sort players to match request order - important!
            foreach ($players as $p) {
                if ($p->getId() == $id) {
                    return $p;
                }
            }
            return null;
        }, $playerIds));
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
        $admins = $this->_ds->remote()->getEventAdmins($eventId);
        $referees = $this->_ds->remote()->getEventReferees($eventId);
        return array_map(function ($item) {
            return (int)$item['id'];
        }, array_merge($admins, $referees));
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
