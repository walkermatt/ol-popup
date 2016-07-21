var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "openlayers", "./paging/paging", "./paging/page-navigator"], function (require, exports, ol, Paging, PageNavigator) {
    "use strict";
    var classNames = {
        DETACH: 'detach'
    };
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    function debounce(func, wait, immediate) {
        var _this = this;
        if (wait === void 0) { wait = 20; }
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.call(_this, args);
            }, callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(_this, args);
        });
    }
    var isTouchDevice = function () {
        try {
            document.createEvent("TouchEvent");
            isTouchDevice = function () { return true; };
        }
        catch (e) {
            isTouchDevice = function () { return false; };
        }
        return isTouchDevice();
    };
    /**
     * Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     */
    function enableTouchScroll(elm) {
        var scrollStartPos = 0;
        elm.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
        }, false);
        elm.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
        }, false);
    }
    ;
    /**
     * Default options for the popup control so it can be created without any contructor arguments
     */
    var DEFAULT_OPTIONS = {
        insertFirst: true,
        panMapIfOutOfView: true,
        ani: ol.animation.pan,
        ani_opts: {
            source: null,
            start: 0,
            duration: 250
        }
    };
    /**
     * The control formerly known as ol.Overlay.Popup
     */
    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup(options) {
            if (options === void 0) { options = DEFAULT_OPTIONS; }
            _super.call(this, {
                stopEvent: true,
                insertFirst: (false !== options.insertFirst ? true : options.insertFirst)
            });
            this.options = defaults({}, options, DEFAULT_OPTIONS);
            this.postCreate();
        }
        Popup.prototype.postCreate = function () {
            var _this = this;
            var options = this.options;
            var domNode = this.domNode = document.createElement('div');
            domNode.className = 'ol-popup';
            this.setElement(domNode);
            var closer = this.closer = document.createElement('a');
            closer.className = 'ol-popup-closer';
            closer.href = '#';
            domNode.appendChild(closer);
            closer.addEventListener('click', function (evt) {
                _this.hide();
                closer.blur();
                evt.preventDefault();
            }, false);
            var content = this.content = document.createElement('div');
            content.className = 'ol-popup-content';
            this.domNode.appendChild(content);
            // Apply workaround to enable scrolling of content div on touch devices
            isTouchDevice() && enableTouchScroll(content);
            var pages = this.pages = new Paging({ popup: this });
            var pageNavigator = new PageNavigator({ pages: pages });
            pageNavigator.hide();
            pageNavigator.on("prev", function () { return pages.prev(); });
            pageNavigator.on("next", function () { return pages.next(); });
            this.panIntoView = debounce(function () { return _this._panIntoView(); }, 200);
        };
        Popup.prototype.dispatch = function (name) {
            this["dispatchEvent"](new Event(name));
        };
        Popup.prototype.show = function (coord, html) {
            this.setPosition(coord);
            this.content.innerHTML = html;
            this.domNode.classList.remove("hidden");
            this.panIntoView();
            this.content.scrollTop = 0;
            this.dispatch("show");
            return this;
        };
        Popup.prototype.hide = function () {
            this.domNode.classList.add("hidden");
            this.pages.clear();
            this.dispatch("hide");
            return this;
        };
        Popup.prototype.detach = function () {
            var _this = this;
            var mapContainer = this.getMap().get("target");
            var parent = this.domNode.parentElement;
            mapContainer.parentNode.insertBefore(this.domNode, mapContainer.nextElementSibling);
            this.domNode.classList.add(classNames.DETACH);
            return {
                off: function () {
                    _this.domNode.classList.remove(classNames.DETACH);
                    parent.appendChild(_this.domNode);
                }
            };
        };
        Popup.prototype.isDetached = function () {
            return this.domNode.classList.contains(classNames.DETACH);
        };
        // to be replaced with a debounced version
        Popup.prototype.panIntoView = function () {
            this._panIntoView();
        };
        Popup.prototype._panIntoView = function () {
            var coord = this.getPosition();
            if (!this.options.panMapIfOutOfView || this.isDetached()) {
                return;
            }
            var popSize = {
                width: this.getElement().clientWidth + 20,
                height: this.getElement().clientHeight + 20
            }, _a = this.getMap().getSize(), mapx = _a[0], mapy = _a[1];
            var tailHeight = 20, tailOffsetLeft = 60, tailOffsetRight = popSize.width - tailOffsetLeft, popOffset = this.getOffset(), _b = this.getMap().getPixelFromCoordinate(coord), popx = _b[0], popy = _b[1];
            var fromLeft = (popx - tailOffsetLeft), fromRight = mapx - (popx + tailOffsetRight);
            var fromTop = popy - popSize.height + popOffset[1], fromBottom = mapy - (popy + tailHeight) - popOffset[1];
            if (0 >= Math.max(fromLeft, fromRight, fromTop, fromBottom))
                return;
            var center = this.getMap().getView().getCenter(), _c = this.getMap().getPixelFromCoordinate(center), x = _c[0], y = _c[1];
            if (fromRight < 0) {
                x -= fromRight;
            }
            else if (fromLeft < 0) {
                x += fromLeft;
            }
            if (fromTop < 0) {
                y += fromTop;
            }
            else if (fromBottom < 0) {
                y -= fromBottom;
            }
            var ani = this.options.ani;
            var ani_opts = this.options.ani_opts;
            if (ani && ani_opts) {
                ani_opts.source = center;
                this.getMap().beforeRender(ani(ani_opts));
            }
            this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel([x, y]));
        };
        return Popup;
    }(ol.Overlay));
    exports.Popup = Popup;
});
