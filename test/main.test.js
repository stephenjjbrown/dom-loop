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

// describe("DomAnimationLoop", () => {
//     it("Reads should always precede writes", () => {
//         global.requestAnimationFrame = (callback) => setTimeout(callback, 1); //?

//         //loop; //?
//         // chai; //?
//         // chaiAsPromised; //?

//         // return expect(new Promise((resolve) => {
//         //     let n = 10;

//         //     loop.write(() => {
//         //         n += 6;
//         //         resolve(n);
//         //     });
//         //     loop.read(() => {
//         //         n /= 2;
//         //     });
//         // })).to.eventually.equal(12);
        
//     });
// })