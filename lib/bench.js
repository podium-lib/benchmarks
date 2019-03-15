'use strict'

const autocannon = require('autocannon')
const path = require('path');
const cp = require('child_process');

const fire = ({ url, title = '', track = false } = {}) => {
    return new Promise((resolve, reject) => {
        const load = autocannon({
            connections: 100,
            pipelining: 10,
            duration: 10,
            title,
            url,
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });

        if (track) {
            autocannon.track(load);
        }
    })
}

const run = async ({ instanses = [], url, title = '' } = {}) => {
    // Warm up
    await fire({ url, title });
    try {
    } catch (error) {
        return error;
    }

    // Run benchmark
    try {
        const result = await fire({ url, title, track: true });
        instanses.forEach(instanse => {
            instanse.kill('SIGINT');
        });
        return result;
    } catch (error) {
        return error;
    }
}

const print = (title) => {
    console.log('\n=========================================================');
    console.log(`Running ${title}:`);
    return title;
}

const benchmarks = async () => {
    await run({
        instanses: [
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9801]),
        ],
        title: print('simple podlet benchmark'),
        url: 'http://localhost:9801',
    });

    await run({
        instanses: [
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9801]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'layout-simple-server.js'), [9800]),
        ],
        title: print('simple layout benchmark'),
        url: 'http://localhost:9800',
    });

    await run({
        instanses: [
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9801]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9802]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9803]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9804]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'podlet-server.js'), [9805]),
            cp.fork(path.join(__dirname, '..', 'benchmarks', 'layout-complex-server.js'), [9800]),
        ],
        title: print('complex layout benchmark'),
        url: 'http://localhost:9800',
    });
}

benchmarks();

