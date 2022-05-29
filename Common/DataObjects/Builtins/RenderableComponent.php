<?php

namespace Builtins;

abstract class RenderableComponent extends CJSModule {
    /**
     * @param array $props
     * @param array $children
     * @return ?string
     */
    abstract public function render(array $props, array $children);

    /**
     * React.Fragment support
     *
     * @param array $rendered_components
     * @return string
     */
    protected function frg(array $rendered_components) {
        return implode("\n", $this->flatten($rendered_components));
    }

    /**
     * @param array $array
     * @return string[]
     */
    protected function flatten($array) {
        /** @var string[] $flat */
        $flat = [];

        foreach ($array as $item) {
            if (is_array($item)) {
                $flat = array_merge($flat, $this->flatten($item));
            } else if ($item !== null) {
                $flat[] = (string)$item;
            }
        }

        return $flat;
    }
}
