<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.ChomboResult</code>
 */
class ChomboResult extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 round_index = 1;</code>
     */
    protected $round_index = 0;
    /**
     * Generated from protobuf field <code>int32 honba = 2;</code>
     */
    protected $honba = 0;
    /**
     * Generated from protobuf field <code>int32 loser_id = 3;</code>
     */
    protected $loser_id = 0;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $round_index
     *     @type int $honba
     *     @type int $loser_id
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Atoms::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 round_index = 1;</code>
     * @return int
     */
    public function getRoundIndex()
    {
        return $this->round_index;
    }

    /**
     * Generated from protobuf field <code>int32 round_index = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setRoundIndex($var)
    {
        GPBUtil::checkInt32($var);
        $this->round_index = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 honba = 2;</code>
     * @return int
     */
    public function getHonba()
    {
        return $this->honba;
    }

    /**
     * Generated from protobuf field <code>int32 honba = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setHonba($var)
    {
        GPBUtil::checkInt32($var);
        $this->honba = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 loser_id = 3;</code>
     * @return int
     */
    public function getLoserId()
    {
        return $this->loser_id;
    }

    /**
     * Generated from protobuf field <code>int32 loser_id = 3;</code>
     * @param int $var
     * @return $this
     */
    public function setLoserId($var)
    {
        GPBUtil::checkInt32($var);
        $this->loser_id = $var;

        return $this;
    }

}

