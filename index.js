const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require ('./config.json');
// When ON log to console.
client.on('ready', () => {
    console.log('---Alright, we\'re up and running!---')
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    console.log(message.content);
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // console.log(message.content);
          if (command === 'status'){
        message.channel.send(`i'm doin ok.`);
    }else if (command === 'members'){
        message.channel.send(`${message.guild.name} has (${message.guild.memberCount}) members`);
    }else if (command === 'whoami'){
        message.channel.send(`You are ${message.author.username}\nAnd your ID is ${message.author.id}`);
    }else if (command === 'kill'){
        if (message.author.id === `134509976956829697`){
            message.channel.send(`k lol bye`);
            return client.destroy();
        }
        else {message.channel.send(`fuck off`);}
    }else if (command === 'whois'){
        if(!message.mentions.users.size){message.channel.send(`Nope, try again!`);}
        else if(message.mentions.users.size === 1){message.channel.send(`They are ${message.mentions.users.first().username}\nAnd their ID is ${message.mentions.users.first().id}`);}
        else{message.channel.send(`nah :b:`);}
    }else if(command === 'wip-id'){
        // TODO WIP meant to get a user by id and get username from that.
        if(message.author.id === `134509976956829697`){
            message.channel.send(`you are the boi`);
        }else{message.channel.send(`you are NOT the boi`);}
    }else if(command === 'args'){
        if (!args.length){return message.channel.send(`dude you gotta give me SOMETHING to work with here.`)}
        else if (args[0] === 'ok'){return message.channel.send(`ok`)}
        message.channel.send(`uwu u thot: ${args[0]}`)
    }else if(command === 'isthot'){
        if(args[0] === '@everyone'){return message.channel.send(`${message.author.username} tried to ping everyone, and is hereby declared a MEGATHOT!`);}
        else if(!message.mentions.users.size){return message.channel.send(`yep, nobody is a thot. good thinking. (mention a user, idiot)`);}
        const taggedUser = message.mentions.users.first();
        message.channel.send(`${taggedUser} is a thot!`);
    }
})

client.login(token);