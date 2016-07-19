define(["require", "exports", "openlayers", "../src/ol3-popup", "jquery"], function (require, exports, ol, Popup, $) {
    "use strict";
    var sample_content = [
        'The story of the three little pigs...',
        'This little piggy went to market',
        'This little piggy stayed home',
        'This little piggy had roast beef',
        'This little piggy had none',
        'And this little piggy, <br/>this wee little piggy, <br/>when wee, wee, wee, wee <br/>all the way home!',
    ];
    var center = ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857');
    var mapContainer = document.getElementById("map");
    function run() {
        var map = new ol.Map({
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
        var popup = new Popup.Popup();
        map.addOverlay(popup);
        popup.on("show", function () { return console.log("show popup"); });
        popup.on("hide", function () { return console.log("hide popup"); });
        popup.pages.on("goto", function () { return console.log("goto page: " + popup.pages.activeIndex); });
        setTimeout(function () {
            popup.show(center, "<div>Click the map to see a popup</div>");
            var pages = 0;
            console.log("adding 5 pages");
            var h = setInterval(function () {
                if (++pages === 5) {
                    console.log("detaching from map (docking)");
                    clearInterval(h);
                    var attach_1 = popup.detach();
                    var h2_1 = popup.on("hide", function () {
                        popup.unByKey(h2_1);
                        attach_1.off();
                    });
                    setTimeout(function () {
                        console.log("re-attaching to map (un-docking)");
                        attach_1.off();
                        console.log("adding a page with string and dom promise");
                        {
                            var d1_1 = $.Deferred();
                            popup.pages.add(d1_1);
                            setTimeout(function () { return d1_1.resolve('<p>This promise resolves to a string<p>'); }, 500);
                            var d2_1 = $.Deferred();
                            popup.pages.add(d2_1);
                            var div_1 = document.createElement("div");
                            div_1.innerHTML = '<p>This function promise resolves to a div element</p>';
                            setTimeout(function () { return d2_1.resolve(div_1); }, 100);
                        }
                        console.log("adding a page with a string callback");
                        popup.pages.add(function () { return '<p>This function returns a string</p>'; });
                        console.log("adding a page with a dom callback");
                        popup.pages.add(function () {
                            var div = document.createElement("div");
                            div.innerHTML = '<p>This function returns a div element</p>';
                            return div;
                        });
                        console.log("adding a page with a string-promise");
                        popup.pages.add(function () {
                            var d = $.Deferred();
                            d.resolve('<p>This function promise resolves to a string</p>');
                            return d;
                        });
                        console.log("adding a page with a dom-promise");
                        var version = 1;
                        popup.pages.add(function () {
                            var d = $.Deferred();
                            var div = document.createElement("div");
                            var markup = "<p>This function promise resolves to a div element</p><p>Version: " + version++ + "</p>";
                            setInterval(function () { return div.innerHTML = markup + "<p>Timestamp: " + new Date().toISOString() + "<p/>"; }, 100);
                            setTimeout(function () { return d.resolve(div); }, 1000);
                            return d;
                        });
                        popup.pages.goto(popup.pages.count - 1);
                    }, 1000);
                }
                var div = document.createElement("div");
                div.innerHTML = "PAGE " + pages + "<br/>" + sample_content[pages % sample_content.length];
                popup.pages.add(div);
                popup.pages.goto(0);
            }, 200);
        }, 500);
        var selector = new Popup.FeatureSelector({
            map: map,
            popup: popup,
            title: "Alt+Click creates markers",
        });
        new Popup.FeatureCreator({
            map: map
        });
    }
    exports.run = run;
});
