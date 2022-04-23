"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loop = void 0;
/**
 * Similar to fastdom. Prevents layout thrashing by batching DOM read and DOM write operations
 * It uses an frame-by-frame loop as its core, however.
 */
var DomAnimationLoop;
(function (DomAnimationLoop) {
    // Virtual frame number based on 60fps. Useful for throttling only. Not an actual frame number
    DomAnimationLoop.frameNumber = 0;
    DomAnimationLoop.phases = [
        {
            name: "read",
            handlers: []
        },
        {
            name: "write",
            handlers: []
        }
    ];
    // Loop isn't created till at least one event added
    DomAnimationLoop._firstEventAdded = false;
    function _startLoop() {
        // The main loop
        const loop = () => {
            DomAnimationLoop.phases.forEach(phase => {
                // slice has to be used to duplicate array in case the array is mutated while execution of callbacks is taking place
                const handlers = phase.handlers.slice(0);
                handlers.forEach(h => h.callback());
            });
            DomAnimationLoop.frameNumber++;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    function _createPhase(name) {
        return {
            name,
            handlers: []
        };
    }
    function addPhaseBefore(newPhaseName, before) {
        const existingPhase = _getPhaseIndex(before);
        const phaseToInsert = _createPhase(newPhaseName);
        DomAnimationLoop.phases.splice(existingPhase, 0, phaseToInsert);
    }
    DomAnimationLoop.addPhaseBefore = addPhaseBefore;
    function addPhaseAfter(newPhaseName, after) {
        const existingPhase = _getPhaseIndex(after);
        const phaseToInsert = _createPhase(newPhaseName);
        DomAnimationLoop.phases.splice(existingPhase + 1, 0, phaseToInsert);
    }
    DomAnimationLoop.addPhaseAfter = addPhaseAfter;
    function add(phase, callback, once, throttle) {
        if (once == null)
            once = true;
        let resultCallback = callback;
        if (once)
            resultCallback = () => { removeEventHandler(id); callback(); };
        if (throttle) {
            const originalResultCallback = resultCallback;
            resultCallback = () => {
                if ((DomAnimationLoop.frameNumber) % throttle === 0)
                    originalResultCallback();
            };
        }
        const id = _addEventHandler(phase, resultCallback);
        return id;
    }
    DomAnimationLoop.add = add;
    /**
     * Perform some kind of DOM read operation, like retrieving width or height of element
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    function read(callback, once, throttle) {
        return add("read", callback, once, throttle);
    }
    DomAnimationLoop.read = read;
    /**
     * Perform a mutate operation on the DOM. Like adding an element or changing CSS classes or style rules
     * @param callback
     * @param once Whether to run the callback once or on every frame
     * @param throttle Run every nth frame (between 0 and 59)
     */
    function write(callback, once, throttle) {
        return add("write", callback, once, throttle);
    }
    DomAnimationLoop.write = write;
    function _getPhaseIndex(name) {
        const phaseIndex = DomAnimationLoop.phases.findIndex(p => p.name === name);
        if (phaseIndex === -1) {
            throw new Error("No DOM Animation loop phase with name " + name);
        }
        return phaseIndex;
    }
    function _getPhase(name) {
        return DomAnimationLoop.phases[_getPhaseIndex(name)];
    }
    function _addEventHandler(phaseName, callback) {
        const id = Math.random();
        const phase = _getPhase(phaseName);
        phase.handlers.push({
            id,
            callback
        });
        // Initialize loop on first event
        if (!DomAnimationLoop._firstEventAdded) {
            DomAnimationLoop._firstEventAdded = true;
            _startLoop();
        }
        return id;
    }
    function removeEventHandler(id) {
        for (let i = 0; i < DomAnimationLoop.phases.length; i++) {
            const phase = DomAnimationLoop.phases[i];
            const index = phase.handlers.findIndex(h => h.id === id);
            if (index !== -1) {
                phase.handlers.splice(index, 1);
                return true;
            }
        }
        return false;
    }
    DomAnimationLoop.removeEventHandler = removeEventHandler;
})(DomAnimationLoop || (DomAnimationLoop = {}));
/* istanbul ignore next */
if (!window["_domAnimationLoop"]) // This ensures only one loop will be instantiated even if multiple bundles include this
    window["_domAnimationLoop"] = DomAnimationLoop;
/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
exports.loop = window["_domAnimationLoop"];
