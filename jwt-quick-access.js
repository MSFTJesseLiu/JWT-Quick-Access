const express = require('express');
const puppeteer = require('puppeteer');
const port = process.env.PORT === undefined? 8000:process.env.PORT;
const ChromeUserDataDirPath = process.env.CHROME_USER_DATA_DIR_PATH === undefined? 'C:/chrome-jwt-profile/':process.env.CHROME_USER_DATA_DIR_PATH;
const ChromeExecutablePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
var headerName = "authorization";


var app = express();
app.get('/', async function (req, res) {
    if(req.header('web-page-url') === undefined || req.header('xhr-url-keyword') === undefined){
        res.status(400).send('Request must contain headers of web-page-url, xhr-url-keyword.');
        return;
    }

    let webPageUrl = req.header('web-page-url');
    let xhrUrlKeyword = req.header('xhr-url-keyword');
    headerName = req.header('header-name') === undefined? headerName:req.header('header-name');

    const browser = await puppeteer.launch({
        executablePath: ChromeExecutablePath,
        headless: false,
        userDataDir: ChromeUserDataDirPath
    });
    const page = await browser.newPage();
    await page.goto(webPageUrl);
    await page.on('request', async request => {
        if (request['_url'].indexOf(xhrUrlKeyword) > -1){
            let jwt = request['_headers'][headerName];
            await res.send(jwt);
            await browser.close();
        }
    });
});
app.listen(port, function () {
    console.log(`JWT Quick Access listening on port ${port}!`);
});