const pool = require("../../db")

exports.get_users = (req, res, next) => {
    console.log("pois")
    pool.connect()
    .then(() => {
        res.status(200).json({
            message: "Handling GET requests to /users"
        })
    })
    .catch((err) => {
        res.status(500).json({
          error: err,
        });
    })
}

exports.registar_user = async (req, res) => {
    /*pool.connect()
    .then(() => {
        const { username } = req.body.username;
        const { email } = req.body.email;
        const { password } = req.body.password;

        const newUser = pool.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3)", [username], [email], [password])
        res.json(newUser)
    })
    .catch((err) => {
        res.status(500).json({
          error: err,
        });
    })*/
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        console.log(req.body.username)

        const newUser = await pool.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, password])
        res.json(newUser)
    } catch (error) {
        console.log(error.message)
    }
}