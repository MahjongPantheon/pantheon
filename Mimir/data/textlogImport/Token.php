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

class Token
{
    protected $_token;
    protected $_allowedNextToken;
    protected $_type;
    protected $_cleanValue;

    /**
     * @param string $token
     * @param string $type
     * @param array $allowedNextToken
     * @param string $cleanValue
     */
    public function __construct($token, $type, $allowedNextToken, $cleanValue = null)
    {
        $this->_token = $token;
        $this->_type = $type;
        $this->_allowedNextToken = $allowedNextToken;
        $this->_cleanValue = $cleanValue;
    }

    public function token()
    {
        return $this->_token;
    }

    public function allowedNextToken()
    {
        return $this->_allowedNextToken;
    }

    public function type()
    {
        return $this->_type;
    }

    public function clean()
    {
        return $this->_cleanValue;
    }

    public function __toString()
    {
        return $this->_token;
    }
}
