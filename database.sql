CREATE TABLE utilizador (
	userid	 SERIAL PRIMARY KEY,
	username VARCHAR(512) UNIQUE NOT NULL,
	email	 VARCHAR(512) UNIQUE NOT NULL,
	password VARCHAR(512) NOT NULL,
	admin	 BOOL NOT NULL DEFAULT false,
	banido	 BOOL NOT NULL DEFAULT false,
	PRIMARY KEY(userid)
);

CREATE TABLE licitacao (
	licitacaoid	 SERIAL PRIMARY KEY,
	preco		 FLOAT(8) NOT NULL,
	valida		 BOOL NOT NULL DEFAULT true,
	leilao_leilaoid	 BIGINT NOT NULL,
	utilizador_userid BIGINT NOT NULL,
	PRIMARY KEY(licitacaoid)
);

CREATE TABLE leilao (
	leilaoid		 SERIAL PRIMARY KEY,
	titulo		 VARCHAR(512) NOT NULL,
	descricao	 VARCHAR(512),
	ean		 BIGINT NOT NULL,
	precomin		 FLOAT(8) NOT NULL,
	maxlicitacao	 FLOAT(8),
	fim		 TIMESTAMP NOT NULL,
	criador		 BIGINT NOT NULL,
	vencedor		 BIGINT,
	cancelado	 BOOL NOT NULL DEFAULT false,
	utilizador_userid BIGINT NOT NULL,
	PRIMARY KEY(leilaoid)
);

CREATE TABLE historico (
	historicoid	 SERIAL PRIMARY KEY,
	titulo		 VARCHAR NOT NULL,
	descricao	 VARCHAR,
	data		 TIMESTAMP,
	leilao_leilaoid BIGINT NOT NULL,
	PRIMARY KEY(historicoid)
);

CREATE TABLE muralmensagem (
	muralid		 SERIAL PRIMARY KEY,
	texto		 TEXT NOT NULL,
	data		 TIMESTAMP NOT NULL,
	leilao_leilaoid	 BIGINT NOT NULL,
	utilizador_userid BIGINT NOT NULL,
	PRIMARY KEY(muralid)
);

CREATE TABLE mensagemprivada (
	mensagemid	 SERIAL PRIMARY KEY,
	texto		 TEXT NOT NULL,
	data		 TIMESTAMP NOT NULL,
	lida		 BOOL NOT NULL DEFAULT false,
	leilao_leilaoid	 BIGINT NOT NULL,
	utilizador_userid BIGINT NOT NULL,
	PRIMARY KEY(mensagemid)
);

ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk2 FOREIGN KEY (utilizador_userid) REFERENCES utilizador(userid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (utilizador_userid) REFERENCES utilizador(userid);
ALTER TABLE historico ADD CONSTRAINT historico_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE muralmensagem ADD CONSTRAINT muralmensagem_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE muralmensagem ADD CONSTRAINT muralmensagem_fk2 FOREIGN KEY (utilizador_userid) REFERENCES utilizador(userid);
ALTER TABLE mensagemprivada ADD CONSTRAINT mensagemprivada_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE mensagemprivada ADD CONSTRAINT mensagemprivada_fk2 FOREIGN KEY (utilizador_userid) REFERENCES utilizador(userid);


CREATE TABLE utilizador (
	userid	 SERIAL,
	username VARCHAR(512) UNIQUE NOT NULL,
	email	 VARCHAR(512) UNIQUE NOT NULL,
	password VARCHAR(512) NOT NULL,
	admin	 BOOL NOT NULL DEFAULT false,
	banido	 BOOL NOT NULL DEFAULT false,
	PRIMARY KEY(userid)
);

CREATE TABLE licitacao (
	licitacaoid	 SERIAL,
	preco		 FLOAT(8) NOT NULL,
	valida		 BOOL NOT NULL DEFAULT true,
	leilao_leilaoid	 SERIAL,
	utilizador_userid SERIAL,
	PRIMARY KEY(licitacaoid)
);

CREATE TABLE leilao (
	leilaoid		 SERIAL,
	titulo		 VARCHAR(512) NOT NULL,
	descricao	 VARCHAR(512),
	ean		 BIGINT NOT NULL,
	precomin		 FLOAT(8) NOT NULL,
	maxlicitacao	 FLOAT(8),
	fim		 TIMESTAMP NOT NULL,
	criador		 BIGINT NOT NULL,
	vencedor		 BIGINT,
	cancelado	 BOOL NOT NULL DEFAULT false,
	utilizador_userid SERIAL,
	PRIMARY KEY(leilaoid)
);

CREATE TABLE historico (
	historicoid	 SERIAL,
	titulo		 VARCHAR(512) NOT NULL,
	descricao	 VARCHAR(512),
	data		 TIMESTAMP,
	leilao_leilaoid SERIAL,
	PRIMARY KEY(historicoid)
);

CREATE TABLE muralmensagem (
	muralid		 SERIAL,
	texto		 TEXT NOT NULL,
	data		 TIMESTAMP NOT NULL,
	leilao_leilaoid	 SERIAL,
	utilizador_userid SERIAL,
	PRIMARY KEY(muralid)
);

CREATE TABLE mensagemprivada (
	mensagemid	 SERIAL,
	texto		 TEXT NOT NULL,
	data		 TIMESTAMP NOT NULL,
	lida		 BOOL NOT NULL DEFAULT false,
	leilao_leilaoid	 SERIAL,
	utilizador_userid SERIAL,
	PRIMARY KEY(mensagemid)
);