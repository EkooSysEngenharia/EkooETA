const Banco = {
    chaves: {
        clientes: "ekooEtaClientes",
        etas: "ekooEtaEtas",
        pontos: "ekooEtaPontos",
        medicoes: "ekooEtaMedicoes"
    },

    carregar(chave) {
        try {
            const dados = localStorage.getItem(chave);

            return dados ? JSON.parse(dados) : [];
        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
            return [];
        }
    },

    salvar(chave, dados) {
        try {
            localStorage.setItem(
                chave,
                JSON.stringify(dados)
            );

            return true;
        } catch (erro) {
            console.error("Erro ao salvar dados:", erro);
            return false;
        }
    },

    gerarId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
    },

    /* CLIENTES */

    listarClientes() {
        return this.carregar(
            this.chaves.clientes
        );
    },

    salvarClientes(clientes) {
        return this.salvar(
            this.chaves.clientes,
            clientes
        );
    },

    buscarClientePorId(id) {
        return this.listarClientes().find(
            cliente => cliente.id === id
        );
    },

    /* ETAs */

    listarEtas() {
        return this.carregar(
            this.chaves.etas
        );
    },

    salvarEtas(etas) {
        return this.salvar(
            this.chaves.etas,
            etas
        );
    },

    listarEtasDoCliente(clienteId) {
        return this.listarEtas().filter(
            eta => eta.clienteId === clienteId
        );
    },

    buscarEtaPorId(id) {
        return this.listarEtas().find(
            eta => eta.id === id
        );
    },

    /* PONTOS DE COLETA */

    listarPontos() {
        return this.carregar(
            this.chaves.pontos
        );
    },

    salvarPontos(pontos) {
        return this.salvar(
            this.chaves.pontos,
            pontos
        );
    },

    listarPontosDaEta(etaId) {
        return this.listarPontos().filter(
            ponto => ponto.etaId === etaId
        );
    },

    buscarPontoPorId(id) {
        return this.listarPontos().find(
            ponto => ponto.id === id
        );
    },

    /* MEDIÇÕES */

    listarMedicoes() {
        return this.carregar(
            this.chaves.medicoes
        );
    },

    salvarMedicoes(medicoes) {
        return this.salvar(
            this.chaves.medicoes,
            medicoes
        );
    },

    listarMedicoesDaEta(etaId) {
        return this.listarMedicoes().filter(
            medicao => medicao.etaId === etaId
        );
    },

    /* BACKUP */

    exportarBackup() {
        return {
            versao: "1.0",
            exportadoEm: new Date().toISOString(),
            clientes: this.listarClientes(),
            etas: this.listarEtas(),
            pontos: this.listarPontos(),
            medicoes: this.listarMedicoes()
        };
    }
};