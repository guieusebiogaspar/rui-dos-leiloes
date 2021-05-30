const pool = require("../../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config();

const admin_email = "gui@hotmail.com";

exports.get_users = async (req, res) => {
    try {
        let client = await pool.connect()

        let results = await client.query("select * from utilizador")

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum user registado"
            }
        } 
        else{
             response = {
                // o que vai ser printado no ecrã
                count: results.rows.length,
                list: results.rows.map((user) => {
                return {
                    id: user.userid,
                    username: user.username,
                    email: user.email
                };
                }),
            };
        }
        
        console.table(results.rows)
        res.status(200).json(response)
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
            return res.status(500).json({ err: "Já existe um user com esse username"}) 
        }

        let verificaEmail = await client.query("SELECT * FROM utilizador WHERE email = $1", [email])
        if(verificaEmail.rows.length > 0) {
            return res.status(500).json({ err: "Já existe um user com esse email"}) 
        }

        // query para inserir novo utilizador na db
        let newUser = await client.query("INSERT INTO utilizador (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hashedPassword])
        // envia para o postman a resposta caso corra tudo bem
        res.status(200).json(newUser.rows)
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
            
                    jwt.sign(
                        {
                          userId: user.userid,
                          username: user.username,
                          admin: user.admin,
                        },
                        process.env.TOKEN_PASSWORD,
                        async function (err, token) {
                            if(err) {
                                throw err;
                            }
                            // SE FOR O USER ADMIN
                            if (user.email === admin_email) {
                                await client.query("UPDATE utilizador SET admin = true WHERE email = $1", [user.email])
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
            res.status(500).json({ message: "Não há nenhum user com esse username"})
        }
    } catch (error) {
        res.status(500).json({ err: "Erro a registar user" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.get_mensagens = async (req, res) => {
    try {
        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        let client = await pool.connect()

        // vai buscar todas as mensagens
        let results = await client.query("select * from mensagemprivada where utilizador_userid = $1", [userid])

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhuma mensagem para este user"
            }
        } else {
            response = {
                // o que vai ser printado no ecrã
                count: results.rows.length,
                list: results.rows.map((mensagem) => {
                  return {
                    id: mensagem.mensagemid,
                    texto: mensagem.texto,
                    data: mensagem.data,
                    leilaoid: mensagem.leilao_leilaoid,
                    userid: mensagem.utilizador_id
                  };
                }),
              };
        }

        console.table(results.rows)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a ler mensagens" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.get_notificacoes = async (req, res) => {
    try {
        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        let client = await pool.connect()

        // vai buscar as mensagens por ler
        let results = await client.query("select * from mensagemprivada where utilizador_userid = $1 and lida = false", [userid])

        await client.query('BEGIN')

        for(let i = 0; i < results.rows.length; i++){
            await client.query("UPDATE mensagemprivada SET lida = true WHERE mensagemid = $1", [results.rows[i].mensagemid])
        }

        await client.query('COMMIT')

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhuma notificação para este user"
            }
        } else {
            response = {
                // o que vai ser printado no ecrã
                count: results.rows.length,
                list: results.rows.map((mensagem) => {
                  return {
                    id: mensagem.mensagemid,
                    texto: mensagem.texto,
                    data: mensagem.data,
                    leilaoid: mensagem.leilao_leilaoid,
                    userid: mensagem.utilizador_id
                  };
                }),
              };
        }

        console.table(results.rows)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a ler notificações" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}
