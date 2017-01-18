/**
 * Used for testing, will create features when Alt+Clicking the map
 */
class FeatureCreator {

    constructor(public options: {
        map: ol.Map;
    }) {

        let map = options.map;

        let vectorSource = new ol.source.Vector({
            features: []
        });

        let vectorLayer = new ol.layer.Vector({
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

        let select = new ol.interaction.Select({
            condition: (event: ol.MapBrowserEvent) =>
                ol.events.condition.click(event) && ol.events.condition.altKeyOnly(event)
        });

        map.addInteraction(select);
        map.addLayer(vectorLayer);

        select.on("select", event => {
            let coord = event.mapBrowserEvent.coordinate;
            let geom = new ol.geom.Point(coord);
            let feature = new ol.Feature({
                geometry: geom,
                name: "New Feature",
                attributes: {}
            });
            vectorSource.addFeature(feature);
        });

    }
}

export = FeatureCreator;