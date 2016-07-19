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

function getInteriorPoint(geom: ol.geom.Geometry) {
    if (geom["getInteriorPoint"]) return (<ol.geom.Point>geom["getInteriorPoint"]()).getCoordinates();
    return ol.extent.getCenter(geom.getExtent());
}

/**
 * Used for testing, will create features when Alt+Clicking the map
 */
export class FeatureCreator {

    constructor(public options: {
        map: ol.Map;
    }) {

        let map = options.map;

        let vectorSource = new ol.source.Vector({
            features: []
        });

        let vectorLayer = new ol.layer.Vector({
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

        let select = new ol.interaction.Select({
            condition: (event: ol.MapBrowserEvent) =>
                ol.events.condition.click(event) && ol.events.condition.altKeyOnly(event)
        });

        map.addInteraction(select);
        map.addLayer(vectorLayer);

        select.on("select", event => {
            let coord = event.mapBrowserEvent.coordinate;
            let geom = new ol.geom.Point(coord);
            let feature = new ol.Feature({
                geometry: geom,
                name: "New Feature",
                attributes: {}
            });
            vectorSource.addFeature(feature);
        });

    }
}

/**
 * Interaction which opens the popup when zero or more features are clicked
 */
export class FeatureSelector {

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

/**
 * The prior + next paging buttons and current page indicator
 */
export class PageNavigator {

    private domNode: HTMLElement;
    prevButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    pageInfo: HTMLSpanElement;

    constructor(public options: { pages: Paging }) {

        let pages = options.pages;

        this.domNode = document.createElement("div");
        this.domNode.classList.add("pagination");
        this.domNode.innerHTML = this.template();

        this.prevButton = <HTMLButtonElement>this.domNode.getElementsByClassName("btn-prev")[0];
        this.nextButton = <HTMLButtonElement>this.domNode.getElementsByClassName("btn-next")[0];
        this.pageInfo = <HTMLSpanElement>this.domNode.getElementsByClassName("page-num")[0];

        pages.options.popup.domNode.appendChild(this.domNode);
        this.prevButton.addEventListener('click', () => this.dispatch('prev'));
        this.nextButton.addEventListener('click', () => this.dispatch('next'));

        pages.on("goto", () => pages.count > 1 ? this.show() : this.hide());
        pages.on("clear", () => this.hide());

        pages.on("goto", () => {
            let index = pages.activeIndex;
            let count = pages.count;
            let canPrev = 0 < index;
            let canNext = count - 1 > index;
            this.prevButton.classList.toggle("inactive", !canPrev);
            this.prevButton.classList.toggle("active", canPrev);
            this.nextButton.classList.toggle("inactive", !canNext);
            this.nextButton.classList.toggle("active", canNext);
            this.prevButton.disabled = !canPrev;
            this.nextButton.disabled = !canNext;
            this.pageInfo.innerHTML = `${1 + index} of ${count}`;
        });
    }

    dispatch(name: string) {
        this.domNode.dispatchEvent(new Event(name));
    }

    on(name: string, listener: EventListener) {
        this.domNode.addEventListener(name, listener);
    }

    template() {
        return `<button class="arrow btn-prev"></button><span class="page-num">m of n</span><button class="arrow btn-next"></button>`;
    }

    hide() {
        this.domNode.classList.add("hidden");
        this.dispatch("hide");
    }

    show() {
        this.domNode.classList.remove("hidden");
        this.dispatch("show");
    }
}

/**
 * Collection of "pages"
 */
export class Paging {

    private _pages: Array<{
        element: HTMLElement;
        location: ol.Coordinate;
    }>;

    private _activeIndex: number;
    domNode: HTMLDivElement;

    constructor(public options: { popup: Popup }) {
        this._pages = [];
        this.domNode = document.createElement("div");
        this.domNode.classList.add("pages");
        options.popup.domNode.appendChild(this.domNode);
    }

    get activeIndex() {
        return this._activeIndex;
    }

    get count() {
        return this._pages.length;
    }

    dispatch(name: string) {
        this.domNode.dispatchEvent(new Event(name));
    }

    on(name: string, listener: EventListener) {
        this.domNode.addEventListener(name, listener);
    }

    add(page: HTMLElement, geom?: ol.geom.Geometry) {
        page.classList.add("page");
        this._pages.push({
            element: page,
            location: geom && getInteriorPoint(geom)
        });
        this.dispatch("add");
    }

    clear() {
        let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
        this._activeIndex = -1;
        this._pages = [];
        if (activeChild) {
            this.domNode.removeChild(activeChild.element);
            this.dispatch("clear");
        }
    }

    goto(index: number) {
        let page = this._pages[index];
        if (page) {
            let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            if (activeChild) {
                this.domNode.removeChild(activeChild.element);
            }
            this.domNode.appendChild(page.element);
            this._activeIndex = index;
            if (page.location) {
                this.options.popup.setPosition(page.location);
                this.options.popup.panIntoView();
            }
            this.dispatch("goto");
        }
    }

    next() {
        (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
    }

    prev() {
        (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
    }
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
