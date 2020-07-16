class Util {

    /**
     * Renders the given emoji text at that given font size on a canvas. Returns that canvas.
     * 
     * @param {*} emojiText The emoji text to render.
     * @param {*} size The font size to render the emoji text at.
     * 
     * @returns The created canvas with the rendered emoji text at the given font size.
     */
    static renderEmoji(emojiText, size) {
        let fontDef = `${size}px Segoe UI Emoji`;
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
        let { width, height } = ctx.canvas;
        let dataWidth = (width << 2);
        let imgData = ctx.getImageData(0, 0, width, height);
        let visitMap = new Uint32Array(imgData.data.length);
        let queue = [[startX, startY]];

        while (queue.length) {
            // Get pixel position to test from queue.
            let [x, y] = queue.shift();
            let pos = ((y * dataWidth) + (x << 2));

            // Check if we've been here before.
            if (visitMap[pos]) continue;

            visitMap[pos] = 1;

            let [red, green, blue, alpha] = imgData.data.slice(pos, pos + 4);
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
                if (x > 0) queue.push([x - 1, y]);
                if (x < width - 1) queue.push([x + 1, y]);
                if (y > 0) queue.push([x, y - 1]);
                if (y < height - 1) queue.push([x, y + 1]);
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    /**
     * Converts a direction value to a heading value.
     *  
     * @param {number} dir The direction value to convert.
     */
    static dirToHeading(dir) {
        return Math.atan2(((dir & 0x08) >> 3) - ((dir & 0x04) >> 2), ((dir & 0x02) >> 1) - (dir & 0x01));
    }
}