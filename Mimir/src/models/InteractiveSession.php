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
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/AuthFailed.php';
require_once __DIR__ . '/../exceptions/InvalidUser.php';
require_once __DIR__ . '/../exceptions/BadAction.php';
require_once __DIR__ . '/../exceptions/Database.php';

/**
 * Class SessionModel
 *
 * Domain model for high-level logic
 * @package Mimir
 */
class InteractiveSessionModel extends Model
{
    /**
     * @throws InvalidParametersException
     * @throws InvalidUserException
     * @throws DatabaseException
     * @param int $eventId
     * @param int[] $playerIds
     * @param int $tableIndex - Table number in tournament
     * @param string $replayHash
     * @param string $origLink
     * @return string
     */
    public function startGame($eventId, $playerIds, $tableIndex = null, $replayHash = null, $origLink = null)
    {
        $this->_checkAuth($playerIds, $eventId);
        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }

        if (!is_array($playerIds)) {
            throw new InvalidParametersException('Players list is not array');
        }

        $players = PlayerPrimitive::findById($this->_db, $playerIds);
        $players = array_filter(array_map(function ($id) use (&$players) {
            // Re-sort players to match request order - important!
            foreach ($players as $p) {
                if ($p->getId() == $id) {
                    return $p;
                }
            }
            return null;
        }, $playerIds));

        if (count($players) !== 4) {
            throw new InvalidUserException('Some players do not exist in DB, check ids');
        }

        $newSession = new SessionPrimitive($this->_db);
        $success = $newSession
            ->setEvent($event[0])
            ->setPlayers($players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash($replayHash)
            ->setTableIndex($tableIndex)
            ->save();
        if (!$success) {
            throw new DatabaseException('Couldn\'t save session data to DB!');
        }

        $this->_trackUpdate($newSession->getRepresentationalHash());
        return $newSession->getRepresentationalHash();
    }

    /**
     * This method is strictly for premature end of session (timeout, etc)
     * Normal end or pre-finish should happen when final round is added.
     *
     * @param $gameHash
     * @return bool
     */
    public function endGame($gameHash)
    {
        $session = $this->_findGame($gameHash, SessionPrimitive::STATUS_INPROGRESS);
        $this->_checkAuth($session->getPlayersIds(), $session->getEventId());
        return $session->prefinish();
    }

