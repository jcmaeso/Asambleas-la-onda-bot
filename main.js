const TelegramBot = require('node-telegram-bot-api');

const token = '559647678:AAFTXQnd6-VV50Itor04qxHob2FwmAh7FzM';

const bot = new TelegramBot(token,{polling:{
    params:{
        timeout: 1000
    },
    interval: 100,
    autoStart: true
}});

bot.onText(/\/echo (.+)/, (msg,match) => {
    let reponseMsg = `Su chat id es: ${msg.chat.id}
    Su usuario es: ${msg.chat.username}`;
    bot.sendMessage(msg.chat.id,reponseMsg);
});

