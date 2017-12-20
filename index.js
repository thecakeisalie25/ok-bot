const Discord = require('discord.js');
const client = new Discord.Client();
// When ON log to console.
client.on('ready', () => {
    console.log('Alright, we\'re up and running!')
});

client.on('message', message => {
    console.log(message.content);
})

client.login('MzkyMDkzNzg0NzgwODMyNzY4.DRuCBQ._0nwbTTceac3PRhecXyJa3lGnbk');