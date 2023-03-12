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

use LordDashMe\SimpleCaptcha\Captcha;

require_once __DIR__ . '/../helpers/Url.php';
require_once __DIR__ . '/../helpers/Passwords.php';
require_once __DIR__ . '/../helpers/Mailer.php';

class PersonRecoverPassword extends Controller
{
    protected $_mainTemplate = 'PersonRecoverPassword';

    /**
     * @return string
     */
    protected function _pageTitle()
    {
        return _t('Recover your password');
    }

    /**
     * @return array
     */
    protected function _run(): array
    {
        if (empty($this->_path['code'])) {
            if (!empty($_POST['email'])) {
                return $this->_sendConfirmationMail($_POST['email'], $_POST['captcha']);
            }

            $captcha = new Captcha();
            $captcha->code();
            $captcha->image();
            $uniqid = md5((string)mt_rand());
            file_put_contents('/tmp/mailrecover_' . md5($uniqid), $captcha->getCode());

            return [
                'recoverRequest' => true,
                'captcha' => $captcha->getImage(),
                'uniqid' => $uniqid,
                'error' => false
            ];
        } else {
            return $this->_proceedWithResetPassword();
        }
    }

    /**
     * @param string $mail
     * @param string $captcha
     * @return array
     */
    private function _sendConfirmationMail($mail, $captcha)
    {
        $emailSanitized = strtolower(trim($mail));
        try {
            if (!filter_var($emailSanitized, FILTER_VALIDATE_EMAIL)) {
                $emailSanitized = '';
                throw new \Exception(_t('E-mail is invalid'));
            }

            $code = file_get_contents('/tmp/mailrecover_' . md5($_POST['uniqid']));
            @unlink('/tmp/mail_' . md5($_POST['uniqid']));
            if (empty($code) || $captcha !== $code) {
                throw new \Exception(_t('Captcha is invalid'));
            }

            $approvalToken = $this->_frey->requestResetPassword($emailSanitized);
            $debugMessage = Mailer::sendPasswordRecovery($approvalToken, $emailSanitized);
            return [
                'debugMessage' => $debugMessage,
                'recoverRequest' => true,
                'success' => true
            ];
        } catch (\Exception $e) {
            $this->_handleTwirpEx($e);
            $captcha = new Captcha();
            $captcha->code();
            $captcha->image();
            $uniqid = md5((string)mt_rand());
            file_put_contents('/tmp/mailrecover_' . md5($uniqid), $captcha->getCode());

            return [
                'recoverRequest' => true,
                'email' => $emailSanitized,
                'captcha' => $captcha->getImage(),
                'uniqid' => $uniqid,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * @return array
     */
    private function _proceedWithResetPassword()
    {
        if (empty($_POST['new_password'])) {
            try {
                if (!filter_var($this->_path['email'], FILTER_VALIDATE_EMAIL)) {
                    throw new \Exception(_t('E-mail is invalid'));
                }
                $newTmpPassword = $this->_frey->approveResetPassword($this->_path['email'], $this->_path['code']);
                return [
                    'recoverRequest' => false,
                    'newTmpPassword' => $newTmpPassword,
                    'email' => $this->_path['email'],
                    'error' => false
                ];
            } catch (\Exception $e) {
                $this->_handleTwirpEx($e);
                return [
                    'recoverRequest' => false,
                    'error' => $e->getMessage()
                ];
            }
        } else {
            $emailSanitized = strtolower(trim($_POST['email'] ?? ''));
            try {
                if (!filter_var($emailSanitized, FILTER_VALIDATE_EMAIL)) {
                    throw new \Exception(_t('E-mail is invalid'));
                }
                if (Passwords::calcPasswordStrength($_POST['new_password']) < 14) {
                    throw new \Exception(_t('Password is too weak. Try adding some digits, uppercase letters or punctuation to it, or increase its length.'));
                }
                $this->_frey->changePassword($emailSanitized, $_POST['old_password'], $_POST['new_password']);
                return [
                    'recoverRequest' => false,
                    'error' => false,
                    'success' => true,
                ];
            } catch (\Exception $e) {
                $this->_handleTwirpEx($e);
                return [
                    'recoverRequest' => false,
                    'newTmpPassword' => $_POST['old_password'],
                    'email' => $emailSanitized,
                    'error' => $e->getMessage()
                ];
            }
        }
    }
}
