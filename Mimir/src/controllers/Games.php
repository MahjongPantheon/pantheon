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

require_once __DIR__ . '/../models/InteractiveSession.php';
require_once __DIR__ . '/../models/PenaltySession.php';
require_once __DIR__ . '/../models/TextmodeSession.php';
require_once __DIR__ . '/../models/OnlineSession.php';
require_once __DIR__ . '/../models/EventUserManagement.php';
require_once __DIR__ . '/../Controller.php';

class GamesController extends Controller
{
    // INTERACTIVE MODE

    /**
     * Start new interactive game and return its hash
     *
     * @param int $eventId Event this session belongs to
     * @param array $players Player id list
     * @throws InvalidUserException
     * @throws DatabaseException
     * @throws \Exception
     * @return string Hashcode of started game
     */
    public function start($eventId, $players)
    {
        $this->_log->addInfo('Starting game with players id# ' . implode(',', $players));
        $gameHash = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->startGame($eventId, $players);
        $this->_log->addInfo('Successfully started game with players id# ' . implode(',', $players));
        return $gameHash;
    }

    /**
     * Start new interactive game and return its hash
     *
     * @param array $players Player id list
     * @throws InvalidUserException
     * @throws DatabaseException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return string Hashcode of started game
     */
    public function startFromToken($players)
    {
        $this->_log->addInfo('Starting new game (by token)');
        $data = (new EventUserManagementModel($this->_db, $this->_config, $this->_meta))->dataFromToken();
        if (empty($data)) {
            throw new InvalidParametersException('Invalid player token', 401);
        }
        return $this->start($data->getEventId(), $players);
    }

    /**
     * Drop last round from selected game
     * For interactive mode (tournaments), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @throws \Exception
     * @return boolean Success?
     */
    public function dropLastRound($gameHashcode)
    {
        $this->_log->addInfo('Dropping last round from session #' . $gameHashcode);
        $success = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->dropLastRound($gameHashcode);
        $this->_log->addInfo('Successfully dropped last round from session #' . $gameHashcode);
        return $success;
    }

    /**
     * Definalize session: drop results, set status flag to "in progress"
     * For interactive mode (club games), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @throws \Exception
     * @return boolean Success?
     */
    public function definalizeGame($gameHashcode)
    {
        $this->_log->addInfo('Definalizing session #' . $gameHashcode);
        $success = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->definalizeSession($gameHashcode);
        $this->_log->addInfo('Successfully definalized session #' . $gameHashcode);
        return $success;
    }

