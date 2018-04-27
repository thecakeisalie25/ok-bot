const  {prefix, token, admin, pollschannelid, wednesdaychannelid, bgcolor, fgcolor} = require ('./config.json');
//const   commandlist = require ('./help.json');
const   discord     = require('discord.js');
const   jimp        = require('jimp');
const   schedule    = require('node-schedule');
const   Sequelize   = require('sequelize');
const   client      = new discord.Client();

const   sequelize = new Sequelize('database', 'user', 'password', 
{
    host:       'localhost',
    dialect:    'sqlite',
    logging:     false,
    storage:    'database.sqlite',
});

const   thots       = sequelize.define('thots', {
    userid:           Sequelize.STRING ,
    count:            Sequelize.INTEGER,
    megathot:         Sequelize.BOOLEAN,
});

const   polls       = sequelize.define('polls', {
    creatorid:        Sequelize.STRING,
    pollid:           {type: Sequelize.INTEGER, primaryKey: true},
    question:         Sequelize.STRING,
    choices:          Sequelize.ARRAY(Sequelize.TEXT),
    serverid:         Sequelize.STRING,
    active:           Sequelize.BOOLEAN,
    until:            Sequelize.DATE,
})

const   votes       = sequelize.define('votes', {
    poll:             Sequelize.INTEGER,
    userid:           Sequelize.STRING,
    vote:             Sequelize.INTEGER,
})

let     adminuser;
let     pollschannel;

let     pollsendid = [];
let     trannybanny;
let     tttboard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

const   userdetermine   = (message, mtext, multi = false) => {
    // Arguments: Message object, text to match, boolean for multiple users.
    // Returns  : User object (or error)
    if(typeof(message)  !== "object" ) throw "First argument must be a message.";
    if(typeof(multi)    !== "boolean") throw "Second argument must be a bool.";
    if(/\d{18}/g.exec(mtext)) // If mtext is an ID, get the user by ID.
    {
        return client.fetchUser(mtext)
    }
    else if(message.mentions.first())
    {
        return message.mentions.first();
    }
}

let     adminonly       = false ;
let     wednesday       = false;

// Init function
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

    [thots].forEach(element => element.sync());
    polls.sync({force:true});
    votes.sync({force:true});
    });

client.on('guildMemberRemove', user => {
    console.log(user);
})

client.on('error', error => {
    console.log(error);
});

