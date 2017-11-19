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

class AdminLogin extends Controller
{
    protected $_mainTemplate = 'AdminLogin';

    protected function _pageTitle()
    {
        return _t('Admin login');
    }

    protected function _run()
    {
        $error = null;

        if (!empty($_POST['secret'])) {
            if (!$this->_getAdminCookie($_POST['secret'])) {
                $error = _t("Wrong admin password");
            } else {
                $cookieLife = time() + 3600;
                if (!empty(Sysconf::ADMIN_AUTH()[$this->_eventId]['cookie_life'])) {
                    $cookieLife = time() + Sysconf::ADMIN_AUTH()[$this->_eventId]['cookie_life'];
                }
                setcookie('secret', $this->_getAdminCookie($_POST['secret']), $cookieLife, '/');
                header('Location: ' . Url::make('/login/', $this->_eventId));
            }
        }

        return [
            'error' => $error,
            'isLoggedIn' => $this->_adminAuthOk()
        ];
    }
}
