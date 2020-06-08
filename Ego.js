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