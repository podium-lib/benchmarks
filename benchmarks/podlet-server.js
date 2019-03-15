'use strict';

const { HttpIncoming } = require('@podium/utils');
const Podlet = require('@podium/podlet');
const http = require('http');

const port = process.argv[2] ? process.argv[2] : 9801;

const podlet = new Podlet({
    pathname: '/',
    fallback: '/fallback',
    version: `2.0.0-${Date.now().toString()}`,
    name: 'podlet-a',
    development: false,
});

podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

const server = http.createServer(async (req, res) => {
    const incoming = new HttpIncoming(req, res);
    const inc = await podlet.process(incoming);

    if (inc.url.pathname === podlet.content()) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('podlet-version', podlet.version);
        res.end(inc.render('Content'));
        return;
    }

    if (inc.url.pathname === podlet.fallback()) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('podlet-version', podlet.version);
        res.end(inc.render('Fallback'));
        return;
    }

    if (inc.url.pathname === '/manifest.json') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('podlet-version', podlet.version);
        res.end(JSON.stringify(podlet));
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
});

server.listen(port, 'localhost', () => {
    // console.log(`Server running at http://localhost:${port}/`);
});

