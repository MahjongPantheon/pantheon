<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  Original source: https://github.com/fguillot/JsonRPC
 *  Customized HttpClient for the needs of this project :)
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
namespace Mimir;

use WebSocket\Client;
use WebSocket\Exception;

class WsClient
{
    /**
     * @var Client
     */
    private Client $_client;

    /**
     * @var string
     */
    private string $_serverToken;

    /**
     * @param string $url
     * @param string $serverToken
     */
    public function __construct($url, $serverToken)
    {
        $this->_client = new Client($url);
        $this->_serverToken = $serverToken;
    }

    /**
     * @param mixed $payload
     * @return void
     */
    protected function _send($payload)
    {
        try {
            $val = json_encode($payload);
            $this->_client->send($val ? $val : '');
        } catch (Exception $e) {
            // Failed to connect or wrong opcode, do nothing
        }
    }

    /**
     * @param int $eventId
     * @param array $localizedNotification
     * @return void
     */
    public function publishNotification($eventId, $localizedNotification)
    {
        $this->_send([
            't' => 'Notification',
            'd' => [
                'server_token' => $this->_serverToken,
                'event_id' => $eventId,
                'localized_notification' => $localizedNotification
            ]
        ]);
    }

    /**
     * @param string $hash
     * @param array $data
     * @return void
     */
    public function publishGameState($hash, $data)
    {
        $this->_send([
            't' => 'GameState',
            'd' => [
                'server_token' => $this->_serverToken,
                'game_hash' => $hash,
                'data' => $data
            ]
        ]);
    }

    public function __destruct()
    {
        $this->_client->close();
    }
}
