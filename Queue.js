class Queue {
    
    /**
     * Constructor for Queue.
     */
    constructor() {
        this.maxSize = 30000;
        this.container = new Uint16Array(this.maxSize);
        this.eIndex = 0;
        this.dIndex = 0;
    }

    /**
     * Tests if the queue is empty.
     * 
     * @returns {boolean} true if the queue is empty, otherwise false.
     */
    isEmpty() {
        return this.eIndex == this.dIndex;
    }

    /**
     * Adds a value to the queue.
     * 
     * @param {number} val The value to add to the queue.
     */
    enqueue(val) {
        this.container[this.eIndex++] = val;
        if (this.eIndex == this.maxSize)
            this.eIndex = 0;
    }

    /**
     * Removes a value from the queue.
     * 
     * @returns {number} The number popped from the queue.
     */
    dequeue() {
        if (this.dIndex == this.maxSize)
            this.dIndex = 0;
        return this.container[this.dIndex++]; 
    }
}