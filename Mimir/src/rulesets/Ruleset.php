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

class Ruleset
{
    public static function instance($rulesetName)
    {
        $ruleset = new Ruleset();
        $ruleset->_title = $rulesetName;
        switch ($rulesetName) {
            case 'ema':
                $ruleset->_ruleset = require_once './ema.php';
                break;
            case 'wrc':
                $ruleset->_ruleset = require_once './wrc.php';
                break;
            case 'jpmlA':
                $ruleset->_ruleset = require_once './jpmlA.php';
                break;
            case 'tenhounet':
                $ruleset->_ruleset = require_once './tenhounet.php';
                break;
            default:
                throw new \Exception('Ruleset not found');
        }
        return $ruleset;
    }

    /**
     * @return array
     */
    public static function fieldTypes()
    {
        return [
            'tenboDivider'          => 'int',
            'ratingDivider'         => 'int',
            'startRating'           => 'int',
            'oka'                   => 'int',
            'uma'                   => 'int[]',
            'equalizeUma'           => 'bool',
            'startPoints'           => 'int',
            'goalPoints'            => 'int',
            'playAdditionalRounds'  => 'bool',
            'subtractStartPoints'   => 'bool',
            'riichiGoesToWinner'    => 'bool',
            'extraChomboPayments'   => 'bool',
            'chomboPenalty'         => 'int',
            'withAtamahane'         => 'bool',
            'withAbortives'         => 'bool',
            'withKuitan'            => 'bool',
            'withKazoe'             => 'bool',
            'withButtobi'           => 'bool',
            'withMultiYakumans'     => 'bool',
            'withNagashiMangan'     => 'bool',
            'withKiriageMangan'     => 'bool',
            'tonpuusen'             => 'bool',
            'gameExpirationTime'    => 'bool',
            'yakuWithPao'           => 'select',
            'minPenalty'            => 'int',
            'maxPenalty'            => 'int',
            'penaltyStep'           => 'int',
            'timerPolicy'           => 'select',
            'yellowZone'            => 'int',
            'redZone'               => 'int',
            'withLeadingDealerGameOver' => 'bool',
            'replacementPlayerFixedPoints' => 'int',
            'replacementPlayerOverrideUma' => 'int',
            'allowedYaku'           => 'select'
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
        $minusedPlayers = array_reduce($scores, function($acc, $score) {
            return $acc + ($score < $this->startPoints() ? 1 : 0);
        }, 0);

        switch($minusedPlayers) {
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
     * @param $changes
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
