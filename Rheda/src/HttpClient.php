<?php
/*  Rheda: visualizer and control panel
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  Original source: https://github.com/fguillot/JsonRPC
 *  Customized HttpClient for the needs of this project :)
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
use JsonRPC\Exception\AccessDeniedException;
use JsonRPC\Exception\ConnectionFailureException;
use JsonRPC\Exception\ServerErrorException;

/**
 * Class HttpClient
 *
 * @package JsonRPC
 * @author  Frederic Guillot
 */
class HttpClient extends \JsonRPC\HttpClient
{
    /**
     * URL of the server
     *
     * @var string
     */
    protected $url;

    /**
     * HTTP client timeout
     *
     * @var integer
     */
    protected $timeout = 5;

    /**
     * Default HTTP headers to send to the server
     *
     * @var array
     */
    protected $headers = array(
        'User-Agent: JSON-RPC PHP Client <https://github.com/fguillot/JsonRPC>',
        'Content-Type: application/json',
        'Accept: application/json',
        'Connection: close',
    );

    /**
     * Username for authentication
     *
     * @var string
     */
    protected $username;

    /**
     * Password for authentication
     *
     * @var string
     */
    protected $password;

    /**
     * Enable debug output to the php error log
     *
     * @var boolean
     */
    protected $debug = false;

    /**
     * Cookies
     *
     * @var array
     */
    protected $cookies = array();

    /**
     * SSL certificates verification
     *
     * @var boolean
     */
    protected $verifySslCertificate = true;

    /**
     * SSL client certificate
     *
     * @var string
     */
    protected $sslLocalCert;

    /**
     * Callback called before the doing the request
     *
     * @var callable
     */
    protected $beforeRequest;

    /**
     * Headers came in last request
     *
     * @var array
     */
    protected $lastHeaders = [];

    /**
     * HttpClient constructor
     *
     * @param  string $url
     */
    public function __construct($url = '')
    {
        parent::__construct($url);
        $this->url = $url;
    }

    /**
     * Set URL
     *
     * @param  string $url
     * @return $this
     */
    public function withUrl($url)
    {
        $this->url = $url;
        return $this;
    }

    /**
     * Set username
     *
     * @param  string $username
     * @return $this
     */
    public function withUsername($username)
    {
        $this->username = $username;
        return $this;
    }

    /**
     * Set password
     *
     * @param  string $password
     * @return $this
     */
    public function withPassword($password)
    {
        $this->password = $password;
        return $this;
    }

    /**
     * Set timeout
     *
     * @param  integer $timeout
     * @return $this
     */
    public function withTimeout($timeout)
    {
        $this->timeout = $timeout;
        return $this;
    }

    /**
     * Set timeout
     *
     * @param  array $headers
     * @return $this
     */
    public function withHeaders(array $headers)
    {
        $this->headers = array_merge($this->headers, $headers);
        return $this;
    }

    /**
     * Set cookies
     *
     * @param  array     $cookies
     * @param  boolean   $replace
     */
    public function withCookies(array $cookies, $replace = false)
    {
        if ($replace) {
            $this->cookies = $cookies;
        } else {
            $this->cookies = array_merge($this->cookies, $cookies);
        }
    }

    /**
     * Enable debug mode
     *
     * @return $this
     */
    public function withDebug()
    {
        $this->debug = true;
        return $this;
    }

    /**
     * Disable SSL verification
     *
     * @return $this
     */
    public function withoutSslVerification()
    {
        $this->verifySslCertificate = false;
        return $this;
    }

    /**
     * Assign a certificate to use TLS
     *
     * @param $path
     * @return $this
     */
    public function withSslLocalCert($path)
    {
        $this->sslLocalCert = $path;
        return $this;
    }

    /**
     * Assign a callback before the request
     *
     * @param  \Closure $closure
     * @return $this
     */
    public function withBeforeRequestCallback(\Closure $closure)
    {
        $this->beforeRequest = $closure;
        return $this;
    }

    /**
     * Get cookies
     *
     * @return array
     */
    public function getCookies()
    {
        return $this->cookies;
    }

