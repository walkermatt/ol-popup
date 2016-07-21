define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * The prior + next paging buttons and current page indicator
     */
    var PageNavigator = (function () {
        function PageNavigator(options) {
            var _this = this;
            this.options = options;
            var pages = options.pages;
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pagination");
            this.domNode.innerHTML = this.template();
            this.prevButton = this.domNode.getElementsByClassName("btn-prev")[0];
            this.nextButton = this.domNode.getElementsByClassName("btn-next")[0];
            this.pageInfo = this.domNode.getElementsByClassName("page-num")[0];
            pages.options.popup.domNode.appendChild(this.domNode);
            this.prevButton.addEventListener('click', function () { return _this.dispatch('prev'); });
            this.nextButton.addEventListener('click', function () { return _this.dispatch('next'); });
            pages.on("goto", function () { return pages.count > 1 ? _this.show() : _this.hide(); });
            pages.on("clear", function () { return _this.hide(); });
            pages.on("goto", function () {
                var index = pages.activeIndex;
                var count = pages.count;
                var canPrev = 0 < index;
                var canNext = count - 1 > index;
                _this.prevButton.classList.toggle("inactive", !canPrev);
                _this.prevButton.classList.toggle("active", canPrev);
                _this.nextButton.classList.toggle("inactive", !canNext);
                _this.nextButton.classList.toggle("active", canNext);
                _this.prevButton.disabled = !canPrev;
                _this.nextButton.disabled = !canNext;
                _this.pageInfo.innerHTML = (1 + index) + " of " + count;
            });
        }
        PageNavigator.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        PageNavigator.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        PageNavigator.prototype.template = function () {
            return "<button class=\"arrow btn-prev\"></button><span class=\"page-num\">m of n</span><button class=\"arrow btn-next\"></button>";
        };
        PageNavigator.prototype.hide = function () {
            this.domNode.classList.add("hidden");
            this.dispatch("hide");
        };
        PageNavigator.prototype.show = function () {
            this.domNode.classList.remove("hidden");
            this.dispatch("show");
        };
        return PageNavigator;
    }());
    return PageNavigator;
});
