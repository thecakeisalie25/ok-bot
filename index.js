const   Discord = require('discord.js');
const   client = new Discord.Client();
const   {prefix, token, admin} = require ('./config.json');

var     pollschannel;
var     activepoll = false;
var     pollstarter;
var     votes = [];
var     userhasvoted = false;
var     votetotal;
var     yvotes = 0;
var     nvotes = 0;

// When ON log to console.
client.on('ready', () => 
    {
    console.log('---Alright, we\'re up and running!---');
    client.user.setActivity(`for commands`, {type:'WATCHING'});
    pollschannel = client.channels.get('392098161054711808');
    // console.log(pollschannel);
    });

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    console.log(message.content);
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift()/*.toLowercase()*/;

    switch (command)
    {
            // console.log(message.content);
            case "status":

                message.channel.send(`i'm doin ok.`);
            
            break;

            case "members":

                message.channel.send(`${message.guild.name} has (${message.guild.memberCount}) members`);
            
            break;

            case "whoami":

                message.channel.send(`You are ${message.author.username}\nAnd your ID is ${message.author.id}`);
            
            break;

            case "kill":

                if (message.author.id === admin)
                { // @thecakeisalie25#0517 at current time of writing
                    message.channel.send(`k lol bye`);
                    return client.destroy();
                }
                else {message.channel.send(`fuck off`);}
            
            break;

            case "whois":
        
                if(!message.mentions.users.size)
                {
                    message.channel.send(`Nope, try again!`);
                }
                else if(message.mentions.users.size === 1)
                {
                    message.channel.send(`They are ${message.mentions.users.first().username}\nAnd their ID is ${message.mentions.users.first().id}`);
                }
                else{message.channel.send(`nah :b:`);}
            
            break;

            case "wip-id":
        
                if(message.author.id === admin)
                {
                    message.channel.send(`you are the boi`);
                }
                else
                {
                    message.channel.send(`you are NOT the boi`);
                }
            
            break;

            case "args":
        
                if (!args.length)
                {
                    return message.channel.send(`dude you gotta give me SOMETHING to work with here.`);
                }
                else if (args[0] === 'ok')
                {
                    return message.channel.send(`ok`);
                }
                message.channel.send(`uwu u thot: ${args[0]}`);
            
            break;

            case "isthot":
        
                if(args[0] === '@everyone' || args[0] === '@here')
                {
                    return message.channel.send(`${message.author.username} tried to ping everyone, and is hereby declared a MEGATHOT!`);
                }
                else if(!message.mentions.users.size)
                {
                    return message.channel.send(`yep, nobody is a thot. good thinking. (mention a user, idiot)`);
                }
                const taggedUser = message.mentions.users.first();
        
                message.channel.send(`${taggedUser} is a thot!`);
            
            break;

            case "avatar":
        
                if (!message.mentions.users.size) 
                {
                    return message.channel.send(`lookin like a thot as always: ${message.author.displayAvatarURL}`);
                }
                const avatarList = message.mentions.users.map(user => {
                    return `${user.username}'s avatar: ${user.displayAvatarURL}`;
                });
                message.channel.send(avatarList);
            
            break;

            case "vote":

                if (message.guild)
                {
                    message.reply(`Public voting is disallowed, please DM the bot instead.`);
                    message.delete();
                    message.author.send(`Vote here with ${prefix}vote <y or n>`);
                }
                else if (!activepoll)
                {
                    message.reply(`There's no active poll, but I love the enthusiasm!`);
                }
                else if (!args.length)
                {
                    message.reply(`You can vote on the active poll using ${prefix}vote <y or n>\nFor reference, the active poll: ${activepoll}`);
                }
                else if (args[0] !== "y" && args[0] !== "n")
                {
                    message.reply(`I'm not the smartest bot, please use y or n only.`)
                }
                else if (args[0]  == "y" || args[0]  == "n") // TODO Actually track votes
                {
                    for(var i = 0; i < votes.length; i++)
                    {
                        if(votes[i][0].id == message.author.id)
                        {
                            message.channel.send(`Sorry, you've voted on this poll before.`);
                            userhasvoted = true
                        }
                    }
                    if(!userhasvoted)
                    {
                        votes.push([message.author, args[0]]);
                        message.reply(`Your vote has been counted.`)
                    }
                    
                }

            break;

            case "poll": // ok.poll | ok.poll [Is the earth flat?] | ok.poll stop

                if (!args.length)
                {
                    if (activepoll)
                    {
                        message.channel.send(activepoll);
                    }
                    else if (!activepoll)
                    {
                        message.channel.send(`There is no active poll. You can start one by writing a question after ${prefix}poll.`);
                    }
                }
                else if (args[0] == "end")
                {
                    if (message.author.id == pollstarter.id || message.author.id == admin)
                    {
                        activepoll = false;
                        pollstarter = null;
                        message.channel.send(`Alright, poll unset.`);

                        for(var i = 0; i < votes.length; i++)
                        {
                            if(votes[i][1] == "y")
                            {
                                votetotal++;
                                yvotes++;
                            }
                            else if(votes[i][1] == "n")
                            {
                                votetotal--;
                                nvotes++;
                            }
                            else
                            {
                                pollschannel.send("There was an error recounting votes. Vote counting will continue, but may not be accurate.");
                            }
                        }

                        pollschannel.send(`Voting results: ${votetotal}\nVotes are calculated as (y - n)\nVotes for yes: ${yvotes}\nVotes for no: ${nvotes}`);

                    }
                    else
                    { // make it so that you can only end a poll in a guild and also make it so that it prints the results
                        message.channel.send(`You didn't start this poll, so you can't end it. If they've forgotten, message Larson.`); 
                    }
                }
                else
                {
                    activepoll = message.content.slice(prefix.length + 5);
                    pollstarter = message.author;
                    message.channel.send(`Alright, poll set. Do ${prefix}end to close the voting and display the results.`);
                }

            break;
}})

client.login(token);