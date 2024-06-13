const bcrypt = require('bcryptjs') 

//TODO: Encriptamos!!
const encrypt = async (textPlain) => { 
    const hash = await bcrypt.hash(textPlain, 10) 
    return hash
}

//TODO: Comparamos!!
const compare = async (passwordPlain, hashPassword) => {
    return await bcrypt.compare(passwordPlain, hashPassword)
}

module.exports = { encrypt, compare }