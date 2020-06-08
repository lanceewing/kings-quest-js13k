class Game {

    actors = [];

    inventory = {};
    
    verb = 'Walk to';
    
    command = 'Walk to';   // Current constructed command, either full or partial
    
    thing = '';

    time = 0;

    score = 0;

    itemTop = -1;

    rooms = [
        []
    ];

    props = [
      // Room#, type, name, width, height, x, y, element reference, unique?
      // Other potential settings (not currently used): zindex, colour
      // types: 0 = actor, 1 = item, 2 = prop


    ];

    flags = {};

    _gameOver = true;

    inputEnabled = false;

    /**
     * Constructor for Game.
     */
    constructor() {
        this.screen = document.getElementById('screen');
        this.wrap = document.getElementById('wrap');
        this.overlay = document.getElementById('overlay');
        this.scoreEl = document.getElementById('score');
        this.items = document.getElementById('itemlist');
        this.sentence = document.getElementById('sentence');
        this.controls = document.getElementById('controls');
        this.msg = document.getElementById('msg');
        this.defineCustomElements();
        this.userInput = new UserInput(this, screen);
        this.start();
    }

    /**
     * Defines the custom HTML elements that we use in the game.
     */
    defineCustomElements() {
        customElements.define('x-sprite', Sprite);
        customElements.define('x-ego', Ego);
    }

    /**
     * Starts the game.
     */
    start() {
        this.resizeScreen();
        window.onresize = e => this.resizeScreen(e);

        this.userInput.enableInput();

        // Register click event listeners for item list arrow buttons.
        document.getElementById("up").onclick = e => this.scrollInv(1);
        document.getElementById("down").onclick = e => this.scrollInv(-1);

        this.running = true;
        this.init();

        this.loop();
    }

    /**
     * Initialised the parts of the game that need initialising on both
     * the initial start and then subsequent restarts. 
     */
    init() {
        this._gameOver = false;
        this.inputEnabled = true;
        this.time = 0;
  
        window.onclick = null;
  
        this.screen.onclick = e => this.processCommand(e);
  
        // For restarts, we'll need to remove the objects from the screen.
        if (this.objs) {
          for (let i=0; i<this.objs.length; i++) {
            this.objs[i].remove();
          }
        }
        
        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 1;
        
        // Starting inventory.
        //this.getItem('dagger');
  
        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 50);
        this.ego.setPosition(234, 0, 600);
        this.ego.nesw = 1;
        this.screen.appendChild(this.ego);
  
        // Enter the starting room.
        this.newRoom();
        
        // Fade in the whole screen at the start.
        this.fadeIn(this.wrap);
    }

    /**
     * Adds a Sprite to the game.
     * 
     * @param {Sprite} obj The Sprite to add to the game.
     */
    add(obj) {
        this.screen.appendChild(obj);
        this.objs.push(obj);
    }

    /**
     * Removes a Sprite from the game.
     * 
     * @param {Sprite} obj  The Sprite to remove from the game.
     */
    remove(obj) {
        // Remove the Sprite from the screen.
        try {
            this.screen.removeChild(obj);
        } catch (e) {
            // Ignore. We don't care if it has already been removed.
        }

        // Remove the Sprite from our list of managed objects.
        let i = this.objs.indexOf(obj);
        if (i != -1) {
            this.objs.splice(i, 1);
        }
    }

    /**
     * Scales the screen div to fit the whole screen.
     * 
     * @param {UIEvent} The resize event.
     */
    resizeScreen(e) {
        this.scaleX = window.innerWidth / this.wrap.offsetWidth;
        this.scaleY = window.innerHeight / this.wrap.offsetHeight;
        this.wrap.style.setProperty('--scale-x', this.scaleX);
        this.wrap.style.setProperty('--scale-y', this.scaleY);
    }

    /**
     * This is the main game loop, in theory executed on every animation frame.
     *
     * @param {number} now Time. The delta of this value is used to calculate the movements of Sprites.
     */
    loop(now) {
        // Immediately request another invocation on the next.
        requestAnimationFrame(now => this.loop(now));

        // Calculates the time since the last invocation of the game loop.
        this.updateDelta(now);

        // Update all objects on the screen.
        this.updateObjects();



        this.userInput.processUserInput();
    }

    /**
     * Updates the delta, which is the difference between the last time and now. Both values
     * are provided by the requestAnimationFrame call to the game loop. The last time is the
     * value from the previous frame, and now is the value for the current frame. The difference
     * between them is the delta, which is the time between the two frames.
     * 
     * @param {number} now The current time provided in the invocation of the game loop.
     */
    updateDelta(now) {
        if (now) {
            this.delta = now - (this.lastTime ? this.lastTime : (now - 16));
            this.stepFactor = this.delta * 0.06;
            this.lastTime = now;
            this.time += this.delta;
        }
    }

    /**
     * 
     */
    updateObjects() {

        //this.ego.update(this);

    }

    /**
     * Adds the given points to the current score.
     */
    addToScore(points) {
        this.score += points;
        this.scoreEl.innerHTML = '' + this.score + ' of 135';
    }
      
    /**
     * Processes the current user interaction.
     */
    processCommand(e) {
        if (this.inputEnabled && !this._gameOver) {
          this.command = $.Logic.process(this.verb, this.command, this.thing, e);
          //if (e) e.stopPropagation();
          if (this.command == this.verb) {
            this.command = this.verb = 'Walk to';
          }
        }
        // TODO: Why didn't I have this here when userInput was disabled?
        if (e) e.stopPropagation();
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        // Remove the previous room's Objs from the screen.
        for (let i = 0; i < this.objs.length; i++) {
            this.objs[i].remove();
        }
        this.objs = [];

        this.roomData = this.rooms[this.room - 1];

        // Add props
        for (let i = 0; i < this.props.length; i++) {
            let prop = this.props[i];

            // Is this prop in the current room?
            if (prop[0] == this.room) {
                this.addPropToRoom(prop);
            }
        }

        // Add event listeners for objects in the room.
        // TODO: Need to put overlay outside screen.
        let screenObjs = this.screen.children;
        for (let i = 0; i < screenObjs.length; i++) {
            this.addObjEventListeners(screenObjs[i]);
        }

        this.fadeIn(this.screen);
        this.ego.show();
        this.fadeIn(this.ego);
    }

    /**
     * Adds the given prop to the current room screen.
     */
    addPropToRoom(prop) {
        let obj;

        // We cache the obj when it isn't in the dom rather than recreate. It might remember it's state.
        obj = prop[7];

        if (!obj) {
            // Switch on the type of prop
            switch (prop[1]) {
                case 0: // Actor
                    break;

                case 1: // Item
                    obj = new Sprite();
                    obj.init(this, prop[3], prop[4]);
                    obj.item = true;
                    break;

                case 2: // Prop
                    obj = new Sprite();
                    obj.init(this, prop[3], prop[4]);
                    break;
            }

            // If the name has a _ then use parts of id to add class names.
            if (prop[2].indexOf('_') > -1) {
                let parts = prop[2].split('_');
                for (let i = 0; i < parts.length; i++) {
                    obj.elem.classList.add(parts[i]);
                }
            }

            if (prop[8]) {
                // If this is a unique object, then we set the id.
                $[prop[2]] = obj;
                obj.elem.id = prop[2];
            } else {
                // If this is not a unique object, then we set a class.
                obj.elem.classList.add(prop[2]);
            }
            obj.elem.dataset.name = prop[2].replace('_', ' ');

            obj.propData = prop;
            obj.add();
            obj.setPosition(prop[5], 0, prop[6]);
            prop[7] = obj;
        }
        else {
            obj.add();
        }

        this.objs.push(obj);
    }

    /**
     * Adds the necessarily event listens to the given element to allow it to be 
     * interacted with as an object in the current room.
     */
    addObjEventListeners(elem) {
        // It is important that we don't use addEventListener in this case. We need to overwrite
        // the event handler on entering each room.
        elem.onmouseenter = e => this.objMouseEnter(e);
        elem.onmouseleave = e => this.objMouseLeave(e);
        elem.onclick = e => this.objClicked(e);
    }

    /**
     * 
     * @param {*} e 
     */
    objMouseEnter(e) {
        this.thing = (e.target.dataset.name? e.target.dataset.name : (e.target.id? e.target.id.replace('_',' ') : e.target.className));
    }

    /**
     * 
     * @param {*} e 
     */
    objMouseLeave(e) {
        this.thing = '';
    }

    /**
     * 
     * @param {*} e 
     */
    objClicked(e) {
        this.thing = (e.target.dataset.name? e.target.dataset.name : (e.target.id? e.target.id.replace('_',' ') : e.target.className));
        this.processCommand(e);
    }
      
    /**
     * Adds the given item to the inventory.
     */
    getItem(name) {
        let item = document.createElement('div');
        item.innerHTML = name;
        this.items.appendChild(item);

        item.onmouseenter = e => this.objMouseEnter(e);
        item.onmouseleave = e => this.objMouseLeave(e);
        item.onclick = e => this.objClicked(e);

        this.inventory[name] = item;
    }

    /**
     * Checks if the given item is in the inventory.
     */
    hasItem(name) {
        return this.inventory.hasOwnProperty(name);
    }

    /**
     * Removes the given item from the inventory.
     */
    dropItem(name) {
        let item = this.inventory[name];
        this.items.removeChild(item);
        delete this.inventory[name];
    }

    /**
     * Handles scrolling of the inventory list.
     * 
     * @param {number} dir
     */
    scrollInv(dir) {
        let newTop = this.itemTop + (91 * dir);
        let invCount = this.items.children.length;
        if ((newTop <= -1) && (newTop > -((invCount - 4) * 91))) {
            this.itemTop = newTop;
            this.items.style.left = this.itemTop + 'px';
        }
    }

    /**
     * Fades in the given DOM Element.
     * 
     * @param {Object} elem The DOM Element to fade in.
     */
    fadeIn(elem) {
        // Remove any previous transition.
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 1.0;
        setTimeout(function () {
            // This is so that other css styles can set transitions on the element
            // while we're not fading in.
            elem.style.removeProperty('transition');
        }, 700);
    }
      
    /**
     * Fades out the given DOM Element.
     * 
     * @param {Object} elem The DOM Element to fade out.
     */
    fadeOut(elem) {
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 0.0;
    }
  
    /**
     * Shakes the screen.
     */
    shakeScreen() {
        let screen = this.screen;
        screen.classList.add('shake');
        setTimeout(function() {
            screen.classList.remove('shake');
        }, 1000);
    }
}