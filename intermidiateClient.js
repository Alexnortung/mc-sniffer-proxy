const mc = require('minecraft-protocol')
const EventEmitter = require('events')

class IntermidiateClient extends EventEmitter {
    constructor(settings) {
        super()
        // connecting client when constructing
        this._client = mc.createClient(settings)
        this._setupEvents()
        console.log('intermidiate client connecting')
    }

    get ended() {
        return this._client.ended
    }

    _setupEvents() {
        // forward packets
        this._client.on('packet', (packet, metaData) => {
            if (["keep_alive"].includes(metaData.name)) {
                // do not send to client
                return
            }
            if (metaData.state === 'login') {
                return
            }
            
            // forward packets
            this.emit('packet_to_client', packet, metaData)
        })

        this.on('packet_to_host', (data, meta) => {
            // console.log(meta, data);
            
            if (typeof meta.name === 'undefined') {
                return
            }
            this._client.write(meta.name, data)
        })
    }
}

module.exports = IntermidiateClient