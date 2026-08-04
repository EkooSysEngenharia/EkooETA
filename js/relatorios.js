(function () {
    function escaparHTML(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor ?? "");
        return elemento.innerHTML;
    }

    function limparNomeArquivo(valor) {
        return String(valor)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9-_ ]/g, "")
            .trim()
            .replace(/\s+/g, "_");
    }

    function formatarDataHoraExcel(dataISO) {
        const data = new Date(dataISO);

        if (Number.isNaN(data.getTime())) {
            return dataISO || "";
        }

        return data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function formatarResultado(resultado) {
        if (!resultado) {
            return "";
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
            return "";
        }

        return resultado.valor;
    }

    function criarEstilosRelatorios() {
        if (document.getElementById("estilosRelatorios")) {
            return;
        }

        const estilos = document.createElement("style");

        estilos.id = "estilosRelatorios";

        estilos.textContent = `
            .modal-relatorios {
                position: fixed;
                inset: 0;
                z-index: 700;

                display: flex;
                align-items: flex-start;
                justify-content: center;

                padding: 18px;
                overflow-y: auto;

                background: rgba(15, 23, 42, 0.65);
            }

            .modal-relatorios.escondido {
                display: none;
            }

            .painel-relatorios {
                width: 100%;
                max-width: 620px;

                margin: 18px auto;
                padding: 22px;

                border-radius: 22px;

                background: white;

                box-shadow:
                    0 18px 45px rgba(0, 0, 0, 0.22);
            }

            .cabecalho-relatorios {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 22px;
            }

            .cabecalho-relatorios h2 {
                margin-bottom: 5px;

                color: #007238;

                font-size: 24px;
            }

            .cabecalho-relatorios p {
                color: #65727d;

                font-size: 13px;
            }

            .fechar-relatorios {
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

            .grade-relatorios {
                display: grid;
                grid-template-columns: 1fr 1fr;

                gap: 14px;
            }

            .campo-relatorio {
                display: flex;
                flex-direction: column;

                gap: 7px;
            }

            .campo-relatorio.campo-largo {
                grid-column: 1 / -1;
            }

            .campo-relatorio label {
                color: #1f2933;

                font-size: 13px;
                font-weight: bold;
            }

            .campo-relatorio select,
            .campo-relatorio input {
                width: 100%;

                padding: 12px;

                border: 1px solid #dce5e9;
                border-radius: 11px;
                outline: none;

                background: white;
                color: #1f2933;

                font-size: 15px;
            }

            .campo-relatorio select:focus,
            .campo-relatorio input:focus {
                border-color: #009846;

                box-shadow:
                    0 0 0 3px rgba(0, 152, 70, 0.12);
            }

            .resumo-relatorio {
                margin-top: 18px;
                padding: 15px;

                border-radius: 14px;

                background: #f4f7f8;

                color: #65727d;

                font-size: 14px;
                line-height: 1.5;
            }

            .mensagem-relatorio {
                margin-top: 15px;
                padding: 12px;

                border-radius: 12px;

                font-size: 13px;
                font-weight: bold;
            }

            .mensagem-relatorio.erro {
                background: #fff0f0;
                color: #c62828;
            }

            .mensagem-relatorio.sucesso {
                background: #e8f7ef;
                color: #007238;
            }

            .acoes-relatorios {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;

                margin-top: 20px;
            }

            .cancelar-relatorio,
            .exportar-excel {
                min-height: 48px;

                border-radius: 13px;

                font-size: 15px;
                font-weight: bold;

                cursor: pointer;
            }

            .cancelar-relatorio {
                border: 1px solid #dce5e9;

                background: white;
                color: #1f2933;
            }

            .exportar-excel {
                border: none;

                background: #009846;
                color: white;
            }

            .exportar-excel:hover {
                background: #007238;
            }

            @media (max-width: 550px) {
                .grade-relatorios {
                    grid-template-columns: 1fr;
                }

                .campo-relatorio.campo-largo {
                    grid-column: auto;
                }
            }
        `;

        document.head.appendChild(estilos);
    }

    function criarInterfaceRelatorios() {
        if (document.getElementById("modalRelatorios")) {
            return;
        }

        const modal = document.createElement("div");

        modal.id = "modalRelatorios";
        modal.className = "modal-relatorios escondido";

        modal.innerHTML = `
            <section class="painel-relatorios">

                <div class="cabecalho-relatorios">

                    <div>
                        <h2>Relatórios</h2>

                        <p>
                            Exporte as medições em uma planilha Excel
                        </p>
                    </div>

                    <button
                        id="fecharRelatorios"
                        class="fechar-relatorios"
                        type="button"
                    >
                        ×
                    </button>

                </div>

                <div class="grade-relatorios">

                    <div class="campo-relatorio campo-largo">

                        <label for="clienteRelatorio">
                            Cliente
                        </label>

                        <select id="clienteRelatorio">

                            <option value="">
                                Todos os clientes
                            </option>

                        </select>

                    </div>

                    <div class="campo-relatorio campo-largo">

                        <label for="etaRelatorio">
                            ETA
                        </label>

                        <select id="etaRelatorio">

                            <option value="">
                                Todas as ETAs
                            </option>

                        </select>

                    </div>

                    <div class="campo-relatorio">

                        <label for="dataInicialRelatorio">
                            Data inicial
                        </label>

                        <input
                            id="dataInicialRelatorio"
                            type="date"
                        >

                    </div>

                    <div class="campo-relatorio">

                        <label for="dataFinalRelatorio">
                            Data final
                        </label>

                        <input
                            id="dataFinalRelatorio"
                            type="date"
                        >

                    </div>

                </div>

                <div
                    id="resumoRelatorio"
                    class="resumo-relatorio"
                >
                    Selecione os filtros desejados.
                </div>

                <div id="mensagemRelatorio"></div>

                <div class="acoes-relatorios">

                    <button
                        id="cancelarRelatorio"
                        class="cancelar-relatorio"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
    id="gerarPdf"
    class="gerar-pdf"
    type="button"
>
    Gerar PDF
</button>
                    <button
                        id="exportarExcel"
                        class="exportar-excel"
                        type="button"
                    >
                        Baixar Excel
                    </button>

                </div>

            </section>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("fecharRelatorios")
            .addEventListener(
                "click",
                fecharRelatorios
            );

        document
            .getElementById("cancelarRelatorio")
            .addEventListener(
                "click",
                fecharRelatorios
            );

        document
            .getElementById("clienteRelatorio")
            .addEventListener(
                "change",
                function () {
                    preencherEtasRelatorio();
                    atualizarResumoRelatorio();
                }
            );

        document
            .getElementById("etaRelatorio")
            .addEventListener(
                "change",
                atualizarResumoRelatorio
            );

        document
            .getElementById("dataInicialRelatorio")
            .addEventListener(
                "change",
                atualizarResumoRelatorio
            );

        document
            .getElementById("dataFinalRelatorio")
            .addEventListener(
                "change",
                atualizarResumoRelatorio
            );

        document
            .getElementById("exportarExcel")
            .addEventListener(
                "click",
                gerarExcel
            );

            document
    .getElementById("gerarPdf")
    .addEventListener(
        "click",
        gerarPdf
    );
        modal.addEventListener(
            "click",
            function (evento) {
                if (evento.target === modal) {
                    fecharRelatorios();
                }
            }
        );
    }

    function mostrarMensagemRelatorio(texto, tipo) {
        const area =
            document.getElementById(
                "mensagemRelatorio"
            );

        area.className =
            `mensagem-relatorio ${tipo}`;

        area.textContent = texto;
    }

    function limparMensagemRelatorio() {
        const area =
            document.getElementById(
                "mensagemRelatorio"
            );

        area.className = "";

        area.textContent = "";
    }

    function preencherClientesRelatorio() {
        const campo =
            document.getElementById(
                "clienteRelatorio"
            );

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
    }

    function preencherEtasRelatorio() {
        const clienteId =
            document.getElementById(
                "clienteRelatorio"
            ).value;

        const campoEta =
            document.getElementById(
                "etaRelatorio"
            );

        campoEta.innerHTML = `
            <option value="">
                Todas as ETAs
            </option>
        `;

        const etas = clienteId
            ? Banco.listarEtasDoCliente(clienteId)
            : Banco.listarEtas();

        etas
            .sort(function (a, b) {
                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );
            })
            .forEach(function (eta) {
                const opcao =
                    document.createElement("option");

                opcao.value = eta.id;

                const cliente =
                    Banco.buscarClientePorId(
                        eta.clienteId
                    );

                opcao.textContent =
                    clienteId || !cliente
                        ? eta.nome
                        : `${cliente.nome} — ${eta.nome}`;

                campoEta.appendChild(opcao);
            });
    }

    function obterMedicoesFiltradas() {
        const clienteId =
            document.getElementById(
                "clienteRelatorio"
            ).value;

        const etaId =
            document.getElementById(
                "etaRelatorio"
            ).value;

        const dataInicial =
            document.getElementById(
                "dataInicialRelatorio"
            ).value;

        const dataFinal =
            document.getElementById(
                "dataFinalRelatorio"
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

                if (
                    etaId &&
                    medicao.etaId !== etaId
                ) {
                    return false;
                }

                const dataMedicao =
                    new Date(medicao.dataHora);

                if (dataInicial) {
                    const inicio =
                        new Date(
                            `${dataInicial}T00:00:00`
                        );

                    if (dataMedicao < inicio) {
                        return false;
                    }
                }

                if (dataFinal) {
                    const fim =
                        new Date(
                            `${dataFinal}T23:59:59`
                        );

                    if (dataMedicao > fim) {
                        return false;
                    }
                }

                return true;
            })
            .sort(function (a, b) {
                return (
                    new Date(a.dataHora) -
                    new Date(b.dataHora)
                );
            });
    }

    function atualizarResumoRelatorio() {
        const medicoes =
            obterMedicoesFiltradas();

        const resumo =
            document.getElementById(
                "resumoRelatorio"
            );

        if (medicoes.length === 0) {
            resumo.textContent =
                "Nenhuma medição encontrada com os filtros selecionados.";

            return;
        }

        resumo.textContent =
            `${medicoes.length} medição(ões) será(ão) incluída(s) no Excel.`;
    }

    function abrirRelatorios() {
        limparMensagemRelatorio();

        preencherClientesRelatorio();
        preencherEtasRelatorio();

        document.getElementById(
            "clienteRelatorio"
        ).value = "";

        document.getElementById(
            "etaRelatorio"
        ).value = "";

        document.getElementById(
            "dataInicialRelatorio"
        ).value = "";

        document.getElementById(
            "dataFinalRelatorio"
        ).value = "";

        atualizarResumoRelatorio();

        document
            .getElementById("modalRelatorios")
            .classList.remove("escondido");
    }

    function fecharRelatorios() {
        document
            .getElementById("modalRelatorios")
            .classList.add("escondido");
    }

    function obterNomesDosPontos(medicoes) {
        const nomes = [];

        medicoes.forEach(function (medicao) {
            const resultados =
                Array.isArray(medicao.resultados)
                    ? medicao.resultados
                    : [];

            resultados.forEach(function (resultado) {
                if (
                    resultado.pontoNome &&
                    !nomes.includes(
                        resultado.pontoNome
                    )
                ) {
                    nomes.push(
                        resultado.pontoNome
                    );
                }
            });
        });

        return nomes;
    }

    function localizarResultado(
        medicao,
        pontoNome
    ) {
        const resultados =
            Array.isArray(medicao.resultados)
                ? medicao.resultados
                : [];

        return resultados.find(
            function (resultado) {
                return (
                    resultado.pontoNome ===
                    pontoNome
                );
            }
        );
    }

    function criarLinhasExcel(
        medicoes,
        nomesPontos
    ) {
        return medicoes.map(
            function (medicao) {
                const linha = {
                    "Carimbo de data/hora":
                        formatarDataHoraExcel(
                            medicao.dataHora
                        ),

                    "Responsável pela medição":
                        medicao.responsavel || "",

                    "Cliente":
                        medicao.clienteNome || "",

                    "ETA":
                        medicao.etaNome || ""
                };

                nomesPontos.forEach(
                    function (pontoNome) {
                        const resultado =
                            localizarResultado(
                                medicao,
                                pontoNome
                            );

                        linha[
                            `Cloro ${pontoNome}`
                        ] = resultado
                            ? formatarResultado(
                                  resultado.cloro
                              )
                            : "";
                    }
                );

                linha[
                    "Volume de Solução no Tanque de 50L (em litros)"
                ] =
                    medicao.volumeTanque ??
                    "";

                linha[
                    "Quantidade de Cloro 12% adicionado (em litros)"
                ] =
                    medicao.cloroAdicionado ??
                    "";

                nomesPontos.forEach(
                    function (pontoNome) {
                        const resultado =
                            localizarResultado(
                                medicao,
                                pontoNome
                            );

                        linha[
                            `pH ${pontoNome}`
                        ] = resultado
                            ? formatarResultado(
                                  resultado.ph
                              )
                            : "";
                    }
                );

                linha["Observações"] =
                    medicao.observacoes || "";

                return linha;
            }
        );
    }

    function ajustarLarguraColunas(
        planilha,
        linhas
    ) {
        if (linhas.length === 0) {
            return;
        }

        const cabecalhos =
            Object.keys(linhas[0]);

        planilha["!cols"] =
            cabecalhos.map(
                function (cabecalho) {
                    let maior =
                        cabecalho.length;

                    linhas.forEach(
                        function (linha) {
                            const tamanho =
                                String(
                                    linha[cabecalho] ??
                                        ""
                                ).length;

                            if (tamanho > maior) {
                                maior = tamanho;
                            }
                        }
                    );

                    return {
                        wch: Math.min(
                            Math.max(
                                maior + 2,
                                12
                            ),
                            40
                        )
                    };
                }
            );
    }

    function gerarNomeArquivo(medicoes) {
        const clienteId =
            document.getElementById(
                "clienteRelatorio"
            ).value;

        const etaId =
            document.getElementById(
                "etaRelatorio"
            ).value;

        let nome =
            "Relatorio_Ekoo_ETA";

        if (clienteId) {
            const cliente =
                Banco.buscarClientePorId(
                    clienteId
                );

            if (cliente) {
                nome +=
                    `_${limparNomeArquivo(
                        cliente.nome
                    )}`;
            }
        }

        if (etaId) {
            const eta =
                Banco.buscarEtaPorId(etaId);

            if (eta) {
                nome +=
                    `_${limparNomeArquivo(
                        eta.nome
                    )}`;
            }
        }

        const hoje =
            new Date()
                .toISOString()
                .slice(0, 10);

        return `${nome}_${hoje}.xlsx`;
    }

    function gerarExcel() {
        limparMensagemRelatorio();

        if (
            typeof XLSX === "undefined"
        ) {
            mostrarMensagemRelatorio(
                "A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.",
                "erro"
            );

            return;
        }

        const medicoes =
            obterMedicoesFiltradas();

        if (medicoes.length === 0) {
            mostrarMensagemRelatorio(
                "Não existem medições para exportar com esses filtros.",
                "erro"
            );

            return;
        }

        const nomesPontos =
            obterNomesDosPontos(medicoes);

        const linhas =
            criarLinhasExcel(
                medicoes,
                nomesPontos
            );

        const planilha =
            XLSX.utils.json_to_sheet(
                linhas
            );

        ajustarLarguraColunas(
            planilha,
            linhas
        );

        planilha["!autofilter"] = {
            ref: planilha["!ref"]
        };

        const arquivo =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            arquivo,
            planilha,
            "Medições"
        );

        const nomeArquivo =
            gerarNomeArquivo(medicoes);

        XLSX.writeFile(
            arquivo,
            nomeArquivo
        );

        mostrarMensagemRelatorio(
            "Planilha gerada com sucesso!",
            "sucesso"
        );
    }
    function obterValorNumerico(resultado) {
    if (
        !resultado ||
        resultado.status !== "valor" ||
        resultado.valor === null ||
        resultado.valor === undefined
    ) {
        return null;
    }

    return Number(resultado.valor);
}

function misturarCores(corInicial, corFinal, intensidade) {
    const nivel = Math.max(
        0,
        Math.min(1, intensidade)
    );

    return corInicial.map(function (valor, indice) {
        return Math.round(
            valor +
            (corFinal[indice] - valor) * nivel
        );
    });
}

function calcularCorIndicador(parametro, resultado) {
    const valor = obterValorNumerico(resultado);

    if (valor === null || Number.isNaN(valor)) {
        return [150, 160, 165];
    }

    const verde = [0, 152, 70];
    const amarelo = [245, 166, 35];
    const vermelho = [198, 40, 40];

    let minimo;
    let maximo;
    let distanciaMaxima;

    if (parametro === "cloro") {
        minimo = 3;
        maximo = 5;
        distanciaMaxima = 3;
    } else {
        minimo = 7;
        maximo = 7.4;
        distanciaMaxima = 1;
    }

    if (valor >= minimo && valor <= maximo) {
        return verde;
    }

    const distancia =
        valor < minimo
            ? minimo - valor
            : valor - maximo;

    const intensidade = Math.min(
        distancia / distanciaMaxima,
        1
    );

    if (intensidade <= 0.5) {
        return misturarCores(
            amarelo,
            vermelho,
            intensidade * 2
        );
    }

    return vermelho;
}

async function gerarPdf() {
    limparMensagemRelatorio();

    if (!window.jspdf || !window.jspdf.jsPDF) {
        mostrarMensagemRelatorio(
            "A biblioteca do PDF não foi carregada.",
            "erro"
        );

        return;
    }

    const medicoes = obterMedicoesFiltradas();

    if (medicoes.length === 0) {
        mostrarMensagemRelatorio(
            "Não existem medições para gerar o PDF.",
            "erro"
        );

        return;
    }

    const { jsPDF } = window.jspdf;

    const documento = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const larguraPagina =
        documento.internal.pageSize.getWidth();

    for (
        let indice = 0;
        indice < medicoes.length;
        indice++
    ) {
        const medicao = medicoes[indice];

        if (indice > 0) {
            documento.addPage();
        }

        documento.setTextColor(0, 114, 56);
        documento.setFontSize(18);
        documento.setFont(
            "helvetica",
            "bold"
        );

        documento.text(
            "Ekoo Sys Engenharia",
            14,
            18
        );

        documento.setFontSize(15);

        documento.text(
            "Relatório de Monitoramento da ETA",
            14,
            28
        );

        documento.setDrawColor(0, 152, 70);

        documento.line(
            14,
            33,
            larguraPagina - 14,
            33
        );

        documento.autoTable({
            startY: 40,

            body: [
                [
                    "Cliente",
                    medicao.clienteNome || "-"
                ],
                [
                    "ETA",
                    medicao.etaNome || "-"
                ],
                [
                    "Data e hora",
                    formatarDataHoraExcel(
                        medicao.dataHora
                    )
                ],
                [
                    "Responsável",
                    medicao.responsavel || "-"
                ]
            ],

            theme: "grid",

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            columnStyles: {
                0: {
                    fontStyle: "bold",
                    textColor: [0, 114, 56],
                    fillColor: [232, 247, 239],
                    cellWidth: 42
                }
            },

            margin: {
                left: 14,
                right: 14
            }
        });

        const resultados =
            Array.isArray(medicao.resultados)
                ? medicao.resultados
                : [];

        const linhasResultados =
            resultados.map(function (resultado) {
                return [
                    resultado.pontoNome || "-",

                    String(
                        formatarResultado(
                            resultado.cloro
                        ) || "-"
                    ).replace(".", ","),

                    String(
                        formatarResultado(
                            resultado.ph
                        ) || "-"
                    ).replace(".", ",")
                ];
            });

        documento.autoTable({
            startY:
                documento.lastAutoTable.finalY +
                8,

            head: [
                [
                    "Ponto de coleta",
                    "Cloro (mg/L)",
                    "pH"
                ]
            ],

            body:
                linhasResultados.length > 0
                    ? linhasResultados
                    : [
                          [
                              "Nenhum resultado",
                              "-",
                              "-"
                          ]
                      ],

            theme: "grid",

            headStyles: {
                fillColor: [0, 152, 70],
                textColor: [255, 255, 255],
                fontStyle: "bold"
            },

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            margin: {
                left: 14,
                right: 14
            },margin: {
    left: 14,
    right: 14
},

didDrawCell: function (dados) {

    if (
        dados.section !== "body" ||
        dados.row.index >= resultados.length
    ) {
        return;
    }

    const resultado =
        resultados[dados.row.index];

    let cor = null;

    if (dados.column.index === 1) {
        cor = calcularCorIndicador(
            "cloro",
            resultado.cloro
        );
    }

    if (dados.column.index === 2) {
        cor = calcularCorIndicador(
            "ph",
            resultado.ph
        );
    }

    if (!cor) {
        return;
    }

    documento.setFillColor(
        cor[0],
        cor[1],
        cor[2]
    );

    documento.circle(
        dados.cell.x +
            dados.cell.width -
            4,
        dados.cell.y +
            dados.cell.height / 2,
        1.8,
        "F"
    );
}
        });

        const volumeTanque =
            medicao.volumeTanque === null ||
            medicao.volumeTanque === undefined
                ? "Não informado"
                : `${String(
                      medicao.volumeTanque
                  ).replace(".", ",")} L`;

        const cloroAdicionado =
            medicao.cloroAdicionado === null ||
            medicao.cloroAdicionado ===
                undefined
                ? "Não informado"
                : `${String(
                      medicao.cloroAdicionado
                  ).replace(".", ",")} L`;

        documento.autoTable({
            startY:
                documento.lastAutoTable.finalY +
                8,

            body: [
                [
                    "Volume de solução no tanque",
                    volumeTanque
                ],
                [
                    "Cloro 12% adicionado",
                    cloroAdicionado
                ]
            ],

            theme: "grid",

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            columnStyles: {
                0: {
                    fontStyle: "bold",
                    textColor: [0, 114, 56],
                    fillColor: [232, 247, 239],
                    cellWidth: 65
                }
            },

            margin: {
                left: 14,
                right: 14
            }
        });

        let posicaoObservacoes =
            documento.lastAutoTable.finalY + 10;

        if (posicaoObservacoes > 260) {
            documento.addPage();
            posicaoObservacoes = 20;
        }

        documento.setTextColor(0, 114, 56);
        documento.setFontSize(10);
        documento.setFont(
            "helvetica",
            "bold"
        );

        documento.text(
            "Observações",
            14,
            posicaoObservacoes
        );

        documento.setTextColor(45, 55, 60);
        documento.setFontSize(9);
        documento.setFont(
            "helvetica",
            "normal"
        );

        const observacoes =
            documento.splitTextToSize(
                medicao.observacoes ||
                    "Nenhuma observação registrada.",
                larguraPagina - 28
            );

        documento.text(
            observacoes,
            14,
            posicaoObservacoes + 6
        );
    }
const alturaPagina =
    documento.internal.pageSize.getHeight();

const yLegenda =
    alturaPagina - 42;

documento.setFont(
    "helvetica",
    "bold"
);

documento.setFontSize(9);

documento.setTextColor(0,114,56);

documento.text(
    "Legenda dos Indicadores",
    14,
    yLegenda
);

const legenda = [
    {
        cor: [150, 160, 165],
        texto: "Não analisado"
    },
    {
        cor: [0, 152, 70],
        texto: "Faixa ideal"
    },
    {
        cor: [245, 166, 35],
        texto: "Atenção"
    },
    {
        cor: [198, 40, 40],
        texto: "Necessita correção"
    }
];

let posicaoY = yLegenda + 8;

legenda.forEach(function(item){

    documento.setFillColor(
        item.cor[0],
        item.cor[1],
        item.cor[2]
    );

    documento.circle(
        18,
        posicaoY-1,
        1.8,
        "F"
    );

    documento.setTextColor(50,50,50);

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.text(
        item.texto,
        24,
        posicaoY
    );

    posicaoY += 6;

});

    const totalPaginas =
        documento.internal.getNumberOfPages();

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {
        documento.setPage(pagina);

        const alturaPagina =
            documento.internal.pageSize.getHeight();

        documento.setDrawColor(0, 152, 70);

        documento.line(
            14,
            alturaPagina - 16,
            larguraPagina - 14,
            alturaPagina - 16
        );

        documento.setFontSize(8);
        documento.setTextColor(90, 100, 105);

        documento.text(
            "Ekoo Sys Engenharia — Ekoo ETA",
            14,
            alturaPagina - 10
        );

        documento.text(
            `Página ${pagina} de ${totalPaginas}`,
            larguraPagina - 14,
            alturaPagina - 10,
            {
                align: "right"
            }
        );
    }

    const clienteId =
        document.getElementById(
            "clienteRelatorio"
        ).value;

    let nomeArquivo =
        "Relatorio_Ekoo_ETA";

    if (clienteId) {
        const cliente =
            Banco.buscarClientePorId(
                clienteId
            );

        if (cliente) {
            nomeArquivo +=
                `_${limparNomeArquivo(
                    cliente.nome
                )}`;
        }
    }

    nomeArquivo +=
        `_${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`;

    documento.save(nomeArquivo);

    mostrarMensagemRelatorio(
        "PDF gerado com sucesso!",
        "sucesso"
    );
}

    function conectarBotaoRelatorios() {
        const botao =
            document.getElementById(
                "botaoRelatorios"
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
            abrirRelatorios
        );
    }

    criarEstilosRelatorios();
    criarInterfaceRelatorios();
    conectarBotaoRelatorios();
})();