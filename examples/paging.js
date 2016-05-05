define(["require", "exports", "openlayers", "../src/ol3-popup"], function (require, exports, ol, Popup) {
    "use strict";
    function run() {
        var map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857'),
                zoom: 6
            })
        });
        var popup = new Popup.Popup();
        map.addOverlay(popup);
        var selector = new Popup.FeatureSelector({
            map: map,
            popup: popup,
            title: "Alt+Click creates markers",
        });
        new Popup.FeatureCreator({ map: map });
    }
    exports.run = run;
});
