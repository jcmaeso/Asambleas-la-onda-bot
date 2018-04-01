const Sequelize =  require('sequelize');

const options = {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },  
    operatorsAliases: false
};

const sequelize = new Sequelize("sqlite:db/db.sqlite",options);

const User = sequelize.define('users', {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {msg : "El id debe ser un numero"},
        }
    },
    usuario: {type: Sequelize.STRING,
         allowNull: false,
         allowEmpty: false,
         validate:{
             notEmpty: {msg: "El usuario no puede estar vacío"}
         }
    }
});

const Asamblea = sequelize.define('asamblea',{
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {msg : "El id debe ser un numero"}
        }
    },
    fecha:{
        type: Sequelize.DATEONLY,
        allowNull: false,
        allowEmpty: false,
        validate:{
            isDate: {msg: "La fecha debe de ser una fecha valida"},
            isAfter: "2018-4-1"
        }    
    },
     hora:{
        type: Sequelize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            isInt: {msg: "la hora debe de ser un entero"},
            max: {args: 23,msg: "La hora tiene que ser menor que 23"},
            min: {args: 0, msg: "La hora debe de ser mayor que 0"}
        }
    } 
});

const Vote = sequelize.define('votes',{
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {msg : "El id debe ser un numero"}
        }
    },
    votante:{
        type: Sequelize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            isInt: {msg : "El votante debe ser un numero"}
        } 
    },
    asamblea:{
        type: Sequelize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            isInt: {msg : "La asamblea debe ser un numero"}
        } 
    },
    fecha:{
        type: Sequelize.DATEONLY,
        allowNull: false,
        allowEmpty: false,
        validate:{
            isDate: {msg: "La fecha debe de ser una fecha valida"},
            isAfter: "2018-4-1"
        }    
    },
    hora:{
        type: Sequelize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            isInt: {msg: "la hora debe de ser un entero"},
            max: {args: 23,msg: "La hora tiene que ser menor que 23"},
            min: {args: 0, msg: "La hora debe de ser mayor que 0"}
        }
    } 
});

sequelize.sync().then(() => {
    console.log("Se ha cargado la base de datos");
}).catch(error => {
    console.log(error);
});

exports.getMaxId = () =>{
    
};

module.exports = {
    sequelize,
    User,
    Vote,
    Asamblea
};