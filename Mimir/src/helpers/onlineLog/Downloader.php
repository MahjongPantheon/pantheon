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

require_once __DIR__ . '/../../primitives/Session.php';
require_once __DIR__ . '/../../exceptions/Download.php';

class Downloader
{

    /**
     * Get replay data from a remote server
     *
     * @param $logUrl
     * @return array [hash => string, content => string]
     * @throws DownloadException
     */
    public function getReplay($logUrl)
    {
        $replayHash = $this->getReplayHash($logUrl);
        $replayHash = $this->_decodeHash($replayHash);

        $logUrl = base64_decode("aHR0cDovL2UubWp2LmpwLzAvbG9nL3BsYWluZmlsZXMuY2dpPw==") . $replayHash;
	//$fallbackLogUrl = base64_decode("aHR0cDovL2UubWp2LmpwLzAvbG9nL2FyY2hpdmVkLmNnaT8=") . $replayHash;
	$fallbackLogUrl = "https://tenhou.net/0/log/?" . $replayHash;

        list ($content, $code) = $this->_download($logUrl);
        if (empty($content) || $code != 200) {
            list ($content, $code) = $this->_download($fallbackLogUrl);
            if (empty($content) || $code != 200) {
                throw new DownloadException('Content fetch failed: format changed? Contact maintainer for instructions');
            }
        }

        return [
            'decoded_hash'    => $replayHash,
            'content' => $content
        ];
    }

    /**
     * Validate domain and get attributes
     *
     * @param $logUrl
     * @return boolean
     * @throws DownloadException
     */
    public function validateUrl($logUrl)
    {
        $validDomain = base64_decode('Oi8vdGVuaG91Lm5ldC8=');
        if (strpos($logUrl, $validDomain) === false || strpos($logUrl, 'log=') === false) {
            throw new DownloadException('Invalid replay link');
        }
        return true;
    }

    /**
     * Parse get attributes and find game hash
     *
     * @param $logUrl
     * @return string
     */
    public function getReplayHash($logUrl)
    {
        $queryString = parse_url($logUrl, PHP_URL_QUERY);
        parse_str($queryString, $out);
        return $out['log'];
    }

    protected function _download($url)
    {
        $handle = curl_init();
        curl_setopt($handle, CURLOPT_URL, $url);
        curl_setopt($handle, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)');
        curl_setopt($handle, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($handle, CURLOPT_TIMEOUT, 5);
        $data = curl_exec($handle);
        $httpCode = curl_getinfo($handle, CURLINFO_HTTP_CODE);

        return [$data, $httpCode];
    }

    /**
     * Decode original replay hash
     * Just don't ask how this magic is done.
     *
     * @param $log
     * @return string
     */
    protected function _decodeHash($log)
    {
        $t = json_decode(base64_decode(
            "WzIyMTM2LDUyNzE5LDU1MTQ2LDQyMTA0LDU5NTkxLDQ2OTM0LDkyNDgsMjg4OTEsNDk1OTcsNTI5Nz" .
            "QsNjI4NDQsNDAxNSwxODMxMSw1MDczMCw0MzA1NiwxNzkzOSw2NDgzOCwzODE0NSwyNzAwOCwzOTEy" .
            "OCwzNTY1Miw2MzQwNyw2NTUzNSwyMzQ3MywzNTE2NCw1NTIzMCwyNzUzNiw0Mzg2LDY0OTIwLDI5MD" .
            "c1LDQyNjE3LDE3Mjk0LDE4ODY4LDIwODFd"
        ));

        $parts = explode('-', $log);
        if (count($parts) != 4) {
            return $log;
        }

        if (ord($parts[3][0]) == 120) {
            $hexparts = [
                hexdec(substr($parts[3], 1, 4)),
                hexdec(substr($parts[3], 5, 4)),
                hexdec(substr($parts[3], 9, 4)),
                0
            ];

            if ($parts[0] >= base64_decode('MjAxMDA0MTExMWdt')) {
                $hexparts[3] = intval("3" . substr($parts[0], 4, 6)) % (17 * 2 - intval(substr($parts[0], 9, 1)) - 1);
            }

            $hashHead = dechex($hexparts[0] ^ $hexparts[1] ^ $t[$hexparts[3] + 0]);
            $hashTail = dechex($hexparts[1] ^ $t[$hexparts[3] + 0] ^ $hexparts[2] ^ $t[$hexparts[3] + 1]);
            $hashHead = str_repeat('0', 4 - strlen($hashHead)) . $hashHead;
            $hashTail = str_repeat('0', 4 - strlen($hashTail)) . $hashTail;
            $parts[3] = $hashHead . $hashTail;
        }

        return join('-', $parts);
    }
}
