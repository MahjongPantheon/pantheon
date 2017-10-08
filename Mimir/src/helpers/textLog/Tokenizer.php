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
namespace Riichi;

require_once __DIR__ . '/../YakuMap.php';
require_once __DIR__ . '/Token.php';
require_once __DIR__ . '/../../exceptions/Tokenizer.php';

class Tokenizer
{
    protected static $_regexps = [];
    protected static $_yakuCodes = [];

    const UNKNOWN_TOKEN = null;
    const SCORE_DELIMITER = 'scoreDelimiter';
    const DORA_DELIMITER = 'doraDelimiter';
    const DORA_COUNT = 'doraCount';
    const YAKU_START = 'yakuStart';
    const YAKU_END = 'yakuEnd';
    const YAKU = 'yaku';
    const SCORE = 'score';
    const HAN_COUNT = 'hanCount';
    const FU_COUNT = 'fuCount';
    const YAKUMAN = 'yakuman';
    const TEMPAI = 'tempai';
    const ALL = 'all';
    const NOBODY = 'nobody';
    const RIICHI_DELIMITER = 'riichi';
    const OUTCOME = 'outcome';
    const PLAYER_ALIAS = 'playerAlias';
    const FROM = 'from';
    const ALSO = 'also';

    /**
     * @var Token[]
     */
    protected $_currentStack = [];
    protected $_lastAllowedToken = [];

    public function __construct()
    {
        $this->_lastAllowedToken = [ // first line should contain player scores map
            self::PLAYER_ALIAS => 1
        ];
    }

    /**
     * Make some basic preparations to simplify tokenizer,
     * then split text to tokens
     * then try to parse and yield ready whole statements
     *
     * @param $text
     * @return mixed
     */
    public function tokenize($text)
    {
        $tokens = preg_split('#\s+#is', trim(str_replace([
            ':', // scoring
            '(', ')' // yaku delimiters
        ], [
            ' : ',
            ' ( ', ' ) '
        ], $text)));

        foreach ($tokens as $k => $token) {
            $ctx = array_slice($tokens, $k > 1 ? $k - 2 : $k, 5); // also pass some next tokens for better debug info
            $statement = $this->_nextToken($token, implode(' ', $ctx));
            if (!empty($statement)) {
                yield $statement;
            }
        }

        yield $this->_callTokenEof();
    }

    // -----------------------------------------------------------------

    public static function identifyYakuByName($name)
    {
        foreach (self::_getYakuCodes() as $regex => $code) {
            if (preg_match($regex, $name)) {
                return $code;
            }
        }

        return null;
    }

    // -----------------------------------------------------------------

    protected static function _getYakuCodes()
    {
        if (empty(self::$_yakuCodes)) {
            // This hardly relies on that big regexp formatting. Touch carefully.
            $rows = explode(
                '   |',
                str_replace(['%^(', ')$%xi'], '', self::_getRegexps()['YAKU'])
            );

            self::$_yakuCodes = [];
            array_map(function ($el) {
                $pieces = explode('#', $el);
                self::$_yakuCodes['#^' . trim($pieces[0]) . '$#'] = trim($pieces[1]);
            }, $rows);
        }

        return self::$_yakuCodes;
    }

