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
    
        this.wrap = document.createElement('x-wrap');
        this.wrap.style.width = width + 'px';
        this.wrap.style.height = height + 'px';
        this.appendChild(this.wrap);

        // If we were given content then add it.
        if (content) {
            this.canvas = Util.renderEmoji(content, Math.max(this.width, this.height));
            this.wrap.appendChild(this.canvas);
        }

        if (shadow) {
            this.shadow = document.createElement('x-shadow');
            this.shadow.style.zIndex = 0;
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

        this.direction = 0;
        this.directionLast = 1;
        this.heading = null;
        this.backgroundX = 0;
        this.backgroundY = 0;
        this.facing = 1;
        this.destZ = -1;
        this.destX = -1;
        this.destFn = null;
        this.dests = [];
        this.cell = 0;
        this.visible = false;
    }

    touching5(obj) {
        // Width and Height is the shadow dimensions.
        let w = this.width;
        let h = this.width / 5;
        let a = w / 2;
        let b = h / 2;
        let h2 = obj.width / 5;
        
        let dx = obj.cx - this.cx;
        let dz = Math.abs((this.z - (h/2)) - (obj.z - (h2/2))) + 15

        return ((dx*dx)/(a*a)+(dz*dz)/(b*b)<=1);
    }

    /**
     * Tests whether the given Sprite is touching this Sprite. There is an optional gap 
     * parameter, which provides more of a "close too" check rather than actually touching.
     *
     * @param {Sprite} obj Another Sprite with which to test whether this Sprite is touching it.
     * @param {number} gap If provided, then if the two Sprites are within this distance, the method returns true.
     * 
     * @returns {boolean} true if this Sprite is touching the given Sprite; otherwise false.
     */
    touching2(obj, gap) {
        // Some objects are not solid, e.g. ghosts.
        if (this.ignore || obj.ignore) {
            return false;
        }
        if (obj) {
            let dx = this.cx - obj.cx;
            let dy = (this.cy - obj.cy);
            let dz = Math.abs(this.z - obj.z) + 15;
            let dist = (dx * dx) + (dy * dy) + (dz * dz);
            let rsum = (this.radius + obj.radius + (gap | 0));
            return (dist <= (rsum * rsum));
        } else {
            return false;
        }
    }
 
    /**
     * 
     * 
     * @param {*} obj 
     * @param {*} gap 
     */
    touching(obj, gap) {
        // Some objects are not solid, e.g. ghosts.
        if (this.ignore || obj.ignore) {
            return false;
        }
        if (obj) {
            let dx = this.cx - obj.cx;
            let dz = this.z - obj.z;
            let dist = (dx * dx) + (dz * dz);
            let rsum = (this.radius + obj.radius);
            return (dist <= (rsum * rsum));

            // (x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2
        } else {
            return false;
        }
    }

    /**
     * Tests whether the given Sprite is touching this Sprite.
     *
     * @param {Sprite} obj Another Sprite with which to test whether this Sprite is touching it.
     * 
     * @returns {boolean} true if this Sprite is touching the given Sprite; othewise false.
     */
    touching3(obj) {
        // Normalize the rectangular coordinates compared to the ellipse
        // having a center at 0,0 and a radius of 0.5.
        let normx0 = (obj.x - this.x) / this.width - 0.5;
        let normx1 = normx0 + obj.width / this.width;
        let normz0 = (obj.z - this.z) / this.height - 0.5;
        let normz1 = normz0 + obj.height / this.height;
        // find nearest x (left edge, right edge, 0.0)
        // find nearest y (top edge, bottom edge, 0.0)
        // if nearest x,y is inside circle of radius 0.5, then intersects
        let nearx, nearz;
        if (normx0 > 0.0) {
            // center to left of X extents
            nearx = normx0;
        } else if (normx1 < 0.0) {
            // center to right of X extents
            nearx = normx1;
        } else {
            nearx = 0.0;
        }
        if (normz0 > 0.0) {
            // center above Y extents
            nearz = normz0;
        } else if (normz1 < 0.0) {
            // center below Y extents
            nearz = normz1;
        } else {
            nearz = 0.0;
        }
        return (nearx * nearx + nearz * nearz) < 0.25;
    }

    touching4(obj) {
        // Normalize the rectangular coordinates compared to the ellipse
        // having a center at 0,0 and a radius of 0.5.
        let normx0 = (obj.x - this.x) / this.width - 0.5;
        let normx1 = normx0 + obj.width / this.width;
        let normy0 = (obj.y - this.y) / this.height - 0.5;
        let normy1 = normy0 + obj.height / this.height;
        // find nearest x (left edge, right edge, 0.0)
        // find nearest y (top edge, bottom edge, 0.0)
        // if nearest x,y is inside circle of radius 0.5, then intersects
        let nearx, neary;
        if (normx0 > 0.0) {
            // center to left of X extents
            nearx = normx0;
        } else if (normx1 < 0.0) {
            // center to right of X extents
            nearx = normx1;
        } else {
            nearx = 0.0;
        }
        if (normy0 > 0.0) {
            // center above Y extents
            neary = normy0;
        } else if (normy1 < 0.0) {
            // center below Y extents
            neary = normy1;
        } else {
            neary = 0.0;
        }
        return (nearx * nearx + neary * neary) < 0.25;
    }

    /**
     * Resets this Sprite's position to its previous position.
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
    
        // Update the style of the sprite to reflect the new position.
        let top = Math.floor(this.z / 2) - this.height - Math.floor(this.y);
        this.style.top = top + 'px';
        this.style.left = (this.x) + 'px';
        this.style.zIndex = Math.floor(this.z);
        this.canvas.style.zIndex = Math.floor(this.z);
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
  
        // If the canvas width is greater than the Sprite width, it means that the sprite
        // sheet has multiple appearances or costumes, each which relates to a facing direction.
        if (this.canvas && (this.canvas.width > this.width)) {
            // Adjust the background position to show the correct part of the sprite sheet for the direction.
            this.backgroundX = (-((this.facing - 1) * this.width));
            this.backgroundY = (-(~~(this.cell/10) * this.height));
            this.canvas.style.left = this.backgroundX + 'px';
            this.canvas.style.top = this.backgroundY + 'px';
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
                
                if (this.game.inputEnabled || (this != this.game.ego)) {
                    // This edge number is simply to stop ego. He won't leave the room.
                    if (z > 950) edge = 10;
                } else {
                    if (z > 1940) {
                        if (x < 80) {
                            edge = 2;   // Left path
                        } else if (x > 1740) {
                            edge = 5;   // Right path
                        } else if (x > 960) {
                            edge = 7;   // Right door down
                        } else {
                            edge = 8;   // Left door down.
                        }
                    }
                }
                
                // Check whether ego has walked to a door or path..
                if (z < 330) {
                    if (this == this.game.ego) {
                        // We stop user input already and allow the user to walk a bit further.
                        this.game.inputEnabled = false;
                    } else {
                        // Non-ego actor has hit wall.
                        edge = 10;
                    }
                }
                if (z < 300) {
                    // Ego has now reached the horizon, so time for a room change. The x value
                    // tells us which exit it was.
                    if (!this.game.ignoreHorizon) {
                        edge = (x < 960? 3 : 4);
                    }
                }
                
                // 1 = left edge
                // 2 = left path
                // 3 = left door up
                // 4 = right door up
                // 5 = right path
                // 6 = right edge
                // 7 = right door down
                // 8 = left door down

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