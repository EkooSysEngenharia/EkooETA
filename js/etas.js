(function () {
    let clienteSelecionadoId = null;
    let etaParaExcluirId = null;

    function escaparHTML(texto) {
        const elemento = document.createElement("div");
        elemento.textContent = String(texto);
        return elemento.innerHTML;
    }

    function criarInterfaceEtas() {
        if (document.getElementById("modalGerenciarEtas")) {
            return;
        }

        const estilos = document.createElement("style");

        estilos.textContent = `
            .botao-etas-cliente {
                width: 100%;
                min-height: 43px;
                margin-top: 12px;
                border: none;
                border-radius: 12px;
                background: #e8f7ef;
                color: #007238;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
            }

            .botao-etas-cliente:hover {
                background: #d7f1e2;
            }

            .modal-etas {
                position: fixed;
                inset: 0;
                z-index: 300;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(15, 23, 42, 0.6);
            }

            .modal-etas.escondido {
                display: none;
            }

            .painel-etas {
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 22px;
                border-radius: 22px;
                background: white;
                box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
            }

            .cabecalho-etas {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 15px;
                margin-bottom: 20px;
            }

            .cabecalho-etas h2 {
                margin-bottom: 5px;
                color: #007238;
                font-size: 22px;
            }

            .cabecalho-etas p {
                color: #65727d;
                font-size: 13px;
            }

            .fechar-etas {
                width: 40px;
                height: 40px;
                flex-shrink: 0;
                border: none;
                border-radius: 12px;
                background: #edf3f6;
                color: #1f2933;
                font-size: 22px;
                cursor: pointer;
            }

            .formulario-eta {
                display: flex;
                gap: 9px;
                margin-bottom: 18px;
            }

            .formulario-eta input {
                width: 100%;
                padding: 13px;
                border: 1px solid #dce5e9;
                border-radius: 12px;
                outline: none;
                font-size: 15px;
            }

            .formulario-eta input:focus {
                border-color: #009846;
                box-shadow: 0 0 0 3px rgba(0, 152, 70, 0.12);
            }

            .formulario-eta button {
                flex-shrink: 0;
                padding: 12px 16px;
                border: none;
                border-radius: 12px;
                background: #009846;
                color: white;
                font-weight: bold;
                cursor: pointer;
            }

            .lista-etas {
                display: flex;
                flex-direction: column;
                gap: 11px;
            }

            .cartao-eta {
                padding: 16px;
                border: 1px solid #dce5e9;
                border-radius: 16px;
                background: #ffffff;
            }

            .conteudo-eta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .nome-eta {
                min-width: 0;
            }

            .nome-eta h3 {
                color: #007238;
                font-size: 16px;
                overflow-wrap: anywhere;
            }

            .nome-eta small {
                display: block;
                margin-top: 4px;
                color: #65727d;
                font-size: 12px;
            }

            .acoes-eta {
                display: flex;
                gap: 7px;
                flex-shrink: 0;
            }

            .acoes-eta button {
                width: 38px;
                height: 38px;
                border: 1px solid #dce5e9;
                border-radius: 10px;
                background: white;
                cursor: pointer;
            }

            .mensagem-sem-etas {
                padding: 26px 18px;
                border: 1px dashed #dce5e9;
                border-radius: 15px;
                color: #65727d;
                text-align: center;
                font-size: 14px;
                line-height: 1.5;
            }

            @media (max-width: 470px) {
                .formulario-eta {
                    flex-direction: column;
                }

                .formulario-eta button {
                    min-height: 46px;
                }
            }
        `;

        document.head.appendChild(estilos);

        const modal = document.createElement("div");

        modal.id = "modalGerenciarEtas";
        modal.className = "modal-etas escondido";

        modal.innerHTML = `
            <section class="painel-etas">

                <div class="cabecalho-etas">
                    <div>
                        <h2>ETAs do cliente</h2>
                        <p id="nomeClienteEtas"></p>
                    </div>

                    <button
                        id="fecharGerenciadorEtas"
                        class="fechar-etas"
                        type="button"
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <form id="formularioEta" class="formulario-eta">
                    <input
                        id="nomeNovaEta"
                        type="text"
                        maxlength="80"
                        placeholder="Ex.: ETA Principal"
                        autocomplete="off"
                        required
                    >

                    <button type="submit">
                        Adicionar
                    </button>
                </form>

                <div id="listaEtasCliente" class="lista-etas"></div>

            </section>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("fecharGerenciadorEtas")
            .addEventListener("click", fecharGerenciadorEtas);

        document
            .getElementById("formularioEta")
            .addEventListener("submit", cadastrarEta);

        modal.addEventListener("click", function (evento) {
            if (evento.target === modal) {
                fecharGerenciadorEtas();
            }
        });
    }

    function abrirGerenciadorEtas(clienteId) {
        const cliente = Banco.buscarClientePorId(clienteId);

        if (!cliente) {
            alert("Cliente não encontrado.");
            return;
        }

        clienteSelecionadoId = clienteId;

        document.getElementById("nomeClienteEtas").textContent =
            cliente.nome;

        document.getElementById("nomeNovaEta").value = "";

        document
            .getElementById("modalGerenciarEtas")
            .classList.remove("escondido");

        renderizarEtas();
    }

    function fecharGerenciadorEtas() {
        clienteSelecionadoId = null;
        etaParaExcluirId = null;

        document
            .getElementById("modalGerenciarEtas")
            .classList.add("escondido");
    }

    function cadastrarEta(evento) {
        evento.preventDefault();

        const campoNome = document.getElementById("nomeNovaEta");
        const nome = campoNome.value.trim();

        if (!clienteSelecionadoId) {
            alert("Nenhum cliente foi selecionado.");
            return;
        }

        if (nome.length < 2) {
            alert("Informe o nome da ETA.");
            campoNome.focus();
            return;
        }

        const etas = Banco.listarEtas();

        const jaExiste = etas.some(function (eta) {
            return (
                eta.clienteId === clienteSelecionadoId &&
                eta.nome.toLowerCase() === nome.toLowerCase()
            );
        });

        if (jaExiste) {
            alert("Esse cliente já possui uma ETA com esse nome.");
            return;
        }

        etas.push({
            id: Banco.gerarId(),
            clienteId: clienteSelecionadoId,
            nome: nome,
            criadoEm: new Date().toISOString()
        });

        Banco.salvarEtas(etas);

        campoNome.value = "";

        renderizarEtas();
    }

    function editarEta(etaId) {
        const eta = Banco.buscarEtaPorId(etaId);

        if (!eta) {
            return;
        }

        const novoNome = window.prompt(
            "Digite o novo nome da ETA:",
            eta.nome
        );

        if (novoNome === null) {
            return;
        }

        const nomeLimpo = novoNome.trim();

        if (nomeLimpo.length < 2) {
            alert("Informe um nome válido.");
            return;
        }

        const etas = Banco.listarEtas();

        const duplicada = etas.some(function (item) {
            return (
                item.clienteId === eta.clienteId &&
                item.id !== eta.id &&
                item.nome.toLowerCase() === nomeLimpo.toLowerCase()
            );
        });

        if (duplicada) {
            alert("Já existe outra ETA com esse nome.");
            return;
        }

        const indice = etas.findIndex(function (item) {
            return item.id === etaId;
        });

        if (indice === -1) {
            return;
        }

        etas[indice].nome = nomeLimpo;

        Banco.salvarEtas(etas);

        renderizarEtas();
    }

    function excluirEta(etaId) {
        const eta = Banco.buscarEtaPorId(etaId);

        if (!eta) {
            return;
        }

        const confirmar = window.confirm(
            `Deseja excluir a ETA "${eta.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        const etasAtualizadas = Banco
            .listarEtas()
            .filter(function (item) {
                return item.id !== etaId;
            });

        Banco.salvarEtas(etasAtualizadas);

        renderizarEtas();
    }

    function renderizarEtas() {
        const lista = document.getElementById("listaEtasCliente");

        const etas = Banco
            .listarEtasDoCliente(clienteSelecionadoId)
            .sort(function (a, b) {
                return a.nome.localeCompare(b.nome, "pt-BR");
            });

        lista.innerHTML = "";

        if (etas.length === 0) {
            lista.innerHTML = `
                <div class="mensagem-sem-etas">
                    Nenhuma ETA cadastrada.<br>
                    Digite o nome acima para cadastrar a primeira.
                </div>
            `;

            return;
        }

        etas.forEach(function (eta) {
            const cartao = document.createElement("article");

            cartao.className = "cartao-eta";

            cartao.innerHTML = `
                <div class="conteudo-eta">

                    <div class="nome-eta">
                        <h3>${escaparHTML(eta.nome)}</h3>
                        <small>Pontos de coleta: próxima etapa</small>
                    </div>

                    <div class="acoes-eta">
                        <button
                            class="editar-eta"
                            type="button"
                            title="Editar ETA"
                        >
                            ✏️
                        </button>

                        <button
                            class="excluir-eta"
                            type="button"
                            title="Excluir ETA"
                        >
                            🗑️
                        </button>
                    </div>

                </div>
            `;

            cartao
                .querySelector(".editar-eta")
                .addEventListener("click", function () {
                    editarEta(eta.id);
                });

            cartao
                .querySelector(".excluir-eta")
                .addEventListener("click", function () {
                    excluirEta(eta.id);
                });

            lista.appendChild(cartao);
        });
    }

    function localizarClienteDoCartao(cartao) {
        const documentoElemento =
            cartao.querySelector(".documento-cliente");

        if (!documentoElemento) {
            return null;
        }

        const documentoTela =
            documentoElemento.textContent.replace(/\D/g, "");

        return Banco.listarClientes().find(function (cliente) {
            const documentoCliente =
                String(cliente.documento).replace(/\D/g, "");

            return documentoCliente === documentoTela;
        });
    }

    function adicionarBotoesEtasNosClientes() {
        const cartoes =
            document.querySelectorAll(".cartao-cliente");

        cartoes.forEach(function (cartao) {
            if (cartao.querySelector(".botao-etas-cliente")) {
                return;
            }

            const cliente = localizarClienteDoCartao(cartao);

            if (!cliente) {
                return;
            }

            const quantidadeEtas =
                Banco.listarEtasDoCliente(cliente.id).length;

            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "botao-etas-cliente";

            botao.textContent =
                quantidadeEtas === 0
                    ? "💧 Cadastrar ETA"
                    : `💧 ETAs cadastradas: ${quantidadeEtas}`;

            botao.addEventListener("click", function () {
                abrirGerenciadorEtas(cliente.id);
            });

            cartao.appendChild(botao);
        });
    }

    function observarListaDeClientes() {
        const listaClientes =
            document.getElementById("listaClientes");

        if (!listaClientes) {
            return;
        }

        const observador = new MutationObserver(function () {
            adicionarBotoesEtasNosClientes();
        });

        observador.observe(listaClientes, {
            childList: true,
            subtree: true
        });

        adicionarBotoesEtasNosClientes();
    }

    criarInterfaceEtas();
    observarListaDeClientes();
})();