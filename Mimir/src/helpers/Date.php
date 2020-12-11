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

require_once __DIR__ . '/PointsCalc.php';


class DateHelper
{

    /**
     * Return local date for current event timezone
     * @param string $utcDate
     * @param string $timezone
     * @return string
     * @throws EntityNotFoundException
     */
    public static function getLocalDate(string $utcDate, string $timezone)
    {
        $date = new \DateTime($utcDate);
        $date->setTimezone(new \DateTimeZone($timezone));
        return $date->format('Y-m-d H:i:s');
    }

    /**
     * Check if game can be definalized. We allow to definalize only games:
     * - already finished
     * - ended no earlier than 3h before
     * - only if players of the game do not have another played games after this one.
     * NOTE: fetches data from event table for each session!
     * @param SessionPrimitive $session
     * @return bool
     * @throws EntityNotFoundException
     */
    public static function mayDefinalizeGame(SessionPrimitive $session)
    {
        if ($session->getStatus() !== SessionPrimitive::STATUS_FINISHED) {
            return false;
        }

        if (!$session->isLastForPlayers()) {
            return false;
        }

        $endDate = new \DateTime($session->getEndDate(), new \DateTimeZone($session->getEvent()->getTimezone()));
        $now = new \DateTime('now', new \DateTimeZone($session->getEvent()->getTimezone()));
        $diff = $now->diff($endDate);
        return !($diff->days > 0 || $diff->h >= 3);
    }

    /**
     * Return date without seconds; useful for representational_hash generator
     *
     * @param string $date
     * @return string
     * @throws \Exception
     */
    public static function getDateWithoutSeconds(string $date)
    {
        $datetime = new \DateTime($date);
        return $datetime->modify(sprintf('-%d seconds', (int)$datetime->format('s')))
            ->format('Y-m-d H:i:s');
    }
}
