<?php

namespace Common;

class Notifications {
    const SessionSeatingReady = 'sr';
    const SessionStartingSoon = 'ss';
    const HandHasBeenRecorded = 'h';
    const ClubSessionEnded = 'ce';
    const TournamentSessionEnded = 'te';
    const RefereeCalled = 'rc';
    const PenaltyApplied = 'pa';
    const HandHasBeenRecordedAdmin = 'ha';

    /**
     * @var int[]
     */
    public static $defaults = [
        self::SessionSeatingReady => 1,
        self::SessionStartingSoon => 1,
        self::HandHasBeenRecorded => 0,
        self::ClubSessionEnded => 0,
        self::TournamentSessionEnded => 0,
        self::RefereeCalled => 1,
        self::PenaltyApplied => 1,
        self::HandHasBeenRecordedAdmin => 0,
    ];

    /**
     * @param string $settings
     * @return int[]
     */
    public static function get(string $settings)
    {
        $result = self::$defaults;
        $json = json_decode($settings, true) ?? [];
        foreach ($json as $k => $v) {
            $result[$k] = $v;
        }
        return $result;
    }
}
