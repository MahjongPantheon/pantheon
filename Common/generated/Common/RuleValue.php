<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.RuleValue</code>
 */
class RuleValue extends \Google\Protobuf\Internal\Message
{
    protected $kind;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $number_value
     *           Represents a double value.
     *     @type string $string_value
     *           Represents a string value.
     *     @type bool $bool_value
     *           Represents a boolean value.
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Atoms::initOnce();
        parent::__construct($data);
    }

    /**
     * Represents a double value.
     *
     * Generated from protobuf field <code>int32 number_value = 2;</code>
     * @return int
     */
    public function getNumberValue()
    {
        return $this->readOneof(2);
    }

    public function hasNumberValue()
    {
        return $this->hasOneof(2);
    }

    /**
     * Represents a double value.
     *
     * Generated from protobuf field <code>int32 number_value = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setNumberValue($var)
    {
        GPBUtil::checkInt32($var);
        $this->writeOneof(2, $var);

        return $this;
    }

    /**
     * Represents a string value.
     *
     * Generated from protobuf field <code>string string_value = 3;</code>
     * @return string
     */
    public function getStringValue()
    {
        return $this->readOneof(3);
    }

    public function hasStringValue()
    {
        return $this->hasOneof(3);
    }

    /**
     * Represents a string value.
     *
     * Generated from protobuf field <code>string string_value = 3;</code>
     * @param string $var
     * @return $this
     */
    public function setStringValue($var)
    {
        GPBUtil::checkString($var, True);
        $this->writeOneof(3, $var);

        return $this;
    }

    /**
     * Represents a boolean value.
     *
     * Generated from protobuf field <code>bool bool_value = 4;</code>
     * @return bool
     */
    public function getBoolValue()
    {
        return $this->readOneof(4);
    }

    public function hasBoolValue()
    {
        return $this->hasOneof(4);
    }

    /**
     * Represents a boolean value.
     *
     * Generated from protobuf field <code>bool bool_value = 4;</code>
     * @param bool $var
     * @return $this
     */
    public function setBoolValue($var)
    {
        GPBUtil::checkBool($var);
        $this->writeOneof(4, $var);

        return $this;
    }

    /**
     * @return string
     */
    public function getKind()
    {
        return $this->whichOneof("kind");
    }

}

