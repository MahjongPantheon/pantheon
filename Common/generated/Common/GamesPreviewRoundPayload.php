<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.GamesPreviewRoundPayload</code>
 */
class GamesPreviewRoundPayload extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>string session_hash = 1;</code>
     */
    protected $session_hash = '';
    /**
     * Generated from protobuf field <code>.common.Round round_data = 2;</code>
     */
    protected $round_data = null;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type string $session_hash
     *     @type \Common\Round $round_data
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
     * Generated from protobuf field <code>.common.Round round_data = 2;</code>
     * @return \Common\Round|null
     */
    public function getRoundData()
    {
        return $this->round_data;
    }

    public function hasRoundData()
    {
        return isset($this->round_data);
    }

    public function clearRoundData()
    {
        unset($this->round_data);
    }

    /**
     * Generated from protobuf field <code>.common.Round round_data = 2;</code>
     * @param \Common\Round $var
     * @return $this
     */
    public function setRoundData($var)
    {
        GPBUtil::checkMessage($var, \Common\Round::class);
        $this->round_data = $var;

        return $this;
    }

}

