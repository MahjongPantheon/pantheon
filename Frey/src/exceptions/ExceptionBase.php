<?php
/*  Frey: ACL & user data storage
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
namespace Frey;

class BaseException extends \Exception
{
    static protected $_conf = null;

    public function __construct($message = "", $code = 0, \Exception $previous = null)
    {
        if (empty(self::$_conf)) {
            $configPath = getenv('OVERRIDE_CONFIG_PATH');
            self::$_conf = require(empty($configPath) ? __DIR__ . '/../../config/index.php' : $configPath);
        }

        $token = empty($_SERVER['HTTP_X_DEBUG_TOKEN']) ? '' : $_SERVER['HTTP_X_DEBUG_TOKEN'];
        if ($token === self::$_conf['admin']['debug_token']) {
            $message .= "\n\n" . $this->getTraceAsString();
        }

        parent::__construct($message, $code, $previous);
    }
}
