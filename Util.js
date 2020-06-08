class Util {

    /**
     * Utility function for obtaining a 2D canvas from a newly created canvas of the 
     * given width and height.
     * 
     * @param {number} w The width of the canvas.
     * @param {number} h The height of the canvas.
     * 
     * @returns {CanvasRenderingContext2D} The created 2D canvas context.
     */
    static create2dContext(w, h) {
        let canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h || w;
        return (canvas.getContext('2d'));
    }

    /**
     * Linear congruential generator algorithm with a fixed seed. Gives the appearance
     * of being random but always generates the numbers in the same sequence. This has
     * been done deliberately.
     * 
     * @param {number} seed 
     * 
     * @returns The created Linear Congruential Generator.
     */
    static random(seed) {
        let _random = seed || 481731;
        return function(n) {
            _random = (_random * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (_random % n);
        };
    }

    /**
     * Renders the given emoji text at that given font size on a canvas. Returns that canvas.
     * 
     * @param {*} emojiText The emoji text to render.
     * @param {*} size The font size to render the emoji text at.
     * 
     * @returns The created canvas with the rendered emoji text at the given font size.
     */
    static renderEmoji(emojiText, size) {
        let fontDef = `${size}px serif`;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.font = fontDef;
        ctx.textAlign = "center"; 
        ctx.textBaseline = "ideographic";
        
        let textMetrics = ctx.measureText(emojiText);
        canvas.height = size + (size / 8);
        canvas.width = textMetrics.width - (size / 4);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontDef;
        ctx.textAlign = "center"; 
        ctx.textBaseline = "ideographic";
        ctx.fillText(emojiText, canvas.width / 2, canvas.height);

        // On Windows, this reduces the thick black edges.
        Util.reduceEdges(ctx, 0, 0);

        // Work out where the edges of the image are.
        let [minX, minY, maxX, maxY] = Util.findEdges(ctx);

        // Redraw the canvas, so that we can remove white space and add a shadow.
        let emojiCanvas = document.createElement('canvas');
        let shadowWidth = 1;
        let newWidth = ((maxX - minX) + 1 + shadowWidth*2);
        let newHeight = ((maxY - minY) + 1 + shadowWidth*2);
        emojiCanvas.width = newWidth;
        emojiCanvas.height = newHeight;
        let emojiCtx = emojiCanvas.getContext('2d');
        emojiCtx.shadowColor = "black";
        emojiCtx.shadowBlur = 3;
        emojiCtx.drawImage(
            canvas, 
            minX-shadowWidth, minY-shadowWidth, newWidth, newHeight,
            0, 0, newWidth, newHeight, 
        );

        return emojiCanvas;
    }

    /**
     * Finds the edges of the visible pixel data within the given canvas context.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * 
     * @returns {Array} An array containing the minX, minY, maxY and maxY values.
     */
    static findEdges(ctx) {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let dataWidth = (width << 2);
        let imgData = ctx.getImageData(0, 0, width, height);
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pos = ((y * dataWidth) + (x << 2));
                let alpha = imgData.data[pos + 3];
                if (alpha > 0) {
                    if (x < minX) {
                        minX = x;
                    }
                    if (x > maxX) {
                        maxX = x;
                    }
                    if (y < minY) {
                        minY = y;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                }
            }
        }

        return [minX, minY, maxX, maxY];
    }

    /**
     * For the image data in the given canvas context, applies a fill algorithm
     * to trim off the thick black edges that Windows emojis have around them.
     * On other operating systems, this will hopefully do nothing, but lets 
     * see.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} startX 
     * @param {number} startY 
     */
    static reduceEdges(ctx, startX, startY) {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let dataWidth = (width << 2);
        let imgData = ctx.getImageData(0, 0, width, height);
        let visitMap = new Uint32Array(imgData.data.length);
        let queue = new Queue();

        console.clear();

        queue.enqueue(startX);
        queue.enqueue(startY);

        try {
            while (!queue.isEmpty()) {
                // Get pixel position to test from queue.
                let x = queue.dequeue();
                let y = queue.dequeue();
                let pos = ((y * dataWidth) + (x << 2));

                // Check if we've been here before.
                let visited = visitMap[pos];
                if (visited) {
                    continue;
                }
                visitMap[pos] = 1;

                let red = imgData.data[pos];
                let green = imgData.data[pos + 1];
                let blue = imgData.data[pos + 2];
                let alpha = imgData.data[pos + 3];
                let brightness = Math.round(Math.sqrt((red * red * 0.241) + (green * green * 0.691) + (blue * blue * 0.068)));
                let spread = false;

                if (alpha == 0) {
                    spread = true;
                }
                else if ((red == 0) && (green == 0) && (blue == 0)) {
                    imgData.data[pos + 3] = 0;
                    spread = true;
                }
                else if (brightness < 70) {
                    imgData.data[pos + 3] = Math.round(brightness * (255 / 70));
                    spread = true;
                }

                if (spread) {
                    if (x > 0) {
                        queue.enqueue(x - 1);
                        queue.enqueue(y);
                    }
                    if (x < width - 1) {
                        queue.enqueue(x + 1);
                        queue.enqueue(y);
                    }
                    if (y > 0) {
                        queue.enqueue(x);
                        queue.enqueue(y - 1);
                    }
                    if (y < height - 1) {
                        queue.enqueue(x);
                        queue.enqueue(y + 1);
                    }
                }
            }
        }
        catch (err) {
            console.log('err: ' + err);
        }

        ctx.putImageData(imgData, 0, 0);
    }

}