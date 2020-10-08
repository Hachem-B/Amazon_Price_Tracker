const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.amazon.fr/JBL-Wireless-Casque-Intra-aural-%C3%A9couteur/dp/B07HGH7QD4/ref=sr_1_1_sspa?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=30FCNI15IB69H&keywords=jbl+under+armour&qid=1584618265&sprefix=jbl+under%2Caps%2C202&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFMWUJHMjdDWElMQkwmZW5jcnlwdGVkSWQ9QTAwMTgwNjRKT1k0VUVCN0YyOUQmZW5jcnlwdGVkQWRJZD1BMDQ5MDYxOTM4QVFJQTMwRlhSWVkmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl';

async function configureBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html);

    $('#priceblock_ourprice', html).each(function() {
        let dollarPrice = $(this).text();
        console.log(dollarPrice);
        let currentPrice = Number(dollarPrice.replace(/\D.+/g,""));      
        if (currentPrice < 300) {
            console.log("Price dropped!!!! " /*+ currentPrice*/);
            sendNotification(currentPrice);
        }
    });
}

async function startTracking() {
    const page = await configureBrowser();
  
    let job = new CronJob('*/15 * * * * *', function() { //runs every 15 sec in this config
      checkPrice(page);
    }, null, true, null, null, true);
    job.start();
}

async function sendNotification(price) {//Better use  Amazon SES(Simple Email Service) or other web service
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bahlousshachem@gmail.com',
        pass: 'avionique nchallah yarabi'
      }
    });
  
    let textToSend = 'Price dropped to ' + price;
    let htmlText = `<a href=\"${url}\">Link To Check Your Product :D </a>`;
  
    let info = await transporter.sendMail({
      from: '<bahlousshachem@gmail.com>',
      to: "malek.benfriha@gmail.com",
      subject: 'Price dropped to ' + price, 
      text: textToSend,
      html: htmlText
    });
  
    console.log("Message sent: %s", info.messageId);
  }

startTracking();