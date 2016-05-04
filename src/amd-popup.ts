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

class PageNavigator {

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

        pages.options.popup.container.appendChild(this.domNode);
        this.prevButton.addEventListener('click', () => this.dispatch('prev'));
        this.nextButton.addEventListener('click', () => this.dispatch('next'));

        pages.on("goto", () => this.show());
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
    }

    show() {
        this.domNode.classList.remove("hidden");
    }
}

class Paging {

    private _pages: Array<HTMLElement>;
    private activeChild: HTMLElement;
    domNode: HTMLDivElement;

    constructor(public options: { popup: Popup }) {
        this._pages = [];
        this.domNode = document.createElement("div");
        this.domNode.classList.add("pages");
        options.popup.container.appendChild(this.domNode);
    }

    get activeIndex() {
        return this._pages.indexOf(this.activeChild);
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

    add(page: HTMLElement) {
        page.classList.add("page");
        this._pages.push(page);
        this.dispatch("add");
    }

    clear() {
        this._pages = [];
        if (this.activeChild) {
            this.domNode.removeChild(this.activeChild);
            this.activeChild = null;
            this.dispatch("clear");
        }
    }

    goto(index: number) {
        let page = this._pages[index];
        if (page) {
            if (this.activeChild) {
                this.domNode.removeChild(this.activeChild);
            }
            this.domNode.appendChild(page);
            this.activeChild = page;
            this.dispatch("goto");
        }
    }

    next() {
        if (this.activeChild) {
            let activeIndex = this._pages.indexOf(this.activeChild);
            if (0 <= activeIndex) {
                this.goto(activeIndex + 1);
            }
        }
    }

    prev() {
        if (this.activeChild) {
            let activeIndex = this._pages.indexOf(this.activeChild);
            if (0 <= activeIndex) {
                this.goto(activeIndex - 1);
            }
        }
    }
}

interface IOptions extends olx.OverlayOptions {
    insertFirst?: boolean;
    panMapIfOutOfView?: boolean;
    ani?: any;
    ani_opts?: any;
};

const DEFAULTS: IOptions = {
    panMapIfOutOfView: true,
    ani: ol.animation.pan,
    ani_opts: { duration: 250 }
}

class Popup extends ol.Overlay {

    panMapIfOutOfView: boolean;
    ani: any;
    ani_opts: any;
    content: HTMLDivElement;
    container: HTMLDivElement;
    closer: HTMLAnchorElement;
    pages: Paging;

    // hack to eliminate warnings due to calling super in the wrong sequence    
    private pre(options: IOptions) {
        this.panMapIfOutOfView = options.panMapIfOutOfView;
        if (this.panMapIfOutOfView === undefined) {
            this.panMapIfOutOfView = true;
        }

        this.ani = options.ani;
        if (this.ani === undefined) {
            this.ani = ol.animation.pan;
        }

        this.ani_opts = options.ani_opts;
        if (this.ani_opts === undefined) {
            this.ani_opts = { 'duration': 250 };
        }

        this.container = document.createElement('div');
        this.container.className = 'ol-popup';

        this.closer = document.createElement('a');
        this.closer.className = 'ol-popup-closer';
        this.closer.href = '#';
        this.container.appendChild(this.closer);

        this.closer.addEventListener('click', evt => {
            this.hide();
            this.closer.blur();
            evt.preventDefault();
        }, false);

        this.content = document.createElement('div');
        this.content.className = 'ol-popup-content';
        this.container.appendChild(this.content);

        // Apply workaround to enable scrolling of content div on touch devices
        Popup.enableTouchScroll_(this.content);

        return options;
    }

    private post() {
        let pages = this.pages = new Paging({ popup: this });
        let pageNavigator = new PageNavigator({ pages: pages });
        pageNavigator.hide();
        pageNavigator.on("prev", () => pages.prev());
        pageNavigator.on("next", () => pages.next());
    }

    constructor(opt_options: IOptions = DEFAULTS) {

        // awkward ol3 construction not meant to be called first so suffer the warnings
        let options = this.pre(opt_options);

        super({
            element: this.container,
            stopEvent: true,
            insertFirst: (false !== options.insertFirst ? true : options.insertFirst)
        });

        this.post();
    }

    /**
     * Show the popup.
     * @param {ol.Coordinate} coord Where to anchor the popup.
     * @param {String} html String of HTML to display within the popup.
     */
    show(coord, html) {
        this.setPosition(coord);
        this.content.innerHTML = html;
        this.container.style.display = 'block';
        if (this.panMapIfOutOfView) {
            this.panIntoView_(coord);
        }
        this.content.scrollTop = 0;
        return this;
    }

    /**
     * @private
     */
    private panIntoView_(coord) {

        var popSize = {
            width: this.getElement().clientWidth + 20,
            height: this.getElement().clientHeight + 20
        },
            mapSize = this.getMap().getSize();

        var tailHeight = 20,
            tailOffsetLeft = 60,
            tailOffsetRight = popSize.width - tailOffsetLeft,
            popOffset = this.getOffset(),
            popPx = this.getMap().getPixelFromCoordinate(coord);

        var fromLeft = (popPx[0] - tailOffsetLeft),
            fromRight = mapSize[0] - (popPx[0] + tailOffsetRight);

        var fromTop = popPx[1] - popSize.height + popOffset[1],
            fromBottom = mapSize[1] - (popPx[1] + tailHeight) - popOffset[1];

        var center = this.getMap().getView().getCenter(),
            curPx = this.getMap().getPixelFromCoordinate(center),
            newPx = curPx.slice();

        if (fromRight < 0) {
            newPx[0] -= fromRight;
        } else if (fromLeft < 0) {
            newPx[0] += fromLeft;
        }

        if (fromTop < 0) {
            newPx[1] += fromTop;
        } else if (fromBottom < 0) {
            newPx[1] -= fromBottom;
        }

        if (this.ani && this.ani_opts) {
            this.ani_opts.source = center;
            this.getMap().beforeRender(this.ani(this.ani_opts));
        }

        if (newPx[0] !== curPx[0] || newPx[1] !== curPx[1]) {
            this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel(newPx));
        }

        return this.getMap().getView().getCenter();

    }

    /**
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     */
    private static isTouchDevice_() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @private
     * @desc Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     */
    private static enableTouchScroll_(elm) {
        if (Popup.isTouchDevice_()) {
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function (event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function (event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }

    /**
     * Hide the popup.
     */
    hide() {
        this.container.style.display = 'none';
        this.pages.clear();
        return this;
    }
}

export = Popup;