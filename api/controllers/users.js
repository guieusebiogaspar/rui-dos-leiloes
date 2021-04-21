const pool = require("../../db")

const admin_email = "gui@hotmail.com";

exports.get_users = async (req, res) => {
    try {
        const results = await pool.query("select * from utilizador")
        res.json(results)
        console.table(results.rows)
    } catch (error) {
        res.status(500).json({ err: "Erro a ler users" });
    }
}

exports.registar_user = async (req, res) => {
    try {
        // le os dados do utilizador
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // query para inserir novo utilizador na db
        const newUser = await pool.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, password])
        
        // envia para o postman a resposta caso corra tudo bem
        res.json(newUser)
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    }
}

exports.login_user = async (req, res) => {
    try {
        // le os dados do utilizador
        const username = req.body.username;
        const password = req.body.password;

        // query para inserir novo utilizador na db
        const newUser = await pool.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, password])
        
        // envia para o postman a resposta caso corra tudo bem
        res.json(newUser)
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    } finally {
        
    }
}

// iniciar conexao e terminar (client)