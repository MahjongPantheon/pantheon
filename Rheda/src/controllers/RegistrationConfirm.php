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

class RegistrationConfirm extends Controller
{
    protected $_mainTemplate = 'RegistrationConfirm';

    protected function _pageTitle()
    {
        return _t('Sign up confirmation');
    }

    /**
     * @return array
     */
    protected function _run(): array
    {
        if ($this->_currentPersonId !== null) {
            return [
                'error' => _t("Can't proceed to registration: please log out to create new user")
            ];
        }

        if (empty($this->_path['code'])) {
            return [
                'error' => _t('Confirmation code not found')
            ];
        }

        try {
            $newId = $this->_frey->approveRegistration($this->_path['code']);
            return [
                'error' => null,
                'success' => true,
                'id' => $newId
            ];
        } catch (\Exception $ex) {
            return [
                'error' => $ex->getMessage(),
                'success' => false
            ];
        }
    }
}
