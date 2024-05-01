# 9gag-post-filter

It seems like the devs keep breaking their own app, letting bots and spammers run around unchecked, and refuse to give the community what it wants. I want to try to fix that.

##   what is it?
It's a chrome\firefox extension (that also works on android), that lets you filter posts on 9gag in a way that the devs refuse to implement. 

## Features

- Brought back the downvote count
- Mark spammer accounts
- Show days next to the username on every post
- Hide users with less than X amount of days
- Hide users with blue checkmarks
- Hide 'Promoted' posts
- ~Hide anonymous 9GAGGER posts~ [9gag removed anons]
- ~Hide posts by tags or words in the title~ [This is now a native option in the settings]

## How to install
Chrome: [Download on the Chrome webstore](https://chrome.google.com/webstore/detail/9gag-post-filter/ajkipkkhchaaccpbpkclolpebkgbmodl)\
Firefox: [Download on the Firefox addons website](https://addons.mozilla.org/en-US/firefox/addon/9gag-post-filter/)
\
\
For Android:\
Kiwi Browser (Chromium browser with extension support): [Play Store](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser)
\
Firefox Nightly Android*: [short guide](https://youtu.be/cknXID7rV7k)
\
\
*Works but is buggier and less convenient than Kiwi IMO, but use whatever you want

## How to run locally (if you want to contribute or just don't trust the chrome webstore)
#### Running without shenanigans
1. Download this repo as a zip
2. Go to chrome://extensions/ and just drag and drop

#### Activly Editing
3. After downloading, extract to some folder
4. Go to chrome://extensions/ and enable developer mode
5. Click on 'Load Unpacked' and select that folder
6. You can now edit the code and see the changes in real time
7. Any changes to scripts that aren't index.js require refreshing the extension
 To refresh go to chrome://extensions/ and click the refresh button in the extension card (next to the enable switch)

## Plans for the future (maybe idk)
- move to a system based on interecepting network requests
- Add dark mode to the popup
- Make popup look nicer
- Buy milk


### Feedback 
Feel free to suggest any changes or improvements to my code
