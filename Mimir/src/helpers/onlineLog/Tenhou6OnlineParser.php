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

use Common\PlatformType;

require_once __DIR__ . '/../../exceptions/Parser.php';
require_once __DIR__ . '/../../helpers/YakuMap.php';
require_once __DIR__ . '/../../primitives/Round.php';
require_once __DIR__ . '/../../primitives/PlayerHistory.php';
require_once __DIR__ . '/../../primitives/JobsQueue.php';
require_once __DIR__ . '/../../models/Tenhou6Model.php';

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
class Tenhou6OnlineParser
{
    /**
     * @var string[][] $_checkScores
     */
    protected $_checkScores = [];
    /**
     * @var array[] $_roundData
     */
    protected $_roundData = [];
    /**
     * (username => PlayerPrimitive)
     * @var PlayerPrimitive[] $_players
     */
    protected $_players = [];
    /**
     * @var DataSource $_ds
     */
    protected $_ds;
    /**
     * @var int[] $_riichi
     */
    protected $_riichi = [];
    /**
     * @var bool $_lastTokenIsAgari
     */
    protected $_lastTokenIsAgari = false;

    public function __construct(DataSource $ds)
    {
        $this->_ds = $ds;
    }

    /**
     * @param SessionPrimitive $session
     * @param string $content game log xml string
     * @param bool $withChips
     * @param int $platformId
     * @return array parsed score
     * @throws \Exception
     */
    public function parseToSession(SessionPrimitive $session, string $content, $withChips = false, $platformId = 1)
    {
        $tenhou6Model = new Tenhou6Model($content, $platformId);
        $this->validateModel($session, $tenhou6Model);

        $this->_tokenUN($tenhou6Model, $session);
        $this->_tokenGO($tenhou6Model->getTokenGO(), $session);

        if (empty($tenhou6Model->getRounds())) {
            throw new InvalidParametersException('Rounds were not found in replay: this is critical error.');
        }

        foreach ($tenhou6Model->getRounds() as $roundData) {
            for ($i = 0; $i < count($roundData['reach_tokens']); $i++) {
                $this->_tokenREACH($roundData['reach_tokens'][$i]);
            }
            if ($roundData['type'] === 'AGARI') {
                $tokenAgari = $roundData['token'];
                $this->_tokenAGARI($tokenAgari);
            } else if ($roundData['type'] === 'MULTI_AGARI') {
                foreach ($roundData['tokens'] as $tokenAgari) {
                    $this->_tokenAGARI($tokenAgari);
                }
            } else if ($roundData['type'] === 'RYUUKYOKU') {
                $tokenRyuukyoku = $roundData['token'];
                $this->_tokenRYUUKYOKU($tokenRyuukyoku);
            }
            $this->_tokenINIT();
        }


        // It is vital to save session and assign session id here,
        // otherwise online game processing will fail in some cases.
        // More details you can find here: https://pantheon.myjetbrains.com/youtrack/issue/PNTN-233
        $success = $session->save();

        $scores = [];
        $rounds = [];
        foreach ($this->_roundData as $round) {
            $savedRound = RoundPrimitive::createFromData($this->_ds, $session, $round);
            $rounds [] = $savedRound;
            $success = $success && $session->updateCurrentState($savedRound);
            $scores [] = $session->getCurrentState()->getScores();
        }

        $debug = [];
        for ($i = 0; $i < count($this->_checkScores); $i++) {
            $debug[] = "Expected\t"
                . implode("\t", $this->_checkScores[$i])
                . "\t:: Got\t"
                . implode("\t", $scores[$i]);
        }

        if ($withChips) {
            throw new InvalidParametersException('Chips in tenhou format6 not supported');
        }

        return [$success, $this->_parseOutcome($tenhou6Model->getOwari()), $rounds, $debug];
    }

    /**
     * Validate tenhou6 model.
     *
     * @param SessionPrimitive $session
     * @param Tenhou6Model $tenhou6Model
     *
     * @return void
     * @throws ParseException
     */
    private function validateModel(SessionPrimitive $session, Tenhou6Model $tenhou6Model)
    {
        if ($session->getReplayHash() !== $tenhou6Model->getReplayHash()) {
            throw new ParseException('Replay hash not equals with session hash');
        }
    }

