else {
                // No user
                return done(null, false, { message: "Não há nenhum user com esse email"})
            }