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
        source: any;
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
    position?: [number, number];
};

/**
 * Default options for the popup control so it can be created without any contructor arguments
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    // determines if this should be the first (or last) element in its container
    insertFirst: true,
    autoPan: true,
    autoPanAnimation: {
        source: null,
        duration: 250
    },
    positioning: "top-right", // ol.OverlayPositioning.TOP_RIGHT
    stopEvent: true
}

/**
 * This is the contract that will not break between versions
 */
export interface IPopup_2_0_4<T> {
    show(position: ol.Coordinate, markup: string): T;
    hide(): T;
}

export interface IPopup extends IPopup_2_0_4<Popup> { 
}
    
/**
 * The control formerly known as ol.Overlay.Popup 
 */
export class Popup extends ol.Overlay implements IPopup {
    options: IPopupOptions;
    content: HTMLDivElement;
    domNode: HTMLDivElement;
    closer: HTMLButtonElement;
    pages: Paging;

    constructor(options = DEFAULT_OPTIONS) {

        options = defaults({}, options, DEFAULT_OPTIONS);
        /**
         * overlays have a map, element, offset, position, positioning
         */
        super(options);
        this.options = options;

        // the internal properties, dom and listeners are in place, time to create the popup
        this.postCreate();
    }


    private postCreate() {

        let options = this.options;

        let domNode = this.domNode = document.createElement('div');
        domNode.className = classNames.olPopup;
        this.setElement(domNode);

        {
            let closer = this.closer = document.createElement('button');
            closer.className = classNames.olPopupCloser;
            domNode.appendChild(closer);

            closer.addEventListener('click', evt => {
                this.hide();
                evt.preventDefault();
            }, false);
        }

        {
            let content = this.content = document.createElement('div');
            content.className = classNames.olPopupContent;
            this.domNode.appendChild(content);
            // Apply workaround to enable scrolling of content div on touch devices
            isTouchDevice() && enableTouchScroll(content);
        }

        {
            let pages = this.pages = new Paging({ popup: this });
            let pageNavigator = new PageNavigator({ pages: pages });
            pageNavigator.hide();
            pageNavigator.on("prev", () => pages.prev());
            pageNavigator.on("next", () => pages.next());
        }

        {
            let callback = this.setPosition;
            this.setPosition = debounce(args => callback.apply(this, args), 50);
        }

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

        this.dispatch(eventNames.show);

      return this;
    }

    hide() {
        this.setPosition(undefined);
        this.pages.clear();
        this.dispatch(eventNames.hide);
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
