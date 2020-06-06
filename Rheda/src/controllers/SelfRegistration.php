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

class SelfRegistration extends Controller
{
    protected $_mainTemplate = 'SelfRegistration';

    protected function _pageTitle()
    {
        return _t('Sign up');
    }

    protected function _run()
    {
        if ($this->_currentPersonId !== null) {
            return [
                'error' => _t("Can't proceed to registration: please log out to create new user")
            ];
        }

        if (!empty($_POST['email'])) {
            return $this->_tryRegisterUser($_POST);
        }

        return [
            'error' => null
        ];
    }

    /**
     * @param array $data
     * @return array
     */
    protected function _tryRegisterUser(array $data)
    {
        $emailError = null;
        $passwordError = null;

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $emailError = _t('E-mail is invalid or not supported. Note that non-latin e-mail domains are not supported.');
        }

        if ($this->_calcPasswordStrength($data['password']) < 14) {
            $passwordError = _t('Password is too weak. Try adding some digits, uppercase letters or punctuation to it, or increase its length.');
        }

        if (!empty($emailError) || !empty($passwordError)) {
            return [
                'email' => $data['email'],
                'error' => _t('Some errors occured, see below'),
                'error_email' => $emailError,
                'error_password' => $passwordError
            ];
        }

        try {
            $approvalCode = $this->_frey->requestRegistration($data['email'], $data['password']);
            $url = Url::makeConfirmation($approvalCode);

            // TODO: send email to user here...
            return [
                'error' => null,
                'success' => true,
                // @phpstan-ignore-next-line
                'debug_url' => Sysconf::DEBUG_MODE ? $url : null
            ];
        } catch (\Exception $ex) {
            return [
                'error' => $ex->getMessage(),
                'success' => false
            ];
        }
    }

    /**
     * Calc strength of password by simple algorithm:
     * - 1 base point for every 2 symbols in password
     * - Multiply by 2 for every symbol class in password
     *
     * So:
     * - "123456" password will have strength of 3 * 2 = 6 (very weak)
     * - "Simple123" will have strength of 6 * 2 * 2 * 2 = 48 (normal)
     * - "thisismypasswordandidontcare" will have strength of 14 * 2 = 28 (below normal)
     *
     * Passwords with calculated strength less than 14 should be considered weak.
     *
     * @see also Frey/src/models/Auth.php:_calcPasswordStrength - functions should match!
     * @param string $password
     * @return float|int
     */
    protected function _calcPasswordStrength(string $password)
    {
        $hasLatinSymbols = preg_match('#[a-z]#', $password);
        $hasUppercaseLatinSymbols = preg_match('#[A-Z]#', $password);
        $hasDigits = preg_match('#[0-9]#', $password);
        $hasPunctuation = preg_match('#[-@\#\$%\^&*\(\),\./\\"\']#', $password);
        $hasOtherSymbols = mb_strlen((string)preg_replace('#[-a-z0-9@\#\$%\^&*\(\),\./\\"\']#ius', '', $password)) > 0;

        return ceil(mb_strlen($password) / 2)
            * ($hasDigits ? 2 : 1)
            * ($hasUppercaseLatinSymbols ? 2 : 1)
            * ($hasPunctuation ? 2 : 1)
            * ($hasOtherSymbols ? 2 : 1)
            * ($hasLatinSymbols ? 2 : 1)
        ;
    }
}
