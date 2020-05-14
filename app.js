require('dotenv').config()
const mc = require('minecraft-protocol')
const fs = require('fs')

const version = '1.12.2'

// console.log(process.env)
let client = mc.createClient({
    skipValidation: true,
    host: '2b2t.org',
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    clientToken: process.env.CLIENTTOKEN,
    accessToken: process.env.ACCESSTOKEN,
    version: version,
})

let playerId
let proxyClient
let storedPackets = []

client.on('packet', (packet, metaData) => {
    if (metaData.name === 'login') {
        playerId = packet.entityId
        console.log('logged in')
    }
    // if (metaData.name === 'team') {
    //     console.log(packet, metaData)
    //     return
    // }
    if (metaData.name === 'teams' && packet.mode === 0) {
        // console.log(packet.players)
        // fs.writeFile('./players.json', JSON.stringify(packet.players), (err) => {
        //     if (err) {
        //         console.log('could not write file', err)
        //     }
        // })
        packet.players.push('Null_boi')
    } else if (metaData.name === 'teams') {
        return
    }
    // return
    if (proxyClient) {
        filterPacketAndSend(packet, metaData, proxyClient)
    } else {
        storePacket(packet, metaData)
    }
    if (metaData.name == 'player_info') {
        return
    }
    if (
        [
            'map_chunk', 
            'chat', 
            'playerlist_header', 
            'update_time',
        ].includes(metaData.name)
        ) {
        return
    }
    console.log(packet, metaData)
})

server = mc.createServer({ // create a server for us to connect to
    'online-mode': false,
    encryption: true,
    version: version,
    'max-players': 1,
});

server.on('login', (newProxyClient) => { // handle login
    // console.log(client)
    newProxyClient.write('login', {
        entityId: playerId,
        levelType: 'default',
        gameMode: 0,
        dimension: 0,
        difficulty: 2,
        maxPlayers: server.maxPlayers,
        reducedDebugInfo: false
    });
    sendStoredPackets(newProxyClient)
    // newProxyClient.write('position', {
    //     x: 0,
    //     y: 1.62,
    //     z: 0,
    //     yaw: 0,
    //     pitch: 0,
    //     flags: 0x00
    // });

    newProxyClient.on('packet', (data, meta) => { // redirect everything we do to 2b2t
        filterPacketAndSend(data, meta, client);
    });

    proxyClient = newProxyClient;
});


function storePacket(packet, metaData) {
    if (['encryption_begin', 'compress', 'success', 'custom_payload'].includes(metaData.name)) {
        return
    }
    storedPackets.push({packet: packet, metaData: metaData})
}

function sendStoredPackets(proxyClient) {
    storedPackets.forEach(packetData => {
        // proxyClient.write(packetData.metaData.name, packetData.packet)
        filterPacketAndSend(packetData.packet, packetData.metaData, proxyClient)
    });
    delete storedPackets
}

//function to filter out some packets that would make us disconnect otherwise.
//this is where you could filter out packets with sign data to prevent chunk bans.
function filterPacketAndSend(data, meta, dest) {
    if (meta.name === 'window_items') {
        console.log('ABORTING WINDOW ITEMS', data)
        return
    }
    if (meta.name === 'set_slot') {
        console.log('ABORTING SET ITEM!', data)
        return
    }
    if (meta.name !="keep_alive" && meta.name !="update_time") { //keep alive packets are handled by the client we created, so if we were to forward them, the minecraft client would respond too and the server would kick us for responding twice.
        dest.write(meta.name, data);
    }
}