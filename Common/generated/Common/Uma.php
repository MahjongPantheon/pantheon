<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>Common.Uma</code>
 */
class Uma extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 place1 = 1;</code>
     */
    protected $place1 = 0;
    /**
     * Generated from protobuf field <code>int32 place2 = 2;</code>
     */
    protected $place2 = 0;
    /**
     * Generated from protobuf field <code>int32 place3 = 3;</code>
     */
    protected $place3 = 0;
    /**
     * Generated from protobuf field <code>int32 place4 = 4;</code>
     */
    protected $place4 = 0;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $place1
     *     @type int $place2
     *     @type int $place3
     *     @type int $place4
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Atoms::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 place1 = 1;</code>
     * @return int
     */
    public function getPlace1()
    {
        return $this->place1;
    }

    /**
     * Generated from protobuf field <code>int32 place1 = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setPlace1($var)
    {
        GPBUtil::checkInt32($var);
        $this->place1 = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 place2 = 2;</code>
     * @return int
     */
    public function getPlace2()
    {
        return $this->place2;
    }

    /**
     * Generated from protobuf field <code>int32 place2 = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setPlace2($var)
    {
        GPBUtil::checkInt32($var);
        $this->place2 = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 place3 = 3;</code>
     * @return int
     */
    public function getPlace3()
    {
        return $this->place3;
    }

    /**
     * Generated from protobuf field <code>int32 place3 = 3;</code>
     * @param int $var
     * @return $this
     */
    public function setPlace3($var)
    {
        GPBUtil::checkInt32($var);
        $this->place3 = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 place4 = 4;</code>
     * @return int
     */
    public function getPlace4()
    {
        return $this->place4;
    }

    /**
     * Generated from protobuf field <code>int32 place4 = 4;</code>
     * @param int $var
     * @return $this
     */
    public function setPlace4($var)
    {
        GPBUtil::checkInt32($var);
        $this->place4 = $var;

        return $this;
    }

}
