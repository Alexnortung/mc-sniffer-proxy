const EventEmitter = require('events')

class Communicator extends EventEmitter {
    constructor() {
        super()
    }

    emitToHost(data) {
        this.emit('to_host', data)
    }

    emitToClient(data) {
        this.emit('to_client', data)
    }

    executeScript(data) {
        this.emit('execute_script', data)
    }
}

module.exports = Communicator