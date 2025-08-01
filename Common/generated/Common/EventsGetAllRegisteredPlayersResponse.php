<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.EventsGetAllRegisteredPlayersResponse</code>
 */
class EventsGetAllRegisteredPlayersResponse extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>repeated .common.RegisteredPlayer players = 1;</code>
     */
    private $players;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type array<\Common\RegisteredPlayer>|\Google\Protobuf\Internal\RepeatedField $players
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Mimir::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>repeated .common.RegisteredPlayer players = 1;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getPlayers()
    {
        return $this->players;
    }

    /**
     * Generated from protobuf field <code>repeated .common.RegisteredPlayer players = 1;</code>
     * @param array<\Common\RegisteredPlayer>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setPlayers($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::MESSAGE, \Common\RegisteredPlayer::class);
        $this->players = $arr;

        return $this;
    }

}

