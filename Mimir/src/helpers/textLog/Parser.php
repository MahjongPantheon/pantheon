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

/*
    Input example:

    [playerId][:][(-)?\d{,5}] [playerId][:][(-)?\d{,5}] [playerId][:][(-)?\d{,5}] [playerId][:][(-)?\d{,5}]
    ron [playerId] from [playerId] [5-12]han
    ron [playerId] from [playerId] [1-4]han \d{2,3}fu
    ron [playerId] from [playerId] yakuman
    tsumo [playerId] [5-12]han
    tsumo [playerId] [1-4]han \d{2,3}fu
    tsumo [playerId] yakuman
    draw tempai nobody
    draw tempai [playerId]
    draw tempai [playerId] [playerId]
    draw tempai [playerId] [playerId] [playerId]
    draw tempai all
    chombo [playerId]
*/

require_once __DIR__ . '/Tokenizer.php';
require_once __DIR__ . '/../../primitives/Player.php';
require_once __DIR__ . '/../../primitives/Round.php';
require_once __DIR__ . '/../../exceptions/Parser.php';

class TextlogParser
{
    /**
     * @var DataSource $db
     */
    protected $_ds;

    /**
     * @var array
     */
    protected $_idMap = [];

    /**
     * @var array
     */
    protected $_originalScore = [];

    public function __construct(DataSource $ds, $idMap)
    {
        $this->_ds = $ds;
        $this->_idMap = $idMap;
    }

    /**
     * @param SessionPrimitive $session
     * @param $gameLog
     * @return array
     * @throws MalformedPayloadException
     * @throws ParseException
     * @throws \Exception
     */
    public function parseToSession(SessionPrimitive $session, $gameLog)
    {
        $this->_originalScore = [];

        $gameLog = trim($gameLog);
        if (empty($gameLog)) {
            throw new MalformedPayloadException('Game log is empty');
        }

        $tokenizer = new Tokenizer();

        $debug = [];
        $lastScoresDebug = array_fill(0, 4, $session->getEvent()->getRuleset()->startPoints()); // todo: omg :(

        /** @var Token[] $statement */
        foreach ($tokenizer->tokenize($gameLog) as $statement) {
            if ($statement[0]->type() == Tokenizer::PLAYER_ALIAS) {
                $this->_fillSession($session, $statement)->save(); // initial save required, rounds use session id
                continue;
            }

            if ($statement[0]->type() == Tokenizer::OUTCOME) {
                $round = $this->_fillRound($session, $statement);
                $round->save();
                $session->updateCurrentState($round);

                // some debug info
                $statementStr = $this->_getStatementAsString($statement);
                $debug []= '-> ' . str_replace('also', "\n-> also", $statementStr)
                    . "\n       `+ [\t" . implode(
                        "\t",
                        array_map(function ($sc, $sc2) {
                            return $sc - $sc2;
                        }, $session->getCurrentState()->getScores(), $lastScoresDebug)
                    ) . "\t]"
                    . "\n       `= [\t" . implode("\t", $session->getCurrentState()->getScores()) . "\t]";

                $lastScoresDebug = $session->getCurrentState()->getScores();

                continue;
            }

            $string = array_reduce($statement, function ($acc, $el) {
                return $acc . ' ' . $el;
            }, '');
            throw new ParseException("Couldn't parse game log: " . $string, 202);
        }

        return [$this->_originalScore, $debug];
    }

    protected function _getStatementAsString(array $statement): string
    {
        return implode(' ', array_map(function (Token $t) {
            return $t->token();
        }, $statement));
    }

