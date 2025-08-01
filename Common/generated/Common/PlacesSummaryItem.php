<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.PlacesSummaryItem</code>
 */
class PlacesSummaryItem extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 place = 1;</code>
     */
    protected $place = 0;
    /**
     * count of games finished on this particular place
     *
     * Generated from protobuf field <code>int32 count = 2;</code>
     */
    protected $count = 0;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $place
     *     @type int $count
     *           count of games finished on this particular place
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Atoms::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 place = 1;</code>
     * @return int
     */
    public function getPlace()
    {
        return $this->place;
    }

    /**
     * Generated from protobuf field <code>int32 place = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setPlace($var)
    {
        GPBUtil::checkInt32($var);
        $this->place = $var;

        return $this;
    }

    /**
     * count of games finished on this particular place
     *
     * Generated from protobuf field <code>int32 count = 2;</code>
     * @return int
     */
    public function getCount()
    {
        return $this->count;
    }

    /**
     * count of games finished on this particular place
     *
     * Generated from protobuf field <code>int32 count = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setCount($var)
    {
        GPBUtil::checkInt32($var);
        $this->count = $var;

        return $this;
    }

}

