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
            'ratingDivider' => _t('Secondary divider (applied after primary) to make rating points from uma/oka compliant points'),
            'redZone' => _t('Red zone duration'),
            'replacementPlayerFixesPoints' => _t('Amount of points to be given to replacement player'),
            'replacementPlayerOverrideUma' => _t('Amount of uma bonus to be given to replacement player'),
            'riichiGoesToWinner' => _t('If riichi bets left on the table go to winner of the hanchan'),
            'startPoints' => _t('Points to start with'),
            'startRating' => _t('Rating initial points amount'),
            'subtractStartPoints' => _t('If start points should be subtracted from result'),
            'tenboDivider' => _t('Primary divider to make game points comply with uma/oka amount'),
            'timerPolicy' => _t('Timer policy'),
            'tonpuusen' => _t('If games have east rounds only'),
            'uma' => _t('Uma (rank) bonus size'),
            'withAbortives' => _t('If abortive draws are allowed'),
            'withAtamahane' => _t('If atamahane is enabled'),
            'withButtobi' => _t('If game ends when any player goes bankrupt'),
            'withKazoe' => _t('If kazoe should be yakuman, not sanbaiman'),
            'withKiriageMangan' => _t('If 4/30 and 3/60 should be rounded to mangan'),
            'withKuitan' => _t('If tanyao in open hand is allowed'),
            'withLeadingDealerGameover' => _t('If game ends when leading dealer wins in last round'),
            'withMultiYakumans' => _t('If multiple yakumans are enabled'),
            'withNagashiMangan' => _t('If nagashi mangan is allowed'),
            'withWinningDealerHonbaSkipped' => _t('If game should proceed to next round if dealer wins (i.e. no honba/renchan)'),
            'yakuWithPao' => _t('List of yakumans that use pao rule'),
            'yellowZone' => _t('Yellow zone duration'),

            // Don't allow to customize this for now
