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

### `new ol.Overlay.Popup(opt_options)`

OpenLayers 3 Popup Overlay.
See [the examples](./examples) for usage. Styling can be done via CSS.

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`opt_options`|`Object`| Overlay options, extends olx.OverlayOptions adding: **`panMapIfOutOfView`** `Boolean` - Should the map be panned so that the popup is entirely within view. |

#### Extends

`ol.Overlay`

#### Methods

##### `show(coord,html)`

Show the popup.

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`coord`|`ol.Coordinate`| Where to anchor the popup. |
|`html`|`String` or `HTMLElement`| String or element of HTML to display within the popup. |


##### `hide()`

Hide the popup.

##### `isOpened()`

Indicates if the popup is in open state

## Contributing

Contributions are welcome, please [create an issue](https://github.com/walkermatt/ol3-popup/issues) first to discuss any potential contributions.

### Updating README.md

`README.md` is generated from the [JSDoc](http://usejsdoc.org/) comments in the source code and the template `util/README.md`. To update the API docs edit the comments in the code; to update the other text edit the template (`util/README.md`).

Once you've made edits run the following which will recreate `README.md` using the JSDoc comments and template:

    npm run doc

In order to use the `doc` npm script you will need to install the `devDependencies`:

    npm install --only=dev

## License

MIT (c) Matt Walker.

## Credit

Based on an example by [Tim Schaub](https://github.com/tschaub) posted on the
[OL3-Dev list](https://groups.google.com/forum/#!forum/ol3-dev).

## Also see

If you find the popup useful you might also like the
[ol3-layerswitcher](https://github.com/walkermatt/ol3-layerswitcher).