    protected static function _getRegexps()
    {
        if (empty(self::$_regexps)) {
            self::$_regexps = [
                'SCORE_DELIMITER' => '#^:$#',
                'YAKU_START' => '#^\($#',
                'YAKU_END' => '#^\)$#',
                'DORA_DELIMITER' => '#^dora$#',
                'DORA_COUNT' => '#^\d{1,2}$#',
                'SCORE' => '#^\-?\d+$#',
                'HAN_COUNT' => '#^(\d{1,2})han$#',
                'FU_COUNT' => '#^(20|25|30|40|50|60|70|80|90|100|110|120)fu$#',
                'YAKUMAN' => '#^yakuman$#',
                'TEMPAI' => '#^tempai#',
                'ALL' => '#^all#',
                'NOBODY' => '#^nobody#',
                'RIICHI_DELIMITER' => '#^ri?ichi$#',
                'OUTCOME' => '#^(ron|tsumo|draw|chombo)$#',
                'ALSO' => '#^also$#', // double/triple ron

                // Format of this regexp is bound to _getYakuCodes function, touch carefully
                // or better don't touch at all :)
                'YAKU' => '%^(
                     (double|daburu)_(ri?ichi|reach)  # ' . Y_DOUBLERIICHI . '
                    |daisangen                        # ' . Y_DAISANGEN . '
                    |daisuu?shii?                     # ' . Y_DAISUUSHII . '
                    |junchan                          # ' . Y_JUNCHAN . '
                    |i?ipeikou?                       # ' . Y_IIPEIKOU . '
                    |ippatsu                          # ' . Y_IPPATSU . '
                    |itt?suu?                         # ' . Y_ITTSU . '
                    |kokushimusou?                    # ' . Y_KOKUSHIMUSOU . '
                    |(mend?zen)?tsumo                 # ' . Y_MENZENTSUMO . '
                    |pin-?fu                          # ' . Y_PINFU . '
                    |renhou?                          # ' . Y_RENHOU . '
                    |(ri?ichi|reach)                  # ' . Y_RIICHI . '
                    |rinshan(_kaihou)?                # ' . Y_RINSHANKAIHOU . '
                    |ryuii?sou?                       # ' . Y_RYUUIISOU . '
                    |ryanpeikou?                      # ' . Y_RYANPEIKOU . '
                    |sanankou?                        # ' . Y_SANANKOU . '
                    |sankantsu                        # ' . Y_SANKANTSU . '
                    |sanshoku                         # ' . Y_SANSHOKUDOUJUN . '
                    |sanshoku_dou?kou?                # ' . Y_SANSHOKUDOUKOU . '
                    |suu?ankou?                       # ' . Y_SUUANKOU . '
                    |suu?kantsu                       # ' . Y_SUUKANTSU . '
                    |tan-?yao                         # ' . Y_TANYAO . '
                    |tenhou?                          # ' . Y_TENHOU . '
                    |toitoi                           # ' . Y_TOITOI . '
                    |haitei                           # ' . Y_HAITEI . '
                    |honitsu                          # ' . Y_HONITSU . '
                    |honrou?tou?                      # ' . Y_HONROTO . '
                    |hou?tei                          # ' . Y_HOUTEI . '
                    |tsuu?ii?sou?                     # ' . Y_TSUUIISOU . '
                    |chankan                          # ' . Y_CHANKAN . '
                    |chanta                           # ' . Y_CHANTA . '
                    |chii?toitsu                      # ' . Y_CHIITOITSU . '
                    |chinitsu                         # ' . Y_CHINITSU . '
                    |chinrou?tou?                     # ' . Y_CHINROTO . '
                    |chihou?                          # ' . Y_CHIHOU . '
                    |chuu?renpou?tou?                 # ' . Y_CHUURENPOUTO . '
                    |shou?sangen                      # ' . Y_SHOSANGEN . '
                    |shou?suu?shi                     # ' . Y_SHOSUUSHII . '
                    |yakuhai1                         # ' . Y_YAKUHAI1 . '
                    |yakuhai2                         # ' . Y_YAKUHAI2 . '
                    |yakuhai3                         # ' . Y_YAKUHAI3 . '
                    |yakuhai4                         # ' . Y_YAKUHAI4 . '
                    |yakuhai5                         # ' . Y_YAKUHAI5 . '
                )$%xi',

                'FROM' => '#^from$#',

                // this should always be the last!
                'PLAYER_ALIAS' => '#^[a-z0-9_\.]+$#',
            ];
        }

