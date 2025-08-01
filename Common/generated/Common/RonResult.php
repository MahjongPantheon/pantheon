<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/atoms.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.RonResult</code>
 */
class RonResult extends \Google\Protobuf\Internal\Message
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
     * Generated from protobuf field <code>int32 winner_id = 3;</code>
     */
    protected $winner_id = 0;
    /**
     * Generated from protobuf field <code>int32 loser_id = 4;</code>
     */
    protected $loser_id = 0;
    /**
     * Generated from protobuf field <code>int32 pao_player_id = 5;</code>
     */
    protected $pao_player_id = 0;
    /**
     * Generated from protobuf field <code>int32 han = 6;</code>
     */
    protected $han = 0;
    /**
     * Generated from protobuf field <code>int32 fu = 7;</code>
     */
    protected $fu = 0;
    /**
     * yaku ids
     *
     * Generated from protobuf field <code>repeated int32 yaku = 8;</code>
     */
    private $yaku;
    /**
     * player ids
     *
     * Generated from protobuf field <code>repeated int32 riichi_bets = 9;</code>
     */
    private $riichi_bets;
    /**
     * Generated from protobuf field <code>int32 dora = 10;</code>
     */
    protected $dora = 0;
    /**
     * Generated from protobuf field <code>int32 uradora = 11;</code>
     */
    protected $uradora = 0;
    /**
     * Generated from protobuf field <code>int32 kandora = 12;</code>
     */
    protected $kandora = 0;
    /**
     * Generated from protobuf field <code>int32 kanuradora = 13;</code>
     */
    protected $kanuradora = 0;
    /**
     * Generated from protobuf field <code>bool open_hand = 14;</code>
     */
    protected $open_hand = false;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $round_index
     *     @type int $honba
     *     @type int $winner_id
     *     @type int $loser_id
     *     @type int $pao_player_id
     *     @type int $han
     *     @type int $fu
     *     @type array<int>|\Google\Protobuf\Internal\RepeatedField $yaku
     *           yaku ids
     *     @type array<int>|\Google\Protobuf\Internal\RepeatedField $riichi_bets
     *           player ids
     *     @type int $dora
     *     @type int $uradora
     *     @type int $kandora
     *     @type int $kanuradora
     *     @type bool $open_hand
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
     * Generated from protobuf field <code>int32 winner_id = 3;</code>
     * @return int
     */
    public function getWinnerId()
    {
        return $this->winner_id;
    }

    /**
     * Generated from protobuf field <code>int32 winner_id = 3;</code>
     * @param int $var
     * @return $this
     */
    public function setWinnerId($var)
    {
        GPBUtil::checkInt32($var);
        $this->winner_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 loser_id = 4;</code>
     * @return int
     */
    public function getLoserId()
    {
        return $this->loser_id;
    }

    /**
     * Generated from protobuf field <code>int32 loser_id = 4;</code>
     * @param int $var
     * @return $this
     */
    public function setLoserId($var)
    {
        GPBUtil::checkInt32($var);
        $this->loser_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 pao_player_id = 5;</code>
     * @return int
     */
    public function getPaoPlayerId()
    {
        return $this->pao_player_id;
    }

    /**
     * Generated from protobuf field <code>int32 pao_player_id = 5;</code>
     * @param int $var
     * @return $this
     */
    public function setPaoPlayerId($var)
    {
        GPBUtil::checkInt32($var);
        $this->pao_player_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 han = 6;</code>
     * @return int
     */
    public function getHan()
    {
        return $this->han;
    }

    /**
     * Generated from protobuf field <code>int32 han = 6;</code>
     * @param int $var
     * @return $this
     */
    public function setHan($var)
    {
        GPBUtil::checkInt32($var);
        $this->han = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 fu = 7;</code>
     * @return int
     */
    public function getFu()
    {
        return $this->fu;
    }

    /**
     * Generated from protobuf field <code>int32 fu = 7;</code>
     * @param int $var
     * @return $this
     */
    public function setFu($var)
    {
        GPBUtil::checkInt32($var);
        $this->fu = $var;

        return $this;
    }

    /**
     * yaku ids
     *
     * Generated from protobuf field <code>repeated int32 yaku = 8;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getYaku()
    {
        return $this->yaku;
    }

    /**
     * yaku ids
     *
     * Generated from protobuf field <code>repeated int32 yaku = 8;</code>
     * @param array<int>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setYaku($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::INT32);
        $this->yaku = $arr;

        return $this;
    }

    /**
     * player ids
     *
     * Generated from protobuf field <code>repeated int32 riichi_bets = 9;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getRiichiBets()
    {
        return $this->riichi_bets;
    }

    /**
     * player ids
     *
     * Generated from protobuf field <code>repeated int32 riichi_bets = 9;</code>
     * @param array<int>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setRiichiBets($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::INT32);
        $this->riichi_bets = $arr;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 dora = 10;</code>
     * @return int
     */
    public function getDora()
    {
        return $this->dora;
    }

    /**
     * Generated from protobuf field <code>int32 dora = 10;</code>
     * @param int $var
     * @return $this
     */
    public function setDora($var)
    {
        GPBUtil::checkInt32($var);
        $this->dora = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 uradora = 11;</code>
     * @return int
     */
    public function getUradora()
    {
        return $this->uradora;
    }

    /**
     * Generated from protobuf field <code>int32 uradora = 11;</code>
     * @param int $var
     * @return $this
     */
    public function setUradora($var)
    {
        GPBUtil::checkInt32($var);
        $this->uradora = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 kandora = 12;</code>
     * @return int
     */
    public function getKandora()
    {
        return $this->kandora;
    }

    /**
     * Generated from protobuf field <code>int32 kandora = 12;</code>
     * @param int $var
     * @return $this
     */
    public function setKandora($var)
    {
        GPBUtil::checkInt32($var);
        $this->kandora = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 kanuradora = 13;</code>
     * @return int
     */
    public function getKanuradora()
    {
        return $this->kanuradora;
    }

    /**
     * Generated from protobuf field <code>int32 kanuradora = 13;</code>
     * @param int $var
     * @return $this
     */
    public function setKanuradora($var)
    {
        GPBUtil::checkInt32($var);
        $this->kanuradora = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>bool open_hand = 14;</code>
     * @return bool
     */
    public function getOpenHand()
    {
        return $this->open_hand;
    }

    /**
     * Generated from protobuf field <code>bool open_hand = 14;</code>
     * @param bool $var
     * @return $this
     */
    public function setOpenHand($var)
    {
        GPBUtil::checkBool($var);
        $this->open_hand = $var;

        return $this;
    }

}

