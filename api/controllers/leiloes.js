const pool = require("../../db")
const jwt = require("jsonwebtoken")
require("dotenv").config();

exports.get_leiloes = async (req, res) => {
    try {
        let client = await pool.connect()

        let results = await client.query("select * from leilao")

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão criado"
            }
        } else {
            response = {
                // o que vai ser printado no ecrã
                count: results.rows.length,
                list: results.rows.map((lei) => {
                  return {
                    id: lei.leilaoid,
                    titulo: lei.titulo,
                    descricao: lei.descricao
                  };
                }),
              };
        }

        console.table(results.rows)
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ err: "Erro a ler leilões" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.cria_leilao = async (req, res) => {
    try {
        let client = await pool.connect()

        // le os dados do leilao
        let titulo = req.body.titulo;
        let descricao = req.body.descricao;
        let ean = req.body.ean;
        let precomin = req.body.precomin;
        let fim = req.body.fim;

        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        console.log(decoded)

        // criador é utilizador_userid
        // query para inserir novo leilao na db
        let newLeilao = await client.query("INSERT INTO leilao (titulo, descricao, ean, precomin, fim, criador, utilizador_userid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [titulo, descricao, ean, precomin, fim, decoded.username, decoded.userId])
        // envia para o postman a resposta caso corra tudo bem
        res.status(200).json(newLeilao.rows)
    } catch (error) {
        if(!req.body.titulo || !req.body.descricao || !req.body.ean || !req.body.precomin || !req.body.fim) {
            res.status(500).json({ err: "Preencha os campos todos"})
        } 
        else {
            console.log(error)
            res.status(500).json({ err: "Erro a criar leilao" });
        }
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.get_ean = async (req, res) => {
    try {
        const ean = req.params.ean;

        let client = await pool.connect()

        let results = await client.query("select * from leilao where ean = $1", [ean])

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse ean"
            }
        } else {
            response = {
                // o que vai ser printado no ecrã
                count: results.rows.length,
                list: results.rows.map((lei) => {
                  return {
                    id: lei.leilaoid,
                    titulo: lei.titulo,
                    descricao: lei.descricao
                  };
                }),
              };
        }

        console.table(results.rows)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a ler leilao" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.get_leilao = async (req, res) => {
    try {
        const leilaoid = req.params.leilaoid;

        let client = await pool.connect()

        let results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse id"
            }
        } else {
            response = {
                // o que vai ser printado no ecrã
                id: results.rows[0].leilaoid,
                titulo: results.rows[0].titulo,
                descricao: results.rows[0].descricao,
                ean: results.rows[0].ean,
                precomin: results.rows[0].precomin,
                maxlicitacao: results.rows[0].maxlicitacao,
                fim: results.rows[0].fim,
                criador: results.rows[0].criador,
                vencedor: results.rows[0].vencedor,
                cancelado: results.rows[0].cancelado,
                utilizador_userid: results.rows[0].utilizador_userid
              };
        }

        console.table(results.rows)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a editar leilao" });
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.editar_leilao = async (req, res) => {
    try {
        const leilaoid = req.params.leilaoid;

        if(!req.body.titulo && !req.body.descricao) {
            return res.status(500).json({ err: "Não introduziu nem titulo nem descrição para editar"})
        } 

        let titulo = req.body.titulo;
        let descricao = req.body.descricao;

        let client = await pool.connect()

        
        let results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])
        
        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse id"
            }
        } else {
            try {
                await client.query('BEGIN')
    
                if(req.body.titulo) {
                    await client.query("UPDATE leilao SET titulo = $1 WHERE leilaoid = $2", [titulo, leilaoid])
                }
                if(req.body.descricao) {
                    await client.query("UPDATE leilao SET descricao = $1 WHERE leilaoid = $2", [descricao, leilaoid])
                }
    
                await client.query('COMMIT')
            } catch (error) {
                await client.query('ROLLBACK')
                return res.status(500).json({ err: "Erro a editar leilao" });
            }

            results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])

            response = {
                // o que vai ser printado no ecrã
                id: results.rows[0].leilaoid,
                titulo: results.rows[0].titulo,
                descricao: results.rows[0].descricao,
                ean: results.rows[0].ean,
                precomin: results.rows[0].precomin,
                maxlicitacao: results.rows[0].maxlicitacao,
                fim: results.rows[0].fim,
                criador: results.rows[0].criador,
                vencedor: results.rows[0].vencedor,
                cancelado: results.rows[0].cancelado,
                utilizador_userid: results.rows[0].utilizador_userid
              };
        }

        console.table(results.rows)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a editar leilao" });

    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

