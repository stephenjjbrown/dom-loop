export interface LoopEventHandler {
    id: number;
    callback: () => void;
}
export interface LoopPhase {
    name: string;
    handlers: LoopEventHandler[];
}
/**
 * Similar to fastdom. Prevents layout thrashing by batching DOM read and DOM write operations
 * It uses an frame-by-frame loop as its core, however.
 */
declare namespace DomAnimationLoop {
    let frameNumber: number;
    const phases: LoopPhase[];
    function addPhaseBefore(newPhaseName: string, before: string): void;
    function addPhaseAfter(newPhaseName: string, after: string): void;
    function add(phase: string, callback: () => void, once?: boolean, throttle?: number): number;
    /**
     * Perform some kind of DOM read operation, like retrieving width or height of element
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    function read(callback: () => void, once?: boolean, throttle?: number): number;
    /**
     * Perform a mutate operation on the DOM. Like adding an element or changing CSS classes or style rules
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    function write(callback: () => void, once?: boolean, throttle?: number): number;
    function removeEventHandler(phaseName: string, id: number): boolean;
}
/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
export declare const loop: typeof DomAnimationLoop;
export {};
