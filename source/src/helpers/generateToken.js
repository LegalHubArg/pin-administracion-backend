const jwt = require('jsonwebtoken') 
require('dotenv').config()

const tokenSign = async (usuario) => { 
    return jwt.sign(
        {
            _usuario: usuario.usuario, //CUIT
            _apellido: usuario.apellidoNombre,
            _email: usuario.email
            //role: user.role //Permisos
        }, //TODO: Payload ! Carga útil
        process.env.SECRET_STRING, //TODO ENV 
        {
            expiresIn: process.env.API_SESSION_TIME, //TODO tiempo de vida
        }
    );
}

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_STRING)
    } catch (e) {
        return null
    }
}

const destroyToken = async (token) => {
    try {
        return jwt.destroy(token)
    } catch (e) {
        return null
    }
}

const decodeSign = (token) => { 
    return jwt.decode(token, null)
}



module.exports = { tokenSign, decodeSign, verifyToken, destroyToken }