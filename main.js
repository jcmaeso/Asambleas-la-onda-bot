const TelegramBot = require('node-telegram-bot-api');
const model = require('./model');
const token = '559647678:AAFTXQnd6-VV50Itor04qxHob2FwmAh7FzM';
const botOptions = {
    polling:{
        params:{
            timeout: 1000
        },
    
    }
};

const bot = new TelegramBot(token,botOptions);

bot.onText(/\/echo (.+)/, (msg,match) => {
    let reponseMsg = `Su chat id es: ${msg.chat.id}
    Su usuario es: ${msg.chat.username}`;
    bot.sendMessage(msg.chat.id,reponseMsg);
});

bot.onText(/\/start/, (msg,match) => {
        let user_name = msg.chat.username;
        let user_id = msg.chat.id;
        model.User.create({id: user_id, usuario: user_name}).then(user => {
            bot.sendMessage(msg.chat.id,"Se ha creado su usuario");
            console.log(`Usuario Creado con exito
            Username: ${user.usuario}
            Id: ${user.id}`);
        }).catch(error =>{
            console.log("Error creando usuario");
            bot.sendMessage(msg.chat.id,"Error de usuario");
            if(error.message.match(/Validation/)){
                console.log("El usuario ya esta en la DB");
                bot.sendMessage(msg.chat.id,"Usted ya esta en la base de datos");
            }
        });

});



