const mc = require('minecraft-protocol')
const EventEmitter = require('events')

class IntermidiateServer extends EventEmitter {
    constructor(settings) {
        const port = settings.port || 25565
        const version = settings.version
        super()
        this._client = null
        this._server = mc.createServer({ // create a server for us to connect to
            'online-mode': false,
            encryption: true,
            version: version,
            port: port,
            'max-players': 1,
        });
        console.log('server started')
        this._setupEvents()
    }

    _setupEvents() {
        this._server.on('login', (newProxyClient) => {
            // newProxyClient.write('login', {
            //     entityId: 666,
            //     levelType: 'default',
            //     gameMode: 0,
            //     dimension: 0,
            //     difficulty: 2,
            //     maxPlayers: 1,
            //     reducedDebugInfo: false
            // });

            newProxyClient.on('packet', (data, meta) => {
                // send packet to host unless it is keep-alive packets
                if (meta.name == "keep_alive") {
                    // do not send to client
                    return
                }
                // console.log(data, meta)
                this.emit('packet_to_host', data, meta)
            });
            newProxyClient.on('error', (...data) => {
                console.log('ERROR: ', data)
            })

            this._client = newProxyClient;
            this._client.on('end', () => {
                this._client = null
            })

            console.log('client connected')
            this.emit('login', newProxyClient)
        });

        this.on('packet_to_client', (data,meta) => {
            if (this._client != null) {
                this._client.write(meta.name, data)
            }
        })
    }

    kickPlayer() {
        if (this._client == null) {
            return false
        }
        this._client.end('You were kicked from the proxy')
    }

    stopServer() {
        // not implemented
    }
}

module.exports = IntermidiateServer