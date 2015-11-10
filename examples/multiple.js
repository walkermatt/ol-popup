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

map.on('singleclick', function(evt) {
    // Create a new popup instance each time the map is clicked, set the
    // ol.Overlay `insertFirst` option to false so that each new popup is
    // appended to the DOM and hence appears above any existing popups
    var popup = new ol.Overlay.Popup({insertFirst: false});
    map.addOverlay(popup);
    var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
    popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
});
