<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.TypedGamesAddOnlineReplayPayload</code>
 */
class TypedGamesAddOnlineReplayPayload extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     */
    protected $event_id = 0;
    /**
     * Generated from protobuf field <code>int32 platform_id = 2;</code>
     */
    protected $platform_id = 0;
    /**
     * Generated from protobuf field <code>int32 content_type = 3;</code>
     */
    protected $content_type = 0;
    /**
     * Generated from protobuf field <code>int32 log_timestamp = 4;</code>
     */
    protected $log_timestamp = 0;
    /**
     * Generated from protobuf field <code>string replay_hash = 5;</code>
     */
    protected $replay_hash = '';
    /**
     * Generated from protobuf field <code>string content = 6;</code>
     */
    protected $content = '';

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $event_id
     *     @type int $platform_id
     *     @type int $content_type
     *     @type int $log_timestamp
     *     @type string $replay_hash
     *     @type string $content
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Mimir::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     * @return int
     */
    public function getEventId()
    {
        return $this->event_id;
    }

    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setEventId($var)
    {
        GPBUtil::checkInt32($var);
        $this->event_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 platform_id = 2;</code>
     * @return int
     */
    public function getPlatformId()
    {
        return $this->platform_id;
    }

    /**
     * Generated from protobuf field <code>int32 platform_id = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setPlatformId($var)
    {
        GPBUtil::checkInt32($var);
        $this->platform_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 content_type = 3;</code>
     * @return int
     */
    public function getContentType()
    {
        return $this->content_type;
    }

    /**
     * Generated from protobuf field <code>int32 content_type = 3;</code>
     * @param int $var
     * @return $this
     */
    public function setContentType($var)
    {
        GPBUtil::checkInt32($var);
        $this->content_type = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 log_timestamp = 4;</code>
     * @return int
     */
    public function getLogTimestamp()
    {
        return $this->log_timestamp;
    }

    /**
     * Generated from protobuf field <code>int32 log_timestamp = 4;</code>
     * @param int $var
     * @return $this
     */
    public function setLogTimestamp($var)
    {
        GPBUtil::checkInt32($var);
        $this->log_timestamp = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string replay_hash = 5;</code>
     * @return string
     */
    public function getReplayHash()
    {
        return $this->replay_hash;
    }

    /**
     * Generated from protobuf field <code>string replay_hash = 5;</code>
     * @param string $var
     * @return $this
     */
    public function setReplayHash($var)
    {
        GPBUtil::checkString($var, True);
        $this->replay_hash = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string content = 6;</code>
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Generated from protobuf field <code>string content = 6;</code>
     * @param string $var
     * @return $this
     */
    public function setContent($var)
    {
        GPBUtil::checkString($var, True);
        $this->content = $var;

        return $this;
    }

}

