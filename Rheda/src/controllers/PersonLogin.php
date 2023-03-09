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

class PersonLogin extends Controller
{
    protected $_mainTemplate = 'PersonLogin';

    protected function _pageTitle()
    {
        return _t('Log in');
    }

    protected function _beforeRun()
    {
        if (!empty($this->_currentPersonId)) {
            if ($this->_path['action'] === 'logout') {
                $this->_storage->deleteAuthToken()->deletePersonId();
                header('Location: ' . '/');
            } else {
                header('Location: ' . '/profile');
            }
            return false;
        }

        return true;
    }

    /**
     * We should get here only when action === login
     * @return array
     */
    protected function _run(): array
    {
        $emailError = null;
        $passwordError = null;
        $emailSanitized = '';

        if (!empty($_POST['password'])) {
            $emailSanitized = strtolower(trim($_POST['email'] ?? ''));
            if (!filter_var($emailSanitized, FILTER_VALIDATE_EMAIL)) {
                $emailError = _t('E-mail is invalid');
            }

            try {
                list($id, $authToken) = $this->_frey->authorize($emailSanitized, $_POST['password']);
                if (empty($id) || empty($authToken)) {
                    throw new \Exception();
                }

                $this->_storage->setAuthToken($authToken)->setPersonId($id);
                header('Location: ' . '/profile');
            } catch (\Exception $ex) {
                $this->_handleTwirpEx($ex);
                $passwordError = _t('Password is incorrect or account not registered');
            }
        }

        return [
            'error_email' => $emailError,
            'error_password' => $passwordError,
            'email' => empty($emailSanitized) ? null : $emailSanitized
        ];
    }
}