    /**
     * @param SessionPrimitive $session
     * @param Token[] $statement
     * @return SessionPrimitive
     * @throws ParseException
     * @throws \Exception
     */
    protected function _fillSession(SessionPrimitive $session, $statement)
    {
        $playersList = [];

        // Line with players and scores
        while (!empty($statement)) {
            /** @var $player Token */
            $player = array_shift($statement);
            /** @var $delimiter Token */
            $delimiter = array_shift($statement);
            /** @var $score Token */
            $score = array_shift($statement);

            if (empty($player) || empty($delimiter) || empty($score)
                || $player->type() != Tokenizer::PLAYER_ALIAS
                || $delimiter->type() != Tokenizer::SCORE_DELIMITER
                || $score->type() != Tokenizer::SCORE
            ) {
                throw new ParseException("Wrong score line format: {$player} {$delimiter} {$score}", 106);
            }

            $playerItem = PlayerPrimitive::findById($this->_ds, [$this->_idMap[$player->token()]]);
            if (empty($playerItem)) {
                throw new ParseException("No player named '{$player->token()}' exists in our DB", 101);
            }
            $playersList []= $playerItem[0];

            $this->_originalScore[$playerItem[0]->getId()] = $score->token(); // For checking after calculcations
        }

        if (count($playersList) !== 4) {
            throw new ParseException("Malformed header, not all players are described: ["
                . implode(',', array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
                }, $playersList))
                . ']', 100);
        }

        return $session->setPlayers($playersList);
    }

    /**
     * @param SessionPrimitive $session
     * @param Token[] $statement
     * @return RoundPrimitive
     * @throws ParseException
     */
    protected function _fillRound(SessionPrimitive $session, $statement)
    {
        // Line with round item
        $methodName = '_parseOutcome' . ucfirst($statement[0]->token());
        if (!is_callable([$this, $methodName])) {
            throw new ParseException("Failed to parse round statement ({$statement[0]->token()}: {$methodName})", 106);
        }

        try {
            return RoundPrimitive::createFromData(
                $this->_ds,
                $session,
                $this->$methodName($statement, $session)
            );
        } catch (\Exception $e) {
            // add some context for debug and rethrow
            $statementTokens = $this->_getStatementAsString($statement);

            // TODO: needs reformatting to avoid exposing internals to clients
            throw new ParseException(
                "\n[" . get_class($e) . "]\n{$e->getMessage()}\nOccured at statement: [{$statementTokens}]" .
                "\n ======= Original trace: ======= \n" . implode("\n", array_filter(array_map(function ($el) {
                    if (empty($el['file']) || empty($el['line']) || strpos($el['file'], 'phar') === 0) {
                        return null;
                    }
                    return $el['file'] . ':' . $el['line'] . ' @ ' . $el['function'];
                }, $e->getTrace()))),
                $e->getCode()
            );
        }
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return string comma-separated riichi-players ids
     * @throws ParseException
     * @throws \Exception
     */
    protected function _getRiichi($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        $riichi = [];
        $started = false;
        foreach ($tokens as $v) {
            if ($v->type() == Tokenizer::RIICHI_DELIMITER) {
                $started = true;
                continue;
            }

            if ($started) {
                if ($v->type() == Tokenizer::PLAYER_ALIAS) {
                    if (empty($participants[$v->token()])) {
                        throw new ParseException("Failed to parse riichi statement. Player {$v->token()} not found. Typo?", 107);
                    }
                    $riichi []= $participants[$v->token()];
                } else {
                    return implode(',', $riichi);
                }
            }
        }

        if ($started && empty($riichi)) {
            throw new ParseException('Failed to prase riichi statement.', 108);
        }
        return implode(',', $riichi);
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return string comma-separated tempai players ids
     * @throws ParseException
     * @throws \Exception
     */
    protected function _getTempai($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        $tempai = [];
        $started = false;
        foreach ($tokens as $v) {
            if ($v->type() == Tokenizer::TEMPAI) {
                $started = true;
                continue;
            }

            if (!$started) {
                continue;
            }

            switch ($v->type()) {
                case Tokenizer::PLAYER_ALIAS:
                    if (empty($participants[$v->token()])) {
                        throw new ParseException("Failed to parse tempai statement. Player {$v->token()} not found. Typo?", 117);
                    }
                    $tempai [] = $participants[$v->token()];
                    break;
                case Tokenizer::ALL:
                    if (!empty($tempai)) {
                        throw new ParseException("Failed to parse riichi statement. Unexpected keyword 'all'. Typo?", 119);
                    }
                    return implode(',', $participants);
                case Tokenizer::NOBODY:
                    if (!empty($tempai)) {
                        throw new ParseException("Failed to parse riichi statement. Unexpected keyword 'nobody'. Typo?", 120);
                    }
                    return '';
                default:
                    return implode(',', $tempai);
            }
        }

        if (empty($tempai)) {
            throw new ParseException('Failed to parse tempai: some players are unrecognized.', 118);
        }
        return implode(',', $tempai);
    }

    /**
     * @param SessionPrimitive $session
     *
     * @return false|int[] [alias => PlayerPrimitive]
     *
     * @throws \Exception
     *
     * @psalm-return array<array-key, int>|false
     */
    protected function _getParticipantsMap(SessionPrimitive $session)
    {
        $idMapFlipped = array_flip($this->_idMap);
        return array_combine(
            array_map(
                function ($playerId) use ($idMapFlipped) {
                    return $idMapFlipped[$playerId];
                },
                $session->getPlayersIds()
            ),
            $session->getPlayersIds()
        );
    }

    /**
     * @param $tokens Token[]
     * @param $type
     * @return Token
     */
    protected function _findByType($tokens, string $type)
    {
        foreach ($tokens as $v) {
            if ($v->type() == $type) {
                return $v;
            }
        }

        return new Token(null, Tokenizer::UNKNOWN_TOKEN, [], null);
    }

    protected function _findHan($tokens): int
    {
        $han = $this->_findByType($tokens, Tokenizer::HAN_COUNT)->clean();
        $yakuman = $this->_findByType($tokens, Tokenizer::YAKUMAN)->token();
        if (!$han && $yakuman) {
            // -1 means 1 yakuman
            $han = -1; // TODO: multi yakumans for textual logs?
        }

        return intval($han);
    }

    /**
     * @param $tokens Token[]
     * @return array
     * @throws ParseException
     */
    protected function _parseYaku($tokens)
    {
        if (!$this->_findByType($tokens, Tokenizer::YAKU_START)->token()) {
            return [
                'yaku' => [],
                'dora' => '0'
            ]; // no yaku info
        }

        $yakuStarted = false;
        $yaku = [];
        $doraCount = 0;
        foreach ($tokens as $t) {
            if ($t->type() == Tokenizer::YAKU_START) {
                $yakuStarted = true;
                continue;
            }

            if ($t->type() == Tokenizer::YAKU_END) {
                $yakuStarted = false;
                break;
            }

            if ($yakuStarted && $t->type() == Tokenizer::YAKU) {
                $yaku []= $t;
            }

            if ($yakuStarted && $t->type() == Tokenizer::DORA_DELIMITER) {
                $doraCount = '1'; // means dora 1 if there is only delimiter
            }

            if ($doraCount == '1' && $yakuStarted && $t->type() == Tokenizer::DORA_COUNT) {
                $doraCount = $t->token();
            }
        }

        if ($yakuStarted) {
            throw new ParseException('Yaku list ending paren was not found', 210);
        }

        return [
            'yaku' => array_map(function (Token $yaku) {
                if ($yaku->type() != Tokenizer::YAKU) {
                    throw new TokenizerException('Requested token #' . $yaku->token() . ' is not yaku', 211);
                }

                $id = Tokenizer::identifyYakuByName($yaku->token());
                if (!$id) {
                    throw new TokenizerException('No id found for requested yaku #' . $yaku->token() .
                        ', this should not happen!', 212);
                }

                return $id;
            }, $yaku),
            'dora' => $doraCount ? $doraCount : '0'
        ];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws ParseException
     * @throws \Exception
     */
    protected function _parseOutcomeRon($tokens, SessionPrimitive $session)
    {
        // check if double/triple ron occured
        $multiRon = !!$this->_findByType($tokens, Tokenizer::ALSO)->token();
        if ($multiRon) {
            if ($session->getEvent()->getRuleset()->withAtamahane()) { // todo: omg :(
                throw new ParseException("Detected multi-ron, but current rules use atamahane.");
            }
            return $this->_parseOutcomeMultiRon($tokens, $session);
        } else {
            return $this->_parseOutcomeSingleRon($tokens, $session);
        }
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws ParseException
     * @throws \Exception
     */
    protected function _parseOutcomeSingleRon($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        /** @var $winner Token
         * @var $from Token
         * @var $loser Token */
        list(/*ron*/, $winner, $from, $loser) = $tokens;

        if (empty($winner) || empty($from) || empty($loser)) {
            throw new ParseException("Malformed round entry: ron", 130);
        }

        if (empty($participants[$winner->token()])) {
            throw new ParseException("Player {$winner} is not found. Typo?", 104);
        }
        if ($from->type() != Tokenizer::FROM) {
            throw new ParseException("No 'from' keyword found in ron statement", 103);
        }
        if (empty($participants[$loser->token()])) {
            throw new ParseException("Player {$loser} is not found. Typo?", 105);
        }

        $yakuParsed = $this->_parseYaku($tokens);
        return [
            'outcome'   => 'ron',
            'winner_id' => $participants[$winner->token()],
            'loser_id'  => $participants[$loser->token()],
            'han'       => $this->_findHan($tokens),
            'fu'        => $this->_findByType($tokens, Tokenizer::FU_COUNT)->clean(),
            'multi_ron' => false,
            'dora'      => $yakuParsed['dora'],
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => implode(',', $yakuParsed['yaku']),
            'riichi'    => $this->_getRiichi($tokens, $session),
        ];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws ParseException
     * @throws \Exception
     */
    protected function _parseOutcomeTsumo($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        /** @var $winner Token */
        list(/*tsumo*/, $winner) = $tokens;
        if (empty($winner)) {
            throw new ParseException("Malformed round entry: tsumo", 130);
        }

        if (empty($participants[$winner->token()])) {
            throw new ParseException("Player {$winner} is not found. Typo?", 104);
        }

        $yakuParsed = $this->_parseYaku($tokens);
        return [
            'outcome'   => 'tsumo',
            'winner_id' => $participants[$winner->token()],
            'han'       => $this->_findHan($tokens),
            'fu'        => $this->_findByType($tokens, Tokenizer::FU_COUNT)->clean(),
            'multi_ron' => false,
            'dora'      => $yakuParsed['dora'],
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => implode(',', $yakuParsed['yaku']),
            'riichi' => $this->_getRiichi($tokens, $session),
        ];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws \Exception
     */
    protected function _parseOutcomeDraw($tokens, SessionPrimitive $session)
    {
        return [
            'outcome'   => 'draw',
            'tempai'    => $this->_getTempai($tokens, $session),
            'riichi'    => $this->_getRiichi($tokens, $session),
        ];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws \Exception
     */
    protected function _parseOutcomeAbort($tokens, SessionPrimitive $session)
    {
        return [
            'outcome'   => 'abort',
            'riichi'    => $this->_getRiichi($tokens, $session),
        ];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws ParseException
     * @throws \Exception
     */
    protected function _parseOutcomeChombo($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        /** @var $loser Token */
        list(/*chombo*/, $loser) = $tokens;
        if (empty($loser)) {
            throw new ParseException("Malformed round entry: tsumo", 130);
        }
        if (empty($participants[$loser->token()])) {
            throw new ParseException("Player {$loser} is not found. Typo?", 104);
        }

        return [
            'outcome'   => 'chombo',
            'loser_id'  => $participants[$loser->token()],
        ];
    }

    /**
     * @param $tokens Token[]
     * @return array
     * @throws ParseException
     */
    protected function _splitMultiRon($tokens)
    {
        /** @var $loser Token
         *  @var $from Token */
        list(/*ron*/, /*winner*/, $from, $loser) = $tokens;
        if (empty($from) || empty($loser)) {
            throw new ParseException("Malformed round entry: ron/also", 130);
        }

        if ($from->type() != Tokenizer::FROM) {
            throw new ParseException("No 'from' keyword found in ron statement", 103);
        }

        $chunks = [[]];
        $idx = 0;
        foreach ($tokens as $k => $t) {
            if ($t->type() == Tokenizer::OUTCOME ||
                $t->type() == Tokenizer::FROM
            ) {
                continue; // unify statements, cut unused keywords
            }
            if ($k > 0 &&
                $tokens[$k-1]->type() == Tokenizer::FROM &&
                $t->type() == Tokenizer::PLAYER_ALIAS &&
                $t->token() == $loser->token()
            ) {
                continue; // loser alias is saved separately, skip it
            }
            if ($t->type() == Tokenizer::ALSO) { // next ron statement
                $idx ++;
                $chunks []= [];
                continue;
            }

            $chunks[$idx] []= $t;
        }

        return [$chunks, $loser];
    }

    /**
     * @param $tokens Token[]
     * @param $session SessionPrimitive
     * @return array
     * @throws ParseException
     * @throws \Exception
     */
    protected function _parseOutcomeMultiRon($tokens, SessionPrimitive $session)
    {
        $participants = $this->_getParticipantsMap($session);

        /** @var $loser Token */
        list($rons, $loser) = $this->_splitMultiRon($tokens);
        if (empty($rons) || empty($loser)) {
            throw new ParseException("Malformed round entry: ron/also", 130);
        }

        if (empty($participants[$loser->token()])) {
            throw new ParseException("Player {$loser} is not found. Typo?", 105);
        }

        $loser = $participants[$loser->token()];

        $resultData = [
            'outcome'   => 'multiron',
            'multi_ron' => count($rons),
            'loser_id'  => $loser,
            'wins' => []
        ];

        foreach ($rons as $ron) {
            /** @var $winner Token */
            $winner = $ron[0];
            if (empty($participants[$winner->token()])) {
                throw new ParseException("Player {$winner} is not found. Typo?", 104);
            }
            $winner = $participants[$winner->token()];

            $yakuParsed = $this->_parseYaku($ron);
            $resultData['wins'] []= [
                'winner_id' => $winner,
                'han'       => $this->_findHan($ron),
                'fu'        => $this->_findByType($ron, Tokenizer::FU_COUNT)->clean(),
                'dora'      => $yakuParsed['dora'],
                'uradora'   => 0,
                'kandora'   => 0,
                'kanuradora' => 0,
                'yaku'      => implode(',', $yakuParsed['yaku']),
                'riichi'    => $this->_getRiichi($ron, $session),
            ];
        }

        return $resultData;
    }
}
