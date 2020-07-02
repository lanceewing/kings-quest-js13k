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
     * @param {number} width The width of the Actor.
     * @param {number} height The height of the Actor.
     * @param {string} content The content to add into the Actor. Optional.
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
     * @param {number} edge 
     */
    hitEdge(edge) {
        if (edge) {
            // Stop moving.
            this.destX = this.destZ = -1;
            this.heading = null;
            this.cell = 0;

            // Now check if there is a room on this edge.
            if (edge < 5) {
                let edgeData = this.game.rooms[this.room - 1][edge];
                if (edgeData) {
                    this.inputEnabled = false;

                    // Hide ego before we reposition him to the new entry point.
                    this.hide();

                    // Set the new room for ego.
                    this.room = edgeData[0];

                    // 1 = left/west
                    // 2 = right/east
                    // 3 = down/south
                    // 4 = up/north

                    // Work out the new position for ego.
                    switch (edgeData[1]) {
                        case 1: // From the left edge of screen
                            this.setPosition(0 - this.width * 2, this.y, this.z);
                            this.setDirection(Sprite.RIGHT);
                            this.moveTo(this.width + 50, this.z, function () {
                                this.game.inputEnabled = true;
                            });
                            break;

                        case 2: // From the right edge of screen.
                            this.setPosition(960 + this.width, this.y, this.z);
                            this.setDirection(Sprite.LEFT);
                            this.moveTo(960 - this.width - 50, this.z, function () {
                                this.game.inputEnabled = true;
                            });
                            break;

                        case 3: // From the bottom edge of screen.
                            this.setPosition(this.x, this.y, 980);
                            this.setDirection(Sprite.IN);
                            this.moveTo(this.x, 975, function () {
                                this.game.inputEnabled = true;
                            });
                            break;

                        case 4: // From the horizon edge of screen
                            this.setPosition(this.x, this.y, 355);
                            this.setDirection(Sprite.OUT);
                            this.moveTo(this.x, 360, function () {
                                this.game.inputEnabled = true;
                            });
                            break;
                    }

                    this.step = 1;
                }
            }
        }
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