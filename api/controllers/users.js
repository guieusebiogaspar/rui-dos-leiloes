const pool = require("../../db")
const Cursor = require('pg-cursor')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const admin_email = "gui@hotmail.com";

exports.get_users = async (req, res) => {

    try {
        jwt.verify(req.token, "secret", (err, authData) => {
            if(err) {
                res.status(403).json({ message: "Não está logado"})
                return
            } 
        })
        let client = await pool.connect()

        let results = await client.query("select * from utilizador")
        res.json(results.rows)
        console.table(results.rows)
    } catch (error) {
        res.status(500).json({ err: "Erro a ler users" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.registar_user = async (req, res) => {
    try {
        let client = await pool.connect()
        // le os dados do utilizador
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

        // encripta password
        let hashedPassword = await bcrypt.hash(password, 10);
        
        let verificaUsername = await client.query("SELECT * FROM utilizador WHERE username = $1", [username])
        if(verificaUsername.rows.length > 0) {
            res.status(500).json({ err: "Já existe um user com esse username"})
            return 
        }

        let verificaEmail = await client.query("SELECT * FROM utilizador WHERE email = $1", [email])
        if(verificaEmail.rows.length > 0) {
            res.status(500).json({ err: "Já existe um user com esse email"}) 
            return
        }

        // query para inserir novo utilizador na db
        let newUser = await client.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hashedPassword])
        // envia para o postman a resposta caso corra tudo bem
        res.json(newUser.rows)
    } catch (error) {
        if(!req.body.username || !req.body.email || !req.body.password) {
            res.status(500).json({ err: "Preencha os campos todos"})
        } 
       /* else if (error.detail.includes("Key (username)") && error.detail.includes("already exists.")){
            res.status(500).json({ err: "Já existe um user com esse username"})  
        } 
        else if (error.detail.includes("Key (email)") && error.detail.includes("already exists.")){
            res.status(500).json({ err: "Já existe um user com esse email"})  
        }*/ 
        else {
            console.log(error)
            res.status(500).json({ err: "Erro a registar user" });
        }
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.login_user = async (req, res) => {
    try {
        // le os dados do utilizador
        let username = req.body.username;
        let password = req.body.password;

        let client = await pool.connect()
        let results = await client.query("SELECT * FROM utilizador WHERE username = $1", [username])

        if(results.rows.length > 0) {
            let user = results.rows[0];
            
            bcrypt.compare(password, user.password, (err, isMatched) => {
                if(err) {
                    throw err;
                }

                if(isMatched) {
                    if (user.email === admin_email) {
                        user.admin = true; //se o login for feito pelo admin (aqui falta atualizar com query)
                      }
            
                      jwt.sign(
                        {
                          userId: user.userid,
                          username: user.username,
                          admin: user.admin,
                        },
                        "secret",
                        function (err, token) {
                            if(err) {
                                throw err;
                            }
                            res.status(200).json({
                                userData: user.username,
                                Authorization: "Bearer " + token,
                            });
                        }
                      );
                } 
                else {
                    res.status(500).json({ message: "Password está incorreta" });
                }
            })
        }
        else {
            // No user
            res.status(500).json({ message: "Não há nenhum user com esse email"})
        }
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    } finally {
        // client.close()
    }
}

// iniciar conexao e terminar (client)