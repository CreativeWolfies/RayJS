"use strict";

class RayDisplay {
    constructor() {
        this.isInitialized = false;
        this.canvas = undefined;
        this.ctx = undefined;
        this.width = 0;
        this.height = 0;
        this.looping = false;
        this.draw = undefined;
        this.bAutoResize = false;
        this.penX = 0;
        this.penY = 0;
        this.filters = [];
        this.pathInitialized = false;
        Object.defineProperty(this, "autoResizeFn", {
            writable: false,
            configurable: false,
            enumerable: false,
            value: function() {
                this.canvas.width = this.width = window.innerWidth;
                this.canvas.height = this.height = window.innerHeight;
            }
        });
        RayDisplay.rayDisplays.push(this);
    }

    static getRayDisplays() {
        return RayDisplay.rayDisplays;
    }

    loopFn() {
        if (typeof this.draw === "function") {
            try {
                this.draw(); // have the elapsed time as argument?
            }
            catch (err) {
                this.looping = false;
                throw err;
            }
        }
        if (this.looping) {
            window.requestAnimationFrame(() => {
                this.loopFn();
            });
        }
    }

    init(fullscrn = true, id) {
        if (this.isInitialized) {
            throw new Error("RayJS Display already initialized.");
        }

        this.isInitialized = true;

        if (fullscrn) {
            this.canvas = document.createElement("canvas");
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");

            this.canvas.width = this.width = window.innerWidth;
            this.canvas.height = this.height = window.innerHeight;
            this.canvas.style.position = "absolute";
            this.canvas.style.top = "0px";
            this.canvas.style.left = "0px";
            this.canvas.style.width = "100vw";
            this.canvas.style.height = "100vh";
        } else {
            let elem = document.getElementById(id);
            if (!(elem instanceof HTMLCanvasElement)) {
                throw new Error("Element selected is not an HTMLCanvasElement");
            }
            this.canvas = elem;
            this.ctx = this.canvas.getContext("2d");
        }
    }

    switchAutoResize(resize) {
        if (typeof resize === "boolean") {
            if (resize) {
                if (!this.bAutoResize) {
                    window.addEventListener("resize", this.autoResizeFn, false);
                    this.bAutoResize = true;
                }
            } else {
                if (this.bAutoResize) {
                    window.removerEventListener("resize", this.autoResizeFn, false);
                }
            }
            this.bAutoResize = resize;
        } else if (typeof resize === "undefined") {
            if (this.bAutoResize) {
                window.removerEventListener("resize", this.autoResizeFn, false);
            } else {
                window.addEventListener("resize", this.autoResizeFn, false);
            }
            this.bAutoResize = !this.bAutoResize;
        } else {
            throw new Error("switchAutoResize() needs a boolean or no argument.");
        }
    }

