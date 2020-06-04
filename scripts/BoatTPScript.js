const Script = require('./Script')

class BoatTPScript extends Script {
    constructor(proxy, options) {
        super(proxy)
        const {destinationCoordinates, packets, miliseconds} = options
        this.destinationX = destinationCoordinates.x
        this.destinationZ = destinationCoordinates.z
        this.destinationY = destinationCoordinates.y
        this.maxPackets = packets
        this.miliseconds = miliseconds
        this.isExecuted = false
        this.interval = null
        // this.listenerFunction = null
    }

    getPlayerPos() {
        // returns promise
        const positionPromise = new Promise((resolve, reject) => {
            this.listenerFunction = (data, meta) => {
                // this.disablePositionListeners()
                resolve({
                    x: data.x,
                    y: data.y,
                    z: data.z,
                })
            }

            this.proxy.intermidiateServer._client.once('vehicle_move', this.listenerFunction)

        })


        return positionPromise
    }

    disablePositionListeners() {
        this.proxy.intermidiateServer._client.off('vehicle_move', this.listenerFunction)
    }

    async execute() {
        if (this.isExecuted) {
            return
        }
        this.isExecuted = true
        const playerPos = await this.getPlayerPos()
        console.log('got player position')
        if (typeof this.destinationY !== 'number') {
            this.destinationY = playerPos.y
        }
        
        const positionsGenerator = this.positions(playerPos)
        const timeBetweenPackets = this.miliseconds / this.maxPackets
        console.log(timeBetweenPackets)
        this.interval = setInterval(() => {
            // console.log('iteration');
            
            const nextMovement = positionsGenerator.next()
            if (nextMovement.done) {
                clearInterval(this.interval)
                return
            }
            // send movement packets to server
            const nextPosition = nextMovement.value
            nextPosition.pitch = 0
            this.proxy.intermidiateClient.emit('packet_to_host', nextPosition, {name: 'vehicle_move'})
            // console.log('sending packet')
        }, timeBetweenPackets);

    }

    positions = function*(startPos) {
        const diffX = this.destinationX - startPos.x
        const diffY = this.destinationY - startPos.y
        const diffZ = this.destinationZ - startPos.z
        const yaw = Math.atan2(-diffX, diffZ) * 180 / Math.PI
        for (let i = 0; i < this.maxPackets; i++) {
            yield {
                x: startPos.x + (diffX * i / this.maxPackets),
                y: startPos.y + (diffY * i / this.maxPackets),
                z: startPos.z + (diffZ * i / this.maxPackets),
                yaw: yaw,
            }
        }
    }

    abort() {
        if (this.interval != null) {
            clearInterval(this.interval)
        }
        this.disablePositionListeners()
        Script.prototype.abort.call(this)
    }
}

module.exports = BoatTPScript