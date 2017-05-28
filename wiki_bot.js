/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

    -> http://howdy.ai/botkit

    -> https://github.com/erwanp/slack-wiki
    
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.local_wiki) {
    console.log('Error: Specify local wiki path');
    process.exit(1);
}

const local_wiki_path = process.env.local_wiki

var Botkit = require('botkit');
var os = require('os');


// Interface messages (bilangual, because I want my bot to be a French-speaker
// but not everyone probably does...)

const lang = 'en'

var message_got_it = {
    'fr': "Je regarde sur le Wiki", 
    'en': "I'm looking for that"
};

var message_host_not_found = {
    'fr': "Je ne trouve pas le serveur", 
    'en': "Host not found"
};

var message_connection_failed = {
    'fr': "Je n'arrive pas à me connecter à", 
    'en': "I can't connect to"
};

var message_search_failed = {
    'fr': "Désolé je n'ai rien trouvé", 
    'en': "Sorry, I couldn't find anything"
};

var message_found_something = {
    'fr': "J'ai trouvé ça", 
    'en': "This is what I found"
};


// Initialize bot 

var controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

// Get remote wiki URL 
var server_wiki_path = ''
var exec = require('child_process').exec;

const command = 'git -C "'+local_wiki_path+'" remote get-url origin'
console.log('WIKI GET ORIGIN:', command)  
exec(command,function(err, stdout, stderr) {
    if(err) {
        bot.reply(message, message_host_not_found[lang]);
    } else {
        server_wiki_path = stdout.replace('.git','/') 
        server_wiki_path = server_wiki_path.replace(/^\s+|\s+$/g, '');  // trim
    }
});

// Update local wiki 
exec('git -C "'+local_wiki_path+'" pull',function(err, stdout, stderr) {
    if(err) {
        bot.reply(message, message_connection_failed[lang]+" "+server_wiki_path);
    }
});

controller.hears(["(.*)"],
    'direct_message,direct_mention,mention', function(bot, message) {

        const what = message.match[1]; // get user input 
        console.log('WIKI RECEIVED REQUEST', what)

        // Command to look up wiki 
        var command = 'git -C "'+local_wiki_path+'" '
        command += '-c color.grep.match=red '    // force grep to highlight found text in red (we use that later)
        command += 'grep --color=always -in --all-match -e '+what.split(' ').join(' -e ')
        command += " -- *.md"   // filter on markdown files 
        command += " | less -R"   // print raw control characters
        console.log('WIKI EXEC COMMAND:', command)
        
        bot.reply(message, message_got_it[lang])
        
        // Update local wiki 
        // (note that exec doesnt wait to be done... but we're updating wiki for next time)
        var exec = require('child_process').exec;
        exec('git -C "'+local_wiki_path+'" pull',function(err, stdout, stderr) {
            if(err) {
                bot.reply(message, message_connection_failed[lang]+" "+server_wiki_path);
                console.log('DEBUG','couldnt git pull wiki from '+server_wiki_path)
            }
        });
        
        // Look up wiki
        var child = exec(command,function(err, stdout, stderr) {
            if(err) {
                bot.reply(message, message_search_failed[lang]);
            } else {   
                  
                function formatResults(text) {
                    
                    var lines = text
                          
                    function escape(s) {
                        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
                    };
                    
                    // We asked grep to highlight the selected words in red  
                    // here I get the highlighted words positions matching the 
                    // ANSI escape codes  >>>   ESC[31m...ESC[m
                    var search_match = "\\033\\[31m(.+?)\\033\\[m"
                    var search_others = "\\033\\[[0-9]+m(.+?)\\033\\[m"
                    
                    lines = lines.replace(new RegExp(search_match, 'g'), "`$1`");
                    lines = lines.replace(new RegExp(search_others, 'g'), "$1")
                    
                    // Loop on Markdown files
                    var re = /(.+\.md):(.*)/g
                        results = {};

                    while (match = re.exec(lines)) {
                  
                        // Add path to Markdown files 
                        var file = server_wiki_path+match[1]
                        
                        var value = match[2]
                        if (!(file in results)) {
                            results[file] = "";
                        }
                        
                        /*
                        // Highlight requested words 
                        whatsplit = what.split(' ')
                        for (k in whatsplit) {
                            value = value.replace(whatsplit[k], " `"+whatsplit[k]+"` ");
                        }*/
                        
                        // Aggregate results for the same Markdown file 
                        results[file] += value + "\n";
                    }
                    
                    var output = "";
                    
                    var keys = [];
                    for (var key in results) {
                         output += "\n"+key+"\n"+results[key]
                    }
                    return output;
                };
             
                output = formatResults(stdout);
                
                if (output.length>0) {
                    bot.reply(message, message_found_something[lang]+":\n"+output);
                } else {
                    bot.reply(message, message_search_failed[lang]);
                    console.log('debug', 'found something but couldnt format it properly')
                };
            };
        });
        
    });




// Keep bot alive 

function start_rtm() {
        bot.startRTM(function(err,bot,payload) {
                if (err) {
                        console.log('Failed to start RTM')
                        return setTimeout(start_rtm, 60000);
                }
                console.log("RTM started!");
                });
        };


controller.on('rtm_close', function(bot, err) {
        start_rtm();
});

    
