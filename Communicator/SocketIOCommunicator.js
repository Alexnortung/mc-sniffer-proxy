const Communicator = require('./Communicator')
const ioServer = require('socket.io')

class SocketIOCommunicator extends Communicator {
    constructor(httpServer) {
        super()
        // setup socket server
        this.io = new ioServer(httpServer)
        this.io.on('connection', socket => {
            socket.on('packet_to_host', (data) => {
                this.emitToHost(data)
            })
            socket.on('packet_to_client', (data) => {
                this.emitToClient(data)
            })
            socket.on('execute_script', (data) => {
                this.executeScript(data)
            })
        })
    }
}

module.exports = SocketIOCommunicator