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

class Login extends Controller
{
    protected $_mainTemplate = 'Login';

    protected function _pageTitle()
    {
        return _t('Log in');
    }

    /**
     * @return (mixed|null)[]
     *
     * @psalm-return array{error_email: mixed|null, error_password: mixed|null, email: mixed|null}
     */
    protected function _run(): array
    {
        $emailError = null;
        $passwordError = null;

        if (!empty($_POST['password']) && empty($this->_currentPersonId)) {
            if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL))  {
                $emailError = _t('E-mail is invalid');
            }

            try {
                list($id, $authToken) = $this->_frey->authorize($_POST['email'], $_POST['password']);
                if (empty($id) || empty($authToken)) {
                    throw new \Exception();
                }

                setcookie(Sysconf::COOKIE_TOKEN_KEY, $authToken, time() + 365 * 24 * 3600, '/');
                setcookie(Sysconf::COOKIE_ID_KEY, $id, time() + 365 * 24 * 3600, '/');
                header('Location: ' . '/profile');
            } catch (\Exception $ex) {
                $passwordError = _t('Password is incorrect or account not registered');
            }
        }

        if (!empty($this->_currentPersonId)) {
            header('Location: ' . '/profile/' . $this->_currentPersonId);
        }

        return [
            'error_email' => $emailError,
            'error_password' => $passwordError,
            'email' => empty($_POST['email']) ? null : $_POST['email']
        ];
    }
}
