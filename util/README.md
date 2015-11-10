# OpenLayers 3 Popup

Basic popup overlay for an [OL3](https://github.com/openlayers/ol3) map. By
default the map is centred so that the popup is entirely visible.

## Examples

The examples demonstrate usage and can be viewed online thanks to [RawGit](http://rawgit.com/):

* [Basic usage](http://rawgit.com/walkermatt/ol3-popup/master/examples/popup.html)
    * Create a popup instance, show it on single-click specifying the content
* [DOM Events](http://rawgit.com/walkermatt/ol3-popup/master/examples/dom-events.html)
    * Handle DOM events triggered by interacting with elements within the popup content
* [Scroll](http://rawgit.com/walkermatt/ol3-popup/master/examples/scroll.html)
    * Controlling popup dimensions and scrolling overflowing content
* [Multiple popups](http://rawgit.com/walkermatt/ol3-popup/master/examples/multiple.html)
    * Add a new popup each time the maps is clicked

The source for all examples can be found in [examples](examples).

## API

{% for class in classes -%}

### `new {{ class.longname }}({{ class.signature }})`

{{ class.description }}

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
{% for param in class.params %}|`{{ param.name }}`|`{{ param.type.names[0] }}`| {{ param.description }} |{% endfor %}

#### Extends

`{{ class.augments }}`

#### Methods

{% for method in class.methods -%}
##### `{% if method.scope == 'static' %}(static) {{ class.longname }}.{% endif %}{{ method.name }}({{ method.signature }})`

{{ method.description }}

{% if method.params -%}
###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
{% for param in method.params -%}
|`{{ param.name }}`|`{{ param.type.names[0] }}`| {{ param.description }} |
{% endfor %}

{% endif %}
{%- endfor %}
{%- endfor -%}

## License

MIT (c) Matt Walker.

## Credit

Based on an example by [Tim Schaub](https://github.com/tschaub) posted on the
[OL3-Dev list](https://groups.google.com/forum/#!forum/ol3-dev).

## Also see

If you find the popup useful you might also like the
[ol3-layerswitcher](https://github.com/walkermatt/ol3-layerswitcher).
