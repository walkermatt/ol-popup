define(["require", "exports", "openlayers", "../src/ol3-popup"], function (require, exports, ol, Popup) {
    "use strict";
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    var mapContainer = document.getElementById("map");
    function run() {
        var map = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: center,
                zoom: 6
            })
        });
        var popup = new Popup.Popup();
        map.addOverlay(popup);
        popup.on("show", function () { return console.log("show popup"); });
        popup.on("hide", function () { return console.log("hide popup"); });
        popup.pages.on("goto", function () { return console.log("goto page: " + popup.pages.activeIndex); });
        setTimeout(function () {
            popup.show(center, "<div>Click the map to see a popup</div>");
            var pages = 0;
            var h = setInterval(function () {
                if (++pages === 5) {
                    clearInterval(h);
                    var attach_1 = popup.detach();
                    var h2_1 = popup.on("hide", function () {
                        popup.unByKey(h2_1);
                        attach_1.off();
                    });
                }
                var div = document.createElement("div");
                div.innerHTML = "PAGE " + pages;
                popup.pages.add(div);
                popup.pages.goto(0);
            }, 500);
        }, 500);
        var selector = new Popup.FeatureSelector({
            map: map,
            popup: popup,
            title: "Alt+Click creates markers",
        });
        new Popup.FeatureCreator({ map: map });
    }
    exports.run = run;
});
