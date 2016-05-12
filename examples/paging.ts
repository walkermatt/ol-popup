import ol = require("openlayers");
import Popup = require("../src/ol3-popup");

let center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');

let mapContainer = document.getElementById("map");

export function run() {
    let map = new ol.Map({
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

    let popup = new Popup.Popup();
    map.addOverlay(popup);
    popup.on("show", () => console.log(`show popup`));
    popup.on("hide", () => console.log(`hide popup`));
    popup.pages.on("goto", () => console.log(`goto page: ${popup.pages.activeIndex}`));

    setTimeout(() => { 
        popup.show(center, "<div>Click the map to see a popup</div>");
        let pages = 0;
        let h = setInterval(() => {
            if (++pages === 5) {
                clearInterval(h);
                let attach = popup.detach();
                let h2 = popup.on("hide", () => {
                    popup.unByKey(h2);
                    attach.off();
                });
            }
            let div = document.createElement("div");
            div.innerHTML = `PAGE ${pages}`;
            popup.pages.add(div);
            popup.pages.goto(0);
        }, 500);
    }, 500);
    
    let selector = new Popup.FeatureSelector({
        map: map,
        popup: popup,
        title: "Alt+Click creates markers",
    });
    
    new Popup.FeatureCreator({ map: map });

}