    /**
     * Finalize all sessions in event
     *
     * @param $eventId
     * @throws AuthFailedException
     * @return int count of finalized sessions
     */
    public function finalizeSessions($eventId)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to finalize sessions');
        }

        $games = SessionPrimitive::findByEventAndStatus($this->_db, $eventId, 'prefinished');
        if (empty($games)) {
            return 0;
        }

        return array_reduce($games, function ($acc, SessionPrimitive $p) {
            return $p->finish() ? $acc + 1 : $acc;
        }, 0);
    }

    /**
     * @param $gameHashcode string Hashcode of game
     * @param $roundData array Structure of round data
     * @param $dry boolean Dry run (no save to DB)
     * @throws InvalidParametersException
     * @throws BadActionException
     * @throws AuthFailedException
     * @return bool|array Success?|Results of dry run
     */
    public function addRound($gameHashcode, $roundData, $dry = false)
    {
        $session = $this->_findGame($gameHashcode, SessionPrimitive::STATUS_INPROGRESS);
        $this->_checkAuth($session->getPlayersIds(), $session->getEventId());

        if ($session->getEvent()->getGamesStatus() == EventPrimitive::GS_SEATING_READY) {
            // We should not allow adding new rounds if session is not started yet
            throw new BadActionException('Sessions are ready, but not started yet. You can\'t add new round now');
        }

        // TODO: checks are not atomic
        // check that same game is not passed
        $currentHonba = $session->getCurrentState()->getHonba();
        $currentRound = $session->getCurrentState()->getRound();
        $currentDealer = $session->getCurrentState()->getCurrentDealer();
        $currentRiichi = $session->getCurrentState()->getRiichiBets();
        $currentScores = $session->getCurrentState()->getScores();
        if ($roundData['round_index'] != $currentRound || $roundData['honba'] != $currentHonba) {
            throw new InvalidParametersException('This round is already recorded (or other round index/honba mismatch)');
        }

        $round = RoundPrimitive::createFromData($this->_db, $session, $roundData);

        if ($dry) {
            list(, $paymentsInfo) = $session->dryRunUpdateCurrentState($round);

            $multiGet = function (RoundPrimitive $p, $method) {
                if ($p instanceof MultiRoundPrimitive) {
                    return array_map(function (RoundPrimitive $inner) use ($method) {
                        return $inner->{$method}();
                    }, $p->rounds());
                }

                return $p->{$method}();
            };

            // Warning! Should match PlayersController::getLastRound return format!
            $result = [
                'outcome'    => $round->getOutcome(),
                'penaltyFor' => $round->getOutcome() === 'chombo' ? $round->getLoserId() : null,
                'riichiIds'  => $round->getRiichiIds(),
                'dealer'     => $currentDealer,
                'round'      => $currentRound,
                'riichi'     => $currentRiichi,
                'honba'      => $currentHonba,
                'scores'     => $currentScores, // scores before payments!
                'payments'   => $paymentsInfo,
                'winner'     => $multiGet($round, 'getWinnerId'),
                'paoPlayer'  => $multiGet($round, 'getPaoPlayerId'),
                'yaku'       => $multiGet($round, 'getYaku'),
                'han'        => $multiGet($round, 'getHan'),
                'fu'         => $multiGet($round, 'getFu'),
                'dora'       => $multiGet($round, 'getDora'),
                'kandora'    => $multiGet($round, 'getKandora'),
                'uradora'    => $multiGet($round, 'getUradora'),
                'kanuradora' => $multiGet($round, 'getKanuradora'),
                'openHand'   => $multiGet($round, 'getOpenHand')
            ];

            if (is_array($result['paoPlayer'])) {
                // pao player may be only one
                $result['paoPlayer'] = reset(array_filter($result['paoPlayer'])) or null;
            }

            return $result;
        }

        return $round->save() && $session->updateCurrentState($round) && $this->_trackUpdate($gameHashcode);
    }

    /**
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @return bool
     * @throws AuthFailedException
     * @throws InvalidParametersException
     */
    public function addPenalty($eventId, $playerId, $amount, $reason)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to add penalties');
        }

        $session = SessionPrimitive::findLastByPlayerAndEvent($this->_db, $playerId, $eventId, SessionPrimitive::STATUS_INPROGRESS);
        if (empty($session)) {
            throw new InvalidParametersException("Couldn't find session in DB");
        }

        if (!$session->getEvent()->getUsePenalty()) {
            throw new InvalidParametersException('This event doesn\'t support adding penalties');
        }

        if (!in_array($playerId, $session->getPlayersIds())) {
            throw new InvalidParametersException("This player does not play this game");
        }

        // TODO: save extra penalties in extra table, so round rollback would not affect them
        $session->getCurrentState()->addPenalty($playerId, $amount, $reason);
        return $session->save();
    }

    /**
     * @param $gameHash
     * @param $withStatus
     * @return SessionPrimitive
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    protected function _findGame($gameHash, $withStatus)
    {
        $game = SessionPrimitive::findByRepresentationalHash($this->_db, [$gameHash]);
        if (empty($game)) {
            throw new InvalidParametersException("Couldn't find session in DB");
        }

        if ($game[0]->getStatus() !== $withStatus) {
            throw new BadActionException("This action is not supported over the game in current status");
        }

        return $game[0];
    }

    protected function _checkAuth($playersIds, $eventId)
    {
        // Check that real session player is trying to enter data
        $evMdl = new EventModel($this->_db, $this->_config, $this->_meta);
        if (!$evMdl->checkToken($playersIds[0], $eventId) &&
            !$evMdl->checkToken($playersIds[1], $eventId) &&
            !$evMdl->checkToken($playersIds[2], $eventId) &&
            !$evMdl->checkToken($playersIds[3], $eventId)
        ) {
            throw new AuthFailedException('Authentication failed! Ask for some assistance from admin team', 403);
        }
    }

    /**
     * Check if token allows administrative operations
     * @return bool
     */
    public function checkAdminToken()
    {
        return $this->_meta->getAuthToken() === $this->_config->getValue('admin.god_token');
    }

    /**
     * Drop last round from session (except if this last round has led to session finish)
     *
     * @param $gameHash
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @return boolean
     */
    public function dropLastRound($gameHash)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to drop last round');
        }

        $session = SessionPrimitive::findByRepresentationalHash($this->_db, [$gameHash]);
        if (empty($session)) {
            throw new InvalidParametersException("Couldn't find session in DB");
        }

        if ($session[0]->getStatus() === SessionPrimitive::STATUS_FINISHED) {
            throw new InvalidParametersException('Session id#' . $session[0]->getId() . ' is already finished. '
                . 'Can\'t alter finished sessions');
        }

        $rounds = RoundPrimitive::findBySessionIds($this->_db, [$session[0]->getId()]);
        if (empty($rounds)) {
            throw new InvalidParametersException('No recorded rounds found for session id#' . $session[0]->getId());
        }

        $lastRound = MultiRoundHelper::findLastRound($rounds);
        $session[0]->rollback($lastRound); // this also does session save & drop round
        return true;
    }

    /**
     * Send event to predefined tracker about new data in game
     * @param $gameHashcode
     * @return bool
     */
    protected function _trackUpdate($gameHashcode)
    {
        if (!empty($this->_config->getValue('trackerUrl'))) {
            file_get_contents(sprintf($this->_config->getValue('trackerUrl'), $gameHashcode));
        }

        return true;
    }
}
