<?php

namespace Common;

class Notifications {
    const SessionSeatingReady = 'sr';

    /**
     * @var int[]
     */
    public static $defaults = [
        // session seating ready
        self::SessionSeatingReady => 1,
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

    /**
     * @param int[] $settings
     * @return string
     */
    public static function serialize($settings)
    {
        $serialized = [];
        foreach ($settings as $k => $v) {
            if (self::$defaults[$k] === $v) {
                continue;
            }
            $serialized[$k] = $v;
        }
        return json_encode($serialized) ?: '';
    }
}
