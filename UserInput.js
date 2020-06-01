class UserInput {

  static LEFT  = 0x01;
  static UP    = 0x02;
  static RIGHT = 0x04;
  static DOWN  = 0x08;

  /**
   * Constructor for UserInput.
   * 
   * @param {Game} game
   * @param {HTMLElement} screen 
   */
  constructor(game, screen) {
    this.game = game;
    this.screen = screen;
    this.keys = {};
    this.oldKeys = {};
    this.xMouse = 0;
    this.yMouse = 0;
    this.mouseButton = 0;
    this.dragStart = null;
    this.dragNow = null;
    this.dragEnd = null;
    this.joystick = 0;
    this.oldJoystick = 0;
  }

  /**
   * Set up the keyboard & mouse event handlers.
   */
  enableInput() {
    document.onkeydown = e => this.keyDown(e);
    document.onkeyup = e => this.keyUp(e);
    this.screen.onmousedown = e => this.mouseDown(e);
    this.screen.onmouseup = e => this.mouseUp(e);
    this.screen.onmousemove = e => this.mouseMove(e);
    this.screen.ontouchend = e => this.touchEnd(e);
    this.screen.ontouchstart = e => this.touchStart(e);
    this.screen.ontouchmove = e => this.touchMove(e);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  mouseDown(e) {
    if (this.game.running) {
      this.dragStart = {
        x: e.pageX - this.screen.offsetLeft,
        y: e.pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
      this.dragEnd = this.dragNow = null;
    }
    this.mouseButton = 1;
    e.preventDefault();
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  mouseUp(e) {
    if (this.game.running) {
      this.dragEnd = {
        x: e.pageX - this.screen.offsetLeft,
        y: e.pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
    }
    this.mouseButton = 0;
    e.preventDefault();
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  mouseMove(e) {
    this.xMouse = e.pageX - this.screen.offsetLeft;
    this.yMouse = e.pageY - this.screen.offsetTop;
    if ((this.mouseButton == 1) && (this.game.running)) {
      this.dragNow = {
        x: e.pageX - this.screen.offsetLeft,
        y: e.pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
    }
  }

  /**
   * 
   * @param {TouchEvent} e 
   */
  touchEnd(e) {
    if (this.game.running) {
      this.dragEnd = {
        x: e.changedTouches[0].pageX - this.screen.offsetLeft,
        y: e.changedTouches[0].pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
    }
    this.xMouse = e.changedTouches[0].pageX - this.screen.offsetLeft;
    this.yMouse = e.changedTouches[0].pageY - this.screen.offsetTop;
    this.mouseButton = 1;
    if (e.cancelable) e.preventDefault();
  }

  /**
   * 
   * @param {TouchEvent} e 
   */
  touchStart(e) {
    if (this.game.running) {
      this.dragStart = {
        x: e.changedTouches[0].pageX - this.screen.offsetLeft,
        y: e.changedTouches[0].pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
      this.dragEnd = this.dragNow = null;
    }
  }

  /**
   * 
   * @param {TouchEvent} e 
   */
  touchMove(e) {
    if (this.game.running) {
      this.dragNow = {
        x: e.changedTouches[0].pageX - this.screen.offsetLeft,
        y: e.changedTouches[0].pageY - this.screen.offsetTop,
        t: (new Date()).getTime()
      };
    }
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
   * Remove event handlers for mouse, touch and key events.
   */
  disableInput() {
    document.onkeydown = null;
    document.onkeyup = null;
    this.screen.onmousedown = null;
    this.screen.onmouseup = null;
    this.screen.onmousemove = null;
    this.screen.ontouchend = null;
    this.screen.ontouchstart = null;
    this.screen.ontouchmove = null;
    this.oldkeys = this.keys = {};
    this.oldJoystick = this.joystick = 0;
  }

  /**
   * @param {Ego} ego The player Ego instance.
   */
  processUserInput(ego) {
    // Process any user input for the main player sprite (ego).
    if (ego) {



    }

    // Keep track of what the previous state of each key was.
    this.oldkeys = {};
    for (var k in this.keys) {
      this.oldKeys[k] = this.keys[k];
    }
    this.oldJoystick = this.joystick;
  }
}