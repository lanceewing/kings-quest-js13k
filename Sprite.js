class Sprite extends HTMLElement {

    // These are constants use to represent the different directions.
    static LEFT  = 0x01;
    static RIGHT = 0x02;
    static IN    = 0x04;
    static OUT   = 0x08;

    static DIRS = [Sprite.LEFT, Sprite.RIGHT, Sprite.IN, Sprite.OUT];

    /**
     * Constructor for Sprite.
     */
    constructor() {
        super();
    }

    /**
     * Initialise the position and size of the Sprite.
     * 
     * @param {Game} game
     * @param {number} width 
     * @param {number} height 
     * @param {string} content
     * @param {boolean} shadow 
     */
    init(game, width, height, content, shadow=true) {
        this.game = game;

        this.width = width;
        this.height = height;
        this.content = content;
        this.style.width = width + 'px';
        this.style.height = height + 'px';
        this.style.setProperty('--sprite-width', width + 'px');

        // If we were given content then add it.
        if (content) {
            this.canvas = Util.renderEmoji(content, Math.max(this.width, this.height));
            this.appendChild(this.canvas);
        }

        if (shadow) {
            this.shadow = document.createElement('x-shadow');
            this.appendChild(this.shadow);
        }

        this.moved = false;
        this.positions = [];
        this.radius = this.width / 2;
        this.colour = 'grey';
        
        this.cx = 0;
        this.cy = 0;

        this.maxStep = 5;
        this.step = this.stepInc = (this.maxStep / 10);

        this.direction = Sprite.OUT;
        this.directionLast = 1;
        this.heading = null;
        this.backgroundX = 0;
        this.backgroundY = 0;
        this.facing = 3;
        this.destZ = -1;
        this.destX = -1;
        this.destFn = null;
        this.dests = [];
        this.cell = 0;
        this.visible = false;
    }
 
    /**
     * Tests if this Sprite is touching another Sprite.
     * 
     * @param {Sprite} obj The Sprite to test if this Sprite is touching.
     * 
     * @returns {boolean} true if this Sprite is touching the given Sprite; otherwise false.
     */
    touching(obj) {
        // Some objects are not solid, e.g. ghosts.
        if (this.ignore || obj.ignore) {
            return false;
        }
        if (obj) {
            let dx = this.cx - obj.cx;
            let dz = this.cz - obj.cz;
            let dist = (dx * dx) + (dz * dz);
            let rsum = (this.radius + obj.radius);
            return (dist <= (rsum * rsum));
        } else {
            return false;
        }
    }
    /**
     * Resets this Sprite's position to its previous position.
     * 
     * @returns {Object} The x/y/z position that the Sprite is now at.
     */
    reset() {
        let pos = this.positions.pop();
        
        if (pos) {
            this.setPosition(pos.x, pos.y, pos.z);
            this.positions.pop();
        }
    
        // We need to switch to small steps when we reset position so we can get as close
        // as possible to other Sprites.
        this.step = 1;
        
        return pos;
    }

    /**
     * Sets the Sprite's position to the given x, y, and z position.
     * 
     * @param {number} x The x part of the new position.
     * @param {number} y The y part of the new position.
     * @param {number} z The z part of the new position.
     */
    setPosition(x, y, z) {
        // If we have a previous position then z will have a non-zero value. We don't
        // want to push the initially undefined position.
        if (this.z) {
            // Remember the last 5 positions.
            this.positions.push({x: this.x, y: this.y, z: this.z});
            if (this.positions.length > 5) {
                this.positions = this.positions.slice(-5);
            }
        }
    
        // Set the new position and calculate the centre point of the Sprite sphere.
        this.x = x;
        this.y = y;
        this.z = z;
        this.cx = x + this.radius;
        this.cy = y + this.radius;
        this.cz = z * 3;
    
        // Update the style of the sprite to reflect the new position.
        let top = Math.floor(this.z / 2) - this.height - Math.floor(this.y);
        this.style.top = top + 'px';
        this.style.left = (this.x) + 'px';

        this.style.zIndex = Math.floor(this.z);
        if (this.canvas) {
            this.canvas.style.zIndex = Math.floor(this.z);
        }

        //let scale = (((this.cz - 1000) / 2000) * 0.5) + 0.5;
        //this.style.transform = `rotateY(0deg) scaleY(${scale})`;
    }

    /**
     * Hides the Sprite but retains element in the DOM.
     */
    hide() {
        this.style.display = 'none';
        this.visible = false;
    
        // This is mainly to reset any lower opacity that might have been in
        // place prior to being hidden, such as as the result of a fade.
        this.style.opacity = 1.0;
    }

    /**
     * Shows the Sprite.
     */
    show() {
        this.style.display = 'block';
        this.visible = true;
    }

    /**
     * Returns whether this screen object is visible or not.
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Sets the direction of this Sprite to the new direction provided. The direction is
     * a bit mask, and so might be a composite direction. From the direction, the heading
     * is calculated.
     * 
     * @param {number} direction A bit mask that identifies the new direction of the Sprite.
     */
    setDirection(direction) {
        let oldFacing = this.facing;
        let facing = 0;

        if (direction && direction != this.direction) {
            this.directionLast = this.direction;
            this.direction = direction;
        
            // Convert the direction to a facing direction by shifting right until we find
            // a 1. There are only four facing directions.
            for (facing = 0; facing <= 4 && !((direction >> facing++) & 1););
            
            this.facing = facing;
        }

        // Convert the direction into a heading, but only if LEFT, RIGHT, IN, or OUT are set.
        if (direction & 0x0F) {
            this.heading = Util.dirToHeading(direction);
        } else {
            this.heading = null;
        }

        if (oldFacing != this.facing) {
            this.classList.remove('facing' + oldFacing);
            this.classList.add('facing' + this.facing);
        }
    }
  
    /**
     * Moves this Sprite based on its current heading, direction, step size and time delta settings. The
     * bounds are checked, and if in moving the Sprite and edge is hit, then the hitEdge method is invoked
     * so that sub-classes can decide what to do.
     */
    move() {
        this.moved = false;
        
        if (this.direction || this.heading != null) {
            let x = this.x;
            let z = this.z;
            let y = this.y;
            let edge = 0;
            
            // Move the position based on the current heading, step size and time delta.
            if (this.heading != null) {
                x += Math.cos(this.heading) * Math.round(this.step * this.game.stepFactor);
                z += Math.sin(this.heading) * Math.round(this.step * this.game.stepFactor);
                
                // 1 = left/west
                // 2 = right/east
                // 3 = down/south
                // 4 = up/north

                if (this.game.inputEnabled) {
                    // Check whether a room edge has been hit.
                    if (x < 0) edge = 1;
                    if ((x + this.width) > 960) edge = 2;
                    // This edge number is simply to stop ego. He won't leave the room.
                    if (z > 985) edge = 3;
                    if (z < 350) edge = 4;
                }
                  

                // Increment the step size the step increment, capping at the max step.
                if ((this.step += this.stepInc) > this.maxStep) this.step = this.maxStep;
            }
        
            if (edge) {
                this.hitEdge(edge);
            } else {
                // If x or z has changed, update the position.
                if ((x != this.x) || (z != this.z)) {
                    this.setPosition(x, y, z);
                    this.moved = true;
                }
            }
        } else {
            // If stationary then set step size back to 1, which allows closer movement
            // to the props.
            this.step = 1;
        }
    }

    /**
     * Updates this Sprite for the current animation frame.
     * 
     * @param {Game} game 
     */
    update(game) {
        if (!this.moved) {
            this.move();
        }
    }
  
    /**
     * Invokes when this Sprite hits another Sprite. The default behaviour is to simply reset the
     * position. Can be overridden by sub-classes.
     */
    hit(obj) {
        if (this.moved) {
            this.reset();
        }
    }

    /**
     * Invoked when this Sprite hits and edge. Overridden by sub-classes.
     *
     * @param {Array} edge If defined then this is an Array identifying the edge. Will be null if the edge is the ground.
     */
    hitEdge(edge) {
        // Default is do nothing.
    }
}