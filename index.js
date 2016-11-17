var $buenosHttps = require('buenos-https');
var $httpProxy = require('http-proxy');
var $express = require('express');

module.exports = JunctionServer;
JunctionServer.create = create;


function create(config) {

    return new JunctionServer(config);

}

function JunctionServer(config) {

    config.server = config.server || {};

    var self = this;

    self.addJunction = addJunction;
    self.listen = listen;

    self.proxy = undefined;
    self.junctionApp = undefined;

    self.server = undefined;

    self.junctions = [];
    self.defaultJunction = undefined;

    _init();

    function addJunction(condition, action, isDefaultJunction) {

        var junction = new Junction();
        junction.setCondition(condition);
        junction.setAction(action);

        if (isDefaultJunction) {
            if (typeof self.defaultJunction === 'undefined') {
                self.defaultJunction = junction;
            }
            else {
                throw new Error('Can only set one defaultJunction');
            }
        }
        else {
            self.junctions.push(junction);
        }

        return junction;

    }

    function listen() {

        var args = Array.prototype.slice.call(arguments);
        return self.server.listen.apply(self.server, args);

    }

    function _init() {

        _createProxyServer();
        _createJunctionServer();

    }

    function _createProxyServer() {

        self.proxy = $httpProxy.createProxyServer(config.proxy);

    }

    function _createJunctionServer() {

        self.junctionApp = $express();
        self.junctionApp.use(_junctionRequest);

        self.server = self.junctionApp;

        if (config.server.secure) {
            self.server = $buenosHttps(self.junctionApp);
        }

    }

    function _junctionRequest(req, res) {

        var dispatched = false;
        for (var i = 0; i < self.junctions.length && !dispatched; i++) {

            if (self.junctions[i].condition(req)) {
                dispatched = true;
                self.proxy.web(req, res, self.junctions[i].action);
            }

        }

        if (!dispatched && self.defaultJunction) {
            self.proxy.web(req, res, self.defaultJunction.action);
        }

    }

}

function Junction() {

    var self = this;

    self.setCondition = setCondition;
    self.setAction = setAction;

    self.condition = undefined;
    self.action = undefined;

    function setCondition(condition) {

        if (typeof condition === 'string') {

            self.condition = req => req.url.indexOf(condition) === 0;

        } else if (typeof condition === 'function') {

            self.condition = condition;

        } else {

            self.condition = () => {
                throw new Error('Junction condition should be a string or a function and can only be omitted for the defaultJunction');
            };

        }

    }

    function setAction(action) {

        if (typeof action === 'string') {

            self.action = {
                target: action
            };

        } else if (typeof action === 'object') {

            self.action = action;

        } else {

            throw new Error('Junction action should be a string or an object');

        }

    }

}
