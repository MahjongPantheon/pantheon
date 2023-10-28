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

require_once __DIR__ . '/../../exceptions/Parser.php';
require_once __DIR__ . '/../../helpers/YakuMap.php';
require_once __DIR__ . '/../../primitives/Round.php';
require_once __DIR__ . '/../../primitives/PlayerHistory.php';

class OnlineParser
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

    protected $_ankan_cache = [];

    public function __construct(DataSource $ds)
    {
        $this->_ds = $ds;
    }

    /**
     * @param SessionPrimitive $session
     * @param string $content game log xml string
     * @param bool $withChips
     * @throws \Exception
     * @return array parsed score
     */
    public function parseToSession(SessionPrimitive $session, string $content, $withChips = false)
    {
        $reader = new \XMLReader();
        $reader->XML($content);

        $kanNakiCache = null;
        $this->_ankan_cache = array(
            0 => array(),
            1 => array(),
            2 => array(),
            3 => array());

        while ($reader->read()) {
            if ($reader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($reader->localName === 'N') {
                $meld = $reader->getAttribute('m');
                $nakiWho = $reader->getAttribute('who');
                $kanNakiCache = array('m' => $meld, 'who' => $nakiWho);
            }
            else if ($reader->localName !== 'DORA') {
                $kanNakiCache = null;
            }

            if ($reader->localName === 'DORA') {
                if (isset($kanNakiCache)) {
                    $ankanArrays = $this->_ankan_cache[$kanNakiCache['who']];
                    array_push($ankanArrays, $kanNakiCache['m']);
                    $this->_ankan_cache[$kanNakiCache['who']] = $ankanArrays;
                }
            }

            if (is_callable([$this, '_token' . $reader->localName])) {
                $method = '_token' . $reader->localName;
                $this->$method($reader, $session);
            }
        }

        // It is vital to save session and assign session id here,
        // otherwise online game processing will fail in some cases.
        // More details you can find here: https://pantheon.myjetbrains.com/youtrack/issue/PNTN-233
        $success = $session->save();

        $scores = [];
        $rounds = [];
        foreach ($this->_roundData as $round) {
            $savedRound = RoundPrimitive::createFromData($this->_ds, $session, $round);
            $rounds []= $savedRound;
            $success = $success && $session->updateCurrentState($savedRound);
            $scores []= $session->getCurrentState()->getScores();
        }

        $debug = [];
        for ($i = 0; $i < count($this->_checkScores); $i++) {
            $debug[]= "Expected\t"
                . implode("\t", $this->_checkScores[$i])
                . "\t:: Got\t"
                . implode("\t", $scores[$i]);
        }

        if ($withChips) {
            $session->setChips($this->_parseChipsOutcome($content));
        }

        return [$success, $this->_parseOutcome($content), $rounds, $debug];
    }

    /**
     * Much simpler to get final scores by regex :)
     *
     * @param string $content
     * @return array<int|null, int> (player id => score)
     */
    protected function _parseOutcome(string $content)
    {
        $regex = "#owari=\"([^\"]*)\"#";
        $matches = [];

        if (preg_match($regex, $content, $matches)) {
            $parts = explode(',', $matches[1]);
            $result = array_combine(
                array_filter(array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
                }, $this->_players)),
                [
                    intval($parts[0] . '00'),
                    intval($parts[2] . '00'),
                    intval($parts[4] . '00'),
                    intval($parts[6] . '00')
                ]
            );
            if (empty($result)) {
                throw new InvalidParametersException('Attempt to combine inequal arrays');
            }
            return $result;
        }

        return [];
    }

    /**
     * @param string $content
     * @return array<int|null, int> (player id => chips)
     */
    protected function _parseChipsOutcome($content)
    {
        $regex = "#owari=\"([^\"]*)\"#";
        $matches = [];

        if (preg_match($regex, $content, $matches)) {
            $parts = explode(',', $matches[1]);
            return array_combine(
                array_filter(array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
                }, $this->_players)),
                [
                    intval($parts[8]),
                    intval($parts[10]),
                    intval($parts[12]),
                    intval($parts[14])
                ]
            ) ?: [];
        }

        return [];
    }

    /**
     * Get nagashi scores
     *
     * @param string $content
     * @return string comma-separated player ids
     */
    protected function _parseNagashi(string $content): string
    {
        list(
            /* score1 */, $delta1,
            /* score2 */, $delta2,
            /* score3 */, $delta3,
            /* score4 */, $delta4
        ) = array_map('intval', explode(',', $content));

        $ids = [];
        foreach ([$delta1, $delta2, $delta3, $delta4] as $idx => $val) {
            if ($val > 0) {
                $ids []= array_values($this->_players)[$idx]->getId();
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
     * @param string $str
     *
     * @return string[]
     *
     * @psalm-return array{0: string, 1: string, 2: string, 3: string}
     */
    protected function _makeScores(string $str): array
    {
        $parts = explode(',', $str);
        return [
            (intval($parts[0]) + intval($parts[1])) . '00',
            (intval($parts[2]) + intval($parts[3])) . '00',
            (intval($parts[4]) + intval($parts[5])) . '00',
            (intval($parts[6]) + intval($parts[7])) . '00'
        ];
    }

    /**
     * This actually should be called first, before any round.
     * If game format is not changed, this won't break.
     *
     * @param \XMLReader $reader
     * @param SessionPrimitive $session
     *
     * @throws ParseException
     * @throws \Exception
     *
     * @return void
     */
    protected function _tokenUN(\XMLReader $reader, SessionPrimitive $session): void
    {
        if (count($this->_players) == 0) {
            $parsedPlayers = [
                rawurldecode((string)$reader->getAttribute('n0')) => 1,
                rawurldecode((string)$reader->getAttribute('n1')) => 1,
                rawurldecode((string)$reader->getAttribute('n2')) => 1,
                rawurldecode((string)$reader->getAttribute('n3')) => 1
            ];

            if (!empty($parsedPlayers['NoName'])) {
                throw new ParseException('"NoName" players are not allowed in replays');
            }

            $players = PlayerPrimitive::findByTenhouId($this->_ds, array_keys($parsedPlayers));

            if (count($players) !== count($parsedPlayers)) {
                $registeredPlayers = array_map(function (PlayerPrimitive $p) {
                    return $p->getTenhouId();
                }, $players);
                $missedPlayers = array_diff(array_keys($parsedPlayers), $registeredPlayers);
                $missedPlayers = join(', ', $missedPlayers);
                throw new ParseException('Not all tenhou nicknames were registered in the system: ' . $missedPlayers);
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

            $session->setPlayers($players);
            $p = array_combine(array_keys($parsedPlayers), $players); // players order should persist
            if (!empty($p)) {
                $this->_players = $p;
            }
        }
    }

    protected function _tokenAGARI(\XMLReader $reader): void
    {
        $who = (int)$reader->getAttribute('who');
        $winner = array_keys($this->_players)[$who];
        $loser = array_keys($this->_players)[(int)$reader->getAttribute('fromWho')];
        $paoPlayer = $reader->getAttribute('paoWho')
            ? array_keys($this->_players)[(int)$reader->getAttribute('paoWho')]
            : null;

        $winnerAnkanCount = intval($this->_ankan_cache[$who]);
        $mValues = explode(",", $reader->getAttribute('m'));

        if ($winnerAnkanCount > 0) {
           $openHand = $winnerAnkanCount === count($mValues) ? 0 : 1;
        } else {
            $openHand = $reader->getAttribute('m') ? 1 : 0;
        }
        $outcomeType = ($winner == $loser ? 'tsumo' : 'ron');

        list($fu) = explode(',', (string)$reader->getAttribute('ten'));
        $yakuList = (string)$reader->getAttribute('yaku');
        $yakumanList = (string)$reader->getAttribute('yakuman');

        $yakuData = \Common\YakuMap::fromTenhou($yakuList, $yakumanList);

        if (!$this->_lastTokenIsAgari) { // single ron, or first ron in sequence
            $riichi = $this->_getRiichi();
            $this->_roundData [] = [
                'outcome' => $outcomeType,
                'winner_id' => $this->_players[$winner]->getId(),
                'loser_id' => $outcomeType === 'ron' ? $this->_players[$loser]->getId() : null,
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => $fu,
                'multi_ron' => false,
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $riichi,
                'open_hand' => $openHand
            ];

            $this->_checkScores []= $this->_makeScores((string)$reader->getAttribute('sc'));
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
                        'fu' => $roundRecord['fu'],
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

            $roundRecord['multi_ron'] ++;
            $roundRecord['wins'] []= [
                'winner_id' => $this->_players[$winner]->getId(),
                'pao_player_id' => $paoPlayer ? $this->_players[$paoPlayer]->getId() : null,
                'han' => $yakuData['han'],
                'fu' => $fu,
                'dora' => $yakuData['dora'],
                'uradora' => 0,
                'kandora' => 0,
                'kanuradora' => 0,
                'yaku' => implode(',', $yakuData['yaku']),
                'riichi' => $this->_getRiichi(),
                'open_hand' => $openHand
            ];

            $this->_roundData []= $roundRecord;

            array_pop($this->_checkScores);
            $this->_checkScores []= $this->_makeScores((string)$reader->getAttribute('sc'));
        }

        $this->_lastTokenIsAgari = true;
    }

    // round start, reset all needed things
    protected function _tokenINIT(): void
    {
        $this->_ankan_cache = array(
            0 => array(),
            1 => array(),
            2 => array(),
            3 => array());
        $this->_lastTokenIsAgari = false; // resets double/triple ron sequence
    }

    /**
     * @return void
     */
    protected function _tokenRYUUKYOKU(\XMLReader $reader)
    {
        $rkType = $reader->getAttribute('type');
        $scoreString = $reader->getAttribute('sc');
        $this->_checkScores []= $this->_makeScores((string)$scoreString);

        if ($rkType && $rkType != 'nm') { // abortive draw
            $this->_roundData []= [
                'outcome'   => 'abort',
                'riichi'    => $this->_getRiichi(),
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
                !!$reader->getAttribute('hai0'),
                !!$reader->getAttribute('hai1'),
                !!$reader->getAttribute('hai2'),
                !!$reader->getAttribute('hai3'),
            ]
        );
        if (empty($combined)) {
            throw new InvalidParametersException('Attempt to combine inequal arrays');
        }
        $tempai = array_filter($combined);

        // Special case for nagashi, implied that $rkType == 'nm'
        if ($rkType) {
            $this->_roundData []= [
                'outcome'   => 'nagashi',
                'riichi'    => $this->_getRiichi(),
                'nagashi'   => $this->_parseNagashi($scoreString ?: ''),
                'tempai'  => implode(',', array_keys($tempai)),
            ];

            return;
        }

        $this->_roundData []= [
            'outcome' => 'draw',
            'tempai'  => implode(',', array_keys($tempai)),
            'riichi'  => $this->_getRiichi(),
        ];
    }

    /**
     * @return void
     */
    protected function _tokenREACH(\XMLReader $reader)
    {
        $player = (int)$reader->getAttribute('who');
        if ($reader->getAttribute('step') == '1') {
            // this is unconfirmed riichi. Confirmed one has step=2.
            // We don't count unconfirmed riichi (e.g. ron on riichi should return bet), so return here.
            return;
        }

        $id = $this->_players[array_keys($this->_players)[$player]]->getId();
        if (!empty($id)) {
            $this->_riichi [] = $id;
        }
    }

    /**
     * @param \XMLReader $reader
     * @param SessionPrimitive $session
     *
     * @throws EntityNotFoundException
     * @throws ParseException
     * @throws \Exception
     *
     * @return void
     */
    protected function _tokenGO(\XMLReader $reader, SessionPrimitive $session): void
    {
        $eventLobby = $session->getEvent()->getLobbyId();

        $lobby = $reader->getAttribute('lobby');
        if ($eventLobby != $lobby) {
            throw new ParseException('Provided replay doesn\'t belong to the event lobby ' . $eventLobby);
        }
    }
}
