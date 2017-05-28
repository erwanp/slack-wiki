# slack-wiki

*A simple pluggin for my Lab assistant*

At my Lab we extensively use a [Gitlab](https://gitlab.com/) wiki to share procedures and 
details about equipments. However, looking up an information isn't always straightforward. 

`slack-wiki` makes it easy: it is a Bot in our Slack channel. Just ask him whatever and it 
will look up the Wiki and return results 

`slack-wiki` is built with [Botkit](https://github.com/howdyai/botkit). It requires the 
Gitlab/Github wiki to be cloned locally, then performs a `git grep` whenever an user asks 
him something. The local wiki is updated automatically on each new request. Matches are 
highlighted parsing the `git grep` results and looking for the appropriate color codes. 

## Requirements

- Assuming you already have node.js installed, get [Botkit](https://github.com/howdyai/botkit):
```
npm install --save botkit
```

- [Create a Slackbot](https://my.slack.com/services/new/bot) for your team and get its Token.

- Clone your project wiki locally
``` 
git clone path/to/repository.wiki.git local/path
```
You should be authentified to pull from the wiki server (to update the local wiki regularly)

- Set your wiki `local/path` as an environment variable `$WIKI_LOCAL_PATH`, 
and your Slack token as an environment variable `$WIKI_TOKEN`

- Run `slack-wiki.sh`


## Example

![example](https://cloud.githubusercontent.com/assets/16088743/26525090/6fe003e8-434c-11e7-8601-1b115aedb382.png)


