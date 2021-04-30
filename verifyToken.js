require("dotenv").config();
const jwt = require("jsonwebtoken")


function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];
   
    if(bearerHeader) {

        // Bearerer token
        const bearer = bearerHeader.split(" ")

        req.token = bearer[1];

        // Se o jwt.verify devolver undefined é porque correu tudo bem, sendo assim pode avançar para a função seguinte
        if(typeof jwt.verify(req.token, process.env.TOKEN_PASSWORD, (err, authData) => {
            if(err) {
                return res.status(403).json({ message: "Não está logado"})
            } 
        }) === "undefined") next();

    } else {
        return res.status(403).json({ message: "Não está logado"})
    }
}

module.exports = verifyToken;