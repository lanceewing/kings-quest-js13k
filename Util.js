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
     */
    static random(seed) {
        let _random = seed || 481731;
        return function(n) {
            _random = (_random * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (_random % n);
        };
    }

}