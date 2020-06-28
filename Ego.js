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
        if (userInput.left() && !userInput.right()) {
            direction |= Sprite.LEFT;
        }
        if (userInput.right() && !userInput.left()) {
            direction |= Sprite.RIGHT;
        }
        if (userInput.up() && !userInput.down()) {
            direction |= Sprite.IN;
        }
        if (userInput.down() && !userInput.up()) {
            direction |= Sprite.OUT;
        }

        if (direction) {
            this.cell = ((this.cell + 1) % 30);
        }
        
        // Update Ego's direction to what was calculated above. The move method will use this 
        // when moving Ego. The direction is converted into a heading within setDirection.
        this.setDirection(direction);
    }
}