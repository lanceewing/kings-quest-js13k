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
   * @param {number} width The width of the Actor.
   * @param {number} height The height of the Actor.
   * @param {string} content The content to add into the Actor. Optional.
   */
  init(game, width, height, content) {
    super.init(game, width, height, content);

    // An HTML template is used for the structure of the actor.
    this.appendChild(document.importNode(document.getElementById('person').content, true));
    this.canvas = this.querySelector('.actor');
  }

  /**
   * Tells the Actor to stop moving. If fully is not provided, and there are pending destination
   * points, then the Actor will start moving to the next point. If fully is set to true then 
   * all pending destination points are cleared.
   * 
   * @param {boolean} fully Whether to fully stop the Actor or not.
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
   * 
   * @param {number} x The X position to move to.
   * @param {number} y The Y position to move to.
   * @param {Function} fn The function to execute once the Actor reaches the X/Y position.
   */
  moveTo(x, z, fn) {
    this.dests.push({ z: z, x: x, fn: fn });
  }

  /**
   * Tells the Actor to say the given text within a speech bubble of the given width. Will
   * execute the given optional next function if provided after the speech bubble is removed.
   * 
   * @param {string} text The text to say.
   * @param {number} width The width of the speech bubble.
   * @param {Function} next The function to execute after saying the text. Optional.
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

      if (this.moved) {
        this.classList.add('walking');
      } else {
        this.classList.remove('walking');
      }
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
