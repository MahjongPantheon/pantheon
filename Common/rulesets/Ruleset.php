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
namespace Common;
require_once __DIR__ . '/../i18n.php';

class Ruleset
{
    /**
     * @param string $rulesetName
     * @return Ruleset
     * @throws \Exception
     */
    public static function instance($rulesetName)
    {
        $ruleset = new Ruleset();
        $ruleset->_title = $rulesetName;
        switch ($rulesetName) {
            case 'ema':
                $ruleset->_ruleset = require __DIR__ . '/ema.php';
                break;
            case 'wrc':
                $ruleset->_ruleset = require __DIR__ . '/wrc.php';
                break;
            case 'jpmlA':
                $ruleset->_ruleset = require __DIR__ . '/jpmlA.php';
                break;
            case 'tenhounet':
                $ruleset->_ruleset = require __DIR__ . '/tenhounet.php';
                break;
            default:
                throw new \Exception('Ruleset not found');
        }
        return $ruleset;
    }

    /**
     * @return array
     */
    public static function fieldDescriptions()
    {
        return [
            'allowedYaku' => _t('List of allowed yaku'),
            'chipsValue' => _t('Chips value'),
            'chomboPenalty' => _t('Chombo penalty in rating points'),
            'doubleronHonbaAtamahane' => _t('Should honda bonus be given by atamahane rule in case of double/triple ron (given to all if not)'),
            'doubleronRiichiAtamahane' => _t('Should riichi sticks be given by atamahane rule in case of double/triple ron'),
            'equalizeUma' => _t('Should uma bonus be divided equally in case of score equality'),
            'extraChomboPayments' => _t('If chombo should be payed in points'),
            'goalPoints' => _t('Points to end game'),
            'maxPenalty' => _t('Maximal arbitrary penalty amount'),
            'minPenalty' => _t('Minimal arbitrary penalty amount'),
            'oka' => _t('Oka (first place) bonus size'),
            'penaltyStep' => _t('Step of penalty amounts'),
            'playAdditionalRounds' => _t('Play additional rounds'),
            'replacementPlayerFixesPoints' => _t('Amount of points to be given to replacement player'),
            'replacementPlayerOverrideUma' => _t('Amount of uma bonus to be given to replacement player'),
            'riichiGoesToWinner' => _t('If riichi bets left on the table go to winner of the hanchan'),
            'startPoints' => _t('Points to start with'),
            'startRating' => _t('Rating initial points amount'),
            'endingPolicy' => _t('Session ending policy'),
            'tonpuusen' => _t('If games have east rounds only'),
            'uma' => _t('Uma (rank) bonus size'),
            'withAbortives' => _t('If abortive draws are allowed'),
            'withAtamahane' => _t('If atamahane is enabled'),
            'withButtobi' => _t('If game ends when any player goes bankrupt'),
            'withKazoe' => _t('If kazoe should be yakuman, not sanbaiman'),
            'withKiriageMangan' => _t('If 4/30 and 3/60 should be rounded to mangan'),
            'withKuitan' => _t('If tanyao in open hand is allowed'),
            'withLeadingDealerGameOver' => _t('If game ends when leading dealer wins in last round'),
            'withMultiYakumans' => _t('If multiple yakumans are enabled'),
            'withNagashiMangan' => _t('If nagashi mangan is allowed'),
            'withWinningDealerHonbaSkipped' => _t('If game should proceed to next round if dealer wins (i.e. no honba/renchan)'),
            'yakuWithPao' => _t('List of yakumans that use pao rule'),
        ];
    }

