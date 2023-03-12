<?php

namespace Common;

use Google\Protobuf\Internal\GPBDecodeException;
use Google\Protobuf\Internal\Message;
use Twirp\Context;

// Specific adapter for testing purposes only
final class FreyAdapter extends FreyAbstractClient implements Frey
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
     * Method taken from generated FreyClient
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
