class Queue {
    
    constructor() {
        this.maxSize = 20000;
        this.container = new Uint16Array(this.maxSize);
        this.eIndex = 0;
        this.dIndex = 0;
    }

    isEmpty() {
        return this.eIndex == this.dIndex;
    }

    enqueue(val) {
        if (this.eIndex + 1 == this.dIndex || (this.eIndex + 1 == this.maxSize && this.dIndex == 0))
            throw "Queue overflow";
        this.container[this.eIndex++] = val;
        if (this.eIndex == this.maxSize)
            this.eIndex = 0;
    }

    dequeue() {
        if (this.dIndex == this.maxSize)
            this.dIndex = 0;
        if (this.dIndex == this.eIndex)
            throw "The queue is empty";
        return this.container[this.dIndex++]; 
    }
}