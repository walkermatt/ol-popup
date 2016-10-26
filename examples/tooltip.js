var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Image({
            source: new ol.source.ImageVector({
                source: new ol.source.Vector({
                    url: 'https://openlayers.org/en/v3.14.0/examples/data/geojson/countries.geojson',
                    format: new ol.format.GeoJSON()
                }),
                style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.6)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#319FD3',
                    width: 1
                })
            })
        })
    })
    ],
    view: new ol.View({
        center: [0, 0],
        zoom: 2
    })
});

var tooltip = new ol.Overlay.Popup({isTooltip: true});
map.addOverlay(tooltip);

var displayTooltip = function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
    });

    if (feature) {
        var tooltipContent = feature.get('name');
        tooltip.show(evt.coordinate, tooltipContent);
	} else {
		tooltip.hide();
	}	  
};

map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    displayTooltip(evt);
});
