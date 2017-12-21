const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require ('./config.json');
// When ON log to console.
client.on('ready', () => {
    console.log('---Alright, we\'re up and running!---')
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // console.log(message.content);
    if (message.content === `${prefix}status`){
        message.channel.send(`i\'m doin ok.`);
    }else if (message.content === `${prefix}members`){
        message.channel.send(`${message.guild.name} has (${message.guild.memberCount}) members`);
    }else if (message.content === `${prefix}whoami`){
        message.channel.send(`You are ${message.author.username}\nAnd your ID is ${message.author.id}`);
    }else if (message.content === `${prefix}kill`){
        if (message.author.id === `134509976956829697`){
            client.destroy();
        }
        else {message.channel.send(`fuck off`);}
    }
})
client.login(token);