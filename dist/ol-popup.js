(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/Overlay')) :
	typeof define === 'function' && define.amd ? define(['ol/Overlay'], factory) :
	(global.Popup = factory(global.ol.Overlay));
}(this, (function (Overlay) { 'use strict';

Overlay = 'default' in Overlay ? Overlay['default'] : Overlay;

/**
* OpenLayers Popup Overlay.
* See [the examples](./examples) for usage. Styling can be done via CSS.
* @constructor
* @extends {ol.Overlay}
* @param {olx.OverlayOptions} opt_options options as defined by ol.Overlay. Defaults to
* `{autoPan: true, autoPanAnimation: {duration: 250}}`
*/
class Popup extends Overlay {

    constructor(opt_options) {

        var options = opt_options || {};

        if (options.autoPan === undefined) {
            options.autoPan = true;
        }

        if (options.autoPanAnimation === undefined) {
            options.autoPanAnimation = {
                duration: 250
            };
        }

        var element = document.createElement('div');

        options.element = element;
        super(options);

        this.container = element;
        this.container.className = 'ol-popup';

        this.closer = document.createElement('a');
        this.closer.className = 'ol-popup-closer';
        this.closer.href = '#';
        this.container.appendChild(this.closer);

        var that = this;
        this.closer.addEventListener('click', function(evt) {
            that.container.style.display = 'none';
            that.closer.blur();
            evt.preventDefault();
        }, false);

        this.content = document.createElement('div');
        this.content.className = 'ol-popup-content';
        this.container.appendChild(this.content);

        // Apply workaround to enable scrolling of content div on touch devices
        Popup.enableTouchScroll_(this.content);

    }

    /**
    * Show the popup.
    * @param {ol.Coordinate} coord Where to anchor the popup.
    * @param {String|HTMLElement} html String or element of HTML to display within the popup.
    * @returns {Popup} The Popup instance
    */
    show(coord, html) {
        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.container.style.display = 'block';
        this.content.scrollTop = 0;
        this.setPosition(coord);
        return this;
    }

    /**
    * @private
    * @desc Determine if the current browser supports touch events. Adapted from
    * https://gist.github.com/chrismbarr/4107472
    */
    static isTouchDevice_() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    static enableTouchScroll_(elm) {
        if(Popup.isTouchDevice_()){
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function(event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function(event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }

    /**
    * Hide the popup.
    * @returns {Popup} The Popup instance
    */
    hide() {
        this.container.style.display = 'none';
        return this;
    }


    /**
    * Indicates if the popup is in open state
    * @returns {Boolean} Whether the popup instance is open
    */
    isOpened() {
        return this.container.style.display == 'block';
    }

}

// Expose Popup as ol.Overlay.Popup if using a full build of
// OpenLayers
if (window.ol && window.ol.Overlay) {
    window.ol.Overlay.Popup = Popup;
}

return Popup;

})));
