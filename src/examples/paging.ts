import ol = require("openlayers");
import Popup = require("../ol3-popup");
import FeatureCreator = require("../extras/feature-creator");
import FeatureSelector = require("../extras/feature-selector");

import $ = require("jquery");

const sample_content = [
    'The story of the three little pigs...',
    'This little piggy went to market',
    'This little piggy stayed home',
    'This little piggy had roast beef',
    'This little piggy had none',
    'And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!',
];

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

    let popup = new Popup.Popup({
        autoPan: true,
        autoPanMargin: 100,
        autoPanAnimation: {
            source: null,
            duration: 2000
        }
    });

    map.addOverlay(popup);
    popup.on("show", () => console.log(`show popup`));
    popup.on("hide", () => console.log(`hide popup`));
    popup.pages.on("goto", () => console.log(`goto page: ${popup.pages.activeIndex}`));

    [1, 2, 3].map(i => popup.pages.add(`Page ${i}`));
    popup.pages.goto(0);

    setTimeout(() => {
        popup.show(center, "<div>Click the map to see a popup</div>");
        let pages = 0;
        console.log("adding 5 pages");
        let h = setInterval(() => {
            if (++pages === 5) {
                console.log("detaching from map (docking)");
                clearInterval(h);
                let attach = popup.detach();
                let h2 = popup.on("hide", () => {
                    popup.unByKey(h2);
                    attach.off();
                });
                setTimeout(() => {
                    console.log("re-attaching to map (un-docking)");
                    attach.off();

                    console.log("adding a page with string and dom promise");
                    {
                        let d1 = $.Deferred();
                        popup.pages.add(d1);
                        setTimeout(() => d1.resolve('<p>This promise resolves to a string<p>'), 500);

                        let d2 = $.Deferred();
                        popup.pages.add(d2);
                        let div = document.createElement("div");
                        div.innerHTML = '<p>This function promise resolves to a div element</p>';
                        setTimeout(() => d2.resolve(div), 100);
                    }

                    console.log("adding a page with a string callback");
                    popup.pages.add(() => '<p>This function returns a string</p>');

                    console.log("adding a page with a dom callback");
                    popup.pages.add(() => {
                        let div = document.createElement("div");
                        div.innerHTML = '<p>This function returns a div element</p>';
                        return div;
                    });

                    console.log("adding a page with a string-promise");
                    popup.pages.add(() => {
                        let d = $.Deferred();
                        d.resolve('<p>This function promise resolves to a string</p>');
                        return d;
                    });

                    console.log("adding a page with a dom-promise");
                    {
                        let message = `
This function promise resolves to a div element.
<br/>
This page was resolved after 3 seconds.  
<br/>As the content of this page grows, 
<br/>you should notice that the PanIntoView is continually keeping the popup within view.
<br/>`;

                        popup.pages.add(() => {
                            let index = 0;
                            let d = $.Deferred();
                            let div = document.createElement("div");
                            let body = document.createElement("div");
                            body.appendChild(div);

                            setTimeout(() => d.resolve(body), 3000);

                            d.then(body => {
                                let h = setInterval(() => {
                                    div.innerHTML = `<p>${message.substr(0, ++index)}</p>`;
                                    popup.panIntoView();
                                    if (index >= message.length) clearInterval(h);
                                }, 100);
                            });

                            return d;
                        });
                    }

                }, 1000);
            }
            let div = document.createElement("div");
            div.innerHTML = `PAGE ${pages}<br/>${sample_content[pages % sample_content.length]}`;
            popup.pages.add(div);
        }, 200);
    }, 500);

    let selector = new FeatureSelector({
        map: map,
        popup: popup,
        title: "<b>Alt+Click</b> creates markers",
    });

    new FeatureCreator({
        map: map
    });

}