    /**
     * @return array
     */
    public static function fieldTypes()
    {
        return [
            'allowedYaku'           => 'select',
            'chipsValue'            => 'int',
            'chomboPenalty'         => 'int',
            'complexUma'            => 'bool',
            'doubleronHonbaAtamahane' => 'bool',
            'doubleronRiichiAtamahane' => 'bool',
            'equalizeUma'           => 'bool',
            'extraChomboPayments'   => 'bool',
            'gameExpirationTime'    => 'int',
            'goalPoints'            => 'int',
            'maxPenalty'            => 'int',
            'minPenalty'            => 'int',
            'oka'                   => 'int',
            'penaltyStep'           => 'int',
            'playAdditionalRounds'  => 'bool',
            'replacementPlayerFixedPoints' => 'int',
            'replacementPlayerOverrideUma' => 'int',
            'riichiGoesToWinner'    => 'bool',
            'startPoints'           => 'int',
            'startRating'           => 'int',
            'endingPolicy'           => 'select',
            'tonpuusen'             => 'bool',
            'uma'                   => 'int[]',
            'withAbortives'         => 'bool',
            'withAtamahane'         => 'bool',
            'withButtobi'           => 'bool',
            'withKazoe'             => 'bool',
            'withKiriageMangan'     => 'bool',
            'withKuitan'            => 'bool',
            'withLeadingDealerGameOver' => 'bool',
            'withMultiYakumans'     => 'bool',
            'withNagashiMangan'     => 'bool',
            'withWinningDealerHonbaSkipped' => 'bool',
            'yakuWithPao'           => 'select',
        ];
    }

    /**
     * Make uma equal if scores are equal
     *
     * @param float[] $score
     * @param float[] $uma
     * @return float[]
     */
    protected function _equalizeUma(array $score, array $uma)
    {
        rsort($score);
        if ($score[0] === $score[1] && $score[1] === $score[2] && $score[2] === $score[3]) {
            return [1 => 0, 0, 0, 0]; // exceptional case: all equal score
        }

        if ($score[0] === $score[1] && $score[1] === $score[2]) {
            // 1 == 2 == 3 places
            $eqUma = ($uma[1] + $uma[2] + $uma[3]) / 3;
            return [1 => $eqUma, $eqUma, $eqUma, $uma[4]];
        }

        if ($score[1] === $score[2] && $score[2] === $score[3]) {
            // 2 == 3 == 4 places
            $eqUma = ($uma[2] + $uma[3] + $uma[4]) / 3;
            return [1 => $uma[1], $eqUma, $eqUma, $eqUma];
        }

        if ($score[0] === $score[1]) {
            $uma[1] = $uma[2] = ($uma[1] + $uma[2]) / 2;
        }

        if ($score[1] === $score[2]) {
            $uma[2] = $uma[3] = ($uma[2] + $uma[3]) / 2;
        }

        if ($score[2] === $score[3]) {
            $uma[3] = $uma[4] = ($uma[3] + $uma[4]) / 2;
        }

        return $uma;
    }

    /**
     * @param array $scores
     * @return int[]
     */
    protected function complexUma($scores = [])
    {
        rsort($scores);
        $minusedPlayers = array_reduce($scores, function ($acc, $score) {
            return $acc + ($score < $this->startPoints() ? 1 : 0);
        }, 0);

        switch ($minusedPlayers) {
            case 3:
                $uma = [1 => 12000, -1000, -3000, -8000];
                break;
            case 1:
                $uma = [1 => 8000, 3000, 1000, -12000];
                break;
            default:
                $uma = [1 => 8000, 4000, -4000, -8000];
        }

        return $uma;
    }

    /**
     * @var string $_title
     */
    protected $_title;
    /**
     * @var array $_ruleset
     */
    protected $_ruleset;

    /**
     * @return array
     */
    public function getRawRuleset()
    {
        return $this->_ruleset;
    }

    /**
     * @param array $changes
     * @return Ruleset
     */
    public function applyChanges($changes)
    {
        $ruleset = clone $this;
        foreach ($changes as $rule => $value) {
            $ruleset->_ruleset[$rule] = $value;
        }
        return $ruleset;
    }

    /**
     * @return string
     */
    public function title()
    {
        return $this->_title;
    }

    /**
     * @return array
     */
    public function allowedYaku()
    {
        return $this->_ruleset['allowedYaku'];
    }

    /**
     * @return bool
     */
    public function tonpuusen()
    {
        return boolval($this->_ruleset['tonpuusen']);
    }

    /**
     * @return int
     */
    public function startRating()
    {
        return intval($this->_ruleset['startRating']);
    }

    /**
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        $uma = isset($this->_ruleset['complexUma']) && $this->_ruleset['complexUma']
            ? $this->complexUma($scores)
            : $this->_ruleset['uma'];

        if ($this->_ruleset['equalizeUma']) {
            return $this->_equalizeUma($scores, $uma);
        }
        return $uma;
    }

    /**
     * oka is an ante every player pays upfront, and the winner takes its all.
     * so if oka is 20000, every player puts 5000 in the "oka-pot" and the
     * gets it all, so he profits 15000 as he payed 5000 himself too.
     *
     * @param int $place
     * @return float
     */
    public function oka(int $place)
    {
        if ($place === 1) {
            return (intval($this->_ruleset['oka']) * 0.75) ;
        } else {
            return -(intval($this->_ruleset['oka']) / 4);
        }
    }

