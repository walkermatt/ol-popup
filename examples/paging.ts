import ol = require("openlayers");
import Popup = require("../src/amd-popup");

export function run() {
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

    let popup = new Popup.Popup();
    map.addOverlay(popup);

    let selector = new Popup.FeatureSelector({
        map: map,
        popup: popup
    });
    
    new Popup.FeatureCreator({ map: map });
    
}