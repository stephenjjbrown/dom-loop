const {performance} = require('perf_hooks');
const { replaceRaf } = require("raf-stub");

let loop;

beforeEach(() => {
    global.performance = performance;
    replaceRaf([global]);

    jest.resetModules();
    window["_domAnimationLoop"] = undefined; // Destroy previous singleton instance
    loop = require("../lib/main").loop;
});

test("Reads should always precede writes", () => {
    return expect(new Promise((resolve) => {
        let n = 10;

        // Order of operations is the test
        // 10 + 6 / 2 is not the same as 10 / 2 + 6
        // So this tests whether events are firing in the right order
        loop.write(() => {
            n += 6;
        });
        loop.read(() => {
            n = n / 2;
        });

        requestAnimationFrame.step();

        loop.read(() => {
            n = n / 2;
        });
        loop.write(() => {
            n += 6;
        });

        requestAnimationFrame.step();

        resolve(n);

    })).resolves.toEqual(11.5);
});

test("Should be able to throttle to every n frames", () => {
    return expect(new Promise(resolve => {
        let n = 2;

        loop.read(() => {
            n++;
        }, false, 2);

        requestAnimationFrame.step();
        requestAnimationFrame.step();
        requestAnimationFrame.step();
        requestAnimationFrame.step();

        resolve(n);
    })).resolves.toEqual(4);
});

test("Should be able to add custom phases before existing ones", () => {
    return expect(new Promise(resolve => {
        let n = 1;

        loop.addPhaseBefore("preread", "read");

        loop.add("preread", () => {
            n++;
        });
        loop.add("read", () => {
            n *= 2;
        });

        requestAnimationFrame.step();

        resolve(n);
    })).resolves.toEqual(4);
});

test("Should be able to add custom phases after existing ones", () => {
    return expect(new Promise(resolve => {
        let n = 1;

        loop.addPhaseAfter("calc", "read");

        loop.add("calc", () => {
            n++;
        });
        loop.add("read", () => {
            n *= 2;
        });

        requestAnimationFrame.step();

        resolve(n);
    })).resolves.toEqual(3);
});


test("Should throw if attempt to add to non-existent phase", () => {
    return expect(() => loop.add("none", () => {})).toThrow();
})

test("Should start loop only after first event handler added", () => {
    return expect(new Promise(resolve => {
        expect(loop.frameNumber).toEqual(0);

        requestAnimationFrame.step();

        expect(loop.frameNumber).toEqual(0);

        loop.read(() => null);
        loop.read(() => null);

        requestAnimationFrame.step();

        resolve(loop.frameNumber);
    })).resolves.toBe(1);
});

test("Should return false if attempting to remove event that is no longer in queue", () => {
    let { loop } = require("../lib/main");

    return expect(new Promise(resolve => {
        let n = 1;
        const id = loop.read(() => n++, false);

        requestAnimationFrame.step();
        requestAnimationFrame.step();

        expect(loop.removeEventHandler(id)).toBe(true);

        requestAnimationFrame.step();

        expect(loop.removeEventHandler(id)).toBe(false);
        
        resolve(n);
    })).resolves.toEqual(3);
    
})


test("Should re-use same instance if imported twice via different bundles or libraries on the same page", () => {
    let { loop } = require("../lib/main");

    jest.resetModules(); // Allows us to import a copy of the same module imported using require()

    const { loop: loop2 } = require("../lib/main"); // To test multiple imports on same page

    expect(loop2).toBe(loop);
})