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

abstract class Ruleset
{
    private static $_instances = [];

    /**
     * @param $title
     * @throws InvalidParametersException
     * @return Ruleset
     */
    public static function instance($title)
    {
        if (empty(self::$_instances[$title])) {
            if (!file_exists(__DIR__ . '/../config/rulesets/' . $title . '.php')) {
                throw new InvalidParametersException('No available ruleset with name ' . $title . ' found');
            }
            require_once __DIR__ . '/../config/rulesets/' . $title . '.php';
            /** @var Ruleset $className */
            $className = 'Mimir\Ruleset' . ucfirst($title);
            self::$_instances[$title] = new $className();
        }

        return static::$_instances[$title];
    }

    /**
     * Make uma equal if scores are equal
     *
     * @param $score
     * @param $uma
     * @return array
     */
    protected function _equalizeUma($score, $uma)
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

    protected static $_title;
    protected static $_ruleset;

    public function title()
    {
        return static::$_title;
    }

    public function allowedYaku()
    {
        return static::$_ruleset['allowedYaku'];
    }

    public function tenboDivider()
    {
        return static::$_ruleset['tenboDivider'];
    }

    public function ratingDivider()
    {
        return static::$_ruleset['ratingDivider'];
    }

    public function tonpuusen()
    {
        return static::$_ruleset['tonpuusen'];
    }

    public function startRating()
    {
        return static::$_ruleset['startRating'];
    }

    public function uma($scores = [])
    {
        return static::$_ruleset['uma'];
    }

    /**
     * oka is an ante every player pays upfront, and the winner takes its all.
     * so if oka is 20000, every player puts 5000 in the "oka-pot" and the
     * gets it all, so he profits 15000 as he payed 5000 himself too.
     */
    public function oka($place)
    {
        if ($place === 1) {
            return ((static::$_ruleset['oka'])*0,75)) ;
        } else {
            return -(static::$_ruleset['oka'] / 4);
        }
    }

    public function startPoints()
    {
        return static::$_ruleset['startPoints'];
    }

    public function subtractStartPoints()
    {
        return static::$_ruleset['subtractStartPoints'];
    }

    public function riichiGoesToWinner()
    {
        return static::$_ruleset['riichiGoesToWinner'];
    }

    public function doubleronRiichiAtamahane()
    {
        if (isset(static::$_ruleset['doubleronRiichiAtamahane'])) {
            return static::$_ruleset['doubleronRiichiAtamahane'];
        } else {
            return false;
        }
    }

    public function doubleronHonbaAtamahane()
    {
        if (isset(static::$_ruleset['doubleronHonbaAtamahane'])) {
            return static::$_ruleset['doubleronHonbaAtamahane'];
        } else {
            return false;
        }
    }

    public function extraChomboPayments()
    {
        return static::$_ruleset['extraChomboPayments'];
    }

    public function chomboPenalty()
    {
        return static::$_ruleset['chomboPenalty'];
    }

    public function withAtamahane()
    {
        return static::$_ruleset['withAtamahane'];
    }

    public function withAbortives()
    {
        return static::$_ruleset['withAbortives'];
    }

    public function withKuitan()
    {
        return static::$_ruleset['withKuitan'];
    }

    public function withKazoe()
    {
        return static::$_ruleset['withKazoe'];
    }

    public function withButtobi()
    {
        return static::$_ruleset['withButtobi'];
    }

    public function withLeadingDealerGameOver()
    {
        return static::$_ruleset['withLeadingDealerGameOver'];
    }

    public function withMultiYakumans()
    {
        return static::$_ruleset['withMultiYakumans'];
    }

    public function withNagashiMangan()
    {
        return static::$_ruleset['withNagashiMangan'];
    }

    public function withKiriageMangan()
    {
        return static::$_ruleset['withKiriageMangan'];
    }

    public function gameExpirationTime()
    {
        return static::$_ruleset['gameExpirationTime'];
    }

    public function minPenalty()
    {
        return static::$_ruleset['minPenalty'];
    }

    public function maxPenalty()
    {
        return static::$_ruleset['maxPenalty'];
    }

    public function penaltyStep()
    {
        return static::$_ruleset['penaltyStep'];
    }

    public function yakuWithPao()
    {
        return static::$_ruleset['yakuWithPao'];
    }

    public function redZone()
    {
        return static::$_ruleset['redZone'];
    }

    public function yellowZone()
    {
        return static::$_ruleset['yellowZone'];
    }

    public function timerPolicy()
    {
        return static::$_ruleset['timerPolicy'];
    }

    public function replacementPlayerFixedPoints()
    {
        return static::$_ruleset['replacementPlayerFixedPoints'];
    }

    public function replacementOverrideUma()
    {
        return static::$_ruleset['replacementPlayerOverrideUma'];
    }
}
