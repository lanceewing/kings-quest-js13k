class Sprite extends HTMLElement {

    constructor() {
        super();
    }

    getSize() {
        if (!this.size) {
            let spriteSize = getComputedStyle(this).getPropertyValue('--sprite-size');
            spriteSize.trim().replace('px', '');
            this.size = parseInt(spriteSize);
        }
        return this.size;
    }

    getRadius() {
        if (!this.radius) {
            this.radius = this.getSize() / 2;
        }
        return this.radius;
    }

    /**
     * 
     * @param {Game} game 
     */
    update(game) {
        let radius = this.getRadius();
        let rect = this.getBoundingClientRect();
        this.cx = Math.round(((rect.x + (rect.width / 2)) - game.screenX) / game.scale);
        this.cy = Math.round(((rect.y + (rect.height / 2)) - game.screenY) / game.scale);
        this.x = this.cx - radius;
        this.y = this.cy - radius;
    }

}