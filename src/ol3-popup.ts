/**
 * OpenLayers 3 Popup Overlay.
 */
import ol = require("openlayers");
import { Paging } from "./paging/paging";
import PageNavigator = require("./paging/page-navigator");

let classNames = {
    DETACH: 'detach',
    olPopup: 'ol-popup',
    olPopupCloser: 'ol-popup-closer',
    olPopupContent: 'ol-popup-content'
};

const eventNames = {
    show: "show",
    hide: "hide",
    next: "next-page"
};

/**
 * extends the base object without replacing defined attributes
 */
function defaults<A, B>(a: A, ...b: B[]): A & B {
    b.forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
}

/**
 * debounce: wait until it hasn't been called for a while before executing the callback
 */
function debounce<T extends Function>(func: T, wait = 20, immediate = false): T {
    let timeout;
    return <T><any>((...args: any[]) => {
        let later = () => {
            timeout = null;
            if (!immediate) func.call(this, args);
        },
            callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.call(this, args);
    });
}

let isTouchDevice = () => {
    try {
        document.createEvent("TouchEvent");
        isTouchDevice = () => true;
    } catch (e) {
        isTouchDevice = () => false;
    }
    return isTouchDevice();
};

/**
 * Apply workaround to enable scrolling of overflowing content within an
 * element. Adapted from https://gist.github.com/chrismbarr/4107472
 */
function enableTouchScroll(elm: HTMLElement) {
    var scrollStartPos = 0;
    elm.addEventListener("touchstart", function (event) {
        scrollStartPos = this.scrollTop + event.touches[0].pageY;
    }, false);
    elm.addEventListener("touchmove", function (event) {
        this.scrollTop = scrollStartPos - event.touches[0].pageY;
    }, false);
}

function getInteriorPoint(geom: ol.geom.Geometry) {
    if (geom["getInteriorPoint"]) return (<ol.geom.Point>geom["getInteriorPoint"]()).getCoordinates();
    return ol.extent.getCenter(geom.getExtent());
}

/**
 * The constructor options 'must' conform
 */
export interface IPopupOptions extends olx.OverlayOptions {
};

/**
 * Default options for the popup control so it can be created without any contructor arguments 
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    stopEvent: true,
    insertFirst: true,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
        source: null
    }
}

/**
 * The control formerly known as ol.Overlay.Popup 
 */
export class Popup extends ol.Overlay {
    options: IPopupOptions;
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    closer: HTMLAnchorElement;
    pages: Paging;

    constructor(options = DEFAULT_OPTIONS) {

        options = defaults({}, options, DEFAULT_OPTIONS);
        super(options);
        this.options = options;
        this.postCreate();
    }

    private postCreate() {

        let options = this.options;

        let domNode = this.domNode = document.createElement('div');
        domNode.className = 'ol-popup';
        this.setElement(domNode);

        let closer = this.closer = document.createElement('a');
        closer.className = 'ol-popup-closer';
        closer.href = '#';
        domNode.appendChild(closer);

        closer.addEventListener('click', evt => {
            this.hide();
            closer.blur();
            evt.preventDefault();
        }, false);

        let content = this.content = document.createElement('div');
        content.className = 'ol-popup-content';
        this.domNode.appendChild(content);

        // Apply workaround to enable scrolling of content div on touch devices
        isTouchDevice() && enableTouchScroll(content);

        let pages = this.pages = new Paging({ popup: this });
        let pageNavigator = new PageNavigator({ pages: pages });
        pageNavigator.hide();
        pageNavigator.on("prev", () => pages.prev());
        pageNavigator.on("next", () => pages.next());
    }

    dispatch(name: string) {
        this["dispatchEvent"](new Event(name));
    }

    show(coord: ol.Coordinate, html: string | HTMLElement) {

        if (html instanceof HTMLElement) {
            this.content.innerHTML = "";
            this.content.appendChild(html);
        } else {
            this.content.innerHTML = html;
        }
        this.domNode.classList.remove("hidden");

        this.setPosition(coord);

        this.content.scrollTop = 0;

        this.dispatch("show");
        return this;
    }

    hide() {
        this.domNode.classList.add("hidden");
        this.pages.clear();
        this.dispatch("hide");
        return this;
    }

    isOpened() {
        return this.domNode.classList.contains("hidden");
    }

    detach() {
        let mapContainer = <HTMLElement>this.getMap().get("target");
        let parent = this.domNode.parentElement;
        mapContainer.parentNode.insertBefore(this.domNode, mapContainer.nextElementSibling);
        this.domNode.classList.add(classNames.DETACH);
        return {
            off: () => {
                this.domNode.classList.remove(classNames.DETACH);
                parent.appendChild(this.domNode);
            }
        };

    }

    private isDetached() {
        return this.domNode.classList.contains(classNames.DETACH);
    }

}