    /**
     * @return int
     */
    public function startPoints()
    {
        return intval($this->_ruleset['startPoints']);
    }

    /**
     * @return int
     */
    public function goalPoints()
    {
        return intval($this->_ruleset['goalPoints']);
    }

    /**
     * @return bool
     */
    public function playAdditionalRounds()
    {
        return boolval($this->_ruleset['playAdditionalRounds']);
    }

    /**
     * @return bool
     */
    public function riichiGoesToWinner()
    {
        return boolval($this->_ruleset['riichiGoesToWinner']);
    }

    /**
     * @return bool
     */
    public function doubleronRiichiAtamahane()
    {
        return boolval($this->_ruleset['doubleronRiichiAtamahane'] ?? false);
    }

    /**
     * @return bool
     */
    public function doubleronHonbaAtamahane()
    {
        return boolval($this->_ruleset['doubleronHonbaAtamahane'] ?? false);
    }

    /**
     * @return bool
     */
    public function extraChomboPayments()
    {
        return boolval($this->_ruleset['extraChomboPayments']);
    }

    /**
     * @return float
     */
    public function chomboPenalty()
    {
        return floatval($this->_ruleset['chomboPenalty']);
    }

    /**
     * @return bool
     */
    public function withAtamahane()
    {
        return boolval($this->_ruleset['withAtamahane']);
    }

    /**
     * @return bool
     */
    public function withAbortives()
    {
        return boolval($this->_ruleset['withAbortives']);
    }

    /**
     * @return bool
     */
    public function withKuitan()
    {
        return boolval($this->_ruleset['withKuitan']);
    }

    /**
     * @return bool
     */
    public function withKazoe()
    {
        return boolval($this->_ruleset['withKazoe']);
    }

    /**
     * @return bool
     */
    public function withButtobi()
    {
        return boolval($this->_ruleset['withButtobi']);
    }

    /**
     * @return bool
     */
    public function withLeadingDealerGameOver()
    {
        return boolval($this->_ruleset['withLeadingDealerGameOver']);
    }

    /**
     * @return bool
     */
    public function withMultiYakumans()
    {
        return boolval($this->_ruleset['withMultiYakumans']);
    }

    /**
     * @return bool
     */
    public function withNagashiMangan()
    {
        return boolval($this->_ruleset['withNagashiMangan']);
    }

    /**
     * @return bool
     */
    public function withKiriageMangan()
    {
        return boolval($this->_ruleset['withKiriageMangan']);
    }

    /**
     * @return int
     */
    public function gameExpirationTime()
    {
        return intval($this->_ruleset['gameExpirationTime']);
    }

    /**
     * @return int
     */
    public function minPenalty()
    {
        return intval($this->_ruleset['minPenalty']);
    }

    /**
     * @return int
     */
    public function maxPenalty()
    {
        return intval($this->_ruleset['maxPenalty']);
    }

    /**
     * @return int
     */
    public function penaltyStep()
    {
        return intval($this->_ruleset['penaltyStep']);
    }

    /**
     * @return array
     */
    public function yakuWithPao()
    {
        return $this->_ruleset['yakuWithPao'];
    }

    /**
     * @return string
     */
    public function endingPolicy()
    {
        return $this->_ruleset['endingPolicy'];
    }

    /**
     * @return int|false
     */
    public function replacementPlayerFixedPoints()
    {
        return $this->_ruleset['replacementPlayerFixedPoints'];
    }

    /**
     * @return float|false
     */
    public function replacementOverrideUma()
    {
        return $this->_ruleset['replacementPlayerOverrideUma'];
    }

    /**
     * @return bool
     */
    public function withWinningDealerHonbaSkipped()
    {
        return boolval($this->_ruleset['withWinningDealerHonbaSkipped'] ?? false);
    }

    /**
     * @return int
     */
    public function chipsValue()
    {
        return intval($this->_ruleset['chipsValue'] ?? 0);
    }
}
