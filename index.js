const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require ('./config.json');
const arrayid = [`134509976956829697`,`120264409934200832`]
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
            message.channel.send(`k lol bye`);
            client.destroy();
        }
        else {message.channel.send(`fuck off`);}
    }else if (message.content.startsWith(`${prefix}whois`)){
        if(!message.mentions.users.size){message.channel.send(`Nope, try again!`);}
        else if(message.mentions.users.size === 1){message.channel.send(`They are ${message.mentions.users.first().username}\nAnd their ID is ${message.mentions.users.first().id}`);}
        else{message.channel.send(`nah :b:`);}
    }else if(message.content === `${prefix}wip-id`){
        // WIP meant to get a user by id and get username from that.
        if(message.author.id === `134509976956829697`){
            message.channel.send(`you are the boi`);
        }else{message.channel.send(`you are NOT the boi`);}
    }else if(arrayid.contains(`${args[0]}`)){message.channel.send(`yeah`)}

})
client.login(token);