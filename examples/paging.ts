import ol = require("openlayers");
import Popup = require("../src/ol3-popup");
import Symbolizer = require("../src/ol3-symbolizer");

const sample_content = [
'This little piggy went to market',    
'This little piggy stayed home',    
'This little piggy had roast beef',    
'This little piggy had none',    
'And this little piggy, this wee little piggy, when wee, wee, wee, wee all the way home!',
];

let symbolizer = new Symbolizer.Symbolizer();

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
                setTimeout(() => attach.off(), 5000);
            }
            let div = document.createElement("div");
            div.innerHTML = `PAGE ${pages}<br/>${sample_content[pages % sample_content.length]}`;
            popup.pages.add(div);
            popup.pages.goto(0);
        }, 500);
    }, 500);

    let selector = new Popup.FeatureSelector({
        map: map,
        popup: popup,
        title: "Alt+Click creates markers",
    });

    new Popup.FeatureCreator({
        map: map,
        symbolizer: symbolizer
    });

}