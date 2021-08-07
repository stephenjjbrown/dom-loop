[![Build Status](https://travis-ci.com/stephenjjbrown/dom-loop.svg?branch=master)](https://travis-ci.com/stephenjjbrown/dom-loop)
[![codecov](https://codecov.io/gh/stephenjjbrown/dom-loop/branch/master/graph/badge.svg?token=VR1J8CFN0N)](https://codecov.io/gh/stephenjjbrown/dom-loop)
[![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-green.svg)](https://wallabyjs.com)

# DOM Animation Loop

Batches DOM read/write operations within a constant animation loop to prevent [layout thrashing](https://blog.idrsolutions.com/2014/08/beware-javascript-layout-thrashing/) and allow for smooth animation of DOM elements.

---

## Basic usage

Install using ```npm install dom-loop --save```

Queue an action to run in either the read or write phase of the next animation frame using ```read()``` and ```write()```

```js
import { loop } from "dom-loop";

const myElement1 = document.querySelector("#myElement1");
const myElement2 = document.querySelector("#myElement2");

let height;

loop.read(() => {
    // Read from the DOM
    height = myElement1.clientHeight;
});

loop.write(() => {
    // Write to the DOM
    myElement.style.height = `${height}px`;
});
```

---

## Read or write every frame

By default, actions queued in the read or write phases only run once on the next frame. You can have those actions run every frame indefinitely, by specifying ```false``` as the second parameter

```js
// This value will be read and updated every frame until stopped
loop.read(() => {
    height = myElement.clientHeight;
}, false);
```

To stop the action from running any further, store the action's ID and call ```removeEventHandler()```:

```js
const id = loop.read(() => height = myElement.clientHeight, false);

loop.removeEventHandler(id);
```

---

## Read or write every nth frame

The third parameter in ```read()`` and ```write()``` controls which frames to run on. The following example runs every 2nd frame (using *frameCount modulo 2*);

```js
// Runs every other frame
loop.read(() => {
    height = myElement.clientHeight;
}, false, 2);
```

---

## Custom phases

By default, the loop batches operations in a read phase and a write phase. You can add any number of custom phases as needed.

```js
// Adds a new phase called "calc" before the write phase
loop.addPhaseBefore("calc", "write");

// Use add() to queue an action into a custom-defined phase
loop.add("calc", () => {
    height = height * 2;
});
```

---