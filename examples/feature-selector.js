define(["require", "exports"], function (require, exports) {
    "use strict";
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
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.pages.goto(0);
            });
        }
        return FeatureSelector;
    }());
    return FeatureSelector;
});
