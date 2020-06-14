class Ego extends Actor {

    /**
     * Constructor for Ego.
     */
    constructor() {
        super();
    }

    /**
     * Initialises Ego.
     * 
     * @param {Game} game 
     */
    init(game, width, height, content) {
        super.init(game, width, height, content);

        //let egoCanvas = Util.renderEmoji('🚶‍♂️', this.height);
        //this.appendChild(egoCanvas);
    }

    /**
     * 
     * @param {Game} game 
     */
    update(game) {
        super.update(game);

    }

    /**
     * 
     */
    processUserInput() {
        let direction = 0;
        let userInput = this.game.userInput;
        
        // Check if the direction keys are pressed and adjust Ego's direction accordingly.
        if (userInput.left() && !(this.direction & Sprite.RIGHT)) {
            direction |= Sprite.LEFT;
        }
        else if (userInput.right() && !(this.direction & Sprite.LEFT)) {
            direction |= Sprite.RIGHT;
        }
        if (userInput.up() && !(this.direction & Sprite.OUT)) {
            direction |= Sprite.IN;
        }
        else if (userInput.down() && !(this.direction & Sprite.IN)) {
            direction |= Sprite.OUT;
        }
        
        // Update Ego's direction to what was calculated above. The move method will use this 
        // when moving Ego. The direction is converted into a heading within setDirection.
        this.setDirection(direction);
    }
}