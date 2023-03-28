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

class Mailer
{
    protected $_mailMode = 'local_mta';
    protected $_mailRemoteUrl = '';
    protected $_mailRemoteActionKey = '';
    protected $_mailerAddress = '';
    protected $_guiUrl = '';

    public function __construct($guiUrl, $mailMode, $mailAddress, $mailRemoteUrl = '', $mailRemoteActionKey = '') {
        $this->_mailMode = $mailMode;
        $this->_mailRemoteUrl = $mailRemoteUrl;
        $this->_mailRemoteActionKey = $mailRemoteActionKey;
        $this->_mailerAddress = $mailAddress;
        $this->_guiUrl = $guiUrl;
    }

    /**
     * @param string $to
     * @param string $subject
     * @param string $message
     * @param array $additionalHeaders
     * @param string $additionalParams
     * @return void
     */
    protected function _send(string $to, string $subject, string $message, array $additionalHeaders, string $additionalParams)
    {
        $additionalHeaders['Content-Transfer-Encoding'] = 'base64';

        $message = nl2br(preg_replace('#https://(\S+)#is', '<a href="$0">$0</a>', $message) ?: '');
        $message = "<html><head><meta charset='UTF-8'><title>$subject</title></head><body>$message</body></html>";
        $message = rtrim(chunk_split(base64_encode($message)));
        $subject = '=?utf-8?B?' . base64_encode($subject) . '?=';

        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'local_mta') {
            mail($to, $subject, $message, $additionalHeaders, $additionalParams);
            return;
        }

        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'remote_api') {
            $handle = curl_init();
            curl_setopt($handle, CURLOPT_URL, $this->_mailRemoteUrl);
            curl_setopt($handle, CURLOPT_POST, true);
            curl_setopt($handle, CURLOPT_POSTFIELDS, [
                'actionkey' => $this->_mailRemoteActionKey,
                'data' => base64_encode(json_encode([$to, $subject, $message, $additionalHeaders, $additionalParams]) ?: '')
            ]);
            curl_setopt($handle, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)');
            curl_setopt($handle, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($handle, CURLOPT_TIMEOUT, 5);
            curl_exec($handle);
        }
    }

    /**
     * @param string $signupEmail
     * @param string $regLink
     * @return string
     */
    public function sendSignupMail($signupEmail, $regLink)
    {
        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'debug') {
            return $regLink;
        }
        /* @phpstan-ignore-next-line */
        self::_send(
            $signupEmail,
            _t('Pantheon: confirm your registration'),
            _p("Hello!

You have just registered your account in the Pantheon system,
please follow next link to confirm your registration:

%s

If you didn't attempt to register, you can safely ignore this message.

Sincerely yours,
Pantheon support team
", $this->_guiUrl . $regLink),
            [
                'MIME-Version' => '1.0',
                'Content-Type' => 'text/html; charset=UTF-8',
                'List-Unsubscribe' => $this->_mailerAddress,
                'X-Mailer' => 'PantheonNotifier/2.0'
            ],
            '-F "Pantheon mail service" -f ' . $this->_mailerAddress
        );

        return ''; // Don't return approval code if we're sending mail ourselves
    }

    /**
     * @param string $approvalToken
     * @param string $emailSanitized
     * @return string
     */
    public function sendPasswordRecovery($approvalToken, $emailSanitized)
    {
        $debugMessage = '';
        $message = _p("Hello!

You have just requested password recovery for your account
in the Pantheon system. Please follow next link to reset your password:

%s

If you didn't attempt to recover password, you can safely ignore this message.

Sincerely yours,
Pantheon support team
", $this->_guiUrl . '/passwordRecovery/' . $approvalToken . '/' . $emailSanitized);
        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'debug') {
            $debugMessage = $message;
        /* @phpstan-ignore-next-line */
        } else {
            self::_send(
                $emailSanitized,
                _t('Pantheon: password recovery request'),
                $message,
                [
                    'MIME-Version' => '1.0',
                    'Content-Type' => 'text/html; charset=UTF-8',
                    'List-Unsubscribe' => $this->_mailerAddress,
                    'X-Mailer' => 'PantheonNotifier/2.0'
                ],
                '-F "Pantheon mail service" -f ' . $this->_mailerAddress
            );
        }

        return $debugMessage;
    }
}
