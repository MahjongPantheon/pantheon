<?php

/*  Rheda: visualizer and control panel
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

namespace Rheda;

if (file_exists(__DIR__ . '/local/index.php')) {
    include __DIR__ . '/local/index.php';
} else {
    class Sysconf
    {
        const COOKIE_DOMAIN = '';

        const FREY_INTERNAL_QUERY_SECRET = 'CHANGE_ME_INTERNAL'; // TODO: change this in your local config!
        const MIMIR_INTERNAL_QUERY_SECRET = 'CHANGE_ME_INTERNAL'; // TODO: change this in your local config!

        /**
         * @return string
         */
        public static function API_URL()
        {
            return 'http://mimir'; // TODO: change this in your local config!
        }

        /**
         * @return string
         */
        public static function MOBILE_CLIENT_URL()
        {
            return (string)getenv('TYR_URL');
        }

        /**
         * @return string
         */
        public static function AUTH_API_URL()
        {
            return 'http://frey'; // TODO: change this in your local config!
        }

        /**
         * @return string
         */
        public static function GUI_URL()
        {
            return (string)getenv('RHEDA_URL');
        }

        /**
         * @return string
         */
        public static function ADMIN_PANEL_URL()
        {
            return (string)getenv('FORSETI_URL');
        }

        /**
         * @return string
         */
        public static function MAILER_ADDR()
        {
            return 'noreply@localhost';
        }

        /**
         * @return string
         */
        public static function DEBUG_TOKEN()
        {
            return 'CHANGE_ME'; // TODO: Change this on your prod server!
        }

        /**
         * @return string
         */
        public static function STAT_DOMAIN()
        {
            return '';
        }

        /**
         * @return string
         */
        public static function ANALYTICS_SITE_ID()
        {
            return '';
        }
    }
}


