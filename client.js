const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const options = {
    host: '127.0.0.1',
    port: 4000
}


var user, client_address, client_port, specificUser = false;

rl.question('Your name: ', (answer) => {
    user = answer;
    let message = JSON.stringify({'type': 'connecting'});
    client.send(message, 0, message.length, options.port, options.host);

    rl.question('--------------------\n1. General\n2. To specific user\n\nSelect your connection channel: ', room => {
        if(room == '2'){ // to specific user
            rl.question('Enter user ip:port: ', address => {
                specificUser = address;
            });
        }
    });
});



rl.on('line', (input) => {
    let msg = {
        'type': 'Sending',
        'specificUser': specificUser,  
        'address': client_address,
        'port': client_port,
        'message': `${user}: ${input}`
    }
    let message = JSON.stringify(msg);
    client.send(message, 0, message.length, options.port, options.host);
    console.log(`${user}: ${input}`);
});


client.on('message', (msg, rinfo) => {
    let messageObject = JSON.parse(msg.toString());
    if (messageObject.type === 'close') {
        console.log(Buffer.from(messageObject.message).toString());
        process.exit();
    } else if (messageObject.type === 'Sending') {
        console.log(Buffer.from(messageObject.message).toString());
    } else {
        console.log('unknown message');
    }
});

client.on('listening', () => {
    const address = client.address();
    client_address = address.address;
    client_port = address.port;
});

// On client error
client.on('error', (err) => {
    console.log(`client error:\n${err.stack}`);
});

