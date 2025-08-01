<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.PlayersGetCurrentSessionsResponse</code>
 */
class PlayersGetCurrentSessionsResponse extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>repeated .common.CurrentSession sessions = 1;</code>
     */
    private $sessions;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type array<\Common\CurrentSession>|\Google\Protobuf\Internal\RepeatedField $sessions
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Mimir::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>repeated .common.CurrentSession sessions = 1;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getSessions()
    {
        return $this->sessions;
    }

    /**
     * Generated from protobuf field <code>repeated .common.CurrentSession sessions = 1;</code>
     * @param array<\Common\CurrentSession>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setSessions($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::MESSAGE, \Common\CurrentSession::class);
        $this->sessions = $arr;

        return $this;
    }

}

