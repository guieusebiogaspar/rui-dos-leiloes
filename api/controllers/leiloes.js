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
        //console.log(decoded)

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

        let mensagens = await client.query("select * from muralmensagem where leilao_leilaoid = $1", [leilaoid])

        let licitacoes = await client.query("select * from licitacao where leilao_leilaoid = $1", [leilaoid])

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
                criador_userid: results.rows[0].utilizador_userid,
                mural: mensagens.rows.map((msg) => {
                    return {
                        texto: msg.texto,
                        data: msg.data,
                        userid: msg.utilizador_userid
                    };          
                  }),
                licitacoes: licitacoes.rows.map((li) => {
                    // se a licitacao for valida
                    if(li.valida) {
                        return {
                          preco: li.preco,
                          userid: li.utilizador_userid
                        };          
                    }
                  }),
              };
        }

        //console.table(results.rows)
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

exports.put_editar_leilao = async (req, res) => {
    try {
        const leilaoid = req.params.leilaoid;

        if(!req.body.titulo && !req.body.descricao) {
            return res.status(500).json({ err: "Não introduziu nem titulo nem descrição para editar"})
        } 

        let titulo = req.body.titulo;
        let descricao = req.body.descricao;
        let data = new Date();

        let dia = String(data.getDate()).padStart(2, '0');
        let mes = String(data.getMonth() + 1).padStart(2, '0')
        let ano = data.getFullYear()
        let hora = data.getHours()
        let minutos = data.getMinutes()
        let segundos = data.getSeconds()
        
        //2021-06-22 19:10:25
        let dataEdicao = ano + "-" + mes + "-" + dia + " " + hora + ":" + minutos + ":" + segundos 

        let client = await pool.connect()

        
        let results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])
        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse id"
            }

            return res.status(200).json(response)
        } else {
            try {
                await client.query('BEGIN')
                
            
                if(req.body.titulo) {
                    await client.query("UPDATE leilao SET titulo = $1 WHERE leilaoid = $2", [titulo, leilaoid])
                    // query para inserir as alterações no histórico
                    await client.query("INSERT INTO historico (tipo, info, data, leilao_leilaoid) VALUES ($1, $2, $3, $4)", ["titulo", titulo, dataEdicao, leilaoid])
                }
                if(req.body.descricao) {
                    await client.query("UPDATE leilao SET descricao = $1 WHERE leilaoid = $2", [descricao, leilaoid])
                    await client.query("INSERT INTO historico (tipo, info, data, leilao_leilaoid) VALUES ($1, $2, $3, $4)", ["descricao", descricao, dataEdicao, leilaoid])
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

            console.table(results.rows)
            return res.status(200).json(response)
        }



    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Erro a editar leilao" });

    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.post_licitacao = async (req, res) => {
    try {
        
        if(!req.body.preco) {
            return res.status(500).json({ err: "Não introduziu um preço para a licitacao"})
        } 
        const leilaoid = req.params.leilaoid;

        let preco = req.body.preco;

        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        let client = await pool.connect()

        
        let results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])
        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse id"
            }

            return res.status(200).json(response)
        } else {
            try {
                
                let data = new Date();
                let dia = String(data.getDate()).padStart(2, '0');
                let mes = String(data.getMonth() + 1).padStart(2, '0')
                let ano = data.getFullYear()
                let hora = data.getHours()
                let minutos = data.getMinutes()
                let segundos = data.getSeconds()

                let dataAtual = ano + "-" + mes + "-" + dia + " " + hora + ":" + minutos + ":" + segundos
                
                const criador = await client.query("SELECT utilizador_userid from leilao where leilaoid = $1", [leilaoid])
                if(parseInt(criador.rows[0].utilizador_userid) === userid) {
                    return res.status(400).json({ err: "Você criou este leilão. Não pode licitar."});
                }

                const dataFim = await client.query("SELECT fim from leilao where leilaoid = $1", [leilaoid])
                if(dataAtual > dataFim.rows[0].fim) {
                    return res.status(400).json({ err: "Este leilão já terminou"});
                }

                const minli = await client.query("SELECT precomin from leilao where leilaoid = $1", [leilaoid])
                if(preco <= minli.rows[0].precomin) {
                    return res.status(400).json({ err: "A licitação introduzida não supera o preço mínimo de licitação"});
                }
                

                const maxli = await client.query("SELECT maxlicitacao from leilao where leilaoid = $1", [leilaoid])   
                if(preco <= maxli.rows[0].maxlicitacao) {
                    return res.status(400).json({ err: "A licitação introduzida não supera a atual licitacao mais elevada"});
                }

            
                if(!res.headersSent) {             
                    await client.query('BEGIN')
    
                    await client.query("INSERT INTO licitacao (preco, valida, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4)", [preco, true, leilaoid, userid])
                    
                    await client.query("UPDATE leilao SET maxlicitacao = $1 WHERE leilaoid = $2", [preco, leilaoid])
                    
                    await client.query('COMMIT')
                }
            } catch (error) {
                await client.query('ROLLBACK')
                if(!res.headersSent) {   
                    return res.status(500).json({ err: "Erro a fazer licitação" });
                }
            }
            
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

          if(!res.headersSent) {   
            console.table(results.rows)
            return res.status(200).json(response)
          }
    } catch (error) {
        console.log(error)
        if(!res.headersSent) {   
            res.status(500).json({ err: "Erro a editar leilao" });
        }
        
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

exports.get_leiloes_user = async (req, res) => {
    try {
        const userid = req.params.userid;

        let client = await pool.connect()

        // primeiro vai buscar os leiloes que o user criou
        let results = await client.query("select * from leilao where utilizador_userid = $1", [userid])

        // depois vai buscar todas as licitações do user
        let resultsLicitador = await client.query("select * from licitacao where utilizador_userid = $1", [userid])
        for(let i = 0; i < resultsLicitador.rows.length; i++) {
            // caso o user licitou num leilao que ainda nao esta no results.rows, adicionamos esse leilao
            let lei = await client.query("select * from leilao where leilaoid = $1", [resultsLicitador.rows[i].leilao_leilaoid])
            if(!results.rows.some(item => item.leilaoid === lei.rows[0].leilaoid)) {
                results.rows.push(lei.rows[0])
            }
        }

        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão associado a esse user"
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

exports.post_mural = async (req, res) => {
    try {
        
        if(!req.body.mensagem) {
            return res.status(500).json({ err: "Não introduziu uma mensagem"})
        } 

        const leilaoid = req.params.leilaoid;

        const mensagem = req.body.mensagem;

        const tokenheader = req.headers.authorization;
        const token = tokenheader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
        const userid = decoded.userId;

        
        let client = await pool.connect()
        
        const criador = await client.query("SELECT utilizador_userid from leilao where leilaoid = $1", [leilaoid])
        
        let results = await client.query("select * from leilao where leilaoid = $1", [leilaoid])
        let response;
        if(results.rows.length === 0) {
            response = {
                message: "Não existe nenhum leilão com esse id"
            }

            return res.status(200).json(response)
        } else {
            try {
                
                let data = new Date();
                let dia = String(data.getDate()).padStart(2, '0');
                let mes = String(data.getMonth() + 1).padStart(2, '0')
                let ano = data.getFullYear()
                let hora = data.getHours()
                let minutos = data.getMinutes()
                let segundos = data.getSeconds()

                let dataAtual = ano + "-" + mes + "-" + dia + " " + hora + ":" + minutos + ":" + segundos

                
                await client.query('BEGIN')

                await client.query("INSERT INTO muralmensagem (texto, data, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4)", [mensagem, dataAtual, leilaoid, userid])
  
                let escritores = await client.query("select distinct utilizador_userid from muralmensagem")

                // escrever a mensagem na caixa de mensagens do user criador do leilão (mas apenas se nao for o proprio criador a escrever)
                console.log(userid + " " + criador.rows[0].utilizador_userid)
                if(userid != criador.rows[0].utilizador_userid){
                    await client.query("INSERT INTO mensagemprivada (texto, data, lida, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4, $5)", [mensagem, dataAtual, false, leilaoid, criador.rows[0].utilizador_userid])
                }
   
                // vai buscar todos os escritores do mural do leilão
                for(let i = 0; i < escritores.rows.length; i++) {
                    // Se nao for uma mensagem do criador nem do user que escreveu a mensagem
                    console.log(escritores.rows[i].utilizador_userid + " " + criador.rows[0].utilizador_userid + " " + escritores.rows[i].utilizador_userid + " " + userid)
                    if(escritores.rows[i].utilizador_userid != criador.rows[0].utilizador_userid && escritores.rows[i].utilizador_userid != userid) {
                        await client.query("INSERT INTO mensagemprivada (texto, data, lida, leilao_leilaoid, utilizador_userid) VALUES ($1, $2, $3, $4, $5)", [mensagem, dataAtual, false, leilaoid, escritores.rows[i].utilizador_userid])
                    }
                }

                await client.query('COMMIT')

                return res.status(200).json({ mensagem: "Mensagem escrita com sucesso" });
            } catch (error) {
                if(!res.headersSent) {   
                    return res.status(500).json({ err: "Erro a escrever mensagem no mural" });
                }
            }
            
        }
        
        results = await client.query("select * from muralmensagem where leilao_leilaoid = $1", [leilaoid])

        response = {
            // o que vai ser printado no ecrã
            muralid: results.rows[0].muralid,
            texto: results.rows[0].texto,
            data: results.rows[0].data,
            leilaoid: results.rows[0].leilao_leilaoid,
            userid: results.rows[0].utilizador_userid
          };

          if(!res.headersSent) {   
            console.table(results.rows)
            return res.status(200).json(response)
          }

    } catch (error) {
        console.log(error)
        if(!res.headersSent) {   
            res.status(500).json({ err: "Erro a escrever mensagem no mural" });
        }
        
    } finally {
        if(typeof client !== "undefined") {
            client.end()
        }
    }
}

