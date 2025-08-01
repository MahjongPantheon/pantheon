<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.GamesDropLastRoundPayload</code>
 */
class GamesDropLastRoundPayload extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>string session_hash = 1;</code>
     */
    protected $session_hash = '';
    /**
     * Generated from protobuf field <code>repeated .common.IntermediateResultOfSession intermediate_results = 2;</code>
     */
    private $intermediate_results;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type string $session_hash
     *     @type array<\Common\IntermediateResultOfSession>|\Google\Protobuf\Internal\RepeatedField $intermediate_results
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Mimir::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>string session_hash = 1;</code>
     * @return string
     */
    public function getSessionHash()
    {
        return $this->session_hash;
    }

    /**
     * Generated from protobuf field <code>string session_hash = 1;</code>
     * @param string $var
     * @return $this
     */
    public function setSessionHash($var)
    {
        GPBUtil::checkString($var, True);
        $this->session_hash = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>repeated .common.IntermediateResultOfSession intermediate_results = 2;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getIntermediateResults()
    {
        return $this->intermediate_results;
    }

    /**
     * Generated from protobuf field <code>repeated .common.IntermediateResultOfSession intermediate_results = 2;</code>
     * @param array<\Common\IntermediateResultOfSession>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setIntermediateResults($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::MESSAGE, \Common\IntermediateResultOfSession::class);
        $this->intermediate_results = $arr;

        return $this;
    }

}

