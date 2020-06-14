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

    /**
     * Draws a filled circle of the given diameter. The fill style should have already
     * been set before invoking this function. This is used for drawing spheres and 
     * the eyes on the spheres.
     *
     * @param {CanvasRenderingContext2D} ctx The 2D canvas context to draw the filled circle on.
     * @param {number} x The x position of the filled circle.
     * @param {number} y The y position of the filled circle.
     * @param {number} d The diameter of the filled circle.
     */
    static fillCircle(ctx, x, y, d, angle, drawBorder) {
        let r = d / 2;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, 0, angle * Math.PI);
        ctx.closePath();
        ctx.fill();
        if (drawBorder) ctx.stroke();
    }

    /**
     * Draws a person background sprite image. This includes the four different directions,
     * and three different cycles of moving in that direction. The parameters allow different
     * size persons to be drawn, of different clours, and with different features.
     * 
     * @param {number} w The width of the person.
     * @param {number} h The height of the person.
     * @param {number} direction The direction of the person.
     * @param {string} face 
     * @param {string} clothes 
     * @param {string} hat 
     * @param {string} pack 
     * @param {string} line 
     */
    static renderPerson(w, h, direction, c, face, clothes, hat, pack, line) {
        let ctx = Util.create2dContext(w, h + (w / 10));
    
        let ballSize = (w / 5);
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        if (line) {
            ctx.strokeStyle = line;
        }
        
        // Hat ball on top
        if (hat) {
            ctx.fillStyle = hat;
            Util.fillCircle(ctx, (w / 2) - (ballSize / 2), 0, ballSize, 2, true);
        }
        
        // Head & hat
        let headSize = w - (w / 5);
        let headStart = ballSize - (ballSize / 5);
        ctx.fillStyle = hat;
        Util.fillCircle(ctx, 0 + ((w - headSize) / 2), headStart, headSize, 2, true);
        ctx.fillStyle = face;
        Util.fillCircle(ctx, 0 + ((w - headSize) / 2), headStart, headSize, hat? 1 : 2, true);
        
        // Neck
        let bodyStart = headStart + headSize;
        let packStart = bodyStart + (w / 10);
        
        // Backpack
        let packWidth = (w / 2.75);
        if (pack) {
            ctx.fillStyle = pack;
            ctx.beginPath();
            if (direction != 0) {
                ctx.rect(w / 2, packStart, -packWidth, headSize);
            }
            if (direction != 1) {
                ctx.rect(w / 2, packStart, packWidth, headSize);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // Body
        let bodyBottom = bodyStart + w + (w / 1.5);
        let shoulderWidth = w / 6;
        ctx.fillStyle = clothes;
        ctx.beginPath();
        ctx.moveTo(w / 2, bodyStart);
        ctx.lineTo((w / 2) - shoulderWidth, bodyStart);
        if (direction != 1) {
            // Draw left point
            ctx.lineTo(3, bodyBottom);
        }
        ctx.lineTo((w / 2) - shoulderWidth, bodyBottom);
        ctx.lineTo((w / 2) + shoulderWidth, bodyBottom);
        if (direction != 0) {
            // Draw right point
            ctx.lineTo(w - 3, bodyBottom);
        }
        ctx.lineTo((w / 2) + shoulderWidth, bodyStart);
        ctx.lineTo(w / 2, bodyStart);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        if (pack) {
            if (direction == 2) {
                ctx.fillStyle = pack;
                ctx.beginPath();
                ctx.rect((w / 2) - packWidth, packStart, packWidth * 2, headSize);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        
        // Legs
        let legLength = h - bodyBottom;
        let legFactors = [1, 1, 0.5];
        let leftFactor = legFactors[c];
        let rightFactor = legFactors[(c + 1) % 3];
        
        ctx.beginPath();
        ctx.moveTo((w / 2) - shoulderWidth, bodyBottom);
        ctx.lineTo((w / 2) - shoulderWidth, bodyBottom + legLength * leftFactor);
        ctx.moveTo((w / 2) + shoulderWidth, bodyBottom);
        ctx.lineTo((w / 2) + shoulderWidth, bodyBottom + legLength * rightFactor);
        ctx.closePath();
        ctx.stroke();
        
        return ctx.canvas;
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