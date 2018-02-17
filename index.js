const   Discord = require('discord.js');
const   client = new Discord.Client();
const   {prefix, token, admin} = require ('./config.json');

var     pollschannel;
var     activepoll = false;
var     pollstarter;
var     votes = [];
var     userhasvoted = false;
var     yvotes = 0;
var     nvotes = 0;
var     plus = "";
var     pollsendid = [];
var     pollsendidexists = false;

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
                { 
                    message.channel.send(`k lol bye`);
                    client.destroy();
                    process.kill();
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
                    message.channel.send(`Public voting is disallowed, please DM the bot instead.`);
                    message.delete();
                    message.author.send(`Vote here with \`${prefix}vote\` <y or n>`);
                }
                else if (!activepoll)
                {
                    message.reply(`There's no active poll, but I love the enthusiasm!`);
                }
                else if (!args.length)
                {
                    message.reply(`You can vote on the active poll using \`${prefix}vote\` <y or n>\nFor reference, the active poll: ${activepoll}`);
                }
                else if (args[0] !== "y" && args[0] !== "n")
                {
                    message.reply(`I'm not the smartest bot, please use y or n only.`);
                }
                else if (args[0]  == "y" || args[0]  == "n")
                {
                    for(var i = 0; i < votes.length; i++)
                    {
                        if(votes[i][0].id == message.author.id)
                        {
                            message.channel.send(`Sorry, you've voted on this poll before.`);
                            userhasvoted = true;
                        }
                    }
                    if(!userhasvoted)
                    {
                        votes.push([message.author, args[0]]);
                        message.reply(`Your vote has been counted.`);
                    }
                    userhasvoted = false;                    
                }

            break;

            case "poll": // ok.poll | ok.poll [Is the earth flat?] | ok.poll end
            case "polls":

                if (!args.length)
                {
                    if (activepoll)
                    {
                        message.channel.send(activepoll);
                    }
                    else if (!activepoll)
                    {
                        message.channel.send(`There is no active poll. You can start one by writing a question after \`${prefix}poll\`.`);
                    }
                }
                else if (args[0] == "end")
                {
                    if (message.author.id == pollstarter.id || message.author.id == admin)
                    {
                        message.channel.send(`Alright, poll unset. Results have been posted in ${pollschannel}`);

                        for(var i = 0; i < votes.length; i++)
                        {
                            if(votes[i][1] == "y")
                            {
                                yvotes++;
                            }
                            else if(votes[i][1] == "n")
                            {
                                nvotes++;
                            }
                            else
                            {
                                pollschannel.send("There was an error recounting votes. Vote counting will continue, but may not be accurate.");
                                pollschannel.send(`This error occurs when a vote is recorded as neither y nor n.`);
                            }
                        }

                        if( yvotes - nvotes > 0 )
                        {
                            plus = "+";
                        }
                        else
                        {
                            plus = "";
                        }
                        pollschannel.send(`${activepoll}`);
                        pollschannel.send(`Voting results: ${plus}${yvotes - nvotes}`);
                        pollschannel.send(`Votes for yes: ${yvotes}`);
                        pollschannel.send(`Votes for no: ${nvotes}`);

                        activepoll = false;
                        pollstarter;
                        votes = [];
                        userhasvoted = false;
                        yvotes = 0;
                        nvotes = 0;
                        plus = "";
                        pollsendid = [];
                        pollsendidexists = false;
                    }
                    else
                    { // make it so that you can only end a poll in a guild and also make it so that it prints the results
                        message.channel.send(`You didn't start this poll, so you can't end it. If they've forgotten, message Larson.`); 
                    }
                }
                else
                {
                    if(message.channel.id == pollschannel.id)
                    {
                        activepoll = message.content.slice(prefix.length + 5);
                        pollstarter = message.author;
                        message.channel.send(`Poll: ${activepoll}`);
                        message.delete();
                        message.channel.send(`Use \`${prefix}poll end\` to stop the poll and show the results.`);
                    }
                    else
                    {
                        message.channel.send(`Sorry, you must start polls in the polls chat.`);
                    }
                }

            break;

            case "pollsend":
            case "pollschat":
            case "anonchat":

            if (message.guild)
            {
                message.channel.send(`Sorry, this command is only usable via DM`);
                message.delete();
                break;
            }
            for (var i = 0; i < pollsendid.length; i++) // Check to see if the user has an existing pollsendid.
            {
                if (pollsendid[i][0].id == message.author.id) // If so...
                {
                    pollschannel.send(`${pollsendid[i][1]}: ${args.toString()}`) // Send the message with the pre-existing pollsendid.
                    pollsendidexists = true; // Make sure we don't make them a new one.
                }
            }
            if (!pollsendidexists) // If not...
            {
                pollsendid.push([message.author, Math.floor(Math.random() * 50)]) // Store their entire user object (bite me) and a generated pollsendid for them.
                pollschannel.send(`${pollsendid[pollsendid.length - 1][1]}: ${args.toString()}`) // Send the message they were trying to send in the first place.
                message.author.send(`Your ID is ${pollsendid[pollsendid.length-1][1]}`) // Send them their ID only when they make a new one.
            }
            pollsendidexists = false; // Make sure to get that squared away.

            break;

            case "eval":

                if(message.author.id == admin)
                {
                    eval(args.toString());
                }
                else
                {
                    message.channel.send("nope, next time try being larson.");
                }

            break;

            case "ok":

                message.delete();
                message.channel.send("ok.");

            break;
}})

client.login(token);