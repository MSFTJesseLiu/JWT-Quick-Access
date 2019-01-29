# JWT Quick Access
### Motivation
As working from the backend in D365 Talent, everytime when I need to test my endpoint from Postman, I probably have to include the Authorization header with JWT token that I get it from 
- Going to a Talent App
- Suddenly open the DevTools in chrome
- Look at the XHRs in the networks panel, find out the request that contains Authorization header with JWT token
- Copy that JWT token and paste it to my Postman request header

**However, this short live JWT token will be expired soon, which I think is super annoying, while commenting out the [Authorization] attribute in the code is not a good way and also some operations require you to be authenticated. So recently I wrote this tiny project to have all the above steps done programmatically in one click, which helps me every hour, makes me stay in a good mood and no copy and paste any more.**

### 5 Mins Setup Steps 
- Have Chrome installed in ``C:\Program Files (x86)\Google\Chrome\Application\chrome.exe``, which is the default path.
- Node.js version: 7 or above (not super sure, the later the better), my node.js version 8 works.
- ``npm`` package manager to install the dependencies for you. 
- Clone this repo, and do ``npm install``
- Run the ``./setup.ps1``, this script will create a separated Chrome user data directory (default: ``C:\chrome-jwt-profile``) and an associated Chrome shortcut (default: ``Chrome JWT.lnk``) for you. You can customized your user data directory path and shortcut name by ``.\setup.ps1 -dirpath C:\chrome-jwt-profile -shortcutname Chrome JWT.lnk``.
- After running this script, you will have a brand new chrome browser session opened. Go to ``chrome://version/`` in your new chrome browser, checked that the Profile Path is what you specified or the default value in the previous step.
- Then run the local node app by ``npm start`` (default``port=8000`` and default ``ChromeUserDataDirPath=C:/chrome-jwt-profile/``). Again you can customize your own port and previous user data directory path by ``$env:PORT="8000"; $env:CHROME_USER_DATA_DIR_PATH="C:/chrome-jwt-profile/"; npm start``.
- Use your Postman, create a ``GET`` request to ``localhost:8000``. With following Tests script and headers:
```js
var jwt = responseBody;
pm.globals.set("Jwt", jwt);
```

| Header                    | Value                                         |
|:-------------------------:|:---------------------------------------------:|
| web-page-url              |  https://attract.talent.dev.dynamics.com/jobs |
| xhr-url-keyword           |  flights                                      |
| header-name (Optional)    |  Authorizationn                               |

Just like this:
![alt text](tests-panel.PNG)
![alt text2](example-request.PNG)

- Send the ``GET`` request to your request to ``localhost:8000``, a chrome browser will be opened, you need to signed in manually, but it's a one time setup.

- Your Postman now have a global variable ``{{Jwt}}``, the refreshed JWT token, and from now on everytime you get a 401, just send the GET request to your local running node app to refresh your ``{{Jwt}}`` with one click without copy and paste.


<sup>The xhr-url-keyword header is the keyword in the XHR request URL sent out from the web page. So this node app is not just for Talent App, it can consume any web page and any XHR request keyword, and any header (default: ``Authorization``).</sup>


### (Nitty-gritty) How it works with Chrome and Postman 
- Since we perhaps already signed in to the Talent App in our default browser session with existing cookies or whatever, I was thinking to open a new tab with Talent app URL in the same session using Puppetee or Selenium these kind of web automation framwork, so I can access the XHR requests sent our from my signed-in Talent app.

- However, in order to launch a browser in any web automation framwork, you cannot have your default browser session opening, since it will need WRITE access to our default Chrome user data directory ``C:\Users\jel\AppData\Local\Google\Chrome\User Data\``, but that WRITE permission has been occupied by our running browser.

- So we need to create a totaly separated Chrome user data directory, and also create a Chrome shortcut to launch from that new user data directory. So then we can dictate our Node.js app to launch our Chrome with that new user data directory then go to a Talent App, and like what I planned to do, just access the one XHR request contains Authorization header with JWT token sent from my signed-in Talent app (Of course, for the first time you doing this, you need to manually signed in, but only once).

- The next step is to let Postman have the new JWT Token that we get from our Node.js app as a **Global Variable** in Postman, super unfortunately, Postman only have a Newman CLI for setup global variables for a fixed set of requests collection, but not for the whole Postman app. And no npm package doing the thing we want. Postman has Rest API that manage your Postman workspace in sync, but that is super heavy, slow and need additional setup. Plust, we cannot either write a config file in Postman application directory, because it doesn't set up the global variable by consuming the config file. 

- The only good thing is Postman can run a javascript which can set the global variable before or after a request has sent, so I then had to make my node app as a local server that is constantly listening, and whenever we want to get a new JWT token, we sent a request to our local node app, and it will return the new JWT token in the body, so then we can setup the global variable with the Postman javascript afterwards.
