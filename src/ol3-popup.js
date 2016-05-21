var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "openlayers"], function (require, exports, ol) {
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
    /**
     * Used for testing, will create features when Alt+Clicking the map
     */
    var FeatureCreator = (function () {
        function FeatureCreator(options) {
            this.options = options;
            var map = options.map;
            var vectorSource = new ol.source.Vector({
                features: []
            });
            var vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });
            var select = new ol.interaction.Select({
                condition: function (event) {
                    return ol.events.condition.click(event) && ol.events.condition.altKeyOnly(event);
                }
            });
            map.addInteraction(select);
            map.addLayer(vectorLayer);
            select.on("select", function (event) {
                var coord = event.mapBrowserEvent.coordinate;
                var geom = new ol.geom.Point(coord);
                var feature = new ol.Feature({
                    geometry: geom,
                    name: "New Feature",
                    attributes: {}
                });
                vectorSource.addFeature(feature);
            });
        }
        return FeatureCreator;
    }());
    exports.FeatureCreator = FeatureCreator;
    /**
     * Interaction which opens the popup when zero or more features are clicked
     */
    var FeatureSelector = (function () {
        function FeatureSelector(options) {
            var _this = this;
            this.options = options;
            var map = options.map;
            map.on("click", function (event) {
                console.log("click");
                var popup = options.popup;
                var coord = event.coordinate;
                popup.hide();
                popup.show(coord, "<label>" + _this.options.title + "</label>");
                var pageNum = 1;
                map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                    var page = document.createElement('p');
                    page.innerHTML = "Page " + pageNum++ + " " + feature.getGeometryName();
                    popup.pages.add(page);
                });
                popup.pages.goto(0);
            });
        }
        return FeatureSelector;
    }());
    exports.FeatureSelector = FeatureSelector;
    /**
     * The prior + next paging buttons and current page indicator
     */
    var PageNavigator = (function () {
        function PageNavigator(options) {
            var _this = this;
            this.options = options;
            var pages = options.pages;
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pagination");
            this.domNode.innerHTML = this.template();
            this.prevButton = this.domNode.getElementsByClassName("btn-prev")[0];
            this.nextButton = this.domNode.getElementsByClassName("btn-next")[0];
            this.pageInfo = this.domNode.getElementsByClassName("page-num")[0];
            pages.options.popup.domNode.appendChild(this.domNode);
            this.prevButton.addEventListener('click', function () { return _this.dispatch('prev'); });
            this.nextButton.addEventListener('click', function () { return _this.dispatch('next'); });
            pages.on("goto", function () { return pages.count > 1 ? _this.show() : _this.hide(); });
            pages.on("clear", function () { return _this.hide(); });
            pages.on("goto", function () {
                var index = pages.activeIndex;
                var count = pages.count;
                var canPrev = 0 < index;
                var canNext = count - 1 > index;
                _this.prevButton.classList.toggle("inactive", !canPrev);
                _this.prevButton.classList.toggle("active", canPrev);
                _this.nextButton.classList.toggle("inactive", !canNext);
                _this.nextButton.classList.toggle("active", canNext);
                _this.prevButton.disabled = !canPrev;
                _this.nextButton.disabled = !canNext;
                _this.pageInfo.innerHTML = (1 + index) + " of " + count;
            });
        }
        PageNavigator.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        PageNavigator.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        PageNavigator.prototype.template = function () {
            return "<button class=\"arrow btn-prev\"></button><span class=\"page-num\">m of n</span><button class=\"arrow btn-next\"></button>";
        };
        PageNavigator.prototype.hide = function () {
            this.domNode.classList.add("hidden");
            this.dispatch("hide");
        };
        PageNavigator.prototype.show = function () {
            this.domNode.classList.remove("hidden");
            this.dispatch("show");
        };
        return PageNavigator;
    }());
    exports.PageNavigator = PageNavigator;
    /**
     * Collection of "pages"
     */
    var Paging = (function () {
        function Paging(options) {
            this.options = options;
            this._pages = [];
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pages");
            options.popup.domNode.appendChild(this.domNode);
        }
        Object.defineProperty(Paging.prototype, "activeIndex", {
            get: function () {
                return this._pages.indexOf(this.activeChild);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paging.prototype, "count", {
            get: function () {
                return this._pages.length;
            },
            enumerable: true,
            configurable: true
        });
        Paging.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        Paging.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        Paging.prototype.add = function (page) {
            page.classList.add("page");
            this._pages.push(page);
            this.dispatch("add");
        };
        Paging.prototype.clear = function () {
            this._pages = [];
            if (this.activeChild) {
                this.domNode.removeChild(this.activeChild);
                this.activeChild = null;
                this.dispatch("clear");
            }
        };
        Paging.prototype.goto = function (index) {
            var page = this._pages[index];
            if (page) {
                if (this.activeChild) {
                    this.domNode.removeChild(this.activeChild);
                }
                this.domNode.appendChild(page);
                this.activeChild = page;
                this.dispatch("goto");
                this.options.popup.panIntoView();
            }
        };
        Paging.prototype.next = function () {
            (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
        };
        Paging.prototype.prev = function () {
            (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
        };
        return Paging;
    }());
    exports.Paging = Paging;
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
