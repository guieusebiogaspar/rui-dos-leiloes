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
        
        //console.table(results.rows)
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

        if(results.rows[0].banido) {
            return res.status(500).json({ message: "Foi banido do sistema" });
        }
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

        //console.table(results.rows)
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

        //console.table(results.rows)
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

exports.banir = async (req, res) => {
    try {
        let userBanidoId = req.params.userid

        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        let client = await pool.connect()

        const adm = await client.query("select admin from utilizador where userid = $1", [userid])
        if(!adm.rows[0].admin) {
            return res.status(500).json({ err: "Precisa de ser admin para realizar esta operação"})
        } 

        let results = await client.query("select * from utilizador where userid = $1", [userBanidoId])

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum user com esse id"
            }

            return res.status(200).json(response)
        } else {
            let dataAtual = new Date();

            try {
                await client.query('BEGIN')

                await client.query("UPDATE utilizador SET banido = $1 where userid = $2", [true, userBanidoId])

                // Cancelar os leilões criados pelo user
                let leiloes = await client.query("select * from leilao where utilizador_userid = $1", [userBanidoId])

                if(leiloes.rows.length > 0) {
                    for(let i = 0; i < leiloes.rows.length; i++) {
                        await client.query("UPDATE leilao SET cancelado = $1 WHERE leilaoid = $2", [true, leiloes.rows[i].leilaoid])

                        let mensagem = "O leilão " + leiloes.rows[0].titulo + " foi cancelado porque o seu criador foi banido. Pedimos desculpa pelo incómodo"
                        
                        // Escreve no mural do leilao
                        await client.query("INSERT INTO muralmensagem (texto, data, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4)", [mensagem, dataAtual, leiloes.rows[i].leilaoid, userid])
                        
                        // Vai informar todos os licitadores e utilizadores que escreveram no mural que o leilão foi cancelado
                        let interessados = await client.query("select distinct utilizador_userid from licitacao where leilao_leilaoid = $1 UNION select distinct utilizador_userid from muralmensagem where leilao_leilaoid = $1", [leiloes.rows[i].leilaoid])

                        for(let j = 0; j < interessados.rows.length; j++) {
                            await client.query("INSERT INTO mensagemprivada (texto, data, lida, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4, $5)", [mensagem, dataAtual, false, leiloes.rows[i].leilaoid, interessados.rows[j].utilizador_userid])
                        }
                    }
                }

                // Invalidar licitações
                await client.query("UPDATE licitacao SET valida = $1 WHERE utilizador_userid = $2", [false, userBanidoId])

                leiloes = await client.query("select * from leilao")

                // invalidar as licitações superior a esta menos a maior
                for(let i = 0; i < leiloes.rows.length; i++) {
                    let leilaoAfetado = await client.query("select MAX(preco) AS preco from licitacao where utilizador_userid = $1 AND leilao_leilaoid = $2", [userBanidoId, leiloes.rows[i].leilaoid])
                    
                    // Se existir alguma licitacao do user banido
                    if(leilaoAfetado.rows[0].preco != null) {
                        // licitacoes do leilao em questao menos as licitacoes do user banido
                        let licitacoes = await client.query("select * from licitacao where leilao_leilaoid = $1 AND utilizador_userid != $2 ORDER BY preco", [leiloes.rows[i].leilaoid, userBanidoId])

                        let entrou = 0
                        for(let j = 0; j < licitacoes.rows.length; j++) {
                            if(j != (licitacoes.rows.length - 1)) {
                                // meter as licitacoes superiores invalidas
                                if(licitacoes.rows[j].preco > leilaoAfetado.rows[0].preco) {
                                    await client.query("UPDATE licitacao SET valida = $1 where licitacaoid = $2", [false, licitacoes.rows[j].licitacaoid])
                                }
                            } else {
                                // Meter a maior licitacao como a maxlicitacao e com o valor da que foi invalidada
        
                                if(licitacoes.rows[j].preco > leilaoAfetado.rows[0].preco) {
                                    entrou = 1
                                    await client.query("UPDATE licitacao SET preco = $1 where licitacaoid = $2", [leilaoAfetado.rows[0].preco, licitacoes.rows[j].licitacaoid])
                                    await client.query("UPDATE leilao SET maxlicitacao = $1 where leilaoid = $2", [licitacoes.rows[j].preco, leiloes.rows[i].leilaoid])
                                }

                                // Caso não tenha existido nenhuma licitação superior à invalidada, a max licitação fica a que vinha atrás
                                if(entrou == 0) {
                                    await client.query("UPDATE leilao SET maxlicitacao = $1 where leilaoid = $2", [licitacoes.rows[j].preco, leiloes.rows[i].leilaoid])
                                }
                            }
                        }
                    }
                }
                
                await client.query('COMMIT')
            } catch (error) {
                await client.query('ROLLBACK')
                return res.status(500).json({ err: "Erro a banir utilizador" });
            }

            response = {
                mensagem: "Utilizador banido com sucesso"
              };

            //console.table(results.rows)
            return res.status(200).json(response)
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a banir utilizador" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.stats = async (req, res) => {
    try {

        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        let client = await pool.connect()

        const adm = await client.query("select admin from utilizador where userid = $1", [userid])
        if(!adm.rows[0].admin) {
            return res.status(500).json({ err: "Precisa de ser admin para realizar esta operação"})
        } 

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

        //console.table(results.rows)
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