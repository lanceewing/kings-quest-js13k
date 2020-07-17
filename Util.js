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
        let canvas = document.createElement('canvas');
        canvas.height = size * 2;
        canvas.width = size * 4;
        let ctx = canvas.getContext('2d');
        ctx.font = `${size}px Segoe UI Emoji`;
        ctx.fillText(emojiText, (size / 2), size + (size / 2));

        // On Windows, this reduces the thick black edges.
        let [minX, minY, maxX, maxY] = Util.reduceEdges(ctx, 0, 0);

        // Redraw the canvas, so that we can remove white space and add a shadow.
        let emojiCanvas = document.createElement('canvas');
        let newWidth = ((maxX - minX) + 3);
        let newHeight = ((maxY - minY) + 3);
        emojiCanvas.width = newWidth;
        emojiCanvas.height = newHeight;
        let emojiCtx = emojiCanvas.getContext('2d');
        emojiCtx.shadowColor = "black";
        emojiCtx.shadowBlur = 3;
        emojiCtx.drawImage(
            canvas, 
            minX-1, minY-1, newWidth, newHeight,
            0, 0, newWidth, newHeight, 
        );

        return emojiCanvas;
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
        let [minX, minY] = [width, height];
        let maxX = 0;
        let maxY = 0;

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

            if (imgData.data[pos + 3]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        return [minX, minY, maxX, maxY];
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