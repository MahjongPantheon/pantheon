<?php

namespace Builtins;

class Stdlib {
    /**
     * Check if variable is array, and this array is sequential
     * @param mixed $any
     * @return bool
     */
    public static function arrayIsArray($any) {
        return is_array($any) && array_keys($any) === range(0, count($any) - 1);
    }

    /**
     * @param array $where
     * @param callable $predicate
     * @return bool
     */
    public static function arraySome(array $where, callable $predicate) {
        foreach ($where as $key => $value) {
            if ($predicate($value, $key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Array.map with only values
     *
     * @param array $src
     * @param callable $predicate
     * @return array
     */
    public static function arrayMap1(array $src, callable $predicate) {
        $result = [];
        foreach ($src as $value) {
            $result[] = $predicate($value);
        }
        return $result;
    }

    /**
     * Array.map with keys and values
     *
     * @param array $src
     * @param callable $predicate
     * @return array
     */
    public static function arrayMap2(array $src, callable $predicate) {
        $result = [];
        foreach ($src as $key => $value) {
            $result[] = $predicate($value, $key);
        }
        return $result;
    }

    /**
     * Array.find
     *
     * @param array $where
     * @param callable $predicate
     * @return mixed|null
     */
    public static function arrayFind(array $where, callable $predicate) {
        foreach ($where as $key => $value) {
            if ($predicate($value, $key)) {
                return $value;
            }
        }
        return null;
    }

    /**
     * @param mixed $needle
     * @param array $haystack
     * @param int $start_from
     * @return int
     */
    public static function arrayIndexOf($needle, $haystack, $start_from = 0) {
        for ($i = $start_from; $i < count($haystack); $i++) {
            if ($haystack[$i] === $needle) {
                return $i;
            }
        }
        return -1;
    }

    /**
     * @param string $needle
     * @param string $haystack
     * @param int $start_from
     * @return int
     */
    public static function stringIndexOf($needle, $haystack, $start_from = 0) {
        $pos = strpos($needle, $haystack, $start_from);
        if ($pos === false) {
            return -1;
        } else {
            return $pos;
        }
    }

    /**
     * @param mixed $needle
     * @param array $haystack
     * @param int|null $start_from
     * @return int
     */
    public static function arrayLastIndexOf($needle, $haystack, $start_from = null) {
        if ($start_from === null) {
            $start_from = count($haystack) - 1;
        }
        for ($i = $start_from; $i > 0; $i--) {
            if ($haystack[$i] === $needle) {
                return $i;
            }
        }
        return -1;
    }

    /**
     * @param array $arr
     * @param int $start
     * @param int|null $end
     * @return array
     */
    public static function arraySlice($arr, $start, $end = null) {
        if ($end !== null) {
            return array_slice($arr, $start, abs($end - $start));
        }
        return array_slice($arr, $start);
    }

    /**
     * @param string $str
     * @param int $start
     * @param int|null $end
     * @return string
     */
    public static function stringSlice($str, $start, $end = null) {
        if ($end !== null) {
            $ret = substr($str, $start, abs($end - $start));
        } else {
            $ret = substr($str, $start);
        }
        return $ret ? $ret : "";
    }

    /**
     * @param array $obj
     * @param array $props
     * @return array
     */
    public static function objectOmit($obj, $props) {
        $new_obj = [];
        foreach ($obj as $k => $v) {
            if (!in_array($k, $props)) {
                $new_obj[$k] = $v;
            }
        }

        return $new_obj;
    }

    /**
     * @param string $pattern
     * @param string $subject
     * @return mixed|null
     */
    public static function strMatch($pattern, $subject) {
        $matches = [];
        if (preg_match($pattern, $subject, $matches)) {
            return $matches;
        }
        return null;
    }

    /**
     * Mimic String.match(/.../g)
     *
     * @param string $pattern
     * @param string $subject
     * @return mixed|null
     */
    public static function strMatchG($pattern, $subject) {
        $matches = [];
        if (preg_match_all($pattern, $subject, $matches)) {
            return $matches[0];
        }
        return null;
    }

    /**
     * @param mixed $var
     * @return string
     */
    public static function typeof($var) {
        if (is_bool($var)) {
            return 'boolean';
        }
        if (is_numeric($var)) {
            return 'number';
        }
        if (is_string($var)) {
            return 'string';
        }
        if (is_null($var)) {
            return 'undefined';
        }
        return 'object';
    }
}
