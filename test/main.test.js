const {performance} = require('perf_hooks');
const { loop } = require("../lib/main");
const { replaceRaf } = require("raf-stub");

beforeEach(() => {
    global.performance = performance;
    replaceRaf([global]);
});

test("Reads should always precede writes", () => {
    return expect(new Promise((resolve) => {
        let n = 10;

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