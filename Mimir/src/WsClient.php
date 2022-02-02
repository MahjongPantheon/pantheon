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
use WebSocket\BadOpcodeException;
use WebSocket\Client;

class WsClient {
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
     */
    public function __construct($url, $serverToken)
    {
        $this->_client = new Client($url);
        $this->_serverToken = $serverToken;
    }

    /**
     * @param int $eventId
     * @param array $localizedNotification
     * @throws BadOpcodeException
     */
    public function publishNotification($eventId, $localizedNotification)
    {
        $this->_client->send(json_encode([
            't' => 'Notification',
            'd' => [
                'server_token' => $this->_serverToken,
                'event_id' => $eventId,
                'localized_notification' => $localizedNotification
            ]
        ]));
    }

    /**
     * @param string $hash
     * @param array $data
     * @throws BadOpcodeException
     */
    public function publishGameState($hash, $data)
    {
        $this->_client->send(json_encode([
            't' => 'GameState',
            'd' => [
                'server_token' => $this->_serverToken,
                'game_hash' => $hash,
                'data' => $data
            ]
        ]));
    }

    public function __destruct()
    {
        $this->_client->close();
    }
}
