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

    let popup = new Popup();
    map.addOverlay(popup);


    let pageCount = 3;

    var range = n => {
        var r = new Array(n);
        for (var i = 0; i < n; i++) r[i] = i;
        return r;
    };
    
    map.on('singleclick', function (evt) {
        let xy = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        var prettyCoord = ol.coordinate.toStringHDMS(xy);
        popup.hide();
        popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
        
        range(pageCount++ % 5).forEach(id => {
            let page = document.createElement('p');
            page.innerHTML = `Page ${id + 1}`;
            popup.pages.add(page);
        });
        popup.pages.goto(0);
    });
}