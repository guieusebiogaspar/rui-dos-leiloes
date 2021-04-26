const pool = require("../../db")
const Cursor = require('pg-cursor')

const admin_email = "gui@hotmail.com";

exports.get_users = async (req, res) => {

    try {
        const client = await pool.connect()

        const results = await client.query("select * from utilizador")
        res.json(results.rows)
        console.table(results.rows)
    } catch (error) {
        res.status(500).json({ err: "Erro a ler users" });
    } finally {
        client.end()
    }
}

exports.registar_user = async (req, res) => {
    try {
        const client = await pool.connect()

        // le os dados do utilizador
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // query para inserir novo utilizador na db
        const newUser = await client.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, password])
        
        // envia para o postman a resposta caso corra tudo bem
        res.json(newUser.rows)
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    } finally {
        client.end()
    }
}

exports.login_user = async (req, res) => {
    try {
        // le os dados do utilizador
        const username = req.body.username;
        const password = req.body.password;

        // query para user se autenticar
        
        
        // envia para o postman a resposta caso corra tudo bem
        res.json(newUser)
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    } finally {
        // client.close()
    }
}

// iniciar conexao e terminar (client)