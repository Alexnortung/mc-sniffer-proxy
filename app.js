require('dotenv').config()
const mc = require('minecraft-protocol')
const fs = require('fs')
const ProxyController = require('./ProxyController')
const SocketIOCommunicator = require('./Communicator/SocketIOCommunicator')
const ScriptLoader = require('./scripts/ScriptLoader')

const version = '1.12.2'

// console.log(process.env)
let clientSettings = {
    // skipValidation: true,
    host: 'localhost',
    port: 25565,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    clientToken: process.env.CLIENTTOKEN,
    accessToken: process.env.ACCESSTOKEN,
    // session: null,
    version: version,
}

const httpServer = require('http').createServer()
httpServer.listen(8080)
const socketCommunicator = new SocketIOCommunicator(httpServer)
const proxy = new ProxyController(version)
const scriptLoader = new ScriptLoader(proxy)
proxy.setScriptLoader(scriptLoader)
proxy.setCommunicator(socketCommunicator)
proxy.startIntermidiateServer({
    port: 25566
})
proxy.intermidiateServer.on('login', () => {
    // connect to host
    proxy.connectIntermidiateClient(clientSettings)
})



