const mc = require('minecraft-protocol')
const IntermidiateClient = require('./intermidiateClient')
const IntermidiateServer = require('./intermidiateServer')

class ProxyController {
    constructor(version) {
        this.communicator = null
        this.scriptLoader = null
        this.intermidiateClient = null
        this.intermidiateServer = null
        this.version = version
    }

    get clientCreated() {
        return this.intermidiateClient != null
    }

    get serverCreated() {
        return this.intermidiateServer  != null
    }

    setScriptLoader(scriptLoader) {
        this.scriptLoader = scriptLoader
    }

    setCommunicator(communicator) {
        this.communicator = communicator
        this._setCommunicatorEvents()
    }

    _setCommunicatorEvents() {
        if (this.communicator == null) {
            return false
        }

        this.communicator.on('to_host', (data) => {
            if (!this.clientCreated) {
                return
            }
            this.intermidiateServer.emit('packet_to_host', data.data, data.meta)
        })

        this.communicator.on('to_client', (data) => {
            if (!this.serverCreated) {
                return
            }
            this.intermidiateServer.emit('packet_to_client', data.data, data.meta)
        })

        this.communicator.on('execute_script', (data) => {
            console.log('recieved execute event');
            if (!this.scriptLoader == null) {
                return
            }
            console.log('executing with', data);
            
            this.scriptLoader.executeBoatScript(data)
        })
    }

    startIntermidiateServer(settings) {
        if (this.serverCreated) {
            return false
        }
        const options = Object.assign({
            version: this.version,
        }, settings)
        this.intermidiateServer = new IntermidiateServer(options)
        this._setServerEvents()
        return true
    }

    _setServerEvents() {
        this.intermidiateServer.on('packet_to_host', (data, meta) => {
            // send packets to host through intermidiate client
            if (!this.clientCreated) {
                return
            }
            this.intermidiateClient.emit('packet_to_host', data, meta)
        })
    }

    connectIntermidiateClient(settings) {
        if (this.clientCreated) {
            return false
        }
        this.intermidiateClient = new IntermidiateClient(settings)
        this._setClientEvents()
        return true
    }

    _setClientEvents() {
        this.intermidiateClient.on('packet_to_client', (data, meta) => {
            // send packet from host to client throguh intermidiate server
            if (!this.serverCreated) {
                return
            }
            this.intermidiateServer.emit('packet_to_client', data, meta)
        })
    }
}

module.exports = ProxyController