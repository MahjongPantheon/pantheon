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
require_once __DIR__ . '/../helpers/onlineLog/Parser.php';
require_once __DIR__ . '/../helpers/onlineLog/Tenhou6OnlineParser.php';
require_once __DIR__ . '/../helpers/onlineLog/Downloader.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/Parser.php';
require_once __DIR__ . '/../helpers/ReplayContentTypeUtils.php';
require_once __DIR__ . '/../models/ReplayContentType.php';

class OnlineSessionModel extends Model
{

    /**
     * @param int $eventId
     * @param string $replayHash
     * @param int $logTimestamp
     * @param string $gameContent
     * @param int $platformId
     * @param int $contentType
     * @return SessionPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    public function addTypedGame(int $eventId, $replayHash, $logTimestamp, $gameContent, $platformId, $contentType)
    {
        $event = $this->checkAndGetEvent($eventId);

        $this->_checkGameTimestampExpired($logTimestamp, $event->getRulesetConfig());
        $this->checkReplayHash($eventId, $replayHash);

        return $this->addGameContent($event, $replayHash, $gameContent, $contentType, $platformId);
    }

    /**
     * @param int $eventId
     * @param string $logUrl
     * @param string $gameContent
     * @return SessionPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    public function addGame(int $eventId, string $logUrl = '', $gameContent = '')
    {
        $event = $this->checkAndGetEvent($eventId);

        $replayHash = '';
        $downloader = new Downloader();
        if (!empty($logUrl)) {
            $downloader->validateUrl($logUrl);
            $replayHash = $downloader->getReplayHash($logUrl);
        }

        $this->_checkGameExpired($logUrl, $event->getRulesetConfig());
        $this->checkReplayHash($eventId, $replayHash);

        // if game log wasn't set, let's download it from the server
        if ($gameContent == '') {
            $replay = $downloader->getReplay($logUrl);
            $gameContent = $replay['content'];
        }

        return $this->addGameContent($event, $replayHash, $gameContent);
    }

    /**
     * @param EventPrimitive $event
     * @param string $replayHash
     * @param string $gameContent
     * @param int $contentType
     * @param int $platformId
     * @return SessionPrimitive
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    private function addGameContent(EventPrimitive $event, string $replayHash, $gameContent, $contentType = 1, $platformId = 1)
    {
        $replayContentType = ReplayContentTypeUtils::getContentType($contentType);
        $parser = null;
        if ($replayContentType === ReplayContentType::Xml) {
            $parser = new OnlineParser($this->_ds);
        } else if ($replayContentType === ReplayContentType::Json) {
            $parser = new Tenhou6OnlineParser($this->_ds);
        }

        $session = (new SessionPrimitive($this->_ds))
            ->setEvent($event)
            ->setReplayHash($replayHash)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS);

        $withChips = $event->getRulesetConfig()->rules()->getChipsValue() > 0;

        if (is_null($parser)) {
            return $session;
        }

        list($success, $originalScore, $rounds, $debug) = $parser->parseToSession($session, $gameContent, $withChips, $platformId);

        if ($event[0]->getRulesetConfig()->rules()->getWithYakitori()) {
            $yakitori = [];
            foreach ($session->getPlayersIds() as $id) {
                $yakitori[$id] = true;
            }
            $session->getCurrentState()->setYakitori($yakitori);
        }

        $success = $success && $session->save();

        /** @var MultiRoundPrimitive|RoundPrimitive $round */
        foreach ($rounds as $round) {
            $round->setSession($session);
            $success = $success && $round->save();
        }

        $session->scheduleRecalcStats();
        $success = $success && $session->finish();
        if (!$success) {
            throw new \Exception("Wasn't able to properly save the game.");
        }

        // TODO enable after investigation of failed added logs
//        $calculatedScore = $session->getCurrentState()->getScores();
//        if (array_diff($calculatedScore, $originalScore) !== []
//            || array_diff($originalScore, $calculatedScore) !== []) {
//            throw new ParseException("Calculated scores do not match with given ones: " . PHP_EOL
//                . print_r($originalScore, true) . PHP_EOL
//                . print_r($calculatedScore, true), 225);
//        }

        return $session;
    }

    /**
     * @param EventPrimitive $event
     * @return void
     * @throws InvalidParametersException
     */
    private function validateEvent($event)
    {
        if (!$event->getIsOnline()) {
            throw new InvalidParametersException('Unable to add online game to event that is not online.');
        }

        if ($event->getIsFinished() > 0) {
            throw new InvalidParametersException('Unable to add online game to event that is already finished.');
        }
    }

    /**
     * @param int $eventId
     * @return EventPrimitive
     * @throws InvalidParametersException
     */
    private function checkAndGetEvent($eventId): EventPrimitive
    {
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        $currentEvent = $event[0];
        $this->validateEvent($currentEvent);
        return $currentEvent;
    }

    /**
     * @param int $eventId
     * @param string $replayHash
     * @return void
     * @throws InvalidParametersException
     */
    private function checkReplayHash($eventId, $replayHash = ''): void
    {
        $addedSession = SessionPrimitive::findByReplayHashAndEvent($this->_ds, $eventId, $replayHash);
        if (!empty($addedSession)) {
            throw new InvalidParametersException('This game is already added to the system');
        }
    }

    /**
     * Check if game is not older than some amount of time defined in ruleset
     *
     * @param int $logTimestamp
     * @param \Common\Ruleset $rules
     *
     * @throws ParseException
     *
     * @return void
     */
    protected function _checkGameTimestampExpired(int $logTimestamp, \Common\Ruleset $rules): void
    {
        if (!$rules->rules()->getGameExpirationTime()) {
            return;
        }

        if (time() - $logTimestamp < $rules->rules()->getGameExpirationTime() * 60 * 60) {
            return;
        }

        throw new ParseException('Replay is older than ' . $rules->rules()->getGameExpirationTime() . ' hours (within JST timezone), so it can\'t be accepted.');
    }

    /**
     * Check if game is not older than some amount of time defined in ruleset
     *
     * @param string $gameLink
     * @param \Common\Ruleset $rules
     *
     * @throws ParseException
     *
     * @return void
     */
    protected function _checkGameExpired(string $gameLink, \Common\Ruleset $rules): void
    {
        if (!$rules->rules()->getGameExpirationTime()) {
            return;
        }

        $regex = '#(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})gm#is';
        $matches = [];
        if (preg_match($regex, $gameLink, $matches)) {
            $date = mktime((int)$matches['hour'], 0, 0, (int)$matches['month'], (int)$matches['day'], (int)$matches['year']);
            if (time() - $date < $rules->rules()->getGameExpirationTime() * 60 * 60) {
                return;
            }
        }

        throw new ParseException('Replay is older than ' . $rules->rules()->getGameExpirationTime() . ' hours (within JST timezone), so it can\'t be accepted.');
    }
}
