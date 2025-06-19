<?php

class Mailer
{
    protected string $_mailMode = 'local_mta';
    protected string $_mailRemoteUrl = '';
    protected string $_mailRemoteActionKey = '';
    protected string $_mailerAddress = '';

    public function __construct(string $mailMode, string $mailAddress, string $mailRemoteUrl = '', string $mailRemoteActionKey = '')
    {
        $this->_mailMode = $mailMode;
        $this->_mailRemoteUrl = $mailRemoteUrl;
        $this->_mailRemoteActionKey = $mailRemoteActionKey;
        $this->_mailerAddress = $mailAddress;
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
        $boundary = md5( uniqid() . microtime());
        $additionalHeaders['Content-Type'] = 'multipart/alternative; boundary="' . $boundary . '"';

        $htmlContent = nl2br(preg_replace('#https://(\S+)#is', '<a href="$0">$0</a>', $message) ?: '');
        $htmlContent = "<html><head><meta charset='UTF-8'><title>$subject</title></head><body>$htmlContent</body></html>";
        $htmlContent = rtrim(chunk_split(base64_encode($htmlContent)));

        $subject = '=?utf-8?B?' . base64_encode($subject) . '?=';
        $body = "--$boundary\r\n" .
            "Content-Type: text/plain; charset=UTF-8\r\n" .
            "Content-Transfer-Encoding: base64\r\n\r\n" .
            rtrim(chunk_split(base64_encode($message))) . "\r\n" .
            "--$boundary\r\n" .
            "Content-Type: text/html; charset=UTF-8\r\n" .
            "Content-Transfer-Encoding: base64\r\n\r\n" .
            $htmlContent . "\r\n" .
            "--$boundary--";

        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'local_mta') {
            mail($to, $subject, $body, $additionalHeaders, $additionalParams);
            return;
        }

        /* @phpstan-ignore-next-line */
        if ($this->_mailMode === 'remote_api') {
            $handle = curl_init();
            curl_setopt($handle, CURLOPT_URL, $this->_mailRemoteUrl);
            curl_setopt($handle, CURLOPT_POST, true);
            curl_setopt($handle, CURLOPT_POSTFIELDS, [
                'actionkey' => $this->_mailRemoteActionKey,
                'data' => base64_encode(json_encode([$to, $subject, $body, $additionalHeaders, $additionalParams]) ?: '')
            ]);
            curl_setopt($handle, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)');
            curl_setopt($handle, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($handle, CURLOPT_TIMEOUT, 5);
            curl_exec($handle);
        }
    }

    /**
     * @return string
     */
    public function sendLastBackupError()
    {
        $gitOutput = file_get_contents('/var/lib/postgresql/gitpush.log');
        /* @phpstan-ignore-next-line */
        self::_send(
            getenv('ADMIN_EMAIL'),
            '[CRITICAL] Pantheon backup failed',
            "========== Pantheon backup has failed! ==========

Here is what git said:

$gitOutput
",
            [
                'MIME-Version' => '1.0',
                'List-Unsubscribe' => $this->_mailerAddress,
                'X-Mailer' => 'PantheonNotifier/2.0'
            ],
            '-F "Pantheon mail service" -f ' . $this->_mailerAddress
        );

        return '';
    }
}

$mailer = new Mailer(
    'remote_api', // remote_api or local_mta
    'noreply@' . getenv('ALLOWED_SENDER_DOMAINS') ?: 'pantheon.local',
    getenv('HERMOD_URL'),
    getenv('MAIL_ACTION_KEY') ?: 'CHANGE_ME',
);
$mailer->sendLastBackupError();
