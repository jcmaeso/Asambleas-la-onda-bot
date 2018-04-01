const TelegramBot = require('node-telegram-bot-api');
const model = require('./model');
const token = '559647678:AAFTXQnd6-VV50Itor04qxHob2FwmAh7FzM';
const botOptions = {
    polling:{
        params:{
            timeout: 100000
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
    bot.sendMessage(chat_id,"Por favor selecciona la Hora",{
        reply_markup: {
            inline_keyboard: keyboard,
        }
    });
    console.log("Display Inline Keyboard");
})

bot.on("error", error =>{
    console.log(error.msg);
})


let get_day_keyboard = (min,max) =>{
    let d = new Date();
    let keyboard = get_header(get_month_name(d.getMonth()));
    keyboard = keyboard.concat(get_days(d));
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

let set_space_btn = () => {
    return set_btn("FA",null);
}

let get_days = (date) =>{
    let weeks = [];
    let week = padding_week_in(new Date(`${date.getFullYear()}/${date.getMonth()+1}/1`));
    let c_date;
    for(let i = 1; i <= get_end_of_month(date.getMonth()+1,date.getFullYear()); i++){
        c_date = new Date(`${date.getFullYear()}/${date.getMonth()+1}/${i}`);
        week.push(set_btn(i,i));
        if(c_date.getDay() === 0){
            weeks.push(week);
            week = [];
        }
    }
    week = week.concat(padding_week_out(c_date));
    weeks.push(week);
    return weeks;
};

let padding_week_in = date =>{
    numOfdays = date.getDay() === 0 ? 6 : date.getDay()-1;
    let padding = new Array(numOfdays);
    padding.fill(set_space_btn());
    return padding;
};

let padding_week_out = date =>{
    numOfdays = date.getDay() === 0 ? 0 : 7-date.getDay();
    let padding = new Array(numOfdays);
    padding.fill(set_space_btn());
    return padding;
};

let get_end_of_month = (month,year) =>{
    return new Date(year, month, 0).getDate();
}

let get_month_name = month => {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembew", "Diciembre"];
    return monthNames[month];

}


