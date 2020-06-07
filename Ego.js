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
    init(game) {
        super.init(game);

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