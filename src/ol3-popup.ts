/**
 * OpenLayers 3 Popup Overlay.
 * See [the examples](./examples) for usage. Styling can be done via CSS.
 * @constructor
 * @extends {ol.Overlay}
 * @param {Object} opt_options Overlay options, extends olx.OverlayOptions adding:
 *                              **`panMapIfOutOfView`** `Boolean` - Should the
 *                              map be panned so that the popup is entirely
 *                              within view.
 */
import ol = require("openlayers");
import Paging = require("./paging/paging");
import PageNavigator = require("./paging/page-navigator");

export type SourceType = HTMLElement | string | JQueryDeferred<HTMLElement | string>;
export type SourceCallback = () => SourceType;

let classNames = {
    DETACH: 'detach'
};

function defaults<A, B>(a: A, ...b: B[]): A & B {
    b.forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
}

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

/**
 * The constructor options 'must' conform
 */
export interface IPopupOptions extends olx.OverlayOptions {
    insertFirst?: boolean;
    panMapIfOutOfView?: boolean;
    ani?: (args: any) => ol.PreRenderFunction;
    ani_opts?: olx.animation.PanOptions;
};

/**
 * Default options for the popup control so it can be created without any contructor arguments 
 */
const DEFAULT_OPTIONS: IPopupOptions = {
    insertFirst: true,
    panMapIfOutOfView: true,
    ani: ol.animation.pan,
    ani_opts: {
        source: null,
        start: 0,
        duration: 250
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

        super({
            stopEvent: true,
            insertFirst: (false !== options.insertFirst ? true : options.insertFirst)
        });

        this.options = defaults({}, options, DEFAULT_OPTIONS);
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

        this.panIntoView = debounce(() => this._panIntoView(), 200);
    }

    dispatch(name: string) {
        this["dispatchEvent"](new Event(name));
    }

    show(coord: ol.Coordinate, html: string) {
        this.setPosition(coord);

        this.content.innerHTML = html;
        this.domNode.classList.remove("hidden");

        this.panIntoView();
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

    // to be replaced with a debounced version
    panIntoView() {
        this._panIntoView();
    }

    private _panIntoView() {
        let coord = this.getPosition();
        if (!this.options.panMapIfOutOfView || this.isDetached()) {
            return;
        }

        let popSize = {
            width: this.getElement().clientWidth + 20,
            height: this.getElement().clientHeight + 20
        },
            [mapx, mapy] = this.getMap().getSize();

        let tailHeight = 20,
            tailOffsetLeft = 60,
            tailOffsetRight = popSize.width - tailOffsetLeft,
            popOffset = this.getOffset(),
            [popx, popy] = this.getMap().getPixelFromCoordinate(coord);

        let fromLeft = (popx - tailOffsetLeft),
            fromRight = mapx - (popx + tailOffsetRight);

        let fromTop = popy - popSize.height + popOffset[1],
            fromBottom = mapy - (popy + tailHeight) - popOffset[1];

        if (0 >= Math.max(fromLeft, fromRight, fromTop, fromBottom)) return;

        let center = this.getMap().getView().getCenter(),
            [x, y] = this.getMap().getPixelFromCoordinate(center);

        if (fromRight < 0) {
            x -= fromRight;
        } else if (fromLeft < 0) {
            x += fromLeft;
        }

        if (fromTop < 0) {
            y += fromTop;
        } else if (fromBottom < 0) {
            y -= fromBottom;
        }


        let ani = this.options.ani;
        let ani_opts = this.options.ani_opts;
        if (ani && ani_opts) {
            ani_opts.source = center;
            this.getMap().beforeRender(ani(ani_opts));
        }

        this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel([x, y]));

    }

}
