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
     * @param int $eventId
     * @return void
     */
    public function messageSeatingReady($playerIds, $eventId)
    {
        $settings = $this->_fetchNotificationSettings($playerIds);
        $eventTitle = $this->_fetchEventTitle($eventId);
        $ids = $this->_getFilteredIdsByPermissions(Notifications::SessionSeatingReady, $settings);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n\nThe seating for next round is ready! Please don't be late!"
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
     * @return string
     * @throws InvalidParametersException
     */
    protected function _fetchEventTitle($eventId)
    {
        $events = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($events)) {
            throw new InvalidParametersException('Event not found in DB');
        }

        return $events[0]->getTitle();
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
                'telegram_id' => $p->getTelegramId(),
                'notifications' => $p->getNotifications()
            ];
        }, $players)));
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
