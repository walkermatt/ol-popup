/**
* OpenLayers Popup Overlay.
* See [the examples](./examples) for usage. Styling can be done via CSS.
* @constructor
* @extends {Overlay}
* @param {import('ol/Overlay').Options} opt_options options as defined by ol.Overlay. Defaults to
* `{animation: {duration: 250}}`
*/
export default class Popup extends Overlay {
    /**
    * @private
    * @desc Determine if the current browser supports touch events. Adapted from
    * https://gist.github.com/chrismbarr/4107472
    */
    private static isTouchDevice_;
    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    * @param {HTMLElement} elm
    */
    private static enableTouchScroll_;
    container: HTMLDivElement;
    closer: HTMLAnchorElement;
    content: HTMLDivElement;
    /**
    * Show the popup.
    * @param {import('ol/coordinate').Coordinate} coord Where to anchor the popup.
    * @param {String|HTMLElement} html String or element of HTML to display within the popup.
    * @returns {Popup} The Popup instance
    */
    show(coord: import('ol/coordinate').Coordinate, html: string | HTMLElement): Popup;
    /**
    * Hide the popup.
    * @returns {Popup} The Popup instance
    */
    hide(): Popup;
    /**
    * Indicates if the popup is in open state
    * @returns {Boolean} Whether the popup instance is open
    */
    isOpened(): boolean;
}
import Overlay from 'ol/Overlay';
