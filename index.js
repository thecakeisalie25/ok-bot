const  {prefix, token, admin, pollschannelid, wednesdaychannelid} = require ('./config.json');
const   Discord     = require('discord.js');
const   Sequelize   = require('sequelize');
const   querystring = require('querystring');
const   client      = new Discord.Client();

const   sequelize = new Sequelize('database', 'user', 'password', 
{
    host:       'localhost',
    dialect:    'sqlite',
    logging:     false,
    storage:    'database.sqlite',
});

const   thots = sequelize.define('thots', {
    userid:     Sequelize.STRING ,
    count:      Sequelize.INTEGER,
    megathot:   Sequelize.BOOLEAN,
}) 

let     adminuser;
let     pollschannel;

let     activepoll      = false;
let     pollstarter;
let     votes           = [];
let     userhasvoted    = false;
let     yvotes          = 0;
let     nvotes          = 0;
let     plus            = "";
let     pollsendid      = [];
let     pollidexists    = false;

const   adminonly       = false;
const   wednesday       = false;

// When ON log to console.
client.on('ready', () => 
    {
    console.log('---Alright, we\'re up and running!---');
    client.user.setActivity(`for commands`, {type:'WATCHING'});
    
    pollschannel    = client.channels.get(pollschannelid);
    wednesdaychat   = client.channels.get(wednesdaychannelid);
    adminuser       = client.users.get(admin);

    /*if (process.argv[2] == "wednesday")
    {
        wednesdaychat.send(`it is wednesday, my dudes.`)
        client.destroy();
        process.exitCode = 0;
    }*/

    thots.sync();
    });

