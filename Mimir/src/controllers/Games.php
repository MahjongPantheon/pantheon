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

use Common\IntermediateResultOfSession;
use Common\TwirpError;
use Twirp\ErrorCode;

require_once __DIR__ . '/../models/InteractiveSession.php';
require_once __DIR__ . '/../models/PenaltySession.php';
require_once __DIR__ . '/../models/OnlineSession.php';
require_once __DIR__ . '/../models/EventUserManagement.php';
require_once __DIR__ . '/../primitives/JobsQueue.php';
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
        $this->_log->info('Starting game with players id# ' . implode(',', $players));
        $gameHash = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))->startGame($eventId, $players);
        $this->_log->info('Successfully started game with players id# ' . implode(',', $players));
        return $gameHash;
    }

    /**
     * Drop last round from selected game
     * For interactive mode (tournaments), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @param IntermediateResultOfSession[] $intermediateResults
     * @throws \Exception
     * @return bool Success?
     */
    public function dropLastRound($gameHashcode, $intermediateResults)
    {
        $this->_log->info('Dropping last round from session #' . $gameHashcode);
        $success = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
            ->dropLastRound($gameHashcode, $intermediateResults);
        $this->_log->info('Successfully dropped last round from session #' . $gameHashcode);
        return $success;
    }

    /**
     * Definalize session: drop results, set status flag to "in progress"
     * For interactive mode (club games), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @throws \Exception
     * @return bool Success?
     */
    public function definalizeGame($gameHashcode)
    {
        $this->_log->info('Definalizing session #' . $gameHashcode);
        $success = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))->definalizeSession($gameHashcode);
        $this->_log->info('Successfully definalized session #' . $gameHashcode);
        return $success;
    }

    /**
     * Explicitly force end of interactive game
     *
     * @param string $gameHashcode Hashcode of game
     * @throws \Exception
     * @return bool Success?
     */
    public function end($gameHashcode)
    {
        $this->_log->info('Finishing game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))->endGame($gameHashcode);
        $this->_log->info(($result ? 'Successfully finished' : 'Failed to finish') . ' game # ' . $gameHashcode);
        return $result;
    }

    /**
     * Cancel game which is in progress now
     *
     * @param string $gameHashcode Hashcode of game
     * @throws \Exception
     * @return bool Success?
     */
    public function cancel($gameHashcode)
    {
        $this->_log->info('Cancelling game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))->cancelGame($gameHashcode);
        $this->_log->info(($result ? 'Successfully cancelled' : 'Failed to cancel') . ' game # ' . $gameHashcode);
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
        $this->_log->info('Finalizing sessions of event # ' . $eventId);
        $result = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
            ->finalizeSessions($eventId);
        $this->_log->info(($result ? 'Successfully finalized' : 'Failed to finalize') . ' sessions of event # ' . $eventId);
        return $result > 0;
    }

    /**
     * Add new round to interactive game
     *
     * @param string $gameHashcode Hashcode of game
     * @param array $roundData Structure of round data
     * @param bool $dry Dry run (without saving to db)
     * @throws BadActionException
     * @throws \Exception
     * @return bool|array Results|Results of dry run|False in case of error
     */
    public function addRound($gameHashcode, $roundData, $dry = false)
    {
        $this->_log->info('Adding new round to game # ' . $gameHashcode);
        $result = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))->addRound($gameHashcode, $roundData, $dry);
        $this->_log->info(($result ? 'Successfully added' : 'Failed to add') . ' new round to game # ' . $gameHashcode);
        return $result;
    }

    /**
     * Add penalty in interactive game
     *
     * @param int $eventId Hashcode of game
     * @param int $playerId Id of penalized player
     * @param int $amount Penalty amount
     * @param string $reason Penalty reason
     * @throws \Exception
     * @return bool Success?
     */
    public function addPenalty($eventId, $playerId, $amount, $reason)
    {
        $this->_log->info('Adding penalty for player #' . $playerId. ' to event # ' . $eventId);
        $result = (new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta))
            ->addPenalty($eventId, $playerId, $amount, $reason);
        $this->_log->info('Successfully added penalty for player #' . $playerId. ' to event # ' . $eventId);
        return $result;
    }

    /**
     * Get session overview
     * [
     *      id => sessionId,
     *      players => [ ..[
     *          id => playerId,
     *          title,
     *          ident
     *      ].. ],
     *      state => [
     *          dealer => playerId,
     *          round => int,
     *          riichi => [ ..playerId.. ],
     *          honba => int,
     *          scores => [ ..int.. ],
     *          finished => bool,
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
        $this->_log->info('Getting session overview for game # ' . $gameHashCode);
        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$gameHashCode]);
        if (empty($session)) {
            throw new TwirpError(ErrorCode::NotFound, "Couldn't find session in DB");
        }

        /** @var PlayerPrimitive[][] $playersReg */
        $playersReg = PlayerPrimitive::findPlayersForSession($this->_ds, $gameHashCode);

        $result = [
            'id'    => $session[0]->getId(),
            'event_id' => $session[0]->getEventId(),
            'table_index' => $session[0]->getTableIndex(),
            'players' => array_map(function (PlayerPrimitive $player) use (&$playersReg, &$session) {
                return [
                    'id' => $player->getId(),
                    'title' => $player->getDisplayName(),
                    'has_avatar' => $player->getHasAvatar(),
                    'last_update' => $player->getLastUpdate(),
                    'score' => $session[0]->getCurrentState()->getScores()[$player->getId()],
                    'yakitori' => $session[0]->getCurrentState()->getYakitori()[$player->getId()],
                    'replaced_by' => empty($playersReg['replacements'][$player->getId()])
                        ? null
                        : [
                            'id' => $playersReg['replacements'][$player->getId()]->getId(),
                            'title' => $playersReg['replacements'][$player->getId()]->getDisplayName(),
                            'has_avatar' => $playersReg['replacements'][$player->getId()]->getHasAvatar(),
                            'last_update' => $playersReg['replacements'][$player->getId()]->getLastUpdate(),
                        ]
                ];
            }, $playersReg['players']),

            'state' => [
                'dealer'    => $session[0]->getCurrentState()->getCurrentDealer(),
                'round'     => $session[0]->getCurrentState()->getRound(),
                'riichi'    => $session[0]->getCurrentState()->getRiichiBets(),
                'honba'     => $session[0]->getCurrentState()->getHonba(),
                'scores'    => $session[0]->getCurrentState()->getScores(),
                'finished'  => $session[0]->getCurrentState()->isFinished(),
                'chombo'    => $session[0]->getCurrentState()->getChombo(),
                'lastHandStarted' => $session[0]->getCurrentState()->lastHandStarted(),
            ]
        ];

        $this->_log->info('Successfully got session overview for game # ' . $gameHashCode);
        return $result;
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
        $this->_log->info('Saving new online game for event id# ' . $eventId . ' @ tenhou link ' . $link);
        $session = (new OnlineSessionModel($this->_ds, $this->_config, $this->_meta))->addGame($eventId, $link);
        $result = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))->getFinishedGame($session);
        $this->_log->info('Successfully saved online game for event id# ' . $eventId . ' @ tenhou link ' . $link);
        return $result;
    }

    /**
     * Add typed online replay
     *
     * @param int $eventId
     * @param string $replayHash
     * @param int $platformId
     * @param int $logTimestamp
     * @param int $contentType
     * @param string $content
     * @return array
     * @throws InvalidParametersException
     * @throws \Exception
     * @throws ParseException
     */
    public function addTypedOnlineReplay($eventId, $replayHash, $platformId, $logTimestamp, $contentType, $content)
    {
        $this->_log->info('Saving new online game for event id# ' . $eventId . ' @ platform id ' . $platformId);
        $session = (new OnlineSessionModel($this->_ds, $this->_config, $this->_meta))
            ->addTypedGame($eventId, $replayHash, $logTimestamp, $content, $platformId, $contentType);
        $result = (new EventFinishedGamesModel($this->_ds, $this->_config, $this->_meta))->getFinishedGame($session, true);
        $this->_log->info('Successfully saved online game for event id# ' . $eventId . ' @ platform id ' . $platformId);
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
        $this->_log->info('Adding penalty game with players id# ' . implode(',', $players));
        $gameHash = (new PenaltySessionModel($this->_ds, $this->_config, $this->_meta))->addPenaltyGame($eventId, $players);
        $this->_log->info('Successfully added penalty game with players id# ' . implode(',', $players));
        return $gameHash;
    }

    /**
     * Add extra time for particular games.
     * Only for tournament events
     *
     * @param $sessionHashList
     * @param $extraTime
     * @return bool
     * @throws \Exception
     */
    public function addExtraTime($sessionHashList, $extraTime)
    {
        $this->_log->info('Adding extra time for sessions #' . implode(', ', $sessionHashList));
        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, $sessionHashList);

        $eventIds = array_unique(array_map(function ($session) {
            return $session->getEventId();
        }, $sessions));
        if (count($eventIds) > 1) {
            throw new TwirpError(ErrorCode::InvalidArgument, 'Setting extra time is not available for session in multiple events');
        }

        if (!$this->_meta->isEventAdminById($eventIds[0]) && !$this->_meta->isEventRefereeById($eventIds[0])) {
            throw new TwirpError(ErrorCode::NotFound, "This action is allowed only for event administrators");
        }

        $success = true;
        foreach ($sessions as $session) {
            $success = $success && $session->setExtraTime($extraTime + $session->getExtraTime())->save();
        }
        $this->_log->info('Added extra time for sessions #' . implode(', ', $sessionHashList));
        return $success;
    }

    /**
     * Forcefully finish game (for club events)
     *
     * @param string $sessionHash
     * @return bool
     * @throws \Exception
     */
    public function forceFinishGame($sessionHash)
    {
        $this->_log->info('Force finish session id# ' . $sessionHash);
        $session = SessionPrimitive::findByRepresentationalHash($this->_ds, [$sessionHash]);
        if (empty($session)) {
            throw new TwirpError(ErrorCode::NotFound, "Couldn't find session in DB");
        }
        if (!$this->_meta->isEventAdminById($session[0]->getEventId()) && !$this->_meta->isEventRefereeById($session[0]->getEventId())) {
            throw new TwirpError(ErrorCode::NotFound, "This action is allowed only for event administrators");
        }
        $success = $session[0]->finish();

        $whoPlays = $session[0]->getPlayersIds();
        $playerIds = array_filter(array_map(function ($pr) use ($whoPlays) {
            if ($pr->getIgnoreSeating() || !in_array($pr->getPlayerId(), $whoPlays)) {
                return null;
            }
            return $pr->getReplacementPlayerId() ?: $pr->getPlayerId();
        }, PlayerRegistrationPrimitive::findByEventId($this->_ds, $session[0]->getEventId())));

        (new JobsQueuePrimitive($this->_ds))
            ->setJobName(JobsQueuePrimitive::JOB_ACHIEVEMENTS)
            ->setJobArguments(['eventId' =>  $session[0]->getEventId()])
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->save();

        $skirnir = new SkirnirClient($this->_ds, $this->_config->getStringValue('skirnirUrl'));
        $skirnir->messageClubSessionEnd($playerIds, $session[0]->getEventId(), $session[0]->getCurrentState()->getScores());
        $this->_log->info('Successfully force-finished session id# ' . $sessionHash);
        return $success;
    }
}