//            'complexUma' => _t('Use JPML-like complex uma bonus (overrides uma amount setting)'),
        ];
    }

    /**
     * @return array
     */
    public static function fieldTypes()
    {
        return [
            'allowedYaku'           => 'select',
            'tenboDivider'          => 'int',
            'ratingDivider'         => 'int',
            'tonpuusen'             => 'bool',
            'startRating'           => 'int',
            'uma'                   => 'int[]',
            'oka'                   => 'int',
            'startPoints'           => 'int',
            'goalPoints'            => 'int',
            'playAdditionalRounds'  => 'bool',
            'subtractStartPoints'   => 'bool',
            'riichiGoesToWinner'    => 'bool',
            'doubleronRiichiAtamahane' => 'bool',
            'doubleronHonbaAtamahane' => 'bool',
            'extraChomboPayments'   => 'bool',
            'chomboPenalty'         => 'int',
            'withAtamahane'         => 'bool',
            'withAbortives'         => 'bool',
            'withKuitan'            => 'bool',
            'withKazoe'             => 'bool',
            'withButtobi'           => 'bool',
            'withLeadingDealerGameOver' => 'bool',
            'withMultiYakumans'     => 'bool',
            'withNagashiMangan'     => 'bool',
            'withKiriageMangan'     => 'bool',
            'gameExpirationTime'    => 'bool',
            'minPenalty'            => 'int',
            'maxPenalty'            => 'int',
            'penaltyStep'           => 'int',
            'yakuWithPao'           => 'select',
            'redZone'               => 'int',
            'yellowZone'            => 'int',
            'timerPolicy'           => 'select',
            'replacementPlayerFixedPoints' => 'int',
            'replacementPlayerOverrideUma' => 'int',
            'withWinningDealerHonbaSkipped' => 'bool',
            'chipsValue'            => 'int',
            'equalizeUma'           => 'bool',
            'complexUma'            => 'bool'
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
                $uma = [1 => 120, -10, -30, -80];
                break;
            case 1:
                $uma = [1 => 80, 30, 10, -120];
                break;
            default:
                $uma = [1 => 80, 40, -40, -80];
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
     * @return float
     */
    public function tenboDivider()
    {
        return $this->_ruleset['tenboDivider'];
    }

    /**
     * @return float
     */
    public function ratingDivider()
    {
        return $this->_ruleset['ratingDivider'];
    }

    /**
     * @return bool
     */
    public function tonpuusen()
    {
        return $this->_ruleset['tonpuusen'];
    }

    /**
     * @return int
     */
    public function startRating()
    {
        return $this->_ruleset['startRating'];
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
            return (($this->_ruleset['oka']) * 0.75) ;
        } else {
            return -($this->_ruleset['oka'] / 4);
        }
    }

    /**
     * @return int
     */
    public function startPoints()
    {
        return $this->_ruleset['startPoints'];
    }

    /**
     * @return int
     */
    public function goalPoints()
    {
        return $this->_ruleset['goalPoints'];
    }

    /**
     * @return bool
     */
    public function playAdditionalRounds()
    {
        return $this->_ruleset['playAdditionalRounds'];
    }

    /**
     * @return bool
     */
    public function subtractStartPoints()
    {
        return $this->_ruleset['subtractStartPoints'];
    }

    /**
     * @return bool
     */
    public function riichiGoesToWinner()
    {
        return $this->_ruleset['riichiGoesToWinner'];
    }

    /**
     * @return bool
     */
    public function doubleronRiichiAtamahane()
    {
        return $this->_ruleset['doubleronRiichiAtamahane'] ?? false;
    }

    /**
     * @return bool
     */
    public function doubleronHonbaAtamahane()
    {
        return $this->_ruleset['doubleronHonbaAtamahane'] ?? false;
    }

    /**
     * @return bool
     */
    public function extraChomboPayments()
    {
        return $this->_ruleset['extraChomboPayments'];
    }

    /**
     * @return float
     */
    public function chomboPenalty()
    {
        return $this->_ruleset['chomboPenalty'];
    }

    /**
     * @return bool
     */
    public function withAtamahane()
    {
        return $this->_ruleset['withAtamahane'];
    }

    /**
     * @return bool
     */
    public function withAbortives()
    {
        return $this->_ruleset['withAbortives'];
    }

    /**
     * @return bool
     */
    public function withKuitan()
    {
        return $this->_ruleset['withKuitan'];
    }

    /**
     * @return bool
     */
    public function withKazoe()
    {
        return $this->_ruleset['withKazoe'];
    }

    /**
     * @return bool
     */
    public function withButtobi()
    {
        return $this->_ruleset['withButtobi'];
    }

    /**
     * @return bool
     */
    public function withLeadingDealerGameOver()
    {
        return $this->_ruleset['withLeadingDealerGameOver'];
    }

    /**
     * @return bool
     */
    public function withMultiYakumans()
    {
        return $this->_ruleset['withMultiYakumans'];
    }

    /**
     * @return bool
     */
    public function withNagashiMangan()
    {
        return $this->_ruleset['withNagashiMangan'];
    }

    /**
     * @return bool
     */
    public function withKiriageMangan()
    {
        return $this->_ruleset['withKiriageMangan'];
    }

    /**
     * @return float
     */
    public function gameExpirationTime()
    {
        return $this->_ruleset['gameExpirationTime'];
    }

    /**
     * @return float
     */
    public function minPenalty()
    {
        return $this->_ruleset['minPenalty'];
    }

    /**
     * @return float
     */
    public function maxPenalty()
    {
        return $this->_ruleset['maxPenalty'];
    }

    /**
     * @return float
     */
    public function penaltyStep()
    {
        return $this->_ruleset['penaltyStep'];
    }

    /**
     * @return array
     */
    public function yakuWithPao()
    {
        return $this->_ruleset['yakuWithPao'];
    }

    /**
     * @return int
     */
    public function redZone()
    {
        return $this->_ruleset['redZone'];
    }

    /**
     * @return int
     */
    public function yellowZone()
    {
        return $this->_ruleset['yellowZone'];
    }

    /**
     * @return string
     */
    public function timerPolicy()
    {
        return $this->_ruleset['timerPolicy'];
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
        return $this->_ruleset['withWinningDealerHonbaSkipped'] ?? false;
    }

    /**
     * @return int
     */
    public function chipsValue()
    {
        return $this->_ruleset['chipsValue'] ?? 0;
    }
}
