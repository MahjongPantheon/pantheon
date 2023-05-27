<?php
/*  Pantheon common files
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
namespace Common;

use Google\Protobuf\Internal\GPBDecodeException;
use Google\Protobuf\Internal\Message;
use Twirp\Context;

// Specific adapter for testing purposes only
final class MimirAdapter extends MimirAbstractClient implements Mimir
{
    /**
     * @var array
     */
    protected $_headers = [];

    /**
     * @param array $headers
     * @return void
     */
    public function withHeaders(array $headers)
    {
        $this->_headers = $headers;
    }

    /**
     * Method taken from generated MimirClient
     * @inheritDoc
     */
    protected function doRequest(array $ctx, string $url, Message $in, Message $out): void
    {
        $body = $in->serializeToString();

        $ctx = Context::withHttpRequestHeaders($ctx, $this->_headers);

        $req = $this->newRequest($ctx, $url, $body, 'application/protobuf');

        try {
            $resp = $this->httpClient->sendRequest($req);
        } catch (\Throwable $e) {
            throw $this->clientError('failed to send request', $e);
        }

        if ($resp->getStatusCode() !== 200) {
            $err = $this->errorFromResponse($resp);
            throw new \Exception($err->getMessage() . ' (remote): ' . $err->getMeta('cause'), $err->getCode());
        }

        try {
            $out->mergeFromString((string)$resp->getBody());
        } catch (GPBDecodeException $e) {
            throw $this->clientError('failed to unmarshal proto response', $e);
        }
    }
}
