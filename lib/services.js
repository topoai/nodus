'use strict';

// ** Libraries
const Component = require('./components.js').Component;

class Service extends Component {
    constructor(name) {
        super();

        this.name = name;
        this.isStarted = false;
    }

    start() {
        // ** Check if we are already started
        if (this.isStarted)
            throw errors('ALREADY_STARTED');

        // ** Ensure that we are loaded
        if (!this.isLoaded)
            this.load();

        this.emit('start', this);

        this.isStarted = true;
        this.emit('started', this);
    }

    stop() {
        // ** Ensure we are started
        if (this.isStarted === false)
            throw errors('NOT_STARTED');

        this.emit('stop', this);

        this.isStarted = false;
        this.emit('stopped', this);
    }

    unload() {
        // ** Stop the service before unloading
        if (this.isStarted)
            this.stop();

        super.unload();
    }
}

module.exports.Service = Service;