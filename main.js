
const TelegramBot = require('node-telegram-bot-api');
const model = require('./model');
const token = '559647678:AAFTXQnd6-VV50Itor04qxHob2FwmAh7FzM';
const Promise = require('bluebird');
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
    let keyboard = get_day_keyboard(null,null);
    bot.sendMessage(chat_id,"Por favor selecciona la Fecha",{
        reply_markup: {
            inline_keyboard: keyboard,
        }
    });
    console.log("Display Inline Keyboard");
})

bot.onText(/\/FechaMasVotada/, msg =>{
    let chat_id = msg.chat.id;
    let order_asambleas = new Map();


    let order_array = (arr) =>{

        arr.forEach(a =>{
            //console.log("value +"+arr.votes);
            if(a.votes > max_voted_ids.votes){
                max_voted_ids = [{id:arr.id, votes:arr.votes}];
                //console.log({id:arr.id, votes:arr.votes})
            }else if(arr.votes === max_voted_ids.votes){
                max_voted_ids.push({id:arr.id, votes:arr.votes});
                //console.log({id:arr.id, votes:arr.votes});
            }
        })
        return max_voted_ids;
    }

    model.Asamblea.findAll().mapSeries(asamblea => {            
                return model.Vote.findAll({where:{asamblea: asamblea.id}}).then(votes =>{
                    return {id: asamblea.id,votes: votes.length};
                });
    }).then((asambleas) =>{
        let max_voted_ids = [{id:null, votes:0}];
        console.log(asambleas);
        asambleas.forEach(asamblea=>{
            if(asamblea.votes > max_voted_ids[0].votes){
                max_voted_ids = [asamblea];
                //console.log({id:arr.id, votes:arr.votes})
            }else if(asamblea.votes === max_voted_ids[0].votes){
                max_voted_ids.push(asamblea);
                //console.log({id:arr.id, votes:arr.votes});
            }
        });
        return max_voted_ids;
    }).then((mas_votados) => {console.log(mas_votados)});
});
//TODO: CAMBIAR EL MODELO DE DATOS DE LAS QUERYS
//TODO: EN VOTACIONES SEPARADAS SE PUEDE VOTAR A LA MISMA FECHA 
bot.on('callback_query', callbackQuery => {
    const min = 9;
    const max = 21;
    let data = callbackQuery.data;
    let msg = callbackQuery.message;
    const regExp = new RegExp(/[1-9]+ [0-9]/);
    const splitDay = new RegExp(/[1-9]+/);
    const splitMonth = new RegExp(/ [0-9]+/);
    const setHourDb = new RegExp(/[0-9]+/);
    let validateHour = new RegExp(/[0-9]?[0-9]:00/);
    let getprevpostMonth = new RegExp(/\d/);
    let it = max-min;
    let horas = [];
    let date;
    let month;
    let day;
    let year;

    console.log(data);


    let read_msg = (number_of_it_left) => {
        let valid_hour;
         bot.once('message', answer =>{        
                if(answer.text === end_hour_message || number_of_it_left === 0){
                    bot.sendMessage(msg.chat.id, `Fin de introducion de valores de horas`,{
                        reply_markup:{
                            hide_keyboard: true
                        }
                    });
                    if(horas.length === 0){
                        throw new Error("No se han registrado horas");
                    }
                    horas.forEach(hora => {
                        valid_hour = setHourDb.exec(hora)[0].trim();
                        store_vote_DB(msg.chat.id,valid_hour,new Date(`${date.getFullYear()}/${month}/${day}`));
                    });
                    return;
                }
                if(!validateHour.test(answer.text)){
                    console.log("Error de intro");
                    bot.sendMessage(msg.chat.id, `Valor no valido`); 
                    read_msg(number_of_it_left);
                }
                let hour_text = validateHour.exec(answer.text)[0];
                if(horas.includes(hour_text)){
                    console.log("Hora repetida");
                    bot.sendMessage(msg.chat.id, `Valor Repetido`);
                    read_msg(number_of_it_left);
                }
                bot.sendMessage(msg.chat.id, `Ha elegido correctamente ${hour_text}`); 
                horas.push(hour_text);
                read_msg(number_of_it_left--); 
        });
    };

    if(data.includes("prev")){
        data = data.split(" ");
        month = parseInt(data[1]);
        year = parseInt(data[2]);
        console.log(year);
        if(month == 0){
            year--;
            month = 12;
        }
        bot.editMessageText(`Mes cambiado a ${get_month_name(month-1)}`, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup:{
                inline_keyboard: get_day_keyboard(month,year)
            }
        });
        return
    }else if(data.includes("post")){
        data = data.split(" ");
        month = parseInt(data[1])+2;
        year = parseInt(data[2]);
        console.log(year);
        if(month == 13){
            year++;
            month = 1;
        }
        bot.editMessageText(`Mes cambiado a ${get_month_name(month-1)}`, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup:{
                inline_keyboard: get_day_keyboard(month,year)
            }
        });
        return
        bot.sendMessage(msg.chat.id,"Cambio de mes prev");
        console.log(`Cambio post mes ${msg.chat.username}`);
        return;
    }else if(!regExp.test(data)){
        bot.sendMessage(msg.chat.id,"Has elegido una opcion no valida\nVuelve a elegir");
        console.log(`Opcion de fecha invalida de ${msg.chat.username}`);
        return;
    }
    //Creates the date object
    date = new Date()
    day = splitDay.exec(data)[0];
    month = parseInt(splitMonth.exec(data)[0].trim())+1;
    //Sends confirmation msg
    bot.editMessageText(`Has elegido el dia ${day} del mes ${month}`, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    });
    //Sends message to enable hour keyboard
    bot.sendMessage(msg.chat.id,"Elige las horas que quieres:",{
        reply_markup: {
            keyboard: get_hour_keyboard(min,max)
        }
    }).then( () => {
        read_msg(it);
    }).catch(error => {
        console.log(error);
    });
});

