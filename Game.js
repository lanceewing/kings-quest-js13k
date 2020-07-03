class Game {

    actors = [];

    inventory = {};
    
    verb = 'Walk to';
    
    command = 'Walk to';   // Current constructed command, either full or partial
    
    thing = '';

    time = 0;

    score = 0;

    itemsLeft = 0;

    itemIcons = {
        'seed'    : '🌱',
        'bowl'    : '🥣',
        'carrot'  : '🥕',
        'cheese'  : '🧀',
        'money'   : '💰',
        'clover'  : '🍀',
        'dagger'  : '🗡',
        'egg'     : '🥚',
        'fiddle'  : '🎻',
        'mirror'  : '🔍',
        'mushroom': '🍄',
        'note'    : '📄',
        'pouch'   : '👜',
        'sceptre' : '🦯',
        'shield'  : '🛡',
        'bow'     : '🏹',
        'walnut'  : '🌰'
    };

    rooms = [
        // 1 = left/west
        // 2 = right/east
        // 3 = down/south
        // 4 = up/north
        [0, 0, 0, 0, 0], // Well
        [0, 0, 0, 0, 0], // Well
        [0, 0, 0, 0, 0], // Well
        [0, 0, 0, 0, 0], // Beanstalk - first
        [0, 0, 0, 0, 0], // Beanstalk - second
        [0, 0, 0, 0, 0], // Beanstalk - third (cloud entry)
        [0, 0, 0, 0, 0], // Cloud entry
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Skyland
        [0, 0, 0, 0, 0], // Sky cave - top
        [0, 0, 0, 0, 0], // Sky cave - mid
        [0, 0, 0, 0, 0], // Sky cave - bottom
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Leprechaun cave
        [0, 0, 0, 0, 0], // Castle - entry
        [0, 0, 0, 0, 0], // Castle - throne
        [0, 0, 0, 0, 0], // Tree branch (nest/egg)
        [0, 0, 0, 0, 0], // Woodcutter's house
        [0, 0, 0, 0, 0], // Witches house
        [0, 0, 0, 0, 0], // Small cave ?
        [0, 0, 0, 0, 0], // (spare)
        [0, 0, 0, 0, 0]  // (spare)
        // Daventry rooms from this point (48 of them)
    ];

    props = [
        // Room#, type, name, content, width, height, x, y, element reference
        // Other potential settings (not currently used): zindex, colour
        // types: 0 = actor, 1 = item, 2 = prop, 3 = light prop, 4 = dark prop, 5 = no shadow prop

        // Room 30
        [ 31, 2, 'tree', '🌳', 400, 400, 10,  895, null ],
        [ 31, 3, 'tree', '🌲', 240, 170, 770, 850, null ],
        [ 31, 4, 'tree', '🌲', 230, 150, 700, 830, null ],
        [ 31, 2, 'tree', '🌳', 230, 75,  460, 630, null ],
        [ 31, 4, 'tree', '🌲', 230, 130, 580, 605, null ],
        [ 31, 3, 'tree', '🌲', 230, 150, 500, 610, null ],
        [ 31, 4, 'tree', '🌲', 180, 70,  810, 380, null ],
        [ 31, 2, 'tree', '🌲', 180, 90,  740, 385, null ],
        [ 31, 4, 'tree', '🌲', 180, 70,  550, 385, null ],
        [ 31, 2, 'tree', '🌲', 180, 90,  480, 390, null ],
        [ 31, 3, 'tree', '🌲', 180, 110, 300, 810, null ],
        [ 31, 4, 'tree', '🌳', 180, 70,  280, 840, null ],

        [ 31, 5, 'cloud', '☁', 200, 50, 50, 130, null ],
        [ 31, 5, 'cloud', '☁', 200, 50, 450, 130, null ],

        // Room 31

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
        this.commands = document.getElementById('commands');
        this.msg = document.getElementById('msg');
        this.defineCustomElements();
        this.userInput = new UserInput(this, screen);
        this.logic = new Logic(this);
        this.buildMap();
        this.start();
    }

    /**
     * Builds the map for the Daventry outside rooms.
     */
    buildMap() {
        // Daventry map starts at room 30.
        for (let room=31; room<79; room++) {
            let roomX = (room % 8);
            let roomY = ~~(room / 8);
            this.rooms[room-1] = [
                0, 
                (roomY * 8) + ((roomX - 1) & 0xF),  // Left
                (roomY * 8) + ((roomX + 1) & 0xF),  // Right
                (((roomY + 1) & 0xF) * 8) + roomX,  // Down
                (((roomY - 1) & 0xF) * 8) + roomX,  // Up
            ];
        }
    }

    /**
     * Defines the custom HTML elements that we use in the game.
     */
    defineCustomElements() {
        customElements.define('x-sprite', Sprite);
        customElements.define('x-ego', Ego);
        customElements.define('x-shadow', class Shadow extends HTMLElement {});
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

        this.commands.querySelectorAll('*').forEach(verb => {
            verb.onclick = e => this.command = this.verb = e.target.dataset.name;
        });

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
            this.obj.forEach(obj => obj.remove());
        }
        
        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 31;
        
        // Starting inventory.
        this.getItem('dagger');
        this.getItem('seed');
        this.getItem('carrot');
        this.getItem('cheese');
        this.getItem('clover');
        this.getItem('egg');
        this.getItem('pouch');
        this.getItem('shield');
        this.getItem('walnut');
        this.getItem('bowl');
        this.getItem('money');
        this.getItem('fiddle');
        this.getItem('mirror');
        this.getItem('bow');
        this.getItem('note');
        this.getItem('sceptre');
        this.getItem('mushroom');
  
        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 150);
        this.ego.setPosition(550, 0, 850);
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
        this.objs = this.objs.filter(o => o !== obj);
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

        // Update sentence.
        if (!this._gameOver) {
            this.sentence.innerHTML = this.command + ' ' + this.thing;
        } else {
            this.sentence.innerHTML = 'Game Over';
        }

        this.userInput.processUserInput(this.ego);

        // If after updating all objects, the room that Ego says it is in is different
        // than what it was previously in, then we trigger entry in to the new room.
        if (this.ego.room != this.room) {
            let game = this;
            this.room = this.ego.room;
            this.fadeOut(this.screen);
            setTimeout(function() {
                game.newRoom();
            }, 200);
        }

        // Update cursor and overlay based on user input state.
        this.overlay.style.display = (this.inputEnabled? 'none' : 'block');
        this.wrap.style.cursor = (this.inputEnabled? 'crosshair' : 'wait');
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
     * The main method invoked on every animation frame when the game is unpaused. It 
     * interates through all of the Sprites and invokes their update method. The update
     * method will invoke the move method if the calculated position has changed. This
     * method then tests if the Sprite is touching another Sprite. If it is, it invokes
     * the hit method on both Sprites. 
     */
    updateObjects() {
        let i = -1, j, a1 = this.ego, a2;
        let objsLen = this.objs.length;

        // Iterate over all of the Sprites in the current room, invoking update on each on.
        for (; ;) {
            if (a1) {
                a1.update();

                // Check if the Sprite is touching another Sprite.
                for (j = i + 1; j < objsLen; j++) {
                    a2 = this.objs[j];
                    if (a2 && a1.touching(a2)) {
                        // If it is touching, then invoke hit on both Sprites. They might take 
                        // different actions in response to the hit.
                        a1.hit(a2);
                        a2.hit(a1);
                    }
                }

                // Clears the Sprite's moved flag, which is only of use to the hit method.
                a1.moved = false;
            }

            if (++i < objsLen) {
                a1 = this.objs[i];
            } else {
                break;
            }
        }
    }

    /**
     * Adds the given points to the current score.
     * 
     * @param {number} points The number of points to increment the score by.
     */
    addToScore(points) {
        this.score += points;
        this.scoreEl.innerHTML = '' + this.score + ' of 135';
    }
      
    /**
     * Processes the current user interaction.
     * 
     * @param {MouseEvent} e The mouse event that trigger the command to process.
     */
    processCommand(e) {
        if (this.inputEnabled && !this._gameOver) {
          this.command = this.logic.process(this.verb, this.command, this.thing, e);
          if (this.command == this.verb) {
            this.command = this.verb = 'Walk to';
          }
        }
        if (e) e.stopPropagation();
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        // Remove the previous room's Objs from the screen.
        this.objs.forEach(obj => obj.remove());
        this.objs = [];

        this.roomData = this.rooms[this.room - 1];

        // Add props
        this.props.forEach(prop => {
            if (prop[0] == this.room) this.addPropToRoom(prop);
        });

        // Add event listeners for objects in the room.
        [...this.screen.children].forEach(obj => this.addObjEventListeners(obj));

        this.fadeIn(this.screen);
        this.ego.show();
        this.fadeIn(this.ego);

        this.inputEnabled = true;
    }

    /**
     * Adds the given prop to the current room screen.
     * 
     * @param {Array} prop 
     */
    addPropToRoom(prop) {
        let obj;

        // Room#, type, name, content, width, height, x, y, element reference

        // We cache the obj when it isn't in the dom rather than recreate. It might remember it's state.
        obj = prop[8];

        if (!obj) {
            // Switch on the type of prop
            switch (prop[1]) {
                case 0: // Actor
                    break;

                case 1: // Item
                    obj = new Sprite();
                    obj.init(this, prop[4], prop[5], prop[3]);
                    obj.item = true;
                    break;

                case 2: // Prop
                case 3:
                case 4:
                    obj = new Sprite();
                    obj.init(this, prop[4], prop[5], prop[3]);
                    break;

                case 5: // Prop without shadow
                    obj = new Sprite();
                    obj.init(this, prop[4], prop[5], prop[3], false);
                    false;
            }

            if (prop[1] == 3) {
                obj.classList.add('light');
            }
            if (prop[1] == 4) {
                obj.classList.add('dark');
            }

            let name = prop[2];
            if (name.startsWith('#')) {
                // If name starts with # then it is a unique prop/item.
                obj.id = name = prop[2].substring(1);

            } else {
                // If this is not a unique object, then we set a class.
                obj.classList.add(name);

                // If the name contains _ then we also split on this and add classes for
                // each part, e.g. for green_key we add "green" and "key".
                if (name.indexOf('_') > -1) {
                    name.split('_').forEach(part => obj.classList.add(part));
                }
            }

            // Some names have _ in them, e.g. green_key, but we use "green key" in sentences.
            obj.dataset.name = name.replace('_', ' ');

            obj.propData = prop;
            obj.setPosition(prop[6], 0, prop[7]);
            prop[8] = obj;
        }

        this.add(obj);
    }

    /**
     * Adds the necessarily event listens to the given element to allow it to be 
     * interacted with as an object in the current room.
     * 
     * @param {HTMLElement} elem The HTMLElement to add the object event listeners to.
     */
    addObjEventListeners(elem) {
        // It is important that we don't use addEventListener in this case. We need to overwrite
        // the event handler on entering each room.
        elem.onmouseenter = e => this.objMouseEnter(e);
        elem.onmouseleave = e => this.objMouseLeave(e);
        elem.onclick = e => this.objClicked(e);
    }

    /**
     * Handles a mouse enter event.
     * 
     * @param {MouseEvent} e 
     */
    objMouseEnter(e) {
        this.thing = (e.target.dataset.name? e.target.dataset.name : (e.target.id? e.target.id.replace('_',' ') : e.target.className));
    }

    /**
     * Handles a mouse leave event.
     * 
     * @param {MouseEvent} e 
     */
    objMouseLeave(e) {
        this.thing = '';
    }

    /**
     * Handles a mouse click event.
     * 
     * @param {MouseEvent} e 
     */
    objClicked(e) {
        this.thing = (e.target.dataset.name? e.target.dataset.name : (e.target.id? e.target.id.replace('_',' ') : e.target.className));
        this.processCommand(e);
    }
      
    /**
     * Adds the given item to the inventory.
     * 
     * @param {string} name The name of the item to add to the inventory.
     */
    getItem(name) {
        let item = document.createElement('span');
        item.innerHTML = this.itemIcons[name];
        item.dataset.name = name;
        this.items.appendChild(item);

        item.onmouseenter = e => this.objMouseEnter(e);
        item.onmouseleave = e => this.objMouseLeave(e);
        item.onclick = e => this.objClicked(e);

        this.inventory[name] = item;
    }

    /**
     * Checks if the given item is in the inventory.
     * 
     * @param {string} name The name of the item to check is in the inventory.
     */
    hasItem(name) {
        return this.inventory.hasOwnProperty(name);
    }

    /**
     * Removes the given item from the inventory.
     * 
     * @param {string} name The name of the item to drop.
     */
    dropItem(name) {
        let item = this.inventory[name];
        this.items.removeChild(item);
        delete this.inventory[name];
    }

    /**
     * Handles scrolling of the inventory list.
     * 
     * @param {number} dir The direction to scroll the inventory.
     */
    scrollInv(dir) {
        let newLeft = this.itemsLeft + (77 * dir);
        let invCount = this.items.children.length;
        if ((newLeft <= 0) && (newLeft >= -((invCount - 6) * 77))) {
            this.itemsLeft = newLeft;
            this.items.style.left = this.itemsLeft + 'px';
        }
    }

    /**
     * Fades in the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade in.
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
     * @param {HTMLElement} elem The DOM Element to fade out.
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