class UserInput {

  /**
   * Constructor for UserInput.
   */
  constructor() {
    this.keys = {};
    this.oldKeys = {};
    this.joystick = 0;
    this.oldJoystick = 0;
  }

  /**
   * Set up the keyboard & mouse event handlers.
   */
  enableInput() {
    document.onkeydown = e => this.keyDown(e);
    document.onkeyup = e => this.keyUp(e);
  }

  /**
   * Invoked when a key is pressed down.
   *  
   * @param {KeyboardEvent} e The key down event containing the key code.
   */
  keyDown(e) {
    this.keys[e.keyCode] = 1;

    if ((e.keyCode >= 37) && (e.keyCode <= 40)) {
      this.joystick |= (1 << (e.keyCode - 37));
    }
  }

  /**
   * Invoked when a key is released.
   *  
   * @param {KeyboardEvent} e The key up event containing the key code.
   */
  keyUp(e) {
    this.keys[e.keyCode] = 0;

    if ((e.keyCode >= 37) && (e.keyCode <= 40)) {
      this.joystick &= ~(1 << (e.keyCode - 37));
    }
  }

  /**
   * Tests if the left button is being held down.
   */
  left() {
    return (this.joystick & 1);
  }

  /**
   * Tests if the right button is being held down.
   */
  right() {
    return (this.joystick & 4);
  }

  /**
   * Tests if the up button is being held down.
   */
  up() {
    return (this.joystick & 2);
  }

  /**
   * Tests if the down button is being held down.
   */
  down() {
    return (this.joystick & 8);
  }

  /**
   * @param {Ego} ego The player Ego instance.
   */
  processUserInput(ego) {
    // Process any user input for the main player sprite (ego).
    ego.processUserInput();

    // Keep track of what the previous state of each key was.
    this.oldkeys = {};
    for (let k in this.keys) {
      this.oldKeys[k] = this.keys[k];
    }
    this.oldJoystick = this.joystick;
  }
}