    /**
     * Much simpler to get final scores by regex :)
     *
     * @param array $owari
     * @return array<int|null, int> (player id => score)
     */
    protected function _parseOutcome($owari)
    {
        $result = array_combine(
            array_filter(array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)),
            [
                intval($owari[0]),
                intval($owari[2]),
                intval($owari[4]),
                intval($owari[6])
            ]
        );
        if (empty($result)) {
            throw new InvalidParametersException('Attempt to combine inequal arrays');
        }
        return $result;
    }

    /**
     * Get nagashi scores
     *
     * @param array $arrayWithScores
     * @return string comma-separated player ids
     */
    protected function _parseNagashi($arrayWithScores): string
    {
        list($delta1, $delta2, $delta3, $delta4) = array_map('intval', $arrayWithScores);

        $ids = [];
        foreach ([$delta1, $delta2, $delta3, $delta4] as $idx => $val) {
            if ($val > 0) {
                $ids [] = array_values($this->_players)[$idx]->getId();
            }
        }

        return implode(',', $ids);
    }

    protected function _getRiichi(): string
    {
        $riichis = $this->_riichi;
        $this->_riichi = [];
        return implode(',', $riichis);
    }

    /**
     * Provide parsed player key specified for game platform.
     *
     * @param Tenhou6Model $tenhou6Model
     * @param array $tokenUnItem
     *
     * @return string
     */
    protected function _getParsedPlayerKey(Tenhou6Model $tenhou6Model, $tokenUnItem): string
    {
        if ($tenhou6Model->getPlatformId() === PlatformType::PLATFORM_TYPE_TENHOUNET) {
            return rawurldecode((string)$tokenUnItem['player_name']);
        } else {
            return rawurldecode((string)$tokenUnItem['player_name']) . '-' . $tokenUnItem['account_id'];
        }
    }

    /**
     * This actually should be called first, before any round.
     * If game format is not changed, this won't break.
     *
     * @param Tenhou6Model $tenhou6Model
     * @param SessionPrimitive $session
     *
     * @return void
     * @throws \Exception
     * @throws ParseException
     */
    protected function _tokenUN(Tenhou6Model $tenhou6Model, SessionPrimitive $session): void
    {
        if (count($this->_players) == 0) {
            if ($tenhou6Model->getPlatformId() === PlatformType::PLATFORM_TYPE_TENHOUNET) {
                $parsedPlayers = [
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[0]) => 1,
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[1]) => 1,
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[2]) => 1,
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[3]) => 1
                ];
                $playersLookup = array_keys($parsedPlayers);
            } else {
                $parsedPlayers = [
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[0]) =>
                        rawurldecode((string)$tenhou6Model->getTokenUN()[0]['player_name']),
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[1]) =>
                        rawurldecode((string)$tenhou6Model->getTokenUN()[1]['player_name']),
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[2]) =>
                        rawurldecode((string)$tenhou6Model->getTokenUN()[2]['player_name']),
                    $this->_getParsedPlayerKey($tenhou6Model, $tenhou6Model->getTokenUN()[3]) =>
                        rawurldecode((string)$tenhou6Model->getTokenUN()[3]['player_name']),
                ];
                $playersLookup = array_keys($parsedPlayers);
            }

            if (PlatformType::PLATFORM_TYPE_TENHOUNET === $tenhou6Model->getPlatformId() && !empty($parsedPlayers['NoName'])) {
                throw new ParseException('"NoName" players are not allowed in replays');
            }

            $players = $this->loadPlayers($tenhou6Model, $parsedPlayers);

            if (count($players) !== count($parsedPlayers)) {
                $registeredPlayers = array_map(function (PlayerPrimitive $p) {
                    return $p->getTenhouId();
                }, $players);
                $missedPlayers = array_diff($playersLookup, $registeredPlayers);
                $missedPlayers = join(', ', $missedPlayers);
                switch ($tenhou6Model->getPlatformId()) {
                    case PlatformType::PLATFORM_TYPE_MAHJONGSOUL:
                        $platformName = 'Mahjongsoul';
                        break;
                    case PlatformType::PLATFORM_TYPE_TENHOUNET:
                    default:
                        $platformName = 'Tenhou';
                        break;
                }
                throw new ParseException('Not all ' . $platformName . ' nicknames were registered in the system: ' . $missedPlayers);
            }

            if ($session->getEvent()->getAllowPlayerAppend()) {
                $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $session->getEventId());
                $registeredPlayers = array_map(function (PlayerRegistrationPrimitive $p) {
                    return $p->getPlayerId();
                }, $regs);
                foreach ($players as $player) {
                    if (!in_array($player->getId(), $registeredPlayers)) {
                        (new PlayerRegistrationPrimitive($this->_ds))
                            ->setReg($player, $session->getEvent())
                            ->save();
                    }
                }
            }

            // check if some players were replaced and replace them back
            $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $session->getEventId());
            $backreplMap = [];
            foreach ($regs as $reg) {
                $backreplMap[$reg->getReplacementPlayerId()] = $reg->getPlayerId();
            }

            $mapToPlayer = [];
            $originals = PlayerPrimitive::findById($this->_ds, array_filter(array_values($backreplMap)));
            foreach ($originals as $rep) {
                $mapToPlayer[$rep->getId()] = $rep;
            }

            /** @var PlayerPrimitive[] $players */
            $players = array_map(function ($player) use ($mapToPlayer, $backreplMap) {
                if (!empty($backreplMap[$player->getId()]) && !empty($mapToPlayer[$backreplMap[$player->getId()]])) {
                    return $mapToPlayer[$backreplMap[$player->getId()]];
                }
                return $player;
            }, $players);

            $session->setPlayers($players);
            $p = array_combine(array_keys($parsedPlayers), $players); // players order should persist
            if (!empty($p)) {
                $this->_players = $p;
            }
        }
    }

    /**
     * Load array of PlayerPrimitive.
     *
     * @param Tenhou6Model $tenhou6Model
     * @param array $parsedPlayers
     *
     * @return PlayerPrimitive[]
     */
    private function loadPlayers(Tenhou6Model $tenhou6Model, $parsedPlayers): array
    {
        if ($tenhou6Model->getPlatformId() === PlatformType::PLATFORM_TYPE_TENHOUNET) {
            return PlayerPrimitive::findByTenhouId($this->_ds, array_keys($parsedPlayers));
        }

        if ($tenhou6Model->getPlatformId() === PlatformType::PLATFORM_TYPE_MAHJONGSOUL) {
            return PlayerPrimitive::findMajsoulAccounts($this->_ds, $tenhou6Model->getTokenUN());
        }

        return [];
    }

    /**
     * Process token AGARI
     *
     * @param array $tokenAgari
     * @return void
     */
    protected function _tokenAGARI($tokenAgari): void
    {
        $winner = array_keys($this->_players)[(int)$tokenAgari['who']];
        $loser = array_keys($this->_players)[(int)$tokenAgari['fromWho']];
        $paoPlayer = (int)$tokenAgari['paoWho'] != -1
            ? array_keys($this->_players)[(int)$tokenAgari['paoWho']]
            : null;
        $openHand = $tokenAgari['openHand'] === true ? 1 : 0;
        $outcomeType = ($winner == $loser ? 'tsumo' : 'ron');

        $fu = $tokenAgari['fu'];
        $yakuList = $tokenAgari['yaku'];
        $yakumanList = $tokenAgari['yakuman'];
        $isMangan = $tokenAgari['isMangan'];

        $yakuData = \Common\YakuMap::fromTenhou($yakuList, $yakumanList);

        if (!$this->_lastTokenIsAgari) { // single ron, or first ron in sequence
            $calculatedFu = $fu;

            //logic for regular mangan
            if ($isMangan) {
                $currentHan = intval($yakuData['han']);
                if ($currentHan === 4) {
                    $calculatedFu = 40;
                }
                if ($currentHan === 3) {
                    $calculatedFu = 70;
                }
            }

            $riichi = $this->_getRiichi();
            $this->_roundData [] = [
                'outcome' => $outcomeType,
                'winner_id' => $this->_players[$winner]->getId(),
                'loser_id' => $outcomeType === 'ron' ? $this->_players[$loser]->getId() : null,
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => strval($calculatedFu),
                'multi_ron' => false,
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $riichi,
                'open_hand' => $openHand
            ];

            $this->_checkScores [] = $tokenAgari['sc'];
        } else {
            // double or triple ron, previous round record should be modified
            /** @var array $roundRecord */
            $roundRecord = array_pop($this->_roundData);

            if ($roundRecord['outcome'] === 'ron') {
                $roundRecord = [
                    'outcome' => 'multiron',
                    'multi_ron' => 1,
                    'loser_id' => $this->_players[$loser]->getId(),
                    'wins' => [[
                        'winner_id' => $roundRecord['winner_id'],
                        'pao_player_id' => $roundRecord['pao_player_id'],
                        'han' => $roundRecord['han'],
                        'fu' => strval($roundRecord['fu']),
                        'dora' => $roundRecord['dora'],
                        'uradora' => $roundRecord['uradora'],
                        'kandora' => $roundRecord['kandora'],
                        'kanuradora' => $roundRecord['kanuradora'],
                        'yaku' => $roundRecord['yaku'],
                        'riichi' => $roundRecord['riichi'],
                        'open_hand' => $roundRecord['open_hand']
                    ]]
                ];
            }

            $roundRecord['multi_ron']++;
            $calculatedFu = $fu;

            //logic for regular mangan
            if ($isMangan) {
                $currentHan = intval($yakuData['han']);
                if ($currentHan === 4) {
                    $calculatedFu = 40;
                }
                if ($currentHan === 3) {
                    $calculatedFu = 70;
                }
            }

            $roundRecord['wins'] [] = [
                'winner_id' => $this->_players[$winner]->getId(),
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => strval($calculatedFu),
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $this->_getRiichi(),
                'open_hand' => $openHand
            ];

            $this->_roundData [] = $roundRecord;

            array_pop($this->_checkScores);
            $this->_checkScores [] = $tokenAgari['sc'];
        }

        $this->_lastTokenIsAgari = true;
    }

    // round start, reset all needed things
    protected function _tokenINIT(): void
    {
        $this->_lastTokenIsAgari = false; // resets double/triple ron sequence
    }

    /**
     * Process token RYUUKYOKU
     *
     * @param array $tokenRyuukyoku
     * @return void
     */
    protected function _tokenRYUUKYOKU($tokenRyuukyoku): void
    {
        $rkType = $tokenRyuukyoku['type'];
        $this->_checkScores [] = $tokenRyuukyoku['sc'];

        if ($rkType && $rkType != 'nm') { // abortive draw
            $this->_roundData [] = [
                'outcome' => 'abort',
                'riichi' => $this->_getRiichi(),
            ];

            return;
        }

        // form array in form of [int 'player id' => bool 'tempai?']
        /** @var array $combined */
        $combined = array_combine(
            array_filter(array_map(
                function (PlayerPrimitive $el) {
                    return $el->getId();
                },
                $this->_players
            )),
            [
                $tokenRyuukyoku['hai0'],
                $tokenRyuukyoku['hai1'],
                $tokenRyuukyoku['hai2'],
                $tokenRyuukyoku['hai3'],
            ]
        );
        if (empty($combined)) {
            throw new InvalidParametersException('Attempt to combine inequal arrays');
        }
        $tempai = array_filter($combined);

        // Special case for nagashi, implied that $rkType == 'nm'
        if ($rkType === 'nm') {
            $this->_roundData [] = [
                'outcome' => 'nagashi',
                'riichi' => $this->_getRiichi(),
                'nagashi' => $this->_parseNagashi($tokenRyuukyoku['sc']),
                'tempai' => implode(',', array_keys($tempai)),
                'sc' => $tokenRyuukyoku['sc']
            ];

            return;
        }

        $this->_roundData [] = [
            'outcome' => 'draw',
            'tempai' => implode(',', array_keys($tempai)),
            'riichi' => $this->_getRiichi(),
        ];
    }

    /**
     * Process token REACH
     *
     * @param array $tokenReach
     * @return void
     */
    protected function _tokenREACH($tokenReach): void
    {
        $player = $tokenReach['who'];
        $id = $this->_players[array_keys($this->_players)[$player]]->getId();
        if (!empty($id)) {
            $this->_riichi [] = $id;
        }
    }

    /**
     * @param array $tokenGO
     * @param SessionPrimitive $session
     *
     * @return void
     * @throws ParseException
     * @throws \Exception
     *
     * @throws EntityNotFoundException
     */
    protected function _tokenGO($tokenGO, SessionPrimitive $session): void
    {
        $eventLobby = $session->getEvent()->getLobbyId();

        $lobby = intval($tokenGO['lobby']);
        if ($eventLobby != $lobby) {
            throw new ParseException('Provided replay doesn\'t belong to the event lobby ' . $eventLobby);
        }
    }

    /**
     * @return int
     */
    /** @phpstan-ignore-next-line-pattern 'Method Mimir\Tenhou6OnlineParser::asInt() is unused' */
    private function asInt(string $n): int
    {
        return intval($n);
    }
}
