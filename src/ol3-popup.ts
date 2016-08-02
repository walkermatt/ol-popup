/**
 * OpenLayers 3 Popup Overlay.
 */
import ol = require("openlayers");
import {Paging} from "./paging/paging";
import PageNavigator = require("./paging/page-navigator");

let classNames = {
    DETACH: 'detach'
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
        };
        let callNow = immediate && !timeout;

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

/**
 * The constructor options 'must' conform, most interesting is autoPan
 */
export interface IPopupOptions extends olx.OverlayOptions {
    // calls panIntoView when position changes
    autoPan?: boolean;
    // when panning into view, passed to the pan animation to track the 'center'
    autoPanAnimation?: {
        // how long should the animation last?
        duration: number;
    };
    // virtually increases the control width & height by this amount when computing new center point
    autoPanMargin?: number;
    // determines if this should be the first (or last) element in its container
    insertFirst?: boolean;
    // determines which container to use, if true then event propagation is stopped meaning mousedown and touchstart events don't reach the map.
    stopEvent?: boolean;
    // the pixel offset when computing the rendered position
    offset?: number[];
    // one of (bottom|center|top)*(left|center|right), css positioning when updating the rendered position
    positioning?: string;
    // the point coordinate for this overlay
    position?: number[];
};

/**
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    // determines if this should be the first (or last) element in its container
    insertFirst: true,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    },
    positioning: "top-right", // ol.OverlayPositioning.TOP_RIGHT
    stopEvent: true
}

/**
 * The control formerly known as ol.Overlay.Popup 
 */
export class Popup extends ol.Overlay {
    panIntoView_: () => void;
    options: IPopupOptions;
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    closer: HTMLDivElement;
    pages: Paging;

    constructor(options = DEFAULT_OPTIONS) {

        /**
         * overlays have a map, element, offset, position, positioning
         */
        super(options);

        // options are captured within the overlay constructor so make them accessible from the outside        
        this.options = defaults({}, options, DEFAULT_OPTIONS);

        // the internal properties, dom and listeners are in place, time to create the popup
        this.postCreate();
    }


    private postCreate() {

        let options = this.options;

        let domNode = this.domNode = document.createElement('div');
        domNode.className = 'ol-popup';
        this.setElement(domNode);

        {
            let closer = this.closer = document.createElement('div');
            closer.className = 'ol-popup-closer';
            domNode.appendChild(closer);

            closer.addEventListener('click', evt => {
                this.hide();
                evt.preventDefault();
            }, false);
        }


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

        {
            let callback = this.panIntoView_;
            this.panIntoView_ = debounce(() => callback.apply(this), 50);
        }
    }

    dispatch(name: string) {
        this["dispatchEvent"](new Event(name));
    }


    show(coord: ol.Coordinate, html: string) {

        this.setPosition(coord);

        this.content.innerHTML = html;
        this.domNode.classList.remove("hidden");

        this.dispatch("show");
        return this;
    }

    hide() {
        this.domNode.classList.add("hidden");
        this.pages.clear();
        this.dispatch("hide");
        return this;
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
