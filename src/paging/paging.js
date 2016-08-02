define(["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getInteriorPoint(geom) {
        if (geom["getInteriorPoint"])
            return geom["getInteriorPoint"]().getCoordinates();
        return ol.extent.getCenter(geom.getExtent());
    }
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
                return this._activeIndex;
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
        Paging.prototype.add = function (source, geom) {
            if (false) {
            }
            else if (typeof source === "string") {
                var page = document.createElement("div");
                page.innerHTML = source;
                this._pages.push({
                    element: page.firstChild,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else if (source["appendChild"]) {
                var page = source;
                page.classList.add("page");
                this._pages.push({
                    element: page,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else if (source["then"]) {
                var d = source;
                var page_1 = document.createElement("div");
                page_1.classList.add("page");
                this._pages.push({
                    element: page_1,
                    location: geom && getInteriorPoint(geom)
                });
                $.when(d).then(function (v) {
                    if (typeof v === "string") {
                        page_1.innerHTML = v;
                    }
                    else {
                        page_1.appendChild(v);
                    }
                });
            }
            else if (typeof source === "function") {
                // response can be a DOM, string or promise            
                var page = document.createElement("div");
                page.classList.add("page");
                this._pages.push({
                    callback: source,
                    element: page,
                    location: geom && getInteriorPoint(geom)
                });
            }
            else {
                throw "invalid source value: " + source;
            }
            this.dispatch("add");
        };
        Paging.prototype.clear = function () {
            var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            this._activeIndex = -1;
            this._pages = [];
            if (activeChild) {
                this.domNode.removeChild(activeChild.element);
                this.dispatch("clear");
            }
        };
        Paging.prototype.goto = function (index) {
            var page = this._pages[index];
            if (page) {
                var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
                if (activeChild) {
                    this.domNode.removeChild(activeChild.element);
                }
                if (page.callback) {
                    var refreshedContent = page.callback();
                    $.when(refreshedContent).then(function (v) {
                        if (false) {
                        }
                        else if (typeof v === "string") {
                            page.element.innerHTML = v;
                        }
                        else if (typeof v["innerHTML"] !== "undefined") {
                            page.element.innerHTML = "";
                            page.element.appendChild(v);
                        }
                        else {
                            throw "invalid callback result: " + v;
                        }
                    });
                }
                this.domNode.appendChild(page.element);
                this._activeIndex = index;
                if (page.location) {
                    this.options.popup.setPosition(page.location);
                }
                this.dispatch("goto");
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
});
