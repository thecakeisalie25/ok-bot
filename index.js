const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require ('./config.json');
// When ON log to console.
client.on('ready', () => {
    console.log('---Alright, we\'re up and running!---')
});

client.on('message', message => {
    // console.log(message.content);
    if (message.content === `${prefix}status`){
        message.channel.send(`i\'m doin ok.`);
    }else if (message.content === `${prefix}members`) {
        message.channel.send(`${message.guild.name} has (${message.guild.memberCount}) members`);
    }else if (message.content === `${prefix}whoami`){
        message.channel.send(`You are ${message.author.username}\nAnd your ID is ${message.author.id}`);
    }
})

client.login(token);