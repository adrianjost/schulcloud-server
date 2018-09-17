'use strict';

const ua = require('universal-analytics');
const hooks = require('./hooks');

const StatisticsModel = require('./model');

class Service {

    constructor(options) {
        this.options = options || {};
        this.docs = {};

    }

    create(data, params) {
        if(data.tid){
            let visitor = ua(data.tid);
            visitor.pageview(data).send();
        }
        let model = new StatisticsModel({
            firstPaint: data.cm1,
            timeToInteractive: data.cm2,
            pageLoaded: data.cm3,
            domInteractiveTime: data.cm4,
            domContentLoaded: data.cm5,
            downlink: data.cm6,
            connection: data.cd1,
            path: data.dp,
            dl: data.dl,
            qt: data.qt,
            cid: data.cid
        });
        return model.save()
            .then(_ => 'succes')
            .catch(err => {
                console.log(err); // eslint-disable-line no-console
                return 'err';
            });
    }

    setup(app, path) {
        this.app = app;
    }

}

module.exports = function () {
    const app = this;

    // Initialize our service with any options it requires
    app.use('/statistics', new Service());

    // Get our initialize service to that we can bind hooks
    const contentService = app.service('/statistics');

    // Set up our before hooks
    contentService.before(hooks.before);

    // Set up our after hooks
    contentService.after(hooks.after);
};

module.exports.Service = Service;
