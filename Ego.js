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
    init(game, width, height) {
        super.init(game, width, height);

        let egoCanvas = Util.renderEmoji('🚶‍♂️', this.height);
        this.appendChild(egoCanvas);
    }

    /**
     * 
     * @param {Game} game 
     */
    update(game) {
        super.update(game);

    }

}