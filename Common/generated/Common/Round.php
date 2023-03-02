<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>Common.Round</code>
 */
class Round extends \Google\Protobuf\Internal\Message
{
    protected $outcome;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type \Common\RonResult $ron
     *     @type \Common\TsumoResult $tsumo
     *     @type \Common\MultironResult $multiron
     *     @type \Common\DrawResult $draw
     *     @type \Common\AbortResult $abort
     *     @type \Common\ChomboResult $chombo
     *     @type \Common\NagashiResult $nagashi
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Atoms::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>.Common.RonResult ron = 1;</code>
     * @return \Common\RonResult|null
     */
    public function getRon()
    {
        return $this->readOneof(1);
    }

    public function hasRon()
    {
        return $this->hasOneof(1);
    }

    /**
     * Generated from protobuf field <code>.Common.RonResult ron = 1;</code>
     * @param \Common\RonResult $var
     * @return $this
     */
    public function setRon($var)
    {
        GPBUtil::checkMessage($var, \Common\RonResult::class);
        $this->writeOneof(1, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.TsumoResult tsumo = 2;</code>
     * @return \Common\TsumoResult|null
     */
    public function getTsumo()
    {
        return $this->readOneof(2);
    }

    public function hasTsumo()
    {
        return $this->hasOneof(2);
    }

    /**
     * Generated from protobuf field <code>.Common.TsumoResult tsumo = 2;</code>
     * @param \Common\TsumoResult $var
     * @return $this
     */
    public function setTsumo($var)
    {
        GPBUtil::checkMessage($var, \Common\TsumoResult::class);
        $this->writeOneof(2, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.MultironResult multiron = 3;</code>
     * @return \Common\MultironResult|null
     */
    public function getMultiron()
    {
        return $this->readOneof(3);
    }

    public function hasMultiron()
    {
        return $this->hasOneof(3);
    }

    /**
     * Generated from protobuf field <code>.Common.MultironResult multiron = 3;</code>
     * @param \Common\MultironResult $var
     * @return $this
     */
    public function setMultiron($var)
    {
        GPBUtil::checkMessage($var, \Common\MultironResult::class);
        $this->writeOneof(3, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.DrawResult draw = 4;</code>
     * @return \Common\DrawResult|null
     */
    public function getDraw()
    {
        return $this->readOneof(4);
    }

    public function hasDraw()
    {
        return $this->hasOneof(4);
    }

    /**
     * Generated from protobuf field <code>.Common.DrawResult draw = 4;</code>
     * @param \Common\DrawResult $var
     * @return $this
     */
    public function setDraw($var)
    {
        GPBUtil::checkMessage($var, \Common\DrawResult::class);
        $this->writeOneof(4, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.AbortResult abort = 5;</code>
     * @return \Common\AbortResult|null
     */
    public function getAbort()
    {
        return $this->readOneof(5);
    }

    public function hasAbort()
    {
        return $this->hasOneof(5);
    }

    /**
     * Generated from protobuf field <code>.Common.AbortResult abort = 5;</code>
     * @param \Common\AbortResult $var
     * @return $this
     */
    public function setAbort($var)
    {
        GPBUtil::checkMessage($var, \Common\AbortResult::class);
        $this->writeOneof(5, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.ChomboResult chombo = 6;</code>
     * @return \Common\ChomboResult|null
     */
    public function getChombo()
    {
        return $this->readOneof(6);
    }

    public function hasChombo()
    {
        return $this->hasOneof(6);
    }

    /**
     * Generated from protobuf field <code>.Common.ChomboResult chombo = 6;</code>
     * @param \Common\ChomboResult $var
     * @return $this
     */
    public function setChombo($var)
    {
        GPBUtil::checkMessage($var, \Common\ChomboResult::class);
        $this->writeOneof(6, $var);

        return $this;
    }

    /**
     * Generated from protobuf field <code>.Common.NagashiResult nagashi = 7;</code>
     * @return \Common\NagashiResult|null
     */
    public function getNagashi()
    {
        return $this->readOneof(7);
    }

    public function hasNagashi()
    {
        return $this->hasOneof(7);
    }

    /**
     * Generated from protobuf field <code>.Common.NagashiResult nagashi = 7;</code>
     * @param \Common\NagashiResult $var
     * @return $this
     */
    public function setNagashi($var)
    {
        GPBUtil::checkMessage($var, \Common\NagashiResult::class);
        $this->writeOneof(7, $var);

        return $this;
    }

    /**
     * @return string
     */
    public function getOutcome()
    {
        return $this->whichOneof("outcome");
    }

}
