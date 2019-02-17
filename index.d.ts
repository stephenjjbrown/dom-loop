export interface LoopEventHandler {
    id: number;
    callback: () => void;
}
/**
 * Similar to fastdom. Prevents layout thrashing by batching DOM read and DOM write operations
 * It uses an frame-by-frame loop as its core, however.
 */
declare class AnimationLoop {
    frameNumber: number;
    private reads;
    private writes;
    constructor();
    /**
     * Perform some kind of DOM read operation, like retrieving width or height of element
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    read(callback: () => void, once?: boolean, throttle?: number): number;
    /**
     * Perform a mutate operation on the DOM. Like adding an element or changing CSS classes or style rules
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    write(callback: () => void, once?: boolean, throttle?: number): number;
    /**
     * Remove a read callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.read() function
     */
    removeReadEventHandler(id: number): boolean;
    /**
     * Remove a write callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.write() function
     */
    removeWriteEventHandler(id: number): boolean;
    private addWriteEventHandler;
    /**
     * Keeps the frame number incrementing each frame
     */
    private increment;
    private addReadEventHandler;
    private addEventHandler;
    private removeEventHandler;
}
/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
export declare const animationLoop: AnimationLoop;
export {};
