import ol = require("openlayers");
import { Popup } from "../ol3-popup";

/**
 * Interaction which opens the popup when zero or more features are clicked
 */
class FeatureSelector {

    constructor(public options: {
        map: ol.Map;
        popup: Popup;
        title: string;
    }) {

        let map = options.map;

        map.on("click", event => {
            console.log("click");
            let popup = options.popup;
            let coord = event.coordinate;
            popup.hide();
            popup.show(coord, `<label>${this.options.title}</label>`);

            let pageNum = 1;
            map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                let page = document.createElement('p');
                page.innerHTML = `Page ${pageNum++} ${feature.getGeometryName()}`;
                popup.pages.add(page, feature.getGeometry());
            });

            popup.pages.goto(0);
        });

    }
}

export = FeatureSelector;