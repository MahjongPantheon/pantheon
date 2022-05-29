<?php

namespace Builtins;

class IntrinsicElement extends RenderableComponent {
    public static function register() {
        // Do nothing
    }

    protected static $_store = [];
    public static function get(string $name): IntrinsicElement {
        if (!isset(self::$_store[$name])) {
            self::$_store[$name] = new IntrinsicElement($name);
        }

        return self::$_store[$name];
    }

    protected $_empty_tags = [
        'area',
        'base',
        'br',
        'col',
        'colgroup',
        'command',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
    ];
    protected $_tag_name = '';

    protected $_unitless_css_properties = [
        'animationIterationCount' => true,
        'borderImageOutset' => true,
        'borderImageSlice' => true,
        'borderImageWidth' => true,
        'boxFlex' => true,
        'boxFlexGroup' => true,
        'boxOrdinalGroup' => true,
        'columnCount' => true,
        'columns' => true,
        'flex' => true,
        'flexGrow' => true,
        'flexPositive' => true,
        'flexShrink' => true,
        'flexNegative' => true,
        'flexOrder' => true,
        'gridRow' => true,
        'gridRowEnd' => true,
        'gridRowSpan' => true,
        'gridRowStart' => true,
        'gridColumn' => true,
        'gridColumnEnd' => true,
        'gridColumnSpan' => true,
        'gridColumnStart' => true,
        'fontWeight' => true,
        'lineClamp' => true,
        'lineHeight' => true,
        'opacity' => true,
        'order' => true,
        'orphans' => true,
        'tabSize' => true,
        'widows' => true,
        'zIndex' => true,
        'zoom' => true,

        // SVG-related properties
        'fillOpacity' => true,
        'floodOpacity' => true,
        'stopOpacity' => true,
        'strokeDasharray' => true,
        'strokeDashoffset' => true,
        'strokeMiterlimit' => true,
        'strokeOpacity' => true,
        'strokeWidth' => true,
    ];

    protected $_vendor_prefixes = [
        'webkit' => true,
        'ms' => true,
        'moz' => true,
        'o' => true,
    ];

    /**
     * IntrinsicElement constructor.
     * @param string $tag_name
     */
    public function __construct($tag_name) {
        $this->_tag_name = $tag_name;
    }

    /**
     * @param string[] $children
     * @return array
     */
    protected function separateTextNodes(array $children) {
        $new_children = [];
        // Add <!-- --> between simple text nodes to make react hydration happy in case of vars interpolation.
        for ($i = 0; $i < count($children) - 1; $i++) {
            $new_children[] = $children[$i];
            // Rendered content is not html tags -> use separator
            if ($children[$i][0] !== '<' && $children[$i + 1][0] !== '<') {
                $new_children[] = '<!-- -->';
            }
        }
        // Add last child
        if (!empty($children)) {
            $new_children[] = $children[count($children) - 1];
        }

        // Trim first and last child at the beginning and at the end.
        if (!empty($new_children)) {
            $new_children[0] = ltrim($new_children[0]);
            $new_children[count($new_children) - 1] = rtrim($new_children[count($new_children) - 1]);
        }

        return $new_children;
    }

    /**
     * @param mixed $val
     * @return bool
     */
    protected function _empty($val): bool
    {
        return $val === null || $val === '' || $val === 0 || $val === false;
    }

    /**
     * @param mixed $htmlString
     * @return mixed
     */
    public static function escape($htmlString)
    {
        if (is_array($htmlString)) {
            return array_map(['Builtins\IntrinsicElement', 'escape'], $htmlString);
        }
        return htmlspecialchars($htmlString);
    }

    /**
     * @param array $props
     * @param array $children
     * @return ?string
     */
    public function render(array $props, array $children) {
        // Attributes rendering
        $attrs = [];
        if (isset($props['___root'])) {
            unset($props['___root']);
        }

        foreach ($props as $name => $value) {
            if ($this->_empty($value) || $name === 'key' || $name === 'ref') {
                // key is not required in server rendering at all;
                // ref is client-only thing
                // also we don't render empty attrs
                continue;
            }
            if ($name === 'className') {
                $name = 'class';
            }
            if ($value === true) {
                $value = 'true';
            }

            if ($name === 'style' && is_array($value)) {
                $css = [];
                foreach ($value as $css_name => $css_value) {
                    $kebab_name = strtolower(preg_replace(
                        '#[\s_]+#', '-',
                        preg_replace('#([a-z])([A-Z])#', '$1-$2', $css_name)
                    ));
                    if ($this->_vendor_prefixes[explode('-', $kebab_name)[0]]) {
                        $kebab_name = '-' . $kebab_name;
                    }
                    $attr_value = (is_numeric($css_value) && !$this->_unitless_css_properties[$css_name])
                        ? $css_value . 'px'
                        : htmlspecialchars($css_value);
                    $css []= $kebab_name . ':' . $attr_value;
                }
                $attrs[] = 'style="' . implode(';', $css) . '"';
            } else {
                $attrs[] = $name . '="' . $value . '"';
            }
        }

        $att_string = empty($attrs) ? '' : (' ' . implode(' ', $attrs));
        if (in_array($this->_tag_name, $this->_empty_tags, true)) {
            return '<' . $this->_tag_name . $att_string . '/>';
        } else {
            return '<' . $this->_tag_name . $att_string . '>' . implode('', $this->separateTextNodes($this->flatten($children))) . '</' . $this->_tag_name . '>';
        }
    }
}