// Message handler.
client.on('message', async message => {
    try 
    {
        if (message.author.bot) return; // Don't parse bot messages.
        if (message.content.toLocaleLowerCase().match(/(\bok(?:a+y+)?\b)|o\|</gm) && // If message contains "ok"...
        !message.content.startsWith(prefix) && // ...And isn't a command...
        !message.channel.topic.includes(`<no-ok>`)) // ...And it's okay to react here...
        {
            message.react(`🆗`) // ...React "OK" to their message.
        };
        if (message.content.toLocaleLowerCase().includes(`ur mom gay`)) {message.channel.send(`no u`)};
        if (message.content.toLocaleLowerCase().includes(`ur dad lesbian`)) {message.channel.send(`no u but like times a billion`)};
        if (message.content.match(/(?:r|u)\/.+?\b/gm)) // subreddit fix
        {
            message.content.match(/(?:r|u)\/.+?\b/gm).forEach(element => {
                message.channel.send(`https://reddit.com/${element}`)
            });
        }
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
                    
                    message.channel.send(`i'm doin ok. (${client.ping}ms)`);
                
                break;
    
                case "thumbs":
                case "thumb":
    
                    await message.react(`👍`)
                    await message.react(`👎`)
    
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

                case "live": 
                
                    message.channel.send('no'); 
                
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
    
                case "isthot":
                case "thot":
            
                    if(args[0] === '@everyone' || args[0] === '@here')
                    {
                        thots.update({megathot:true}, {where: {userid: message.author.id}});
                        return message.channel.send(`${message.author.username} tried to ping everyone, and is hereby declared a megathot.`);
                    }
                    else if(message.mentions.users.size  == 3)
                    {
                        return message.channel.send(`i specifically requested the opposite of this`);
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
                    thotlist.forEach(function(element, index, array) // TODO: arrow function
                    {
                        const thotuser = client.users.get(element.userid);
                        const thottext = `${index+1}. ${thotuser.username}: ${element.count}`;
                        message.channel.send(thottext)
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

                    //TODO: Add code.

                break;
    
                case "poll": // ok.poll | ok.poll [Is the earth flat?] | ok.poll end
                case "polls":

                    const filter  = m => message.author.id === m.author.id;

                    message.channel.send(`What's the poll question?\neg. \`Which is better, cats or dogs?\``);
                    let collect    = await message.channel.awaitMessages(filter, {time: 60000, maxMatches: 1, errors: ['time']})
                        .catch(err => message.channel.send("Sorry, you took too long."));
                    let poll      = collect.first().content;
                    if(poll.startsWith(`${prefix}${command}`))
                    {
                        return await message.channel.send(`Don't include \`${prefix}${command}\` in your response, just answer the questions naturally. Restarting the command, it causes problems otherwise.`);
                    }

                    message.channel.send(`What are the choices? (don't include "abstain", that gets added automatically.)\neg. \`cats,dogs\``);
                    message.channel.send(`Tip: Don't use emojis for each choice, write them out as words.`);
                    collect       = await message.channel.awaitMessages(filter, {time: 60000, maxMatches: 1, errors: ['time']})
                        .catch(err => message.channel.send("Sorry, you took too long."));
                    let choices   = collect.first().content;
                    if(choices.startsWith(`${prefix}${command}`))
                    {
                        return await message.channel.send(`Don't include \`${prefix}${command}\` in your response, just answer the questions naturally. Restarting the command, it causes problems otherwise.`);
                    }
                    choices       = choices.split(/, ?/gm); // Split the comma seperated entries into an array.
                    choices.push("abstain");

                    message.channel.send(`How long should the poll be active?\neg. \`3 days, 2 hours, 10 minutes\` \neg. \`3d2h10m\`\neg. \`Forever\` (This will go on until you manually cancel it)`);
                    collect       = await message.channel.awaitMessages(filter, {time: 60000, maxMatches: 1, errors: ['time']})
                        .catch(err => message.channel.send("Sorry, you took too long."));
                    let until     = collect.first().content;
                    if(until.startsWith(`${prefix}${command}`))
                    {
                        return await message.channel.send(`Don't include \`${prefix}${command}\` in your response, just answer the questions naturally. Restarting the command, it causes problems otherwise.`);
                    }
                    let date      = new Date();

                    if(!until.match(/(\d+) ?(\w)/gm))
                    {
                        return message.channel.send(`No date string found, assuming forever.\nEnd with ${prefix}endpoll.`);
                    } 
                    else
                    {
                        until.match(/(\d+) ?(\w)/gm).forEach(element => {
                            if(element.endsWith("d"))
                            {
                                const num = element.split(/[ ,a-z,A-Z]/g)[0];
                                date = new Date(date.getTime() + (num * 1000 * 60 * 60 * 24));
                            }
                            else if(element.endsWith("h"))
                            {
                                const num = element.split(/[ ,a-z,A-Z]/g)[0];
                                date = new Date(date.getTime() + (num * 1000 * 60 * 60));
                            }
                            else if(element.endsWith("m"))
                            {
                                const num = element.split(/[ ,a-z,A-Z]/g)[0];
                                date = new Date(date.getTime() + (num * 1000 * 60));
                            }
                        })
                    }
                    message.channel.send(new Date().toString());
                    message.channel.send(date.toString());
                    message.channel.send(until);
                    message.channel.send(poll);
                    message.channel.send(choices);


                break;
    
                case "pollsend":
                case "pollschat":
                case "anonsend":
                case "anonchat":
    
                    let pollsendid;
                    if (message.guild)
                    {
                        message.channel.send(`Sorry, this command is only usable via DM`); // Otherwise this command would be useless.
                        message.delete();
                        break;
                    }
                    for (let i = 0; i < pollsendid.length; i++) // Check to see if the user has an existing pollsendid. TODO: .foreach? || or pollsendid.includes?
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
    
                break;
    
                case "eval": // Evaluate arbitrary code. This can't be a bad idea, right?
    
                    if(message.author.id == admin) // Perms check.
                    {
                        try 
                        {
                            eval(argslist || message.channel.send('no')).catch(message.channel.send); // Do what I ask.                        
                        } 
                        catch (error) 
                        {
                            message.channel.send(`ERROR: ${error}`).catch();    
                        }
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
                        message.channel.send(`uh`)
                        message.channel.send(`it landed on it's edge i guess`)
                    }
    
                break;
    
                case "getemoji": // TODO: emoji project? big gif?
                case "getanimoji":
    
                    message.guild.emojis.forEach(emoji => {
                        console.log(emoji);
                        message.channel.send(`${emoji.name} == ${emoji.id} (\\${emoji})`);
                    })
    
                break;

                case "reactok":

                    okmotes.forEach(element => {
                        message.react(element);
                    })

                break;

                case "oof":

                    message.channel.send(`if she say oof, she like being choked.`);

                break;

                case "tictactoe":
                case "ttt":

                    const parseboard = board => { // array of 3 arrays of 3 --> board in string, seperated by \n
                        if(board.length !== 3) throw "Argument passed must be a Tic Tac Toe board."
                        let boardstring = "";
                        board.forEach(element =>{
                            element.forEach(element => {
                                switch(element)
                                {
                                    case 0:
                                        boardstring += "-";
                                    break;
                                    case 1:
                                        boardstring += "O";
                                    break;
                                    case 2:
                                        boardstring += "X";
                                    break;
                                    default:
                                        boardstring += "⁉";
                                    break;
                                }
                            })
                            boardstring += "\n"
                        })
                        return `\`\`\`\n${boardstring}\`\`\``;
                    }
                    const checkboard = board => { // array of 3 arrays of 3 --> "X", "O", or false. Who has won, or no winner yet.
                             if(board.length !== 3) throw "Argument passed must be a Tic Tac Toe board."
                        else if(board[0][0] == "2" && board[1][1] == "2" && board[2][2] == "2") return "X"; // [ \ ]
                        else if(board[0][2] == "2" && board[1][1] == "2" && board[2][0] == "2") return "X"; // [ / ]
                        else if(board[0][0] == "2" && board[1][0] == "2" && board[2][0] == "2") return "X"; // [|  ]
                        else if(board[0][1] == "2" && board[1][1] == "2" && board[2][1] == "2") return "X"; // [ | ]
                        else if(board[0][2] == "2" && board[1][2] == "2" && board[2][2] == "2") return "X"; // [  |]
                        else if(board[0][0] == "2" && board[0][1] == "2" && board[0][2] == "2") return "X"; // [***]
                        else if(board[1][0] == "2" && board[1][1] == "2" && board[1][2] == "2") return "X"; // [---]
                        else if(board[2][0] == "2" && board[2][1] == "2" && board[2][2] == "2") return "X"; // [...]
                        else if(board[0][0] == "1" && board[1][1] == "1" && board[2][2] == "1") return "O"; // [ \ ]
                        else if(board[0][2] == "1" && board[1][1] == "1" && board[2][0] == "1") return "O"; // [ / ]
                        else if(board[0][0] == "1" && board[1][0] == "1" && board[2][0] == "1") return "O"; // [|  ]
                        else if(board[0][1] == "1" && board[1][1] == "1" && board[2][1] == "1") return "O"; // [ | ]
                        else if(board[0][2] == "1" && board[1][2] == "1" && board[2][2] == "1") return "O"; // [  |]
                        else if(board[0][0] == "1" && board[0][1] == "1" && board[0][2] == "1") return "O"; // [***]
                        else if(board[1][0] == "1" && board[1][1] == "1" && board[1][2] == "1") return "O"; // [---]
                        else if(board[2][0] == "1" && board[2][1] == "1" && board[2][2] == "1") return "O"; // [...]
                        else return false;
                    }
                    if(args[0] == "--clear")
                    {
                        tttboard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; // an array of 3 arrays of 3, 0=blank, 1=O, 2=X.
                    }
                    else if(args[0] == "--move")
                    {
                        if(!args[1].length == 3)
                        {
                            return message.channel.send(`Try again with a 3 character place code.`)
                        }
                        else
                        {
                            let pos = args[1].split("");
                            let loc = pos.map(element => {
                                if(["U","L"].includes(element))
                                {
                                    return 0;
                                }
                                else if(["C","O"].includes(element))
                                {
                                    return 1;
                                }
                                else if(["D","R","X"].includes(element))
                                {
                                    return 2;
                                }
                            })
                            tttboard[loc[0]][loc[1]] = loc[2];
                            /*switch(pos[0]) // I can't believe I wrote this crap.
                            {
                                case "U":
                                    switch(pos[1])
                                    {
                                        case "L":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[0][0] = 2;
                                                break;
                                                case "O":
                                                    tttboard[0][0] = 1;
                                                break;
                                            }
                                        break;
                                        case "C":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[0][1] = 2;
                                                break;
                                                case "O":
                                                    tttboard[0][1] = 1;
                                                break;
                                            }
                                        break;
                                        case "R":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[0][2] = 2;
                                                break;
                                                case "O":
                                                    tttboard[0][2] = 1;
                                                break;
                                            }
                                        break;
                                    }
                                break;
                                case "C":
                                    switch(pos[1])
                                    {
                                        case "L":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[1][0] = 2;
                                                break;
                                                case "O":
                                                    tttboard[1][0] = 1;
                                                break;
                                            }
                                        break;
                                        case "C":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[1][1] = 2;
                                                break;
                                                case "O":
                                                    tttboard[1][1] = 1;
                                                break;
                                            }
                                        break;
                                        case "R":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[1][2] = 2;
                                                break;
                                                case "O":
                                                    tttboard[1][2] = 1;
                                                break;
                                            }
                                        break;
                                    }
                                break;
                                case "D":
                                    switch(pos[1])
                                    {
                                        case "L":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[2][0] = 2;
                                                break;
                                                case "O":
                                                    tttboard[2][0] = 1;
                                                break;
                                            }
                                        break;
                                        case "C":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[2][1] = 2;
                                                break;
                                                case "O":
                                                    tttboard[2][1] = 1;
                                                break;
                                            }
                                        break;
                                        case "R":
                                            switch(pos[3])
                                            {
                                                case "X":
                                                    tttboard[2][2] = 2;
                                                break;
                                                case "O":
                                                    tttboard[2][2] = 1;
                                                break;
                                            }
                                        break;
                                    }
                                break; // gon' burn it up
                            }*/
                        }
                    }
                    message.channel.send(parseboard(tttboard));
                    message.channel.send(checkboard(tttboard));
                    /*switch(checkboard(tttboard))
                    {
                        case false:
                            message.channel.send(`No winner yet...`);
                        break;
                        default:
                            message.channel.send(`The winner is: ${checkboard(tttboard) || "Larson fucked up."}`);
                        break;
                    }*/
                break;
}
    }
    catch(error)
    {
        if (error.name === `DiscordAPIError`)
        {
            console.log(error);
        }
        else
        {
            throw error;
        }
    }
})

client.login(token);

// when it's ok-bot time