    setFillColor(color) {
        this.checkInit();
        if (
            (typeof color === "string") &&
            (~color.search(/^#([\da-fA-F]{6}|[\da-fA-F]{3})$/))
        ) {
            this.ctx.fillStyle = color;
        } else {
            throw new Error("setFillColor() needs a string with a color in hexadecimal format.");
        }
    }

    setStrokeColor(color) {
        this.checkInit();
        if (
            (typeof color === "string") &&
            (~color.search(/^#([\da-fA-F]{6}|[\da-fA-F]{3})$/))
        ) {
            this.ctx.strokeStyle = color;
        } else {
            throw new Error("setStrokeColor() needs a string with a color in hexadecimal format.");
        }
    }

    setAlpha(a) {
        this.checkInit();
        if (typeof a !== "number") {
            throw new Error("setAlpha() needs a number.");
        }
        this.ctx.globalAlpha = a;
    }

    getColors() {
        this.checkInit();
        return {
            "stroke": this.ctx.strokeStyle,
            "fill": this.ctx.fillStyle,
            "alpha": this.globalAlpha
        };
    }

    setLineEnding(type) {
        this.checkInit();
        if (
            (typeof type === "string") &&
            (
                (type === "butt") ||
                (type === "round") ||
                (type === "square")
            )
        ) {
            this.ctx.lineCap = type;
        } else {
            throw new Error("setLineEnding() needs one of these values : \"butt\", \"round\", \"square\".");
        }
    }

    initPenMovement() {
        this.checkInit();
        if (!this.pathInitialized) {
            this.pathInitialized = true;
            this.ctx.beginPath();
        } else {
            throw new Error("A pen is already here.");
        }
    }

    checkPen() {
        this.checkInit();
        if (!this.pathInitialized) {
            throw new Error("You must initialize a PenMovement before using its functions.");
        }
    }

    movePenTo(x, y) {
        this.checkPen();
        if (
            (typeof x === "number") &&
            (typeof y === "number")
        ) {
            this.penX = x;
            this.penY = y;
            this.ctx.moveTo(x, y);
        } else {
            throw new Error("movePenTo() needs numbers (x, y).");
        }
    }

    movePenBy(relX, relY) {
        this.checkPen();
        if (
            (typeof relX === "number") &&
            (typeof relY === "number")
        ) {
            this.penX += relX;
            this.penY += relY;
            this.ctx.moveTo(this.penX, this.penY);
        } else {
            throw new Error("movePenBy() needs numbers (relX, relY).");
        }
    }

    usePenTo(x, y) {
        this.checkPen();
        if (
            (typeof x === "number") &&
            (typeof y === "number")
        ) {
            this.penX = x;
            this.penY = y;
            this.ctx.lineTo(x, y);
            this.ctx.moveTo(x, y);
        } else {
            throw new Error("usePenTo() needs numbers (x, y).");
        }
    }

    usePenBy(relX, relY) {
        this.checkPen();
        if (
            (typeof relX === "number") &&
            (typeof relY === "number")
        ) {
            this.penX += relX;
            this.penY += relY;
            this.ctx.lineTo(this.penX, this.penY);
            this.ctx.moveTo(this.penX, this.penY);
        } else {
            throw new Error("usePenBy() needs numbers (relX, relY).");
        }
    }

    usePenArc(x, y, r, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false) {
        this.checkPen();
        if (
            (typeof x === "number") &&
            (typeof y === "number") &&
            (typeof r === "number") &&
            (r > 0) &&
            (typeof startAngle === "number") &&
            (typeof endAngle === "number") &&
            (typeof anticlockwise === "boolean")
        ) {
            this.ctx.arc(x, y, startAngle, endAngle, anticlockwise);
        } else {
            throw new Error("usePenArc() needs numbers (x, y, r (must be a number above 0), startAngle, endAngle) and a boolean (anticlockwise).");
        }
    }

    usePenArcTo(x, y, sndX, sndY, r) {
        this.checkPen();
        if (
            (typeof x === "number") &&
            (typeof y === "number") &&
            (typeof sndX === "number") &&
            (typeof sndY === "number") &&
            (typeof r === "number")
        ) {
            this.ctx.arcTo(x, y, sndX, sndY, r);
        } else {
            throw new Error("usePenArcTo() needs numbers (x, y, sndX, sndY, r).");
        }
    }

    usePenBezierCurve(cpx, cpy, sndCpx, sndCpy, endPointX, endPointY) {
        this.checkPen();
        if (
            (typeof cpx === "number") &&
            (typeof cpy === "number") &&
            (typeof sndCpx === "number") &&
            (typeof sndCpy === "number")  &&
            (typeof endPointX === "number") &&
            (typeof endPointY === "number")
        ) {
            this.ctx.bezierCurveTo(cpx, cpy, sndCpx, sndCpy, endPointX, endPointY);
            this.ctx.moveTo(endPointX, endPointY);
        } else {
            throw new Error("usePenBezierCurve() needs numbers (cpx, cpy, sndCpx, sndCpy, endPointX, endPointY).");
        }
    }

    usePenRect(x, y, width, height) {
        if (
            (typeof x === "number") &&
            (typeof y === "number") &&
            (typeof width === "number") &&
            (typeof height === "number") &&
            (width > 0) &&
            (height > 0)
        ) {
            this.ctx.rect(x, y, width, height);
        } else {
            throw new Error("usePenRect() needs numbers (x, y, width, height)");
        }
    }

    usePenEllipse(x, y, rx, ry, rotation = 0, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false) {
        this.checkPen();
        if (CanvasRenderingContext2D.prototype.hasOwnProperty("ellipse")) {
            if (
                (typeof x === "number") &&
                (typeof y === "number") &&
                (typeof rx === "number") &&
                (typeof ry === "number") &&
                (typeof rotation === "number") &&
                (typeof startAngle === "number") &&
                (typeof endAngle === "number") &&
                (typeof anticlockwise === "boolean")
            ) {
                this.ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise);
            } else {
                throw new Error("usePenEllipse() needs numbers (x, y, rx, ry, rotation, startAngle, endAngle) and a boolean (anticlockwise)");
            }
        } else {
            throw new Error("User's navigator cannot handle CanvasRenderingContext2D.ellipse() function.");
        }
    }

    stopPenMovement() {
        this.checkPen();
        this.penX = 0;
        this.penY = 0;
        this.ctx.closePath();
        this.pathInitialized = false;
    }

    fillPenPath(rule) {
        this.checkInit();
        if (
            (rule === "nonzero") ||
            (rule === "evenodd")
        ) {
            this.ctx.fill(rule);
        } else if (typeof rule === "undefined") {
            this.ctx.fill();
        } else {
            throw new Error("fillPenPath() needs no argument or one of these values (fill rules) : \"nonzero\", \"evenodd\"");
        }
    }

    strokePenPath() {
        this.checkInit();
        this.ctx.stroke();
    }

    getPenPos() {
        this.checkPen();
        return {
            "x": this.penX,
            "y": this.penY
        };
    }

    clearRect(x, y, w, h) {
        this.checkInit();
        if (this.pathInitialized) {
            throw new Error("The pen path must be stopped before using clearRect().");
        }
        if (
            (typeof x === "number") &&
            (typeof y === "number") &&
            (typeof w === "number") &&
            (w > 0) &&
            (typeof h === "number") &&
            (h > 0)
        ) {
            this.ctx.clearRect(x, y, w, h);
        } else {
            throw new Error("clearRect() needs numbers (x, y, w (must be a number above 0), h (must be a number above 0)).");
        }
    }

    clearCanvas() {
        this.checkInit();
        if (this.pathInitialized) {
            throw new Error("The pen path must be stopped before using clearCanvas().");
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    createStencil(rule) {
        this.checkPen();
        if (
            (typeof rule === "string") &&
            (
                (rule === "nonzero") ||
                (rule === "evenodd")
            )
        ) {
            this.ctx.clip(rule);
        } else if (typeof rule === "undefined") {
            this.ctx.clip();
        } else {
            throw new Error("createStencil() needs no argument or one of these values (clip rules) : \"nonzero\", \"evenodd\"");
        }
    }

    createGradient(x, y, sndX, sndY, r, style, gradientStyle, ...colors) {
        this.checkInit();
        if (
            (typeof x === "number") &&
            (typeof y === "number") &&
            (typeof sndX === "number") &&
            (typeof sndY === "number") &&
            (typeof style === "string") &&
            (
                (style === "fill") ||
                (style === "stroke")
            ) &&
            (typeof gradientStyle === "string") &&
            (
                (gradientStyle === "linear") ||
                (gradientStyle === "radial")
            ) &&
            (colors.every(el => el instanceof Array))
        ) {
            let grad;
            if (gradientStyle === "linear") {
                grad = this.ctx.createLinearGradient(x, y, sndX, sndY);
            } else if (
                (gradientStyle === "radial") &&
                (r.every(el => el instanceof Array))
                (r.every(el => typeof el[0] === "number")) &&
                (r.every(el => typeof el[1] === "number")
            ) {
                grad = this.ctx.createRadialGradient(x, y, r[0], sndX, sndY, r[1]);
            }
            colors.forEach(colorStops => {
                if (
                    (typeof colorStops[0] === "number") &&
                    (colorStops[0] > 0) &&
                    (colorStops[0] < 1) &&
                    (typeof colorStops[1] === "string")
                ) {
                    grad.addColorStop(colorStops[0], colorStops[1]);
                }
            });
            this.ctx[`${style}Style`] = grad;
        } else {
            throw new Error("createGradient() needs numbers (x, y, sndX, sndY, r (if you have selected a linear gradient, put a random value for this argument.)), strings (style (\"fill\", \"stroke\"), gradientStyle (\"linear\", \"radial\")) and an Array (colors) with a number (between 0 and 1) and a string of the color.");
        }
    }

    drawFocus(element) {
        this.checkInit();
        if (
            (element instanceof HTMLButtonElement) ||
            (
                (element instanceof HTMLInputElement) &&
                (element.type === "button")
            )
        ) {
            this.ctx.drawFocusIfNeeded(element);
        } else {
            throw new Error("drawFocus() needs an HTMLInputElement (with \"button\" as type) or an HTMLButtonElement.");
        }
    }

    drawImage(image, sx = 0, sy = 0, sWidth = image.width, sHeight = image.height, dx = 0, dy = 0, dWidth = image.width, dHeight = image.height) {
        this.checkInit();
        if (
            (image instanceof CanvasImageSource) &&
            (typeof sx === "number") &&
            (sx > 0) &&
            (typeof sy === "number") &&
            (sy > 0) &&
            (typeof sWidth === "number") &&
            (sWidth > 0) &&
            (typeof sHeight === "number") &&
            (sHeight > 0) &&
            (typeof dx === "number") &&
            (dx > 0) &&
            (typeof dy === "number") &&
            (dy > 0) &&
            (typeof dWidth === "number") &&
            (dWidth > 0) &&
            (typeof dHeight === "number") &&
            (dHeight > 0)
        ) {
            ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        } else {
            throw new Error("drawImage() needs a CanvasImageSource (image) and numbers (sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight).");
        }
    }

    setFilters(...filters) {
        this.checkInit();
        if (CanvasRenderingContext2D.prototype.hasOwnProperty("filter")) {
            let fltrs = "";
            filters.forEach(el => {
                fltrs += ` ${el}`;
            });
            this.ctx.filter = fltrs;
            this.filters = filters;
        } else {
            console.error("User's navigator cannot handle CanvasRenderingContext2D.filter property.");
            return false;
        }
    }

    getFilters() {
        this.checkInit();
        if (CanvasRenderingContext2D.prototype.hasOwnProperty("filter")) {
            return this.filters;
        } else {
            console.error("User's navigator cannot handle CanvasRenderingContext2D.filter property.");
            return false;
        }
    }

    setFont(font) {
        this.checkInit();
        if (typeof font === "string") {
            this.ctx.font = font;
        } else {
            throw new Error("Argument must be a string");
        }
    }

    setTextDirection(direction = "source-over") {
        this.checkInit();
        if (CanvasRenderingContext2D.prototype.hasOwnProperty("direction")) {
            if (
                (typeof direction === "string") &&
                (
                    (direction === "ltr") ||
                    (direction === "rtl") ||
                    (direction === "inherit")
                )
            ) {
                this.ctx.direction = direction;
            } else {
                throw new Error("setTextDirection() needs a string that must be one of these values : \"ltr\", \"rtl\", \"inherit\".");
            }
        } else {
            throw new Error("User's navigator cannot handle CanvasRenderingContext2D.direction property.");
        }
    }

    setCompositeOperation(type) {
        this.checkInit();
        if (
            (typeof type === "string") &&
            (
                (type === "source-over") ||
                (type === "source-in") ||
                (type === "source-out") ||
                (type === "source-atop") ||
                (type === "destination-over") ||
                (type === "destination-in") ||
                (type === "destination-out") ||
                (type === "destination-atop") ||
                (type === "lighter") ||
                (type === "copy") ||
                (type === "xor") ||
                (type === "multiply") ||
                (type === "screen") ||
                (type === "overlay") ||
                (type === "darken") ||
                (type === "lighten") ||
                (type === "color-dodge") ||
                (type === "color-burn") ||
                (type === "hard-light") ||
                (type === "soft-light") ||
                (type === "difference") ||
                (type === "exclusion") ||
                (type === "hue") ||
                (type === "saturation") ||
                (type === "color") ||
                (type === "luminosity")
            )
        ) {
            this.ctx.globalCompositeOperation = type;
        } else {
            throw new Error("setCompositeOperation needs no argument (reset) or a string (a valid globalCompositeOperation. https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation).");
        }
    }

    writeText(text, x, y) {
        this.checkInit();
        if (
            (typeof text === "string") &&
            (typeof x === "number") &&
            (typeof y === "number")
        ) {
            this.ctx.fillText(text, x, y);
        } else {
            throw new Error("writeText() needs a string (text) and numbers (x, y).");
        }
    }

    setInterpolate(interpolate) {
        this.checkInit();
        if (
            (CanvasRenderingContext2D.prototype.hasOwnProperty("imageSmoothingEnabled")) ||
            (CanvasRenderingContext2D.prototype.hasOwnProperty("mozImageSmoothingEnabled")) ||
            (CanvasRenderingContext2D.prototype.hasOwnProperty("webkitImageSmoothingEnabled")) ||
            (CanvasRenderingContext2D.prototype.hasOwnProperty("msImageSmoothingEnabled"))
        ) {
            if (typeof interpolate !== "boolean") {
                throw new Error("Argument must be a boolean");
            } else {
                this.ctx.mozImageSmoothingEnabled = interpolate;
                this.ctx.webkitImageSmoothingEnabled = interpolate;
                this.ctx.msImageSmoothingEnabled = interpolate;
                this.ctx.imageSmoothingEnabled = interpolate;
            }
        } else {
            console.error("User's navigator cannot handle CanvasRenderingContext2D.imageSmoothingEnabled property.")
            return false;
        }
    }

    setLineDashOffset(v) {
        this.checkInit();
        if (typeof v === "number") {
            this.ctx.lineDashOffset = v;
        } else {
            throw new Error("setLineDashOffset() needs a number (v).");
        }
    }

    setLineJoin(join) {
        if (
            (typeof join === "string") &&
            (
                (join === "bevel") ||
                (join === "round") ||
                (join === "mitter")
            )
        ) {
            this.ctx.lineJoin = join;
        } else {
            throw new Error("setLineJoin() needs a string that must be one of these values : \"bevel\", \"round\", \"mitter\".");
        }
    }

    setLineWidth(w) {
        if (typeof w === "number") {
            this.ctx.lineWidth = w;
        } else {
            this.ctx.lineWidth = w;
            console.error("setLineWidth() changes the width of lines only if the function has a valid number (w).");
        }
    }

    createPattern(img, repetition = "repeat", style = "fill") {
        this.checkInit();
        if (
            (img instanceof CanvasImageSource) &&
            (typeof repetition === "string") &&
            (
                (repetition === "repeat") ||
                (repetition === "repeat-x") ||
                (repetition === "repeat-y") ||
                (repetition === "no-repeat")
            ) &&
            (typeof style === "string") &&
            (
                (style === "fill") ||
                (style === "stroke")
            )
        ) {
            let pattern = this.ctx.createPattern(img, repetition);
            this.ctx[style + "Style"] = pattern;
        } else {
            throw new Error("createPattern() needs a CanvasImageSource (img) and strings (repetition (\"repeat\", \"repeat-x\", \"repeat-y\" or \"no-repeat\". Default value : \"repeat\"), style (\"fill\" or \"stroke\". Default value : \"fill\")).");
        }
    }

    setDrawingMethod(draw) {
        if (typeof draw !== "function") {
            throw new Error("Argument must be a function");
        }

        this.draw = draw;
    }

    startLooping() {
        this.checkInit();

        if (this.looping) {
            throw new Error("Display already looping");
        }

        this.looping = true;
        window.requestAnimationFrame(() => {
          this.loopFn();
        });
    }

    stopLooping() {
        this.looping = false;
    }

    checkInit() {
        if (!this.isInitialized) {
            throw new Error("RayJS not initialized!");
        }
    }
}
RayDisplay.rayDisplays = [];
