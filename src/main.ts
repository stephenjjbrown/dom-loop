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
namespace DomAnimationLoop {
	// Virtual frame number based on 60fps. Useful for throttling only. Not an actual frame number
	export let frameNumber: number = 0;

	export const phases: LoopPhase[] = [
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
	let _firstEventAdded = false;

	function _startLoop() {
		// The main loop
		const loop = () => {
			// console.log("reads", reads); //?
			// console.log("writes", writes); //?

			phases.forEach(phase => {
				// slice has to be used to duplicate array in case the array is mutated while execution of callbacks is taking place
				const handlers = phase.handlers.slice(0);

				handlers.forEach(h => h.callback());
			});

			increment(); 

			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	function _createPhase(name: string): LoopPhase {
		return {
			name,
			handlers: []
		}
	}

	export function addPhaseBefore(newPhaseName: string, before: string) {
		const existingPhase = _getPhaseIndex(before);

		const phaseToInsert = _createPhase(newPhaseName)

		phases.splice(existingPhase, 0, phaseToInsert);
	}

	export function addPhaseAfter(newPhaseName: string, after: string) {
		const existingPhase = _getPhaseIndex(after);

		const phaseToInsert = _createPhase(newPhaseName)

		phases.splice(existingPhase + 1, 0, phaseToInsert);
	}

	export function add(phase: string, callback: () => void, once?: boolean, throttle?: number) {
		if (once == null) once = true;

		let resultCallback = callback;

		if (once)
			resultCallback = () => { removeEventHandler(phase, id); callback() };

		if (throttle) {
			const originalResultCallback = resultCallback;
			resultCallback = () => {
				if ((frameNumber) % throttle === 0)
					originalResultCallback();
			};
		}

		const id = addEventHandler(phase, resultCallback);
		return id;
	}

	/**
	 * Perform some kind of DOM read operation, like retrieving width or height of element
	 * @param callback
	 * @param once Whether to run the callback once or on every frame
	 * @param throttle Run every nth frame (between 0 and 59)
	 */
	export function read(callback: () => void, once?: boolean, throttle?: number) {
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

	/**
	 * Perform a mutate operation on the DOM. Like adding an element or changing CSS classes or style rules
	 * @param callback
	 * @param once Whether to run the callback once or on every frame
	 * @param throttle Run every nth frame (between 0 and 59)
	 */
	export function write(callback: () => void, once?: boolean, throttle?: number) {
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
		if (frameNumber === 59)
			frameNumber = 0;
		else
			frameNumber++;
	}

	// function addReadEventHandler(callback: () => void) {
	// 	return addEventHandler("read", callback);
	// }

	// function addReadEventHandler(callback: () => void) {
	// 	return addEventHandler("read", callback);
	// }

	function _getPhaseIndex(name: string) {
		const phaseIndex = phases.findIndex(p => p.name === name);

		if (phaseIndex === -1) {
			throw new Error("No DOM Animation loop phase with name " + name);
		}

		return phaseIndex;
	}

	function _getPhase(name: string) {
		return phases[_getPhaseIndex(name)];
	}

	function addEventHandler(phaseName: string, callback: () => void) {
		const id = Math.random();

		const phase = _getPhase(phaseName);

		phase.handlers.push({
			id,
			callback
		});

		// Initialize loop on first event
		if (!_firstEventAdded) {
			_startLoop();
		}

		return id;
	}

	export function removeEventHandler(phaseName: string, id: number) {
		const phase = _getPhase(phaseName);

		const index = phase.handlers.findIndex(h => h.id === id);

		if (index !== -1) {
			phase.handlers.splice(index, 1);
			return true;
		}

		return false;
	}
}

/**
 * Singleton instance of animation loop. A frame-by-frame loop used for animating DOM elements, as well as batching DOM read and write operations
 */
export const loop = DomAnimationLoop;
