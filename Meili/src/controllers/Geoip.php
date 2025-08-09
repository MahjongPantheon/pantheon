<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
namespace Meili;

require_once __DIR__ . '/../Controller.php';

class GeoipController extends Controller
{
    /**
     * @param string $request
     * @return array
     */
    public function getData($request)
    {
        $data = json_decode($request, true);
        $action = $data['action'];
        $ip = $data['ip'];

        if ($action === 'get_countries') {
            return $this->getCountries($ip ?: '');
        }

        if ($action === 'get_timezones') {
            return $this->getTimezones($ip ?: '');
        }
    }

    /**
     * Get available countries.
     * If addr is provided, calculate preferred country based on IP.
     *
     * @param string $addr
     * @return array
     * @throws \Exception
     */
    public function getCountries($addr = '')
    {
        $this->_log->info('Receiving countries list');
        require_once __DIR__ . '/../../bin/countries.php';
        /** @phpstan-ignore-next-line */
        $countries = getCountriesWithCodes();

        $preferredCountry = '';
        // Some workarounds for Forseti SPA querying: we don't have server there and can't get current IP.
        if (empty($addr) && !empty($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
            $addr = $_SERVER['REMOTE_ADDR'];
        }
        if ($addr) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            try {
                /** @phpstan-ignore-next-line */
                $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
                /** @phpstan-ignore-next-line */
                $record = $reader->city($addr);
                $preferredCountry = strtoupper($record->country->isoCode);
            } catch (\Exception $e) {
                // Do nothing actually.
            }
        }

        $this->_log->info('Successfully received countries');
        return [
            'countries' => $countries,
            'preferredByIp' => $preferredCountry
        ];
    }

    /**
     * Get available timezones.
     * If addr is provided, calculate preferred timezone based on IP.
     *
     * @param string $addr
     * @return array
     * @throws \Exception
     */
    public function getTimezones($addr = '')
    {
        $this->_log->info('Receiving timezones list');
        $timezoneIdentifiers = \DateTimeZone::listIdentifiers();

        $preferredTimezone = '';
        // Some workarounds for Forseti SPA querying: we don't have server there and can't get current IP.
        if (empty($addr) && !empty($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
            $addr = $_SERVER['REMOTE_ADDR'];
        }
        if ($addr) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            try {
                /** @phpstan-ignore-next-line */
                $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
                /** @phpstan-ignore-next-line */
                $record = $reader->city($addr);
                $preferredTimezone = $record->location->timeZone;
            } catch (\Exception $e) {
                // Do nothing actually.
            }
        }

        $this->_log->info('Successfully received timezones');
        return [
            'timezones' => $timezoneIdentifiers,
            'preferredByIp' => $preferredTimezone
        ];
    }
}