    /**
     * Explicitly force end of interactive game
     *
     * @param string $gameHashcode Hashcode of game
     * @return bool Success?
     */
    public function end($gameHashcode)
    {
        $this->_log->addInfo('Finishing game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->endGame($gameHashcode);
        $this->_log->addInfo(($result ? 'Successfully finished' : 'Failed to finish') . ' game # ' . $gameHashcode);
        return $result;
    }

    /**
     * Cancel game which is in progress now
     *
     * @param string $gameHashcode Hashcode of game
     * @return bool Success?
     */
    public function cancel($gameHashcode)
    {
        $this->_log->addInfo('Cancelling game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->cancelGame($gameHashcode);
        $this->_log->addInfo(($result ? 'Successfully cancelled' : 'Failed to cancel') . ' game # ' . $gameHashcode);
        return $result;
    }


    /**
     * Finalize all pre-finished sessions in interactive tournament
     *
     * @param int $eventId
     * @throws \Exception
     * @return bool Success?
     */
    public function finalizeSessions($eventId)
    {
        $this->_log->addInfo('Finalizing sessions of event # ' . $eventId);
        $result = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
            ->finalizeSessions($eventId);
        $this->_log->addInfo(($result ? 'Successfully finalized' : 'Failed to finalize') . ' sessions of event # ' . $eventId);
        return $result;
    }

    /**
     * Add new round to interactive game
     *
     * @param string $gameHashcode Hashcode of game
     * @param array $roundData Structure of round data
     * @param boolean $dry Dry run (without saving to db)
     * @throws BadActionException
     * @throws \Exception
     * @return bool|array Results|Results of dry run|False in case of error
     */
    public function addRound($gameHashcode, $roundData, $dry = false)
    {
        $this->_log->addInfo('Adding new round to game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))->addRound($gameHashcode, $roundData, $dry);
        $this->_log->addInfo(($result ? 'Successfully added' : 'Failed to add') . ' new round to game # ' . $gameHashcode);
        return $result;
    }

    /**
     * Add penalty in interactive game
     *
     * @param integer $eventId Hashcode of game
     * @param integer $playerId Id of penalized player
     * @param integer $amount Penalty amount
     * @param string $reason Penalty reason
     * @throws \Exception
     * @return bool Success?
     */
    public function addPenalty($eventId, $playerId, $amount, $reason)
    {
        $this->_log->addInfo('Adding penalty for player #' . $playerId. ' to event # ' . $eventId);
        $result = (new InteractiveSessionModel($this->_db, $this->_config, $this->_meta))
            ->addPenalty($eventId, $playerId, $amount, $reason);
        $this->_log->addInfo('Successfully added penalty for player #' . $playerId. ' to event # ' . $eventId);
        return $result;
    }

    /**
     * Get session overview
     * [
     *      id => sessionId,
     *      players => [ ..[
     *          id => playerId,
     *          display_name,
     *          ident
     *      ].. ],
     *      state => [
     *          dealer => playerId,
     *          round => int,
     *          riichi => [ ..playerId.. ],
     *          honba => int,
     *          scores => [ ..int.. ],
     *          finished => boolean,
     *          penalties => [ playerId => penaltySize, ... ]
     *      ]
     * ]
     *
     * @param string $gameHashCode
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function getSessionOverview($gameHashCode)
    {
        $this->_log->addInfo('Getting session overview for game # ' . $gameHashCode);
        $session = SessionPrimitive::findByRepresentationalHash($this->_db, [$gameHashCode]);
        if (empty($session)) {
            throw new InvalidParametersException("Couldn't find session in DB", 404);
        }

        $result = [
            'id'    => $session[0]->getId(),
            'table_index' => $session[0]->getTableIndex(),
            'players' => array_map(function (PlayerPrimitive $player) {
                return [
                    'id' => $player->getId(),
                    'display_name' => $player->getDisplayName(),
                    'ident' => $player->getIdent()
                ];
            }, $session[0]->getPlayers()),

            'state' => [
                'dealer'    => $session[0]->getCurrentState()->getCurrentDealer(),
                'round'     => $session[0]->getCurrentState()->getRound(),
                'riichi'    => $session[0]->getCurrentState()->getRiichiBets(),
                'honba'     => $session[0]->getCurrentState()->getHonba(),
                'scores'    => $session[0]->getCurrentState()->getScores(),
                'finished'  => $session[0]->getCurrentState()->isFinished(),
                'penalties' => $session[0]->getCurrentState()->getPenalties(),
                'yellowZoneAlreadyPlayed' => $session[0]->getCurrentState()->yellowZoneAlreadyPlayed(),
            ]
        ];

        $this->_log->addInfo('Successfully got session overview for game # ' . $gameHashCode);
        return $result;
    }

    // TEXT LOG MODE

    /**
     * Add textual log for whole game
     *
     * @param int $eventId
     * @param string $text
     * @return bool
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    public function addTextLog($eventId, $text)
    {
        $this->_log->addInfo('Saving new game for event id# ' . $eventId);
        $success = (new TextmodeSessionModel($this->_db, $this->_config, $this->_meta))->addGame($eventId, $text);
        $this->_log->addInfo('Successfully saved game for event id# ' . $eventId);
        return $success;
    }

    // ONLINE REPLAY MODE

    /**
     * Add online replay
     *
     * @param int $eventId
     * @param string $link
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    public function addOnlineReplay($eventId, $link)
    {
        $this->_log->addInfo('Saving new online game for event id# ' . $eventId . ' @ tenhou link ' . $link);
        $session = (new OnlineSessionModel($this->_db, $this->_config, $this->_meta))->addGame($eventId, $link);
        $result = (new EventFinishedGamesModel($this->_db, $this->_config, $this->_meta))->getFinishedGame($session);
        $this->_log->addInfo('Successfully saved online game for event id# ' . $eventId . ' @ tenhou link ' . $link);
        return $result;
    }

    /**
     * Add game with penalty for all players.
     * It was added for online tournament needs. Use it on your own risk.
     *
     * @param int $eventId Event this session belongs to
     * @param array $players Player id list
     * @throws InvalidUserException
     * @throws DatabaseException
     * @throws \Exception
     * @return string Hashcode of added game
     */
    public function addPenaltyGame($eventId, $players)
    {
        $this->_log->addInfo('Adding penalty game with players id# ' . implode(',', $players));
        $gameHash = (new PenaltySessionModel($this->_db, $this->_config, $this->_meta))->addPenaltyGame($eventId, $players);
        $this->_log->addInfo('Successfully added penalty game with players id# ' . implode(',', $players));
        return $gameHash;
    }
}