    /**
     * Get last headers
     *
     * @return array
     */
    public function getLastHeaders()
    {
        return $this->lastHeaders;
    }

    /**
     * Do the HTTP request
     *
     * @throws ConnectionFailureException
     * @param  string $payload
     * @param  array|string[] $headers
     * @return array
     */
    public function execute($payload, array $headers = [])
    {
        if (is_callable($this->beforeRequest)) {
            call_user_func_array($this->beforeRequest, array($this, $payload));
        }

        $stream = fopen(trim($this->url), 'r', false, $this->buildContext($payload));

        if (! is_resource($stream)) {
            throw new ConnectionFailureException('Unable to establish a connection');
        }

        $metadata = stream_get_meta_data($stream);
        $headers = $metadata['wrapper_data'];
        $response = json_decode(stream_get_contents($stream), true);

        fclose($stream);

        if ($this->debug) {
            error_log('==> Request: '.PHP_EOL.(is_string($payload) ? $payload : json_encode($payload, JSON_PRETTY_PRINT)));
            error_log('==> Headers: '.PHP_EOL.var_export($headers, true));
            error_log('==> Response: '.PHP_EOL.json_encode($response, JSON_PRETTY_PRINT));
        }

        $this->handleExceptions($headers);
        $this->parseCookies($headers);
        $this->lastHeaders = $headers;

        return $response;
    }

    /**
     * Prepare stream context
     *
     * @param  string   $payload
     * @param  array|string[] $headers
     * @return resource
     */
    protected function buildContext($payload, array $headers = [])
    {
        $headers = $this->headers;

        if (! empty($this->username) && ! empty($this->password)) {
            $headers[] = 'Authorization: Basic '.base64_encode($this->username.':'.$this->password);
        }

        if (! empty($this->cookies)) {
            $cookies = array();

            foreach ($this->cookies as $key => $value) {
                $cookies[] = $key.'='.$value;
            }

            $headers[] = 'Cookie: '.implode('; ', $cookies);
        }

        $options = array(
            'http' => array(
                'method' => 'POST',
                'protocol_version' => 1.1,
                'timeout' => $this->timeout,
                'max_redirects' => 2,
                'header' => implode("\r\n", $headers),
                'content' => $payload,
                'ignore_errors' => true,
            ),
            'ssl' => array(
                'verify_peer' => $this->verifySslCertificate,
                'verify_peer_name' => $this->verifySslCertificate,
            )
        );

        if ($this->sslLocalCert !== null) {
            $options['ssl']['local_cert'] = $this->sslLocalCert;
        }

        return stream_context_create($options);
    }

    /**
     * Parse cookies from response
     *
     * @param  array $headers
     */
    protected function parseCookies(array $headers)
    {
        foreach ($headers as $header) {
            $pos = stripos($header, 'Set-Cookie:');

            if ($pos !== false) {
                $cookies = explode(';', substr($header, $pos + 11));

                foreach ($cookies as $cookie) {
                    $item = explode('=', $cookie);

                    if (count($item) === 2) {
                        $name = trim($item[0]);
                        $value = $item[1];
                        $this->cookies[$name] = $value;
                    }
                }
            }
        }
    }

    /**
     * Throw an exception according the HTTP response
     *
     * @param  array   $headers
     * @throws AccessDeniedException
     * @throws ServerErrorException
     */
    public function handleExceptions(array $headers)
    {
        $exceptions = array(
            '401' => '\JsonRPC\Exception\AccessDeniedException',
            '403' => '\JsonRPC\Exception\AccessDeniedException',
            '404' => '\JsonRPC\Exception\ConnectionFailureException',
            '500' => '\JsonRPC\Exception\ServerErrorException',
        );

        foreach ($headers as $header) {
            foreach ($exceptions as $code => $exception) {
                if (strpos($header, 'HTTP/1.0 '.$code) !== false || strpos($header, 'HTTP/1.1 '.$code) !== false) {
                    throw new $exception('Response: '.$header);
                }
            }
        }
    }
}
