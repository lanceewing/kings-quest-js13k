class Actor extends Sprite {

  /**
   * Constuctor for Actor.
   */
  constructor() {
    super();
  }

  /**
   * Initialises the Actor with a given position.
   * 
   * @param {Game} game 
   */
  init(game, width, height, content) {
    super.init(game, width, height, content);
    
    this.colour = 'grey';
    this.hat = 'grey';
    this.face = 'white';
    this.pack = 'red';

    this.canvas = this.buildCanvas();
    this.wrap.appendChild(this.canvas);
    //this.shadow = document.createElement('x-shadow');
    //this.appendChild(this.shadow);
  }

  /**
   * Builds the background image canvas for the Actor. 
   */
  buildCanvas() {
    // Create a single canvas to render the sprite sheet for the four directions.
    let ctx = Util.create2dContext(this.width * 4, this.width * 3 * 3);

    // For each direction, render the Actor facing in that direction.
    for (let c = 0; c < 3; c++) {
      for (let d = 0; d < 4; d++) {
        ctx.drawImage(
          Util.renderPerson(this.width, this.width * 3, d, c, this.face, this.colour, this.hat, this.pack, this.outline),
          d * this.width,
          c * this.width * 3);
      }
    }

    return ctx.canvas;
  }

  /**
   * Tells the Actor to stop moving. If fully is not provided, and there are pending destination
   * points, then the Actor will start moving to the next point. If fully is set to true then 
   * all pending destination points are cleared.
   */
  stop(fully) {
    // Clear the current destination.
    this.destX = this.destZ = -1;
    this.heading = null;
    this.cell = 0;

    if (this.destFn) {
      this.destFn();
      this.destFn = null;
    }

    // To fully stop, we need to also clear the pending destinations.
    if (fully) this.dests = [];
  }

  /**
   * Tells the Actor to move to the given position on the screen.
   */
  moveTo(x, z, fn) {
    this.dests.push({ z: z, x: x, fn: fn });
  }

  /**
   * Tells the Actor to say the given text within a speech bubble of the given width. Will
   * execute the given optional next function if provided after the speech bubble is removed.
   */
  say(text, width, next) {
    let game = this.game;
    let elem = this;

    game.inputEnabled = false;
    game.overlay.style.display = 'block';
    game.overlay.onclick = null;

    let bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.innerHTML = text;

    let left;
    if (this.x > 800) {
      left = -width + 40;
    } else if (this.x < 100) {
      left = -10;
    } else {
      left = -(width / 2);
    }

    bubble.style.width = width + 'px';
    bubble.style.left = left + 'px';

    this.appendChild(bubble);
    this.classList.add('speech');

    let closeBubbleTO = null;
    let closeBubbleFn = function (e) {
      // If function was called by a user event, then cancel the timeout.
      if (e) {
        clearTimeout(closeBubbleTO);
        game.overlay.onclick = null;
      }
      // Remove the speech bubble.
      elem.classList.remove('speech');
      if (elem.contains(bubble)) {
        elem.removeChild(bubble);
      }

      if (next) {
        setTimeout(next, 200);
      } else {
        // Re-enable user input if nothing is happening after the speech.
        game.inputEnabled = true;
      }
    };
    closeBubbleTO = setTimeout(closeBubbleFn, (text.length / 10) * 1500);
    game.overlay.onclick = closeBubbleFn;
  }

  /**
   * Updates the Actor's position based on its current heading and destination point.
   */
  update() {
    // Only update the Actor if it is currently on screen.
    if (this.style.display != 'none') {
      // Mask out left/right/in/out but retain the current jumping directions.
      let direction;

      if ((this.destX != -1) && (this.destZ != -1)) {
        if (this.touching({ cx: this.destX, cy: this.cy, z: this.destZ, radius: -this.radius }, 20)) {
          // We've reached the destination.
          this.stop();

        } else {
          this.heading = Math.atan2(this.destZ - this.z, this.destX - this.cx);

          // Cycle cell
          this.cell = ((this.cell + 1) % 30);
        }
      } else if (this.dests.length > 0) {
        // If there is a destination position waiting for ego to move to, pop it now.
        let pos = this.dests.shift();
        this.destZ = pos.z
        this.destX = pos.x;
        this.destFn = pos.fn;
      }

      if (this.heading !== null) {
        // Convert the heading to a direction value.
        if (Math.abs(this.heading) > 2.356) {
          direction |= Sprite.LEFT;
        } else if (Math.abs(this.heading) < 0.785) {
          direction |= Sprite.RIGHT;
        } else if (this.heading > 0) {
          direction |= Sprite.OUT;
        } else {
          direction |= Sprite.IN;
        }
      }

      // Update Ego's direction to what was calculated above.
      this.setDirection(direction);

      // Move Ego based on it's heading.
      if (this.heading !== null) this.move();
    }
  }

  /**
   * Invoked when the Actor has hit another Sprite.
   * 
   * @param obj The Sprite that the Actor has hit.
   */
  hit(obj) {
    // Reset the position to the last one that isn't touching another Sprite. Resetting
    // the position prevents the Actor from walking through obstacles. 
    for (; this.reset() && this.touching(obj););
  }
}
