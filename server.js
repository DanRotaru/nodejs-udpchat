var createSocket = require('dgram').createSocket;
const server = createSocket('udp4');

const options = {
    host: '127.0.0.1',
    port: 4000
}


let listConnections = [];

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
});

server.on('message', (msg, rinfo) => {
    let messageObject = JSON.parse(msg.toString());
    
    if (messageObject.type === 'connecting') {
        listConnections.push({
            'address': rinfo.address,
            'port': rinfo.port
        });
        console.log(`New user connected with ${rinfo.address}:`, rinfo.port);
    }
    else if (messageObject.specificUser && messageObject.type !== 'connecting') {
        let specificUser = messageObject.specificUser.split(":");
        if(specificUser.length && messageObject.message !== undefined){
            let user_address = specificUser[0];
            let user_port = parseInt(specificUser[1]);

            let message = {
                'type': 'Sending',
                'message': messageObject.message
            };
            server.send(JSON.stringify(message), user_port, user_address);
            return false;
        }
    }
    
    else if (messageObject.type === 'Sending') {
        let tasks = [];
        for (let connection of listConnections) {
            if (connection.address === rinfo.address && connection.port === rinfo.port) {
                continue;
            }
            tasks.push(new Promise((resolve, reject) => {
                try {
                    resolve(server.send(msg, 0, msg.length, connection.port, connection.address));
                } catch (e) {
                    reject(e);
                }

            }));
        }
        Promise.all(tasks).then((result) => console.log('New message received'));
    } else {
        console.log('system failed to understand the message');
    }
});


server.on('listening', () => {
    var address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(options.port, options.host);