bot.on("error", error =>{
    console.log(error.msg);
})


let store_vote_DB = (votante,hora,fecha) => {
    console.log(fecha);
    console.log(hora);
    console.log(votante);

    let validate_data = () =>{
        return new Promise((resolve,reject) =>{
            model.Asamblea.findOne({where: {
                hora: hora,
                fecha: fecha
            }}).then(asamblea  => {
                console.log("error dsd");
                console.log(asamblea);
                if(asamblea === null){
                    console.log("entro");
                    reject(new Error("No hay asamblea en este dia creada"));
                }else{
                    resolve(asamblea.id);
                }
            })
        });
    }
    let insert_data = id =>{
        model.Vote.create({
            votante: votante,
            asamblea: id,
            fecha: fecha,
            hora: hora 
        }).catch(error => {
            console.log(error);
        })
    }
    validate_data().then(insert_data).catch(error =>{
        if(error.message === "No hay asamblea en este dia creada"){
            model.Asamblea.create({
                fecha: fecha,
                hora: hora
            }).then(asamblea =>{
                console.log("No existia asamblea en esa fecha y la he creado");
                insert_data(asamblea.id);
            })
            return;
        }
        console.log(error)
    })
};



let get_day_keyboard = (month,year) =>{
    let d = (month === null || year  === null) ? new Date() : new Date(`${year}/${month}/1`);
    let keyboard = get_header(d.getMonth(),d.getFullYear());
    keyboard = keyboard.concat(get_days(d));
    return keyboard;
}
let get_header = (header,year) => {
    return [[set_btn("<",`prev ${header} ${year}`),set_btn(get_month_name(header),null),set_btn(">",`post ${header} ${year}`)],
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
        week.push(set_btn(i,`${i} ${date.getMonth()}`));
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

let get_month_number = mon => {
    return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
 }

let get_hour_keyboard = (min,max) => {
    let keyboard = [];
    for(let i = min; i <= max; i++){
        keyboard.push([`HORA: ${i}:00`]);
    }
    keyboard.push([end_hour_message])
    return keyboard;
}