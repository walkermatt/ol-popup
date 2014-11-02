ol.Overlay.Popup = function(opt_options) {

    var options = opt_options || {};

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
        this.ani_opts = {'duration': 250};
    }

    this.container = document.createElement('div');
    this.container.className = 'ol-popup';

    this.closer = document.createElement('a');
    this.closer.className = 'ol-popup-closer';
    this.closer.href = '#';
    this.container.appendChild(this.closer);

    var that = this;
    this.closer.addEventListener('click', function(evt) {
        that.container.style.display = 'none';
        that.closer.blur();
        evt.preventDefault();
    }, false);

    this.content = document.createElement('div');
    this.content.className = 'ol-popup-content';
    this.container.appendChild(this.content);

    ol.Overlay.call(this, {
        element: this.container,
        stopEvent: true
    });

};

ol.inherits(ol.Overlay.Popup, ol.Overlay);

ol.Overlay.Popup.prototype.show = function(coord, html) {
    this.setPosition(coord);
    this.content.innerHTML = html;
    this.container.style.display = 'block';
    if (this.panMapIfOutOfView) {
        this.panIntoView(coord);
    }
    return this;
};

ol.Overlay.Popup.prototype.panIntoView = function(coord) {

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
        px = this.getMap().getPixelFromCoordinate(center);

    if (fromRight < 0) {
        px[0] -= fromRight;
    } else if (fromLeft < 0) {
        px[0] += fromLeft;
    }

    if (fromTop < 0) {
        px[1] += fromTop;
    } else if (fromBottom < 0) {
        px[1] -= fromBottom;
    }

    if (this.ani && this.ani_opts) {
        this.ani_opts.source = center;
        this.getMap().beforeRender(this.ani(this.ani_opts));
    }
    this.getMap().getView().setCenter(this.getMap().getCoordinateFromPixel(px));

    return this.getMap().getView().getCenter();

};

ol.Overlay.Popup.prototype.hide = function() {
    this.container.style.display = 'none';
    return this;
};
