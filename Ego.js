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
                    this.game.inputEnabled = false;

                    // Hide ego before we reposition him to the new entry point.
                    this.hide();

                    // Set the new room for ego.
                    this.room = edgeData;

                    // 1 = left/west
                    // 2 = right/east
                    // 3 = down/south
                    // 4 = up/north

                    // Work out the new position for ego.
                    switch (edge) {
                        case 1: // From the left edge of screen.
                            this.setPosition(955 - this.width, this.y, this.z);
                            this.setDirection(Sprite.LEFT);
                            break;

                        case 2: // From the right edge of screen
                            this.setPosition(5, this.y, this.z);
                            this.setDirection(Sprite.RIGHT);
                            break;
                        
                        case 3: // From the bottom edge of screen
                            this.setPosition(this.x, this.y, 355);
                            this.setDirection(Sprite.OUT);
                            break;

                        case 4: // From the horizon edge of screen.
                            this.setPosition(this.x, this.y, 980);
                            this.setDirection(Sprite.IN);
                            break;
                    }

                    // Ignore objects while we're changing rooms.
                    //this.ignore = true;

                    // Previously positions are not applicable when room changes.
                    this.positions = [];

                    this.step = 1;

                    // Store the edge that ego entered the new room.
                    this.edge = edge;
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

        if (this.game.inputEnabled) {
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
}