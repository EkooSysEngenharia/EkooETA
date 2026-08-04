(function () {
    function escaparHTML(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    function formatarDataHora(dataISO) {
        if (!dataISO) {
            return "Data não informada";
        }

        const data = new Date(dataISO);

        if (Number.isNaN(data.getTime())) {
            return dataISO;
        }

        return data.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    function formatarResultado(resultado) {
        if (!resultado) {
            return "Não informado";
        }

        if (resultado.status === "nao_analisado") {
            return "Não analisado";
        }

        if (resultado.status === "na") {
            return "N/A";
        }

        if (
            resultado.valor === null ||
            resultado.valor === undefined
        ) {
            return "Não informado";
        }

        return String(resultado.valor).replace(".", ",");
    }

    function criarEstilosHistorico() {
        if (document.getElementById("estilosHistorico")) {
            return;
        }

        const estilos = document.createElement("style");

        estilos.id = "estilosHistorico";

        estilos.textContent = `
            .modal-historico {
                position: fixed;
                inset: 0;
                z-index: 600;

                display: flex;
                align-items: flex-start;
                justify-content: center;

                padding: 18px;
                overflow-y: auto;

                background: rgba(15, 23, 42, 0.65);
            }

            .modal-historico.escondido {
                display: none;
            }

            .painel-historico {
                width: 100%;
                max-width: 700px;

                margin: 18px auto;
                padding: 22px;

                border-radius: 22px;

                background: white;

                box-shadow:
                    0 18px 45px rgba(0, 0, 0, 0.22);
            }

            .cabecalho-historico {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 20px;
            }

            .cabecalho-historico h2 {
                margin-bottom: 5px;

                color: #007238;

                font-size: 24px;
            }

            .cabecalho-historico p {
                color: #65727d;

                font-size: 13px;
            }

            .fechar-historico {
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

            .filtros-historico {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 12px;

                margin-bottom: 18px;
            }

            .campo-filtro-historico {
                display: flex;
                flex-direction: column;

                gap: 6px;
            }

            .campo-filtro-historico label {
                font-size: 13px;
                font-weight: bold;
            }

            .campo-filtro-historico input,
            .campo-filtro-historico select {
                width: 100%;

                padding: 11px;

                border: 1px solid #dce5e9;
                border-radius: 11px;
                outline: none;

                background: white;

                font-size: 14px;
            }

            .lista-historico {
                display: flex;
                flex-direction: column;

                gap: 12px;
            }

            .cartao-historico {
                padding: 17px;

                border: 1px solid #dce5e9;
                border-radius: 16px;

                background: #ffffff;

                box-shadow:
                    0 7px 18px rgba(31, 41, 51, 0.06);
            }

            .topo-cartao-historico {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 14px;
            }

            .dados-historico h3 {
                margin-bottom: 6px;

                color: #007238;

                font-size: 17px;
            }

            .dados-historico p {
                margin: 3px 0;

                color: #65727d;

                font-size: 13px;
            }

            .data-historico {
                padding: 6px 9px;

                border-radius: 999px;

                background: #e8f7ef;
                color: #007238;

                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
            }

            .acoes-historico {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 9px;

                margin-top: 14px;
            }

            .acoes-historico button {
                min-height: 41px;

                border-radius: 11px;

                font-size: 13px;
                font-weight: bold;

                cursor: pointer;
            }

            .ver-medicao {
                border: none;

                background: #009846;
                color: white;
            }

            .excluir-medicao {
                border: 1px solid #f0caca;

                background: #fff5f5;
                color: #c62828;
            }

            .historico-vazio {
                padding: 35px 18px;

                border: 1px dashed #dce5e9;
                border-radius: 16px;

                color: #65727d;

                text-align: center;
                line-height: 1.5;
            }

            .detalhes-medicao {
                margin-top: 18px;
                padding-top: 18px;

                border-top: 1px solid #dce5e9;
            }

            .detalhes-medicao.escondido {
                display: none;
            }

            .resumo-medicao {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 10px;

                margin-bottom: 16px;
            }

            .item-resumo {
                padding: 12px;

                border-radius: 11px;

                background: #f4f7f8;
            }

            .item-resumo strong {
                display: block;

                margin-bottom: 4px;

                color: #007238;

                font-size: 12px;
            }

            .item-resumo span {
                font-size: 14px;
            }

            .tabela-resultados {
                width: 100%;

                border-collapse: collapse;

                margin-top: 12px;

                font-size: 13px;
            }

            .tabela-resultados th,
            .tabela-resultados td {
                padding: 10px;

                border: 1px solid #dce5e9;

                text-align: left;
            }

            .tabela-resultados th {
                background: #e8f7ef;
                color: #007238;
            }

            .observacoes-historico {
                margin-top: 14px;
                padding: 13px;

                border-radius: 11px;

                background: #f4f7f8;

                font-size: 13px;
                line-height: 1.5;
            }

            @media (max-width: 560px) {
                .filtros-historico,
                .resumo-medicao {
                    grid-template-columns: 1fr;
                }

                .topo-cartao-historico {
                    flex-direction: column;
                }

                .data-historico {
                    white-space: normal;
                }

                .tabela-resultados {
                    font-size: 12px;
                }

                .tabela-resultados th,
                .tabela-resultados td {
                    padding: 8px 6px;
                }
            }
        `;

        document.head.appendChild(estilos);
    }

    function criarInterfaceHistorico() {
        if (document.getElementById("modalHistorico")) {
            return;
        }

        const modal = document.createElement("div");

        modal.id = "modalHistorico";
        modal.className = "modal-historico escondido";

        modal.innerHTML = `
            <section class="painel-historico">

                <div class="cabecalho-historico">

                    <div>
                        <h2>Histórico</h2>

                        <p>
                            Consulte as medições realizadas
                        </p>
                    </div>

                    <button
                        id="fecharHistorico"
                        class="fechar-historico"
                        type="button"
                    >
                        ×
                    </button>

                </div>

                <div class="filtros-historico">

                    <div class="campo-filtro-historico">

                        <label for="pesquisaHistorico">
                            Pesquisar
                        </label>

                        <input
                            id="pesquisaHistorico"
                            type="search"
                            placeholder="Cliente, ETA ou responsável"
                        >

                    </div>

                    <div class="campo-filtro-historico">

                        <label for="clienteHistorico">
                            Cliente
                        </label>

                        <select id="clienteHistorico">
                            <option value="">
                                Todos os clientes
                            </option>
                        </select>

                    </div>

                </div>

                <div
                    id="listaHistorico"
                    class="lista-historico"
                ></div>

            </section>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("fecharHistorico")
            .addEventListener(
                "click",
                fecharHistorico
            );

        document
            .getElementById("pesquisaHistorico")
            .addEventListener(
                "input",
                renderizarHistorico
            );

        document
            .getElementById("clienteHistorico")
            .addEventListener(
                "change",
                renderizarHistorico
            );

        modal.addEventListener(
            "click",
            function (evento) {
                if (evento.target === modal) {
                    fecharHistorico();
                }
            }
        );
    }

    function preencherFiltroClientes() {
        const campo =
            document.getElementById(
                "clienteHistorico"
            );

        const valorAtual = campo.value;

        campo.innerHTML = `
            <option value="">
                Todos os clientes
            </option>
        `;

        Banco
            .listarClientes()
            .sort(function (a, b) {
                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );
            })
            .forEach(function (cliente) {
                const opcao =
                    document.createElement("option");

                opcao.value = cliente.id;
                opcao.textContent = cliente.nome;

                campo.appendChild(opcao);
            });

        campo.value = valorAtual;
    }

    function abrirHistorico() {
        preencherFiltroClientes();

        document.getElementById(
            "pesquisaHistorico"
        ).value = "";

        document.getElementById(
            "clienteHistorico"
        ).value = "";

        renderizarHistorico();

        document
            .getElementById("modalHistorico")
            .classList.remove("escondido");
    }

    function fecharHistorico() {
        document
            .getElementById("modalHistorico")
            .classList.add("escondido");
    }

    function obterMedicoesFiltradas() {
        const pesquisa =
            document
                .getElementById(
                    "pesquisaHistorico"
                )
                .value
                .trim()
                .toLowerCase();

        const clienteId =
            document.getElementById(
                "clienteHistorico"
            ).value;

        return Banco
            .listarMedicoes()
            .filter(function (medicao) {
                if (
                    clienteId &&
                    medicao.clienteId !== clienteId
                ) {
                    return false;
                }

                const texto = `
                    ${medicao.clienteNome || ""}
                    ${medicao.etaNome || ""}
                    ${medicao.responsavel || ""}
                `.toLowerCase();

                return texto.includes(pesquisa);
            })
            .sort(function (a, b) {
                return (
                    new Date(b.dataHora) -
                    new Date(a.dataHora)
                );
            });
    }

    function criarDetalhesMedicao(medicao) {
        const resultados =
            Array.isArray(medicao.resultados)
                ? medicao.resultados
                : [];

        const linhas = resultados
            .map(function (resultado) {
                return `
                    <tr>
                        <td>
                            ${escaparHTML(
                                resultado.pontoNome
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                formatarResultado(
                                    resultado.cloro
                                )
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                formatarResultado(
                                    resultado.ph
                                )
                            )}
                        </td>
                    </tr>
                `;
            })
            .join("");

        return `
            <div class="resumo-medicao">

                <div class="item-resumo">
                    <strong>Responsável</strong>
                    <span>
                        ${escaparHTML(
                            medicao.responsavel
                        )}
                    </span>
                </div>

                <div class="item-resumo">
                    <strong>Data e hora</strong>
                    <span>
                        ${escaparHTML(
                            formatarDataHora(
                                medicao.dataHora
                            )
                        )}
                    </span>
                </div>

                <div class="item-resumo">
                    <strong>Volume no tanque</strong>
                    <span>
                        ${
                            medicao.volumeTanque === null ||
                            medicao.volumeTanque === undefined
                                ? "Não informado"
                                : `${String(
                                      medicao.volumeTanque
                                  ).replace(".", ",")} L`
                        }
                    </span>
                </div>

                <div class="item-resumo">
                    <strong>Cloro 12% adicionado</strong>
                    <span>
                        ${
                            medicao.cloroAdicionado === null ||
                            medicao.cloroAdicionado === undefined
                                ? "Não informado"
                                : `${String(
                                      medicao.cloroAdicionado
                                  ).replace(".", ",")} L`
                        }
                    </span>
                </div>

            </div>

            <table class="tabela-resultados">

                <thead>
                    <tr>
                        <th>Ponto</th>
                        <th>Cloro</th>
                        <th>pH</th>
                    </tr>
                </thead>

                <tbody>
                    ${
                        linhas ||
                        `
                            <tr>
                                <td colspan="3">
                                    Nenhum resultado encontrado.
                                </td>
                            </tr>
                        `
                    }
                </tbody>

            </table>

            <div class="observacoes-historico">

                <strong>Observações:</strong>

                <br>

                ${
                    medicao.observacoes
                        ? escaparHTML(
                              medicao.observacoes
                          )
                        : "Nenhuma observação registrada."
                }

            </div>
        `;
    }

    function excluirMedicao(id) {
        const medicoes =
            Banco.listarMedicoes();

        const medicao =
            medicoes.find(function (item) {
                return item.id === id;
            });

        if (!medicao) {
            return;
        }

        const confirmar =
            window.confirm(
                `Excluir a medição de "${medicao.clienteNome}" realizada em ${formatarDataHora(
                    medicao.dataHora
                )}?`
            );

        if (!confirmar) {
            return;
        }

        const atualizadas =
            medicoes.filter(function (item) {
                return item.id !== id;
            });

        Banco.salvarMedicoes(atualizadas);

        renderizarHistorico();
    }

    function criarCartaoHistorico(medicao) {
        const cartao =
            document.createElement("article");

        cartao.className =
            "cartao-historico";

        cartao.innerHTML = `
            <div class="topo-cartao-historico">

                <div class="dados-historico">

                    <h3>
                        ${escaparHTML(
                            medicao.clienteNome
                        )}
                    </h3>

                    <p>
                        <strong>ETA:</strong>
                        ${escaparHTML(
                            medicao.etaNome
                        )}
                    </p>

                    <p>
                        <strong>Responsável:</strong>
                        ${escaparHTML(
                            medicao.responsavel
                        )}
                    </p>

                </div>

                <span class="data-historico">
                    ${escaparHTML(
                        formatarDataHora(
                            medicao.dataHora
                        )
                    )}
                </span>

            </div>

            <div class="acoes-historico">

                <button
                    class="ver-medicao"
                    type="button"
                >
                    Ver medição
                </button>

                <button
                    class="excluir-medicao"
                    type="button"
                >
                    Excluir
                </button>

            </div>

            <div
                class="detalhes-medicao escondido"
            >
                ${criarDetalhesMedicao(medicao)}
            </div>
        `;

        const botaoVer =
            cartao.querySelector(
                ".ver-medicao"
            );

        const detalhes =
            cartao.querySelector(
                ".detalhes-medicao"
            );

        botaoVer.addEventListener(
            "click",
            function () {
                detalhes.classList.toggle(
                    "escondido"
                );

                botaoVer.textContent =
                    detalhes.classList.contains(
                        "escondido"
                    )
                        ? "Ver medição"
                        : "Fechar detalhes";
            }
        );

        cartao
            .querySelector(
                ".excluir-medicao"
            )
            .addEventListener(
                "click",
                function () {
                    excluirMedicao(
                        medicao.id
                    );
                }
            );

        return cartao;
    }

    function renderizarHistorico() {
        const lista =
            document.getElementById(
                "listaHistorico"
            );

        const medicoes =
            obterMedicoesFiltradas();

        lista.innerHTML = "";

        if (medicoes.length === 0) {
            lista.innerHTML = `
                <div class="historico-vazio">

                    <strong>
                        Nenhuma medição encontrada.
                    </strong>

                    <br><br>

                    Registre uma nova medição para
                    começar a formar o histórico.

                </div>
            `;

            return;
        }

        medicoes.forEach(
            function (medicao) {
                lista.appendChild(
                    criarCartaoHistorico(
                        medicao
                    )
                );
            }
        );
    }

    function conectarBotaoHistorico() {
        const botao =
            document.getElementById(
                "botaoHistorico"
            );

        if (!botao) {
            return;
        }

        const novoBotao =
            botao.cloneNode(true);

        botao.parentNode.replaceChild(
            novoBotao,
            botao
        );

        novoBotao.addEventListener(
            "click",
            abrirHistorico
        );
    }

    criarEstilosHistorico();
    criarInterfaceHistorico();
    conectarBotaoHistorico();
})();