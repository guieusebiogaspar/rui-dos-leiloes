function verifyToken (req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];

    if(bearerHeader) {
        // Bearerer token
        const bearer = bearerHeader.split(" ")

        req.token = bearer[1];

        next();
    } else {
        res.status(403).json({ message: "Não está logado"})
    }
}

module.exports = verifyToken;