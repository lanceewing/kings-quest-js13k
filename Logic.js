/**
 * Holds room logic functions.
 */
class Logic {

    /**
     * Constructor for Logic.
     * 
     * @param {Game} game The Game.
     */
    constructor(game) {
        this.game = game;
        this.userInput = game.userInput;
    }

    /**
     * 
     * 
     * @param {string} verb 
     * @param {string} cmd 
     * @param {string} thing 
     * @param {*} e 
     */
    process(verb, cmd, thing, e) {
      let newCommand = cmd;
      let thingId = thing.replace(' ','_');
  
      switch (verb) {

  
        default:
          this.game.ego.say("Nothing happened.", 220);
          break;
      }
      
      return newCommand;
    }

  }
  