/**
 * OpenLayers 3 Popup Overlay.
 * See [the examples](./examples) for usage. Styling can be done via CSS.
 * @constructor
 * @extends {ol.Overlay}
 * @param {Object} opt_options Overlay options
 */
ol.Overlay.Popup = function(opt_options) {

    var options = opt_options || {};

    if (options.autoPan === undefined) {
        options.autoPan = true;
    }

    if (options.autoPanAnimation === undefined) {
        options.autoPanAnimation = {
            duration: 250
        };
    }

    this.container = document.createElement('div');
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
    ol.Overlay.Popup.enableTouchScroll_(this.content);

    options.element = this.container;
    ol.Overlay.call(this, options);

};

ol.inherits(ol.Overlay.Popup, ol.Overlay);

/**
 * Show the popup.
 * @param {ol.Coordinate} coord Where to anchor the popup.
 * @param {String|HTMLElement} html String or element of HTML to display within the popup.
 */
ol.Overlay.Popup.prototype.show = function(coord, html) {
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
};

/**
 * @private
 * @desc Determine if the current browser supports touch events. Adapted from
 * https://gist.github.com/chrismbarr/4107472
 */
ol.Overlay.Popup.isTouchDevice_ = function() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch(e) {
        return false;
    }
};

/**
 * @private
 * @desc Apply workaround to enable scrolling of overflowing content within an
 * element. Adapted from https://gist.github.com/chrismbarr/4107472
 */
ol.Overlay.Popup.enableTouchScroll_ = function(elm) {
    if(ol.Overlay.Popup.isTouchDevice_()){
        var scrollStartPos = 0;
        elm.addEventListener("touchstart", function(event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
        }, false);
        elm.addEventListener("touchmove", function(event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
        }, false);
    }
};

/**
 * Hide the popup.
 */
ol.Overlay.Popup.prototype.hide = function() {
    this.container.style.display = 'none';
    return this;
};


/**
 * Indicates if the popup is in open state
 */
ol.Overlay.Popup.prototype.isOpened = function() {
    return this.container.style.display == 'block';
};