        return self::$_regexps;
    }

    // -----------------------------------------------------------------

    protected function _identifyToken($token)
    {
        $matches = [];
        foreach (self::_getRegexps() as $name => $re) {
            if (preg_match($re, $token, $matches)) {
                return [constant('Riichi\Tokenizer::' . $name), $matches];
            }
        }

        return [self::UNKNOWN_TOKEN, null];
    }

    protected function _isTokenAllowed($tokenType)
    {
        if (empty($this->_currentStack)) {
            return !empty($this->_lastAllowedToken[$tokenType]);
        }

        $allowed = end($this->_currentStack)->allowedNextToken();
        return !empty($allowed[$tokenType]);
    }

    protected function _nextToken($token, $ctx)
    {
        list($tokenType, $reMatches) = $this->_identifyToken($token);

        if (!$this->_isTokenAllowed($tokenType)) {
            throw new TokenizerException("Unexpected token: {$token} ({$tokenType}, context: {$ctx})", 108);
        }

        $methodName = '_callToken' . ucfirst($tokenType);
        if (is_callable([$this, ucfirst($tokenType)])) {
            throw new TokenizerException("Unexpected token: {$token} ({$tokenType}, context: {$ctx})", 200);
        }

        return $this->$methodName($token, $reMatches);
    }

    // ------------------------------------------------------------------

    /**
     * Eof decisive token: should parse all remaining items in stack
     */
    protected function _callTokenEof()
    {
        $tmp = $this->_currentStack;
        $this->_currentStack = [];
        return $tmp;
    }

    /**
     * New outcome decisive token: should parse items in stack, then start new statement
     *
     * @param $token
     * @return null|Token[]
     */
    protected function _callTokenOutcome($token)
    {
        if (!empty($this->_currentStack) && self::identifyYakuByName($token) == Y_MENZENTSUMO) {
            /** @var $lastToken Token */
            $lastToken = end($this->_currentStack);
            if ($lastToken->type() == Tokenizer::YAKU_START ||
                $lastToken->type() == Tokenizer::YAKU ||
                $lastToken->type() == Tokenizer::DORA_COUNT ||
                $lastToken->type() == Tokenizer::DORA_DELIMITER
            ) {
                // workaround against same word 'tsumo' in different context
                return $this->_callTokenYaku($token);
            }
        }

        $oldStack = $this->_currentStack;

        if (!empty($this->_currentStack)) {
            $this->_lastAllowedToken = end($this->_currentStack)->allowedNextToken();
            $this->_currentStack = [];
        }

        $methodName = '_callTokenOutcome' . ucfirst($token);
        $this->$methodName($token);

        return $oldStack;
    }

    protected function _callTokenYakuEnd($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::YAKU_END,
            [
                Tokenizer::RIICHI_DELIMITER => 1,
                Tokenizer::OUTCOME => 1,
                Tokenizer::ALSO => 1,
            ]
        );
        return null;
    }

    protected function _callTokenScore($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::SCORE,
            [
                Tokenizer::PLAYER_ALIAS => 1,
                Tokenizer::OUTCOME => 1,
            ]
        );
        return null;
    }

    protected function _callTokenYakuStart($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::YAKU_START,
            [
                Tokenizer::YAKU => 1,
                Tokenizer::DORA_DELIMITER => 1,
                Tokenizer::RIICHI_DELIMITER => 1, // for 'riichi' as yaku
                Tokenizer::OUTCOME => 1, // for 'tsumo' as yaku
            ]
        );
        return null;
    }

    protected function _callTokenYaku($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::YAKU,
            [
                Tokenizer::YAKU => 1,
                Tokenizer::DORA_DELIMITER => 1,
                Tokenizer::YAKU_END => 1,
                Tokenizer::RIICHI_DELIMITER => 1, // for 'riichi' as yaku
                Tokenizer::OUTCOME => 1, // for 'tsumo' as yaku
            ]
        );
        return null;
    }

    protected function _callTokenDoraCount($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::DORA_COUNT,
            [
                Tokenizer::YAKU => 1,
                Tokenizer::YAKU_END => 1,
                Tokenizer::RIICHI_DELIMITER => 1, // for 'riichi' as yaku
                Tokenizer::OUTCOME => 1, // for 'tsumo' as yaku
            ]
        );
        return null;
    }

    protected function _callTokenDoraDelimiter($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::DORA_DELIMITER,
            [
                Tokenizer::DORA_COUNT => 1,
                Tokenizer::YAKU_END => 1,
            ]
        );
        return null;
    }

    protected function _callTokenScoreDelimiter($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::SCORE_DELIMITER,
            [
                Tokenizer::SCORE => 1,
            ]
        );
        return null;
    }

    protected function _callTokenHanCount($token, $matches)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::HAN_COUNT,
            [
                Tokenizer::FU_COUNT => 1,
                Tokenizer::RIICHI_DELIMITER => 1,
                Tokenizer::YAKU_START => 1,
                Tokenizer::ALSO => 1,
                Tokenizer::OUTCOME => 1,
            ],
            $matches[1]
        );
        return null;
    }

    protected function _callTokenFuCount($token, $matches)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::FU_COUNT,
            [
                Tokenizer::RIICHI_DELIMITER => 1,
                Tokenizer::YAKU_START => 1,
                Tokenizer::ALSO => 1,
                Tokenizer::OUTCOME => 1,
            ],
            $matches[1]
        );
        return null;
    }

    protected function _callTokenYakuman($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::YAKUMAN,
            [
                Tokenizer::YAKU_START => 1,
                Tokenizer::ALSO => 1,
            ]
        );
        return null;
    }

    protected function _callTokenTempai($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::TEMPAI,
            [
                Tokenizer::ALL => 1,
                Tokenizer::NOBODY => 1,
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );
        return null;
    }

    protected function _callTokenAll($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::ALL,
            [
                Tokenizer::OUTCOME => 1,
                Tokenizer::RIICHI_DELIMITER => 1,
            ]
        );
        return null;
    }

    protected function _callTokenNobody($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::NOBODY,
            [
                Tokenizer::OUTCOME => 1,
                Tokenizer::RIICHI_DELIMITER => 1,
            ]
        );
        return null;
    }

    protected function _callTokenRiichi($token)
    {
        if (!empty($this->_currentStack)) {
            /** @var $lastToken Token */
            $lastToken = end($this->_currentStack);
            if ($lastToken->type() == Tokenizer::YAKU_START ||
                $lastToken->type() == Tokenizer::YAKU ||
                $lastToken->type() == Tokenizer::DORA_COUNT ||
                $lastToken->type() == Tokenizer::DORA_DELIMITER
            ) {
                // workaround against same word 'riichi' in different context
                return $this->_callTokenYaku($token);
            }
        }

        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::RIICHI_DELIMITER,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenAlso($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::ALSO,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenOutcomeRon($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::OUTCOME,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenOutcomeTsumo($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::OUTCOME,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenOutcomeDraw($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::OUTCOME,
            [
                Tokenizer::TEMPAI => 1,
            ]
        );

        return null;
    }

    protected function _callTokenOutcomeChombo($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::OUTCOME,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenFrom($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::FROM,
            [
                Tokenizer::PLAYER_ALIAS => 1,
            ]
        );

        return null;
    }

    protected function _callTokenPlayerAlias($token)
    {
        $this->_currentStack [] = new Token(
            $token,
            Tokenizer::PLAYER_ALIAS,
            [
                Tokenizer::SCORE_DELIMITER => 1,
                Tokenizer::PLAYER_ALIAS => 1,
                Tokenizer::FROM => 1,
                Tokenizer::RIICHI_DELIMITER => 1,
                Tokenizer::HAN_COUNT => 1,
                Tokenizer::YAKUMAN => 1,
                Tokenizer::OUTCOME => 1,
                Tokenizer::ALSO => 1,
            ]
        );

        return null;
    }

    /**
     * For tests only!!!
     * @param $tokenList
     */
    public function _reassignLastAllowedToken($tokenList)
    {
        $this->_lastAllowedToken = $tokenList;
    }
}
