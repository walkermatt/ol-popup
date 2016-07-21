define(["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
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
                event = event["mapBrowserEvent"] || event;
                var coord = event.coordinate;
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
    return FeatureCreator;
});