client.on('message', async message => {
    if (message.author.bot) return;
    if (new Date().getDay() == 3 && message.channel.id == wednesdaychat.id && message.content.toLocaleLowerCase().includes("w") && wednesday)
    {
        message.channel.send(`hey.\ni noticed your message had a "w" in it.\ndid you know?\nit is wednesday, my dudes.`);
    };
    if (!message.content.startsWith(prefix)) return;
    if (adminonly && (message.author.id !== adminuser.id)) return;
    console.log(`${message.author.username}: ${message.content}`);
    const args      = message.content.slice(prefix.length).split(/ +/);
    const command   = args.shift();
    const argslist  = args.join(` `);

    switch (command)
    {
            case "status":

                message.channel.send(`i'm doin ok.`);
            
            break;

            case "members":

                message.channel.send(`${message.guild.name} has (${message.guild.memberCount}) members`);
            
            break;

            case "kill":

                if (message.author.id === admin)
                { 
                    message.channel.send(`k lol bye`);
                    client.user.setActivity(`myself die`, {type:'WATCHING'});
                    client.destroy();
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
            case "thot":
        
                if(args[0] === '@everyone' || args[0] === '@here')
                {
                    thots.update({megathot:true}, {where: {userid: message.author.id}});
                    return message.channel.send(`${message.author.username} tried to ping everyone, and is hereby declared a megathot.`);
                }
                else if(message.mentions.users.size !== 1)
                {
                    return message.channel.send(`tag a user. not two users, and not zero users. don't even think about 3 users.`);
                }
                const thotmention = message.mentions.users.first();
                const thot = await thots.findOne({where: {userid: thotmention.id}});
                if(thot)
                {
                    thot.increment('count');
                    message.channel.send(`${thotmention} is a thot, as determined by ${thot.get('count')} people so far.`);
                }
                else
                {
                    thots.create({
                        userid: thotmention.id,
                        count: 1,
                        megathot: false,
                    })
                    message.channel.send(`${thotmention} is a thot. thot patrol is now tracking.`);
                }
                            
            break;

            case "notathot":
            case "destroythot":

                if (message.author.id !== adminuser.id)
                {
                    message.channel.send(`you must be a registered member of the thot patrol.`);
                }
                else if (message.mentions.users.size !== 1)
                {
                    message.channel.send(`nope, try again.`);
                }
                else
                {
                    message.channel.send(`are you sure you want us to throw away this dood's records?`).then(() =>
                    {
                        const filter = m => message.author.id == m.author.id;

                        message.channel.awaitMessages(filter, {time:10000, maxMatches: 1, errors: ['time']})
                            .then(messages =>
                                {
                                    if (messages.first().content.startsWith(`y`))
                                    {
                                        thots.destroy({where: {userid: message.mentions.users.first().id}});
                                        message.channel.send(`alright, reset.`)
                                    }
                                    else
                                    {
                                        message.channel.send(`alright, cancelled.`);
                                    }
                                })
                            .catch((error) => 
                                {
                                    message.channel.send(`error: you took too long, idiot.`);
                                    console.log(error);
                                });
                    });
                }

            break;

            case "thotleaderboard":
            case "listthots":
            case "listhots":
            case "lsthots":
            case "thotlist":

                const thotlist  = await thots.findAll({attributes: [`userid`, `count`]});
                thotlist.sort(function (a,b)
                    {
                        return b.count - a.count;
                    });
                thotlist.forEach(function(element, index, array)
                {
                    const thotuser = client.users.get(element.userid);
                    message.channel.send(`${index+1}. ${thotuser.username}: ${element.count}`)
                })
                if(!thotlist.length) message.channel.send("http://i1.kym-cdn.com/photos/images/newsfeed/000/770/675/627.png")

            break;

            case "destroyallthots":
                
                if (message.author.id !== adminuser.id)
                    {
                        return message.channel.send(`you must be a registered member of the thot patrol.`);
                    }
                message.channel.send(`you sure b?`).then(() =>
                {
                    const filter = m => message.author.id == m.author.id;

                    message.channel.awaitMessages(filter, {time:10000, maxMatches: 1, errors: ['time']})
                        .then(messages =>
                            {
                                if (messages.first().content.startsWith(`y`))
                                {
                                    thots.sync({force:true});
                                    message.channel.send(`alright, done.`)
                                }
                                else
                                {
                                    message.channel.send(`alright, cancelled.`);
                                }
                            })
                        .catch((error) => 
                            {
                                message.channel.send(`error: you took too long, idiot.`);
                                console.log(error);
                            });
                });

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
                    message.delete().catch(console.error(`ERROR: Could not delete message. Likely was in a DM chat.`));
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
                    for(let i = 0; i < votes.length; i++)
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
                        message.delete().catch(console.error(`ERROR: Could not delete message. Likely was in a DM chat.`));
                        if(!message.channel.id == pollschannel.id)message.channel.send(`Alright, poll unset. Results have been posted in ${pollschannel}`);

                        for(let i = 0; i < votes.length; i++)
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
                        pollidexists = false;

                        client.user.setPresence({status:'online'});
                    }
                    else
                    {
                        message.delete().catch(console.error(`ERROR: Could not delete message. Likely was in a DM chat.`));
                        message.channel.send(`You didn't start this poll, so you can't end it. If they've forgotten, message Larson.`); 
                    }
                }
                else if (args[0] == "help" && args.length == 1)
                {
                    message.channel.send(`Usage: ${prefix}${command} <Question> || ${prefix}${command} end`);
                }
                else if (args[0] == "count")
                {
                    message.channel.send
                }
                else
                {
                    if(!activepoll)
                    {
                        activepoll = argslist;
                        pollstarter = message.author;
                        pollschannel.send(`Poll: ${activepoll}`);
                        message.delete().catch(console.error(`ERROR: Could not delete message. Likely was in a DM chat.`));
                        pollschannel.send(`Use \`${prefix}poll end\` to stop the poll and show the results.`);

                        client.user.setPresence({status:'dnd'});
                        
                        pollsendid = [];
                        pollidexists = false;
                    }
                    else
                    {
                        message.channel.send(`Sorry, there is an active poll currently.`);
                        message.channel.send(activepoll);
                    }
                }

            break;

            case "pollsend":
            case "pollschat":
            case "anonsend":
            case "anonchat":

                if (message.guild)
                {
                    message.channel.send(`Sorry, this command is only usable via DM`); // Otherwise this command would be useless.
                    message.delete().catch(console.error(`ERROR: Could not delete message. Likely was in a DM chat.`));
                    break;
                }
                for (let i = 0; i < pollsendid.length; i++) // Check to see if the user has an existing pollsendid.
                {
                    if (pollsendid[i][0].id == message.author.id) // If so...
                    {
                        pollschannel.send(`${pollsendid[i][1]}: ${argslist}`) // Send the message.
                        pollidexists = true; // Make sure we don't make them a new one.
                    }
                }
                if (!pollidexists) // If not...
                {
                    pollsendid.push([message.author, Math.floor(Math.random() * 50)]) // Store their entire user object (bite me) and a generated ID for them.
                    pollschannel.send(`${pollsendid[pollsendid.length-1][1]}: ${argslist}`) // Send the message.
                    message.author.send(`Your ID is ${pollsendid[pollsendid.length-1][1]}`) // Send them their ID only when they make a new one.
                }
                pollidexists = false; // Make sure to get that squared away.

            break;

            case "eval": // Evaluate arbitrary code. This can't be a bad idea, right?

                if(message.author.id == admin) // Perms check.
                {
                    eval(argslist || message.channel.send('no')).catch(message.channel.send); // Do what I ask.
                }
                else
                {
                    message.channel.send("nope, next time try being larson."); // Or don't, if you can't.
                }

            break;

            case "ok": // ok

                message.delete(); // no ok
                message.channel.send("ok."); // ok

            break;

            case "coin": // Flip a coin.
            case "flipacoin":
            case "coinflip":

                const coin = Math.floor(Math.random() * 2);
                if (coin == 1)
                {
                    message.channel.send(`it's heads`);
                }
                else if (coin == 0) 
                {
                    message.channel.send(`it's tails`);
                }
                else
                {
                    message.channel.send(`uh what`);
                }

            break;
}})

client.login(token);

// when it's ok-bot time