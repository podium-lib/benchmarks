'use strict';

const { HttpIncoming } = require('@podium/utils');
const Layout = require('@podium/layout');
const http = require('http');

const layout = new Layout({
    name: 'layout',
    pathname: '/'
});

const podletA = layout.client.register({
    name: 'podlet-a',
    uri: 'http://localhost:9801/manifest.json'
});

const podletB = layout.client.register({
    name: 'podlet-b',
    uri: 'http://localhost:9802/manifest.json'
});

const podletC = layout.client.register({
    name: 'podlet-c',
    uri: 'http://localhost:9803/manifest.json'
});

const podletD = layout.client.register({
    name: 'podlet-d',
    uri: 'http://localhost:9804/manifest.json'
});

const podletE = layout.client.register({
    name: 'podlet-e',
    uri: 'http://localhost:9805/manifest.json'
});

const server = http.createServer(async (req, res) => {
    const incoming = new HttpIncoming(req, res);

    if (incoming.url.pathname !== layout.pathname()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found');
        return;
    }

    try {
        const inc = await layout.process(incoming);

        const [ a, b, c, d, e ] = await Promise.all([
            podletA.fetch(inc.context),
            podletB.fetch(inc.context),
            podletC.fetch(inc.context),
            podletD.fetch(inc.context),
            podletE.fetch(inc.context),
        ]);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`<html><body>${a} - ${b} - ${c} - ${d} - ${e}</body></html>`);
    } catch(error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal server error');
    }
});

server.listen(9800, 'localhost', () => {
    // console.log(`Server running at http://localhost:9800/`);
});
