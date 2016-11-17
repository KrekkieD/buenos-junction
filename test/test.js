var $buenosJunction = require('../index');

// var $buenosHttps = require('buenos-https');
// var $httpProxy = require('http-proxy');
// var $express = require('express');

var junctionServer = $buenosJunction.create({
    proxy: {
        secure: false
    }
});

junctionServer.addJunction('/ams/checkout-beta', 'http://localhost.klm.com:8080');
junctionServer.addJunction(undefined, 'https://www.ute3.klm.com');

// var proxy = $httpProxy.createProxyServer({ secure: false });

// proxy.on('error', () => {
//     console.log('Unable to forward proxy request. Server down?');
// });

// var app = $express();
// app.use(function(req, res) {
//     if (req.url.indexOf('/ams/checkout-beta') === 0) {
//         proxy.web(req, res, { target: 'http://localhost.klm.com:8080' });
//     } else {
//         proxy.web(req, res, { target: 'https://www.ute3.klm.com' });
//     }
// });
// $buenosHttps(app).listen(8100);
junctionServer.listen(8100);
