<?php
/*  Mimir: mahjong games storage
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
namespace Mimir;

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/textLog/Parser.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';

class TextmodeSessionModel extends Model
{
    /**
     * @param int $eventId
     * @param string $gameLog
     * @param array $idMap
     * @return bool
     * @throws InvalidParametersException
     * @throws MalformedPayloadException
     * @throws \Exception
     * @throws ParseException
     */
    public function addGame(int $eventId, string $gameLog, array $idMap)
    {
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $parser = new TextlogParser($this->_ds, $idMap);
        $session = (new SessionPrimitive($this->_ds))
            ->setEvent($event[0])
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS);

        list($originalScore, $debug) = $parser->parseToSession($session, $gameLog);
        $success = $session->save();
        $success = $success && $session->prefinish();

        $calculatedScore = $session->getCurrentState()->getScores();
        $aliases = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $session->getPlayers());

        if (array_diff($calculatedScore, $originalScore) !== []
            || array_diff($originalScore, $calculatedScore) !== []) {
            throw new ParseException("Calculated scores do not match with given ones: " . PHP_EOL
                . json_encode(array_combine($aliases, array_values($originalScore)), JSON_PRETTY_PRINT) . PHP_EOL
                . json_encode(array_combine($aliases, array_values($calculatedScore)), JSON_PRETTY_PRINT) . PHP_EOL
                . "Here is log changes list for your convenience: \n" . implode("\n", $debug), 225);
        }

        return $success;
    }
}
