<?php

namespace Mimir;

require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';

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
        $ids = $this->_fetchTelegramIds($playerIds);
        $eventTitle = $this->_fetchEventTitle($eventId);
        $this->_sendMessage(
            $ids,
            "[<b>$eventTitle</b>]\n\nThe seating for next round is ready! Please don't be late!"
        );
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
     * @return string[]
     * @throws \Exception
     */
    protected function _fetchTelegramIds($playerIds)
    {
        $players = PlayerPrimitive::findById($this->_ds, $playerIds);
        return array_values(array_filter(array_map(function ($p) {
            return (string)$p->getTelegramId();
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
                'to' => array_filter($telegramIds),
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
