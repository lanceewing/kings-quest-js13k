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
     * Processes a command from the user input.
     * 
     * @param {string} verb The verb part of the command to process.
     * @param {string} cmd The full command to process.
     * @param {string} thing The thing or noun part of the command to process.
     * @param {MouseEvent} e The mouse event associated with the command to process.
     */
    process(verb, cmd, thing, e) {
      let newCommand = cmd;
      let thingId = thing.replace(' ','_');
  
      // If we don't yet have a thing to do something to, then ignore.
      if (!thing) return verb;

      switch (verb) {

  
        default:
          this.game.ego.say("Nothing happened.", 220);
          break;
      }
      
      return newCommand;
    }

  }
  