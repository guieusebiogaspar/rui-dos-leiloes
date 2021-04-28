const pool = require("./db")
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt")

function init (passport) {
    const authenticateUser = async (username, password, done) => {
        try {
            let client = await pool.connect()
    
            let results = await client.query("SELECT * FROM utilizador WHERE username = $1", [username])

            if(results.rows.length > 0) {
                let user = results.rows[0];

                bcrypt.compare(password, user.password, (err, res) => {
                    if(err) {
                        throw err;
                    }

                    if(res) {
                        return done(null, user)
                    } 
                    else {
                        return done(null, false, { message: "Password está incorreta" });
                        //res.status(500).json({ err: "Erro a comparar passwords" });
                        //return
                    }
                })
            } 
            else {
                // No user
                return done(null, false, { message: "Não há nenhum user com esse email"})
            }

        } catch (error) {
            res.status(500).json({ err: "Erro a autenticar user" });
        } finally {
            if(typeof client !== "undefined") {
                client.end()
            }
        }
    }

    passport.use(new LocalStrategy({
        usernameField: "username",
        password: "password" 
    }, authenticateUser))

    // Guarda os detalhes do utilizador selecionado na sessão
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        pool.query(`SELECT * FROM utilizador WHERE userid = $1`, [id], (err, results) => {
        if (err) {
            return done(err);
        }
        
        return done(null, results.rows[0]);
        });
    });

}

module.exports = init;
