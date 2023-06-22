/**
* OpenLayers Popup Overlay.
* See [the examples](./examples) for usage. Styling can be done via CSS.
* @extends {Overlay}
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
    /**
     * @param {ol_Overlay_Options} [opt_options] OpenLayers Overlay options,
     *                                         defaults to `{autoPan: {animation: {duration: 250}}}`
     */
    constructor(opt_options?: import("ol/Overlay").Options | undefined);
    container: HTMLDivElement;
    closer: HTMLAnchorElement;
    content: HTMLDivElement;
    /**
    * Show the popup.
    * @param {ol_coordinate_Coordinate} coord Where to anchor the popup.
    * @param {String|HTMLElement} html String or element of HTML to display within the popup.
    * @returns {Popup} The Popup instance
    */
    show(coord: import("ol/coordinate").Coordinate, html: string | HTMLElement): Popup;
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
export type ol_Overlay_Options = import('ol/Overlay').Options;
export type ol_coordinate_Coordinate = import('ol/coordinate').Coordinate;
import Overlay from 'ol/Overlay';
