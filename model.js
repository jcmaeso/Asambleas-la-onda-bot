const Sequalize =  require('sequelize');

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

const sequalize = new Sequalize("sqlite:db/db.sqlite",options);

const User = sequalize.define('users', {
    id: {
        primaryKey: true,
        type: Sequalize.INTEGER,
        allowNull: false,
        validate: {
            notNull: {msg: "El id no puede ser nulo"},
            isInt: {msg : "El id debe ser un numero"}
        }
    },
    usuario: {type: Sequalize.STRING,
         allowNull: false,
         allowEmpty: false,
         validate:{
             notNull: {msg: "El usuario no puede ser nulo"},
             notEmpty: {msg: "El usuario no puede estar vacío"}
         }
    }
});

const Asamblea = sequalize.define('asamblea',{
    id: {
        primaryKey: true,
        type: Sequalize.INTEGER,
        allowNull: false,
        validate: {
            notNull: {msg: "El id no puede ser nulo"},
            isInt: {msg : "El id debe ser un numero"}
        }
    },
    fecha:{
        type: Sequalize.DATEONLY,
        allowNull: false,
        allowEmpty: false,
        validate:{
            notNull: {msg: "El usuario no puede ser nulo"},
            notEmpty: {msg: "El usuario no puede estar vacío"},
            isDate: {msg: "La fecha debe de ser una fecha valida"},
            isAfter: "2018-4-1"
        }    
    },
     hora:{
        type: Sequalize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            notNull: {msg: "La hora no puede ser nula"},
            notEmpty: {msg: "La hora no puede esta vacia"},
            isInt: {msg: "la hora debe de ser un entero"},
            max: {args: 23,msg: "La hora tiene que ser menor que 23"},
            min: {args: 0, msg: "La hora debe de ser mayor que 0"}
        }
    } 
});

const Vote = sequalize.define('votes',{
    id: {
        primaryKey: true,
        type: Sequalize.INTEGER,
        allowNull: false,
        validate: {
            notNull: {msg: "El id no puede ser nulo"},
            isInt: {msg : "El id debe ser un numero"}
        }
    },
    votante:{
        type: Sequalize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            notNull: {msg: "El votante no puede ser nulo"},
            isInt: {msg : "El votante debe ser un numero"}
        } 
    },
    asamblea:{
        type: Sequalize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            notNull: {msg: "La asamblea no puede ser nulo"},
            isInt: {msg : "La asamblea debe ser un numero"}
        } 
    },
    fecha:{
        type: Sequalize.DATEONLY,
        allowNull: false,
        allowEmpty: false,
        validate:{
            notNull: {msg: "El usuario no puede ser nulo"},
            notEmpty: {msg: "El usuario no puede estar vacío"},
            isDate: {msg: "La fecha debe de ser una fecha valida"},
            isAfter: "2018-4-1"
        }    
    },
    hora:{
        type: Sequalize.INTEGER,
        allowNull: false,
        allowEmpty: false,
        validate: {
            notNull: {msg: "La hora no puede ser nula"},
            notEmpty: {msg: "La hora no puede esta vacia"},
            isInt: {msg: "la hora debe de ser un entero"},
            max: {args: 23,msg: "La hora tiene que ser menor que 23"},
            min: {args: 0, msg: "La hora debe de ser mayor que 0"}
        }
    } 
});

sequalize.sync().catch(error => {
    console.log(error);
});

module.exports = {
    sequalize,
    User,
    Vote,
    Asamblea
};