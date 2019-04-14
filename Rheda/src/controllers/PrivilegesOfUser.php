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

require_once __DIR__ . '/../helpers/Url.php';

class PrivilegesOfUser extends Controller
{
    protected $_mainTemplate = 'PrivilegesOfUser';
    protected $_selectedPersonData = null;

    protected function _pageTitle()
    {
        return _p('%s : rights and privileges', $this->_selectedPersonData['title']);
    }

    protected function _run()
    {
        $rulesList = $this->_frey->getRulesList();
        $data = $this->_frey->getPersonalInfo([$this->_path['id']]);
        if (empty($data)) {
            return ['error' => true, 'message' => _t('Person not found in database')];
        }

        $this->_selectedPersonData = $data[0];
        $allAccessData = $this->_frey->getAllPersonAccess($this->_path['id']);
        print_r($rulesList);
        print_r($allAccessData);
    }
}
