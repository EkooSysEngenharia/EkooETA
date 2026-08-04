(function () {
    let pontosDaMedicao = [];

    function escaparHTML(valor) {
        const elemento = document.createElement("div");

        elemento.textContent = String(valor);

        return elemento.innerHTML;
    }

    function criarEstilosMedicao() {
        if (document.getElementById("estilosMedicao")) {
            return;
        }

        const estilos = document.createElement("style");

        estilos.id = "estilosMedicao";

        estilos.textContent = `
            .modal-medicao {
                position: fixed;
                inset: 0;
                z-index: 500;

                display: flex;
                align-items: flex-start;
                justify-content: center;

                padding: 18px;

                overflow-y: auto;

                background: rgba(15, 23, 42, 0.65);
            }

            .modal-medicao.escondido {
                display: none;
            }

            .painel-medicao {
                width: 100%;
                max-width: 620px;

                margin: 18px auto;
                padding: 22px;

                border-radius: 22px;

                background: white;

                box-shadow:
                    0 18px 45px rgba(0, 0, 0, 0.22);
            }

            .cabecalho-medicao {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 22px;
            }

            .cabecalho-medicao h2 {
                margin-bottom: 5px;

                color: #007238;

                font-size: 24px;
            }

            .cabecalho-medicao p {
                color: #65727d;

                font-size: 13px;
            }

            .fechar-medicao {
                width: 42px;
                height: 42px;

                flex-shrink: 0;

                border: none;
                border-radius: 12px;

                background: #edf3f6;
                color: #1f2933;

                font-size: 22px;

                cursor: pointer;
            }

            .grade-medicao {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 14px;

                margin-bottom: 18px;
            }

            .campo-medicao {
                display: flex;
                flex-direction: column;

                gap: 7px;
            }

            .campo-medicao.campo-largo {
                grid-column: 1 / -1;
            }

            .campo-medicao label {
                color: #1f2933;

                font-size: 13px;
                font-weight: bold;
            }

            .campo-medicao input,
            .campo-medicao select,
            .campo-medicao textarea {
                width: 100%;

                padding: 12px;

                border: 1px solid #dce5e9;
                border-radius: 11px;
                outline: none;

                background: white;
                color: #1f2933;

                font-size: 15px;
            }

            .campo-medicao input:focus,
            .campo-medicao select:focus,
            .campo-medicao textarea:focus {
                border-color: #009846;

                box-shadow:
                    0 0 0 3px rgba(0, 152, 70, 0.12);
            }

            .campo-medicao textarea {
                min-height: 100px;

                resize: vertical;
            }

            .pontos-medicao {
                display: flex;
                flex-direction: column;

                gap: 14px;

                margin: 20px 0;
            }

            .cartao-ponto-medicao {
                padding: 16px;

                border: 1px solid #dce5e9;
                border-radius: 16px;

                background: #f9fbfa;
            }

            .cartao-ponto-medicao h3 {
                margin-bottom: 14px;

                color: #007238;

                font-size: 17px;
            }

            .parametros-ponto {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 12px;
            }

            .parametro {
                padding: 12px;

                border-radius: 12px;

                background: white;
            }

            .parametro h4 {
                margin-bottom: 9px;

                font-size: 14px;
            }

            .linha-parametro {
                display: flex;
                flex-direction: column;

                gap: 7px;
            }

            .linha-parametro select,
            .linha-parametro input {
                width: 100%;

                padding: 10px;

                border: 1px solid #dce5e9;
                border-radius: 10px;
                outline: none;

                background: white;

                font-size: 14px;
            }

            .linha-parametro input:disabled {
                background: #edf3f6;
                color: #8a959e;
            }

            .mensagem-medicao {
                margin-bottom: 15px;
                padding: 12px;

                border-radius: 12px;

                font-size: 13px;
                font-weight: bold;
            }

            .mensagem-medicao.erro {
                background: #fff0f0;
                color: #c62828;
            }

            .mensagem-medicao.sucesso {
                background: #e8f7ef;
                color: #007238;
            }

            .mensagem-pontos-vazia {
                padding: 24px 16px;

                border: 1px dashed #dce5e9;
                border-radius: 14px;

                color: #65727d;

                text-align: center;
                font-size: 14px;
                line-height: 1.5;
            }

            .acoes-medicao {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 10px;

                margin-top: 20px;
            }

            .cancelar-medicao,
            .salvar-medicao {
                min-height: 48px;

                border-radius: 13px;

                font-size: 15px;
                font-weight: bold;

                cursor: pointer;
            }

            .cancelar-medicao {
                border: 1px solid #dce5e9;

                background: white;
                color: #1f2933;
            }

            .salvar-medicao {
                border: none;

                background: #009846;
                color: white;
            }

            .salvar-medicao:hover {
                background: #007238;
            }

            @media (max-width: 550px) {
                .grade-medicao,
                .parametros-ponto {
                    grid-template-columns: 1fr;
                }

                .campo-medicao.campo-largo {
                    grid-column: auto;
                }
            }
        `;

        document.head.appendChild(estilos);
    }

    function criarInterfaceMedicao() {
        if (document.getElementById("modalNovaMedicao")) {
            return;
        }

        const modal = document.createElement("div");

        modal.id = "modalNovaMedicao";
        modal.className = "modal-medicao escondido";

        modal.innerHTML = `
            <section class="painel-medicao">

                <div class="cabecalho-medicao">

                    <div>
                        <h2>Nova medição</h2>

                        <p>
                            Registre uma vistoria completa da ETA
                        </p>
                    </div>

                    <button
                        id="fecharNovaMedicao"
                        class="fechar-medicao"
                        type="button"
                    >
                        ×
                    </button>

                </div>

                <form id="formularioNovaMedicao">

                    <div class="grade-medicao">

                        <div class="campo-medicao campo-largo">
                            <label for="clienteMedicao">
                                Cliente
                            </label>

                            <select
                                id="clienteMedicao"
                                required
                            >
                                <option value="">
                                    Selecione o cliente
                                </option>
                            </select>
                        </div>

                        <div class="campo-medicao campo-largo">
                            <label for="etaMedicao">
                                ETA
                            </label>

                            <select
                                id="etaMedicao"
                                required
                                disabled
                            >
                                <option value="">
                                    Primeiro selecione o cliente
                                </option>
                            </select>
                        </div>

                        <div class="campo-medicao">
                            <label for="responsavelMedicao">
                                Responsável pela medição
                            </label>

                            <input
                                id="responsavelMedicao"
                                type="text"
                                maxlength="100"
                                placeholder="Ex.: Aline Moura"
                                required
                            >
                        </div>

                        <div class="campo-medicao">
                            <label for="dataHoraMedicao">
                                Data e hora
                            </label>

                            <input
                                id="dataHoraMedicao"
                                type="datetime-local"
                                required
                            >
                        </div>

                    </div>

                    <div id="mensagemMedicao"></div>

                    <div
                        id="pontosMedicao"
                        class="pontos-medicao"
                    >
                        <div class="mensagem-pontos-vazia">
                            Selecione o cliente e a ETA para carregar
                            os pontos de coleta.
                        </div>
                    </div>

                    <div class="grade-medicao">

                        <div class="campo-medicao">
                            <label for="volumeTanqueMedicao">
                                Volume de solução no tanque de 50 L
                            </label>

                            <input
                                id="volumeTanqueMedicao"
                                type="number"
                                inputmode="decimal"
                                min="0"
                                max="50"
                                step="0.01"
                                placeholder="Litros"
                            >
                        </div>

                        <div class="campo-medicao">
                            <label for="cloroAdicionadoMedicao">
                                Cloro 12% adicionado
                            </label>

                            <input
                                id="cloroAdicionadoMedicao"
                                type="number"
                                inputmode="decimal"
                                min="0"
                                step="0.01"
                                placeholder="Litros"
                            >
                        </div>

                        <div class="campo-medicao campo-largo">
                            <label for="observacoesMedicao">
                                Observações
                            </label>

                            <textarea
                                id="observacoesMedicao"
                                maxlength="1000"
                                placeholder="Digite as observações da vistoria"
                            ></textarea>
                        </div>

                    </div>

                    <div class="acoes-medicao">

                        <button
                            id="cancelarNovaMedicao"
                            class="cancelar-medicao"
                            type="button"
                        >
                            Cancelar
                        </button>

                        <button
                            class="salvar-medicao"
                            type="submit"
                        >
                            Salvar medição
                        </button>

                    </div>

                </form>

            </section>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("fecharNovaMedicao")
            .addEventListener(
                "click",
                fecharNovaMedicao
            );

        document
            .getElementById("cancelarNovaMedicao")
            .addEventListener(
                "click",
                fecharNovaMedicao
            );

        document
            .getElementById("clienteMedicao")
            .addEventListener(
                "change",
                carregarEtasDoCliente
            );

        document
            .getElementById("etaMedicao")
            .addEventListener(
                "change",
                carregarPontosDaEta
            );

        document
            .getElementById("formularioNovaMedicao")
            .addEventListener(
                "submit",
                salvarNovaMedicao
            );

        modal.addEventListener(
            "click",
            function (evento) {
                if (evento.target === modal) {
                    fecharNovaMedicao();
                }
            }
        );
    }

    function formatarDataParaCampo(data) {
        const ano = data.getFullYear();

        const mes = String(
            data.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
            data.getDate()
        ).padStart(2, "0");

        const hora = String(
            data.getHours()
        ).padStart(2, "0");

        const minuto = String(
            data.getMinutes()
        ).padStart(2, "0");

        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }

    function mostrarMensagemMedicao(
        texto,
        tipo
    ) {
        const area =
            document.getElementById(
                "mensagemMedicao"
            );

        area.className =
            `mensagem-medicao ${tipo}`;

        area.textContent = texto;
    }

    function limparMensagemMedicao() {
        const area =
            document.getElementById(
                "mensagemMedicao"
            );

        area.className = "";

        area.textContent = "";
    }

    function preencherClientes() {
        const campoCliente =
            document.getElementById(
                "clienteMedicao"
            );

        const clientes =
            Banco
                .listarClientes()
                .sort(function (a, b) {
                    return a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    );
                });

        campoCliente.innerHTML = `
            <option value="">
                Selecione o cliente
            </option>
        `;

        clientes.forEach(function (cliente) {
            const opcao =
                document.createElement("option");

            opcao.value = cliente.id;

            opcao.textContent =
                cliente.nome;

            campoCliente.appendChild(opcao);
        });
    }

    function abrirNovaMedicao() {
        limparFormularioMedicao();

        preencherClientes();

        document
            .getElementById("modalNovaMedicao")
            .classList.remove("escondido");
    }

    function fecharNovaMedicao() {
        document
            .getElementById("modalNovaMedicao")
            .classList.add("escondido");

        pontosDaMedicao = [];
    }

    function limparFormularioMedicao() {
        document
            .getElementById(
                "formularioNovaMedicao"
            )
            .reset();

        document
            .getElementById("dataHoraMedicao")
            .value =
                formatarDataParaCampo(
                    new Date()
                );

        const eta =
            document.getElementById(
                "etaMedicao"
            );

        eta.disabled = true;

        eta.innerHTML = `
            <option value="">
                Primeiro selecione o cliente
            </option>
        `;

        document
            .getElementById("pontosMedicao")
            .innerHTML = `
                <div class="mensagem-pontos-vazia">
                    Selecione o cliente e a ETA para carregar
                    os pontos de coleta.
                </div>
            `;

        pontosDaMedicao = [];

        limparMensagemMedicao();
    }

    function carregarEtasDoCliente() {
        const clienteId =
            document.getElementById(
                "clienteMedicao"
            ).value;

        const campoEta =
            document.getElementById(
                "etaMedicao"
            );

        campoEta.innerHTML = "";

        pontosDaMedicao = [];

        document
            .getElementById("pontosMedicao")
            .innerHTML = `
                <div class="mensagem-pontos-vazia">
                    Selecione uma ETA para carregar os pontos.
                </div>
            `;

        if (!clienteId) {
            campoEta.disabled = true;

            campoEta.innerHTML = `
                <option value="">
                    Primeiro selecione o cliente
                </option>
            `;

            return;
        }

        const etas =
            Banco
                .listarEtasDoCliente(clienteId)
                .sort(function (a, b) {
                    return a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    );
                });

        campoEta.disabled = false;

        campoEta.innerHTML = `
            <option value="">
                Selecione a ETA
            </option>
        `;

        etas.forEach(function (eta) {
            const opcao =
                document.createElement("option");

            opcao.value = eta.id;

            opcao.textContent = eta.nome;

            campoEta.appendChild(opcao);
        });

        if (etas.length === 0) {
            campoEta.disabled = true;

            campoEta.innerHTML = `
                <option value="">
                    Este cliente não possui ETA cadastrada
                </option>
            `;

            mostrarMensagemMedicao(
                "Cadastre uma ETA para este cliente antes de iniciar a medição.",
                "erro"
            );
        } else {
            limparMensagemMedicao();
        }
    }

    function criarCampoParametro(
        ponto,
        parametro,
        titulo
    ) {
        const identificador =
            `${parametro}-${ponto.id}`;

        return `
            <div class="parametro">

                <h4>${titulo}</h4>

                <div class="linha-parametro">

                    <select
                        class="status-parametro"
                        data-ponto-id="${ponto.id}"
                        data-parametro="${parametro}"
                    >
                        <option value="valor">
                            Informar valor
                        </option>

                        <option value="nao_analisado">
                            Não analisado
                        </option>

                        <option value="na">
                            N/A
                        </option>
                    </select>

                    <input
                        id="${identificador}"
                        class="valor-parametro"
                        data-ponto-id="${ponto.id}"
                        data-parametro="${parametro}"
                        type="number"
                        inputmode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="${
                            parametro === "cloro"
                                ? "mg/L"
                                : "Valor do pH"
                        }"
                    >

                </div>

            </div>
        `;
    }

    function carregarPontosDaEta() {
        const etaId =
            document.getElementById(
                "etaMedicao"
            ).value;

        const area =
            document.getElementById(
                "pontosMedicao"
            );

        area.innerHTML = "";

        pontosDaMedicao = [];

        if (!etaId) {
            area.innerHTML = `
                <div class="mensagem-pontos-vazia">
                    Selecione uma ETA para carregar os pontos.
                </div>
            `;

            return;
        }

        pontosDaMedicao =
            Banco
                .listarPontosDaEta(etaId)
                .sort(function (a, b) {
                    return a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    );
                });

        if (pontosDaMedicao.length === 0) {
            area.innerHTML = `
                <div class="mensagem-pontos-vazia">
                    Esta ETA não possui pontos cadastrados.<br>
                    Cadastre os pontos antes de iniciar a medição.
                </div>
            `;

            mostrarMensagemMedicao(
                "A ETA selecionada não possui pontos de coleta.",
                "erro"
            );

            return;
        }

        limparMensagemMedicao();

        pontosDaMedicao.forEach(
            function (ponto) {
                const cartao =
                    document.createElement(
                        "article"
                    );

                cartao.className =
                    "cartao-ponto-medicao";

                cartao.innerHTML = `
                    <h3>
                        ${escaparHTML(ponto.nome)}
                    </h3>

                    <div class="parametros-ponto">

                        ${criarCampoParametro(
                            ponto,
                            "cloro",
                            "Cloro"
                        )}

                        ${criarCampoParametro(
                            ponto,
                            "ph",
                            "pH"
                        )}

                    </div>
                `;

                area.appendChild(cartao);
            }
        );

        area
            .querySelectorAll(
                ".status-parametro"
            )
            .forEach(function (campoStatus) {
                campoStatus.addEventListener(
                    "change",
                    function () {
                        atualizarStatusParametro(
                            campoStatus
                        );
                    }
                );
            });
    }

    function atualizarStatusParametro(
        campoStatus
    ) {
        const pontoId =
            campoStatus.dataset.pontoId;

        const parametro =
            campoStatus.dataset.parametro;

        const campoValor =
            document.querySelector(
                `.valor-parametro[data-ponto-id="${pontoId}"][data-parametro="${parametro}"]`
            );

        const informarValor =
            campoStatus.value === "valor";

        campoValor.disabled =
            !informarValor;

        if (!informarValor) {
            campoValor.value = "";
        }
    }

    function obterResultadoParametro(
        pontoId,
        parametro
    ) {
        const campoStatus =
            document.querySelector(
                `.status-parametro[data-ponto-id="${pontoId}"][data-parametro="${parametro}"]`
            );

        const campoValor =
            document.querySelector(
                `.valor-parametro[data-ponto-id="${pontoId}"][data-parametro="${parametro}"]`
            );

        const status =
            campoStatus.value;

        if (status !== "valor") {
            return {
                status: status,
                valor: null
            };
        }

        const textoValor =
            campoValor.value.trim();

        if (textoValor === "") {
            return null;
        }

        return {
            status: "valor",
            valor: Number(textoValor)
        };
    }

    function salvarNovaMedicao(evento) {
        evento.preventDefault();

        limparMensagemMedicao();

        const clienteId =
            document.getElementById(
                "clienteMedicao"
            ).value;

        const etaId =
            document.getElementById(
                "etaMedicao"
            ).value;

        const responsavel =
            document.getElementById(
                "responsavelMedicao"
            ).value.trim();

        const dataHora =
            document.getElementById(
                "dataHoraMedicao"
            ).value;

        if (!clienteId || !etaId) {
            mostrarMensagemMedicao(
                "Selecione o cliente e a ETA.",
                "erro"
            );

            return;
        }

        if (responsavel.length < 2) {
            mostrarMensagemMedicao(
                "Informe a responsável pela medição.",
                "erro"
            );

            return;
        }

        if (!dataHora) {
            mostrarMensagemMedicao(
                "Informe a data e a hora.",
                "erro"
            );

            return;
        }

        if (pontosDaMedicao.length === 0) {
            mostrarMensagemMedicao(
                "A ETA precisa ter pontos cadastrados.",
                "erro"
            );

            return;
        }

        const resultados = [];

        for (const ponto of pontosDaMedicao) {
            const cloro =
                obterResultadoParametro(
                    ponto.id,
                    "cloro"
                );

            const ph =
                obterResultadoParametro(
                    ponto.id,
                    "ph"
                );

            if (!cloro || !ph) {
                mostrarMensagemMedicao(
                    `Preencha ou marque como não analisado os dados do ponto "${ponto.nome}".`,
                    "erro"
                );

                return;
            }

            resultados.push({
                pontoId: ponto.id,
                pontoNome: ponto.nome,
                cloro: cloro,
                ph: ph
            });
        }

        const cliente =
            Banco.buscarClientePorId(
                clienteId
            );

        const eta =
            Banco.buscarEtaPorId(etaId);

        const volumeTanqueTexto =
            document.getElementById(
                "volumeTanqueMedicao"
            ).value;

        const cloroAdicionadoTexto =
            document.getElementById(
                "cloroAdicionadoMedicao"
            ).value;

        const observacoes =
            document.getElementById(
                "observacoesMedicao"
            ).value.trim();

        const medicoes =
            Banco.listarMedicoes();

        medicoes.push({
            id: Banco.gerarId(),

            clienteId: clienteId,
            clienteNome: cliente.nome,

            etaId: etaId,
            etaNome: eta.nome,

            responsavel: responsavel,

            dataHora:
                new Date(dataHora).toISOString(),

            resultados: resultados,

            volumeTanque:
                volumeTanqueTexto === ""
                    ? null
                    : Number(volumeTanqueTexto),

            cloroAdicionado:
                cloroAdicionadoTexto === ""
                    ? null
                    : Number(cloroAdicionadoTexto),

            observacoes: observacoes,

            criadoEm:
                new Date().toISOString()
        });

        const salvou =
            Banco.salvarMedicoes(medicoes);

        if (!salvou) {
            mostrarMensagemMedicao(
                "Não foi possível salvar a medição.",
                "erro"
            );

            return;
        }

        mostrarMensagemMedicao(
            "Medição salva com sucesso!",
            "sucesso"
        );

        setTimeout(function () {
            fecharNovaMedicao();
        }, 900);
    }

    function conectarBotaoNovaMedicao() {
        const botao =
            document.getElementById(
                "botaoNovaMedicao"
            );

        if (!botao) {
            return;
        }

        /*
         * O script.js já possui um evento antigo nesse botão.
         * Vamos substituir o botão por uma cópia para remover
         * o aviso antigo sem alterar o script.js.
         */

        const novoBotao =
            botao.cloneNode(true);

        botao.parentNode.replaceChild(
            novoBotao,
            botao
        );

        novoBotao.addEventListener(
            "click",
            abrirNovaMedicao
        );
    }

    criarEstilosMedicao();
    criarInterfaceMedicao();
    conectarBotaoNovaMedicao();
})();