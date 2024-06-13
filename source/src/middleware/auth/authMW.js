const { verifyToken } = require('../../helpers/generateToken')
require('dotenv').config();
const ldap = require("ldapjs");
const axios = require('axios');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        // console.log('ESTO VIENE DEL TOKEN')
        // console.log(tokenData)
        if (tokenData._usuario) {
            next()
        } else {
            res.status(409)
            res.send({ status: "bloqueado", mensaje: 'PIN: Usuario no autenticado.' })
        }

    } catch (e) {
        console.log(e)
        res.status(409)
        res.send({ status: "bloqueado", mensaje: 'PIN: Usuario no autenticado.' })
    }

}

const checkUsuarioAD = async (req, res, next) => {
    try {
        //------------ LDAP auth
        let url = `ldap://${process.env.AD_ENDPOINT}:389`
        //console.log(url)
        const client = ldap.createClient({
            url: url
        });
        client.on('error', err => {
            if (err.code === 'ENOTFOUND') {
                console.log('AD NO CONECTADO');
            }
            if (err.code === 'ER_CONNECTION_TIMEOUT') {
                console.log('AD Timeout');
            }
        });
        const cuit = req.body.usuario;
        const pass = req.body.password;
        if (cuit && pass) {
            const usuarioAD = "BUENOSAIRES\\" + cuit;

            client.bind(usuarioAD, pass, function (err) {
                if (err) {
                    res.status(409)
                    if (err.code === 'ENOTFOUND') {
                        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: Error al conectarse a AD GCBA.', error: 'Petición erronea.' }))
                        res.end();
                        return;
                    }
                    if (err.code === 'ER_CONNECTION_TIMEOUT') {
                        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: Error al conectarse a AD GCBA Timeout.', error: 'Petición erronea.' }))
                        res.end();
                        return;
                    }
                    res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: las credenciales de Usuario que intenta ingresar no están validadas en AD.', error: 'Petición erronea.' }))
                    res.end();
                } else {
                    client.unbind((err) => {
                        (err === null) ? console.log('AD UNBIND OK') : console.log('AD ERROR UNBIND')
                    });
                    next()
                }
            });
        } else {
            client.unbind((err) => {
                (err === null) ? console.log('AD UNBIND OK') : console.log('AD ERROR UNBIND')
            });
            res.status(409)
            res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario que intenta ingresar no pertenece a AD.', error: 'Petición no permitida.' }))
            res.end();
        }

    } catch (e) {
        client.unbind((err) => {
            (err === null) ? console.log('AD UNBIND OK') : console.log('AD ERROR UNBIND')
        });
        res.status(409)
        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: No es posible conectarse al AD.', error: 'Petición erronea.' }))
        res.end();
    }

}

const checkRecaptcha = async (req, res, next) => {
    try {
        if (process.env?.VALIDAR_CAPTCHA !== 'true') { console.log("Login SIN captcha."); return next() }

        console.log("Validando captcha.")

        const captchaToken = String(req.body.captchaToken).trim();
        if (captchaToken !== "") {

            try {
                // Call Google's API to get score
                const resp = await axios.post(
                    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_CAPTCHA}&response=${captchaToken}`
                );
                //   console.log(resp)
                if (resp.data.success) {
                    next()
                }
                else {
                    res.status(409)
                    res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario que intenta ingresar no valido captcha.', error: 'Petición no permitida.' }))
                    res.end();
                }

            }
            catch {
                res.status(409)
                res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario que intenta ingresar no valido captcha.', error: 'Petición no permitida.' }))
                res.end();
            }
        } else {
            res.status(409)
            res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario que intenta ingresar no valido captcha.', error: 'Petición no permitida.' }))
            res.end();
        }

    } catch (e) {
        res.status(409)
        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario que intenta ingresar no valido captcha.', error: 'Petición erronea.' }))
        res.end();
    }

}

//MW para chequear si el usuario es el usuario autorizado para firmar el boletín
async function usuarioFirmaMW(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        if (tokenData._usuario == process.env.FIRMA_USUARIO_CUIT) {
            next()
        } else {
            throw tokenData
        }
    }
    catch (e) {
        console.log(e)
        res.status(403) //Forbidden
        res.send(JSON.stringify({ status: 'bloqueado', mensaje: `PIN: El Usuario no está autorizado para firmar el boletín.` }))
        res.end();
    }
}

module.exports = { checkAuth, checkUsuarioAD, checkRecaptcha, usuarioFirmaMW };