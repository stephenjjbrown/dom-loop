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
    // const reads: LoopEventHandler[] = [];
    // const writes: LoopEventHandler[] = [];
    // Loop isn't created till at least one event added
    var _firstEventAdded = false;
    function _startLoop() {
        // The main loop
        var loop = function () {
            // console.log("reads", reads); //?
            // console.log("writes", writes); //?
            DomAnimationLoop.phases.forEach(function (phase) {
                // slice has to be used to duplicate array in case the array is mutated while execution of callbacks is taking place
                var handlers = phase.handlers.slice(0);
                handlers.forEach(function (h) { return h.callback(); });
            });
            increment();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    function _createPhase(name) {
        return {
            name: name,
            handlers: []
        };
    }
    function addPhaseBefore(newPhaseName, before) {
        var existingPhase = _getPhaseIndex(before);
        var phaseToInsert = _createPhase(newPhaseName);
        DomAnimationLoop.phases.splice(existingPhase, 0, phaseToInsert);
    }
    DomAnimationLoop.addPhaseBefore = addPhaseBefore;
    function addPhaseAfter(newPhaseName, after) {
        var existingPhase = _getPhaseIndex(after);
        var phaseToInsert = _createPhase(newPhaseName);
        DomAnimationLoop.phases.splice(existingPhase + 1, 0, phaseToInsert);
    }
    DomAnimationLoop.addPhaseAfter = addPhaseAfter;
    function add(phase, callback, once, throttle) {
        if (once == null)
            once = true;
        var resultCallback = callback;
        if (once)
            resultCallback = function () { removeEventHandler(phase, id); callback(); };
        if (throttle) {
            var originalResultCallback_1 = resultCallback;
            resultCallback = function () {
                if ((DomAnimationLoop.frameNumber) % throttle === 0)
                    originalResultCallback_1();
            };
        }
        var id = addEventHandler(phase, resultCallback);
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
        // if (once == null) once = true;
        // let resultCallback = callback;
        // if (once)
        // 	resultCallback = () => { removeReadEventHandler(id); callback() };
        // if (throttle) {
        // 	const originalResultCallback = resultCallback;
        // 	resultCallback = () => {
        // 		if ((frameNumber) % throttle === 0)
        // 			originalResultCallback();
        // 	};
        // }
        // const id = addReadEventHandler(resultCallback);
        // return id;
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
        // if (once == null) once = true;
        // let resultCallback = callback;
        // if (once)
        // 	resultCallback = () => { removeWriteEventHandler(id); callback()};
        // if (throttle) {
        // 	const originalResultCallback = resultCallback;
        // 	resultCallback = () => {
        // 		if ((frameNumber) % throttle === 0)
        // 			originalResultCallback();
        // 	};
        // }
        // const id = addWriteEventHandler(resultCallback);
        // return id;
    }
    DomAnimationLoop.write = write;
    /**
     * Remove a read callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.read() function
     */
    // export function removeReadEventHandler(id: number) {
    // 	return removeEventHandler(reads, id);
    // }
    /**
     * Remove a write callback that has been scheduled
     * @param id Callback ID, returned from animationLoop.write() function
     */
    // export function removeWriteEventHandler(id: number) {
    // 	return removeEventHandler(writes, id);
    // }
    // function addWriteEventHandler(callback: () => void) {
    // 	return addEventHandler("write", callback);
    // }
    /**
     * Keeps the frame number incrementing each frame
     */
    function increment() {
        if (DomAnimationLoop.frameNumber === 59)
            DomAnimationLoop.frameNumber = 0;
        else
            DomAnimationLoop.frameNumber++;
    }
    // function addReadEventHandler(callback: () => void) {
    // 	return addEventHandler("read", callback);
    // }
    // function addReadEventHandler(callback: () => void) {
    // 	return addEventHandler("read", callback);
    // }
    function _getPhaseIndex(name) {
        var phaseIndex = DomAnimationLoop.phases.findIndex(function (p) { return p.name === name; });
        if (phaseIndex === -1) {
            throw new Error("No DOM Animation loop phase with name " + name);
        }
        return phaseIndex;
    }
    function _getPhase(name) {
        return DomAnimationLoop.phases[_getPhaseIndex(name)];
    }
    function addEventHandler(phaseName, callback) {
        var id = Math.random();
        var phase = _getPhase(phaseName);
        phase.handlers.push({
            id: id,
            callback: callback
        });
        // Initialize loop on first event
        if (!_firstEventAdded) {
            _startLoop();
        }
        return id;
    }
    function removeEventHandler(phaseName, id) {
        var phase = _getPhase(phaseName);
        var index = phase.handlers.findIndex(function (h) { return h.id === id; });
        if (index !== -1) {
            phase.handlers.splice(index, 1);
            return true;
        }
        return false;
    }
    DomAnimationLoop.removeEventHandler = removeEventHandler;
})(DomAnimationLoop || (DomAnimationLoop = {}));
/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
exports.loop = DomAnimationLoop;
