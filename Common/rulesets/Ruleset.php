<?php
/*  Pantheon common files
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
    protected RulesetConfig $_rulesetCurrent;

    /**
     * @param string|RulesetConfig $customizedSettings
     * @throws \Exception
     */
    public function __construct(string|RulesetConfig $customizedSettings) {
        if ($customizedSettings instanceof RulesetConfig) {
            $this->_rulesetCurrent = $customizedSettings;
        } else {
            $this->_rulesetCurrent = new RulesetConfig();
            $this->_rulesetCurrent->mergeFromJsonString($customizedSettings, true);
        }
        if ($this->_rulesetCurrent->getUmaType() === UmaType::UMA_TYPE_UNSPECIFIED) {
            $this->_rulesetCurrent->setUmaType(UmaType::UMA_TYPE_UMA_SIMPLE);
        }
        // for events that where created before field honbaValue was added, this is necessary.
        if ($this->_rulesetCurrent->getHonbaValue() == 0) {
            $this->_rulesetCurrent->setHonbaValue(300);
        }
    }

    public function rules(): RulesetConfig
    {
        return $this->_rulesetCurrent;
    }

    /**
     * Make a ruleset based on default
     * @param string $rulesetName ema|wrc|jpmlA|tenhounet
     * @return Ruleset
     * @throws \Exception
     */
    public static function instance($rulesetName)
    {
        switch ($rulesetName) {
            case 'ema':
            case 'wrc':
            case 'jpmlA':
            case 'tenhounet':
            case 'rrc':
                return new Ruleset(require __DIR__ . '/' . $rulesetName . '.php');
            default:
                throw new \Exception('Ruleset not found');
        }
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
            return [0, 0, 0, 0]; // exceptional case: all equal score
        }

        if ($score[0] === $score[1] && $score[1] === $score[2]) {
            // 1 == 2 == 3 places
            $eqUma = ($uma[0] + $uma[1] + $uma[2]) / 3;
            return [$eqUma, $eqUma, $eqUma, $uma[3]];
        }

        if ($score[1] === $score[2] && $score[2] === $score[3]) {
            // 2 == 3 == 4 places
            $eqUma = ($uma[1] + $uma[2] + $uma[3]) / 3;
            return [$uma[0], $eqUma, $eqUma, $eqUma];
        }

        if ($score[0] === $score[1]) {
            $uma[0] = $uma[1] = ($uma[0] + $uma[1]) / 2;
        }

        if ($score[1] === $score[2]) {
            $uma[1] = $uma[2] = ($uma[1] + $uma[2]) / 2;
        }

        if ($score[2] === $score[3]) {
            $uma[2] = $uma[3] = ($uma[2] + $uma[3]) / 2;
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
            return $acc + ($score < $this->_rulesetCurrent->getStartPoints() ? 1 : 0);
        }, 0);

        switch ($minusedPlayers) {
            case 3:
                $uma = $this->_rulesetCurrent->getComplexUma()->getNeg3();
                break;
            case 1:
                $uma = $this->_rulesetCurrent->getComplexUma()->getNeg1();
                break;
            default:
                $uma = $this->_rulesetCurrent->getComplexUma()->getOtherwise();
        }

        return [$uma->getPlace1(), $uma->getPlace2(), $uma->getPlace3(), $uma->getPlace4()];
    }

    /**
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        $uma = $this->_rulesetCurrent->getUmaType() === UmaType::UMA_TYPE_UMA_COMPLEX
            ? $this->complexUma($scores)
            : [
                $this->_rulesetCurrent->getUma()->getPlace1(),
                $this->_rulesetCurrent->getUma()->getPlace2(),
                $this->_rulesetCurrent->getUma()->getPlace3(),
                $this->_rulesetCurrent->getUma()->getPlace4()
            ];

        if ($this->_rulesetCurrent->getEqualizeUma()) {
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
            return ($this->_rulesetCurrent->getOka() * 0.75) ;
        } else {
            return -($this->_rulesetCurrent->getOka() / 4);
        }
    }
}
