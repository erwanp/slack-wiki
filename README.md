# slack-wiki

**A simple pluggin for my Lab assistant **

At my Lab we extensively use a [Gitlab](https://gitlab.com/) wiki to share procedures and 
details about equipments. However, looking up an information isn't always straightforward. 

slack-wiki makes it easy: it is a Bot in our Slack channel. Just ask him whatever and it 
will look up the Wiki and return results 

slack-wiki is built with [Botkit](https://github.com/howdyai/botkit). 
It requires the Gitlab/Github wiki to be cloned locally, then performs `git grep` commands 
whenever an user asks him something on Slack. 

### Requirements

- Assuming you already have node.js installed, get [Botkit](https://github.com/howdyai/botkit):
```
npm install --save botkit
```

- [Create a Slackbot](https://my.slack.com/services/new/bot) for your team. 

- Clone your project wiki locally
``` 
git clone path/to/repository.wiki.git local/path
```
You should be authentified to pull from the wiki server (to update the local wiki regularly)

- Set your wiki `local/path` as an environment variable `$WIKI_LOCAL_PATH`, 
and your Slack token as an environment variable `$WIKI_TOKEN`

- Run `slack-wiki.sh`


