import { Paging } from "./paging";

const classNames = {
    prev: 'btn-prev',
    next: 'btn-next',
    hidden: 'hidden',
    active: 'active',
    inactive: 'inactive',
    pagenum: "page-num"
};

const eventNames = {
    show: "show",
    hide: "hide",
    prev: "prev",
    next: "next"
};


/**
 * The prior + next paging buttons and current page indicator
 */
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

        this.prevButton = <HTMLButtonElement>this.domNode.getElementsByClassName(classNames.prev)[0];
        this.nextButton = <HTMLButtonElement>this.domNode.getElementsByClassName(classNames.next)[0];
        this.pageInfo = <HTMLSpanElement>this.domNode.getElementsByClassName(classNames.pagenum)[0];

        pages.options.popup.domNode.appendChild(this.domNode);
        this.prevButton.addEventListener('click', () => this.dispatch(eventNames.prev));
        this.nextButton.addEventListener('click', () => this.dispatch(eventNames.next));

        pages.on("goto", () => pages.count > 1 ? this.show() : this.hide());
        pages.on("clear", () => this.hide());

        pages.on("goto", () => {
            let index = pages.activeIndex;
            let count = pages.count;
            let canPrev = 0 < index;
            let canNext = count - 1 > index;
            this.prevButton.classList.toggle(classNames.inactive, !canPrev);
            this.prevButton.classList.toggle(classNames.active, canPrev);
            this.nextButton.classList.toggle(classNames.inactive, !canNext);
            this.nextButton.classList.toggle(classNames.active, canNext);
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
        this.domNode.classList.add(classNames.hidden);
        this.dispatch(eventNames.hide);
    }

    show() {
        this.domNode.classList.remove(classNames.hidden);
        this.dispatch(eventNames.show);
    }
}

export = PageNavigator;