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

bot.onText(/\/AnadeFecha/, (msg) => {
    let chat_id = msg.chat.id;
    let keyboard = get_day_keyboard(23,32);
    console.log(keyboard);
    bot.sendMessage(chat_id,"Por favor selecciona la Hora",{
        reply_markup: {
            inline_keyboard: keyboard,
        }
    });
})


let get_day_keyboard = (min,max) =>{
    let keyboard = get_header("MONTH");
    return keyboard;
}
let get_header = (header) => {
    return [[set_btn("<",null),set_btn(header,null),set_btn(">",null)],
    [set_btn("L",null),set_btn("M",null),set_btn("X",null),set_btn("J",null),set_btn("V",null),set_btn("S",null),set_btn("D",null)]];
}
let set_btn = (btntext,data) => {
    if(data === null){
        data = 0;
    }
    return {text: btntext,callback_data: data};
};
let get_hour_keyboard_item = (hour) =>{
    return {text: `${hour.toString()}:00`,
            callback_data: hour.toString(),
            callback_}
};


