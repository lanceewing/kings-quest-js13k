class Game {

    /**
     * Constructor for Game.
     * 
     * @param {HTMLElement} screen The element in which the game screen will be rendered.
     */
    constructor(screen) {
        this.screen = screen;
        this.time = 0;
        this.defineCustomElements();
        this.userInput = new UserInput(this, screen);
        this.start();
    }

    /**
     * 
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

        // this.ego = document.createElement('x-ego');
        // this.ego.init(this);
        // this.screen.appendChild(this.ego);

        this.objs = [];

        this.userInput.enableInput();
        this.running = true;
        this.loop();
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
        this.scaleX = window.innerWidth / this.screen.offsetWidth;
        this.scaleY = window.innerHeight / this.screen.offsetHeight;
        this.screen.style.setProperty('--scale-x', this.scaleX);
        this.screen.style.setProperty('--scale-y', this.scaleY);
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
                    switch (prop[2]) {
                        case 'pod':
                            obj = new Actor(prop[3], prop[4], 'black', 0.95, 10, 'black');
                            obj.setDirection(Sprite.OUT);
                            break;
                    }
                    obj.setPosition(prop[5], 0, prop[6]);
                    break;

                case 1: // Item
                    obj = new Obj(prop[3], prop[4], prop[8]);
                    obj.item = true;
                    break;

                case 2: // Prop
                    obj = new Obj(prop[3], prop[4], prop[8]);
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
}