
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

/*Text/Message constants*/

const end_hour_message = `He terminado de introducir horas`; 

/*Constant Objects*/
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
//TODO: CAMBIAR EL MODELO DE DATOS DE LAS QUERYS
bot.on('callback_query', callbackQuery => {
    const min = 9;
    const max = 21;
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const regExp = new RegExp(/[1-9]+/);
    let validateHour = new RegExp(/[0-9]?[0-9]:00/);
    let it = max-min;
    let horas = [];
    let date;


    let read_msg = (number_of_it_left) => {
        bot.once('message', answer =>{
            return new Promise((resolve, reject) =>{
                if(answer.text === end_hour_message || number_of_it_left === 0){
                    bot.sendMessage(msg.chat.id, `Fin de introducion de valores de horas`,{
                        reply_markup:{
                            hide_keyboard: true
                        }
                    });
                    if(horas.length === 0){
                        reject(new Error("No se han registrado horas"));
                    }
                    return resolve(horas);
                }
                if(!validateHour.test(answer.text)){
                    console.log("Error de intro");
                    bot.sendMessage(msg.chat.id, `Valor no valido`); 
                    resolve(read_msg(number_of_it_left));
                }
                let hour_text = validateHour.exec(answer.text)[0];
                if(horas.includes(hour_text)){
                    console.log("Hora repetida");
                    bot.sendMessage(msg.chat.id, `Valor Repetido`);
                    resolve(read_msg(number_of_it_left));
                }
                bot.sendMessage(msg.chat.id, `Ha elegido correctamente ${hour_text}`); 
                horas.push(hour_text);
                resolve(read_msg(number_of_it_left--)); 
            });
        });
    };


    if(!regExp.test(data)){
        bot.sendMessage(msg.chat.id,"Has elegido una opcion no valida\nVuelve a elegir");
        console.log(`Opcion de fecha invalida de ${msg.chat.username}`);
        return;
    }
    //Creates the date object
    date = new Date()
    //Sends confirmation msg
    bot.editMessageText(`Has elegido el dia ${data}`, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    });
    //Sends message to enable hour keyboard
    bot.sendMessage(msg.chat.id,"Elige las horas que quieres:",{
        reply_markup: {
            keyboard: get_hour_keyboard(min,max)
        }
    }).then( () => {
        return read_msg(it);
    }).then(horas => {
        horas.forEach(hora => {
            store_vote_DB(msg.chat.id,hora,date);
        });
    }).catch(error => {
        console.log(error);
    });
});

bot.on("error", error =>{
    console.log(error.msg);
})


let store_vote_DB = (votante,hora,fecha) => {
    model.Asamblea.findAll({
        where: {
            hora: hora,
            fecha: fecha
        }
    }).then(asamblea => {
        //If there's not instance on DB, create one
        if(asamblea === null){
            console.log("Creada nueva a asamblea");
            asamblea = Promise.resolve(model.Asamblea.create({
                fecha: fecha,
                hora: hora
            }));
        }
        //Storage vote
        model.Vote.create({
            votante: votante,
            asamblea: asamblea.id,
            fecha: fecha,
            hora: hora
        });
    });
};



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
        data = "NULL";
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

let get_hour_keyboard = (min,max) => {
    let keyboard = [];
    for(let i = min; i <= max; i++){
        keyboard.push([`HORA: ${i}:00`]);
    }
    keyboard.push([end_hour_message])
    return keyboard;
}