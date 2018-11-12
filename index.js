/**
 * Similar to fastdom. Prevents layout thrashing by batching DOM read and DOM write operations
 * It uses an frame-by-frame loop as its core, however.
 */
class AnimationLoop {
    constructor() {
        // Virtual frame number based on 60fps. Useful for throttling only. Not an actual frame number
        this.frameNumber = 0;
        this.reads = [];
        this.writes = [];
        // The main loop
        const loop = () => {
            // slice has to be used to duplicate array in case the array is mutated while execution of callbacks is taking place
            this.reads.slice(0).forEach(h => h.callback());
            this.writes.slice(0).forEach(h => h.callback());
            this.increment();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    /**
     * Perform some kind of DOM read operation, like retrieving width or height of element
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    read(callback, once, throttle) {
        if (once == null)
            once = false;
        let resultCallback = callback;
        if (once)
            resultCallback = () => this.removeReadEventHandler(id), callback();
        if (throttle) {
            const originalResultCallback = resultCallback;
            resultCallback = () => {
                if ((this.frameNumber) % throttle === 0)
                    originalResultCallback();
            };
        }
        const id = this.addReadEventHandler(resultCallback);
        return id;
    }
    /**
     * Perform a mutate operation on the DOM. Like adding an element or changing CSS classes or style rules
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    write(callback, once, throttle) {
        if (once == null)
            once = false;
        let resultCallback = callback;
        if (once)
            resultCallback = () => this.removeWriteEventHandler(id), callback();
        if (throttle) {
            const originalResultCallback = resultCallback;
            resultCallback = () => {
                if ((this.frameNumber) % throttle === 0)
                    originalResultCallback();
            };
        }
        const id = this.addWriteEventHandler(resultCallback);
        return id;
    }
    /**
     * Remove a read callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.read() function
     */
    removeReadEventHandler(id) {
        return this.removeEventHandler(this.reads, id);
    }
    /**
     * Remove a write callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.write() function
     */
    removeWriteEventHandler(id) {
        return this.removeEventHandler(this.writes, id);
    }
    addWriteEventHandler(callback) {
        return this.addEventHandler(this.writes, callback);
    }
    /**
     * Keeps the frame number incrementing each frame
     */
    increment() {
        if (this.frameNumber === 59)
            this.frameNumber = 0;
        else
            this.frameNumber++;
    }
    addReadEventHandler(callback) {
        return this.addEventHandler(this.reads, callback);
    }
    addEventHandler(eventArray, callback) {
        const id = Math.random();
        eventArray.push({
            id,
            callback
        });
        return id;
    }
    removeEventHandler(eventArray, id) {
        const index = eventArray.findIndex(h => h.id === id);
        if (index !== -1) {
            eventArray.splice(index, 1);
            return true;
        }
        return false;
    }
}
/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
export const animationLoop = new AnimationLoop();
