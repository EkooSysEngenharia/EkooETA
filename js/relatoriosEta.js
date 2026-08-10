import { auth } from "../firebase/firebase-config.js";

import {
    listarClientes
} from "../firebase/clientes.js";

import {
    listarEtas
} from "../firebase/etas.js";

import {
    listarPontos
} from "../firebase/pontos.js";

import {
    listarMedicoesPorUsuario
} from "../firebase/medicoes.js";


let usuarioAtualId = null;
let dadosRelatorio = {
    clientes: [],
    etas: [],
    pontos: [],
    medicoes: []
};


export function montarModuloRelatorios(container) {
    garantirEstiloRelatorios();

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

    container.innerHTML = `
        <section class="modulo-relatorios">

            <header class="cabecalho-modulo-relatorios">

                <div>
                    <p class="identificacao-modulo">
                        Consolidação de dados
                    </p>

                    <h1>📄 Relatórios</h1>

                    <p>
                        Consulte os dados cadastrados e gere
                        arquivos para Excel ou PDF.
                    </p>
                </div>

                <div class="acoes-relatorios">

                    <button
                        id="botaoExportarCsv"
                        class="botao-exportar-relatorio"
                        type="button"
                        disabled
                    >
                        Exportar Excel
                    </button>

                    <button
                        id="botaoImprimirRelatorio"
                        class="botao-imprimir-relatorio"
                        type="button"
                        disabled
                    >
                        Imprimir / PDF
                    </button>

                </div>

            </header>

            <section class="filtros-relatorios">

                <div>
                    <label for="clienteRelatorio">
                        Cliente
                    </label>

                    <select id="clienteRelatorio">
                        <option value="">
                            Todos os clientes
                        </option>
                    </select>
                </div>

                <div>
                    <label for="etaRelatorio">
                        ETA
                    </label>

                    <select id="etaRelatorio">
                        <option value="">
                            Todas as ETAs
                        </option>
                    </select>
                </div>

                <div>
                    <label for="dataInicialRelatorio">
                        Data inicial
                    </label>

                    <input
                        id="dataInicialRelatorio"
                        type="date"
                    >
                </div>

                <div>
                    <label for="dataFinalRelatorio">
                        Data final
                    </label>

                    <input
                        id="dataFinalRelatorio"
                        type="date"
                    >
                </div>

                <button
                    id="botaoAplicarRelatorio"
                    type="button"
                >
                    Aplicar filtros
                </button>

            </section>

            <section class="resumo-relatorios">

                <article>
                    <small>Clientes</small>
                    <strong id="totalClientesRelatorio">0</strong>
                </article>

                <article>
                    <small>ETAs</small>
                    <strong id="totalEtasRelatorio">0</strong>
                </article>

                <article>
                    <small>Pontos</small>
                    <strong id="totalPontosRelatorio">0</strong>
                </article>

                <article>
                    <small>Medições</small>
                    <strong id="totalMedicoesRelatorio">0</strong>
                </article>

            </section>

            <section class="area-tabela-relatorio">

                <div class="cabecalho-tabela-relatorio">
                    <div>
                        <h2>Resultados das medições</h2>

                        <p>
                            Cloro, pH, status e responsáveis.
                        </p>
                    </div>

                    <strong id="quantidadeLinhasRelatorio">
                        0 registros
                    </strong>
                </div>

                <div
                    id="conteudoRelatorio"
                    class="conteudo-relatorio"
                >
                    <div class="estado-vazio-relatorio">
                        <span>⏳</span>
                        <strong>Carregando dados...</strong>
                    </div>
                </div>

            </section>

        </section>
    `;

    configurarEventos();
    carregarDadosRelatorio();
}


function configurarEventos() {
    document
        .getElementById("clienteRelatorio")
        .addEventListener(
            "change",
            atualizarOpcoesEtas
        );

    document
        .getElementById("botaoAplicarRelatorio")
        .addEventListener(
            "click",
            aplicarFiltros
        );

    document
        .getElementById("botaoExportarCsv")
        .addEventListener(
            "click",
            exportarCsv
        );

    document
        .getElementById("botaoImprimirRelatorio")
        .addEventListener(
            "click",
            gerarRelatorioPdf
        );
}


async function carregarDadosRelatorio() {
    const conteudo =
        document.getElementById(
            "conteudoRelatorio"
        );

    if (!usuarioAtualId) {
        conteudo.innerHTML = `
            <div class="estado-vazio-relatorio">
                <span>⚠️</span>
                <strong>Usuário não identificado</strong>
            </div>
        `;

        return;
    }

    try {
        const [
            clientes,
            etas,
            medicoes
        ] = await Promise.all([
            listarClientes(usuarioAtualId),
            listarEtas(usuarioAtualId),
            listarMedicoesPorUsuario(
                usuarioAtualId
            )
        ]);

        const listasPontos =
            await Promise.all(
                etas.map(
                    function (eta) {
                        return listarPontos(
                            usuarioAtualId,
                            eta.id
                        );
                    }
                )
            );

        dadosRelatorio = {
            clientes,
            etas,
            pontos:
                listasPontos.flat(),
            medicoes
        };

        preencherClientes();
        atualizarOpcoesEtas();
        aplicarFiltros();

        document.getElementById(
            "botaoExportarCsv"
        ).disabled = false;

        document.getElementById(
            "botaoImprimirRelatorio"
        ).disabled = false;
    } catch (erro) {
        console.error(
            "Erro ao carregar relatório:",
            erro
        );

        conteudo.innerHTML = `
            <div class="estado-vazio-relatorio">
                <span>⚠️</span>

                <strong>
                    Não foi possível carregar o relatório
                </strong>

                <p>
                    Confira a conexão e tente novamente.
                </p>
            </div>
        `;
    }
}


function preencherClientes() {
    const select =
        document.getElementById(
            "clienteRelatorio"
        );

    select.innerHTML = `
        <option value="">
            Todos os clientes
        </option>
    `;

    dadosRelatorio.clientes
        .forEach(function (cliente) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                cliente.id;

            option.textContent =
                obterNomeCliente(cliente);

            select.appendChild(option);
        });
}


function atualizarOpcoesEtas() {
    const clienteId =
        document.getElementById(
            "clienteRelatorio"
        ).value;

    const selectEta =
        document.getElementById(
            "etaRelatorio"
        );

    const valorAtual =
        selectEta.value;

    selectEta.innerHTML = `
        <option value="">
            Todas as ETAs
        </option>
    `;

    dadosRelatorio.etas
        .filter(function (eta) {
            return (
                !clienteId ||
                eta.clienteId === clienteId
            );
        })
        .forEach(function (eta) {
            const option =
                document.createElement(
                    "option"
                );

            option.value = eta.id;
            option.textContent =
                eta.nome || "ETA";

            selectEta.appendChild(option);
        });

    const aindaExiste =
        Array.from(
            selectEta.options
        ).some(
            function (option) {
                return (
                    option.value ===
                    valorAtual
                );
            }
        );

    selectEta.value =
        aindaExiste
            ? valorAtual
            : "";
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

    return dadosRelatorio.medicoes
        .filter(function (medicao) {
            const data =
                String(
                    medicao.dataHora ||
                    ""
                ).slice(0, 10);

            return (
                (
                    !clienteId ||
                    medicao.clienteId ===
                        clienteId
                ) &&
                (
                    !etaId ||
                    medicao.etaId === etaId
                ) &&
                (
                    !dataInicial ||
                    data >= dataInicial
                ) &&
                (
                    !dataFinal ||
                    data <= dataFinal
                )
            );
        });
}


function aplicarFiltros() {
    const medicoes =
        obterMedicoesFiltradas();

    const clienteId =
        document.getElementById(
            "clienteRelatorio"
        ).value;

    const etaId =
        document.getElementById(
            "etaRelatorio"
        ).value;

    const clientes =
        dadosRelatorio.clientes.filter(
            function (cliente) {
                return (
                    !clienteId ||
                    cliente.id === clienteId
                );
            }
        );

    const etas =
        dadosRelatorio.etas.filter(
            function (eta) {
                return (
                    (
                        !clienteId ||
                        eta.clienteId === clienteId
                    ) &&
                    (
                        !etaId ||
                        eta.id === etaId
                    )
                );
            }
        );

    const idsEtas =
        new Set(
            etas.map(
                function (eta) {
                    return eta.id;
                }
            )
        );

    const pontos =
        dadosRelatorio.pontos.filter(
            function (ponto) {
                return idsEtas.has(
                    ponto.etaId
                );
            }
        );

    document.getElementById(
        "totalClientesRelatorio"
    ).textContent =
        String(clientes.length);

    document.getElementById(
        "totalEtasRelatorio"
    ).textContent =
        String(etas.length);

    document.getElementById(
        "totalPontosRelatorio"
    ).textContent =
        String(pontos.length);

    document.getElementById(
        "totalMedicoesRelatorio"
    ).textContent =
        String(medicoes.length);

    document.getElementById(
        "quantidadeLinhasRelatorio"
    ).textContent =
        `${medicoes.length} ${
            medicoes.length === 1
                ? "registro"
                : "registros"
        }`;

    renderizarTabela(medicoes);
}


function renderizarTabela(medicoes) {
    const conteudo =
        document.getElementById(
            "conteudoRelatorio"
        );

    if (medicoes.length === 0) {
        conteudo.innerHTML = `
            <div class="estado-vazio-relatorio">
                <span>📄</span>

                <strong>
                    Nenhum registro encontrado
                </strong>

                <p>
                    Altere os filtros ou cadastre novas medições.
                </p>
            </div>
        `;

        return;
    }

    conteudo.innerHTML = `
        <div class="tabela-relatorio-wrapper">

            <table class="tabela-relatorio">

                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>ETA</th>
                        <th>Ponto</th>
                        <th>Status</th>
                        <th>Cloro</th>
                        <th>pH</th>
                        <th>Responsável</th>
                        <th>Observação</th>
                    </tr>
                </thead>

                <tbody>
                    ${medicoes
                        .map(criarLinhaTabela)
                        .join("")}
                </tbody>

            </table>

        </div>
    `;
}


function criarLinhaTabela(medicao) {
    const status =
        medicao.status ===
        "nao_analisado"
            ? "Não analisado"
            : "Analisado";

    return `
        <tr>
            <td>
                ${formatarDataHora(
                    medicao.dataHora
                )}
            </td>

            <td>
                ${escaparHtml(
                    medicao.clienteNome ||
                    "—"
                )}
            </td>

            <td>
                ${escaparHtml(
                    medicao.etaNome ||
                    "—"
                )}
            </td>

            <td>
                ${escaparHtml(
                    medicao.pontoNome ||
                    "—"
                )}
            </td>

            <td>${status}</td>

            <td>
                ${
                    medicao.cloro !== null &&
                    medicao.cloro !== undefined
                        ? `${medicao.cloro} mg/L`
                        : "—"
                }
            </td>

            <td>
                ${
                    medicao.ph !== null &&
                    medicao.ph !== undefined
                        ? medicao.ph
                        : "—"
                }
            </td>

            <td>
                ${escaparHtml(
                    medicao.responsavel ||
                    "—"
                )}
            </td>

            <td>
                ${escaparHtml(
                    medicao.observacao ||
                    medicao.observacaoGeral ||
                    "—"
                )}
            </td>
        </tr>
    `;
}


function gerarRelatorioPdf() {
    const medicoes =
        obterMedicoesFiltradas();

    if (medicoes.length === 0) {
        alert(
            "Não há registros para gerar o relatório."
        );

        return;
    }

    const visitas =
        agruparMedicoesPorVisita(
            medicoes
        );

    const logoUrl =
        new URL(
            "../assets/logo.png",
            window.location.href
        ).href;

    const janela =
        window.open(
            "",
            "_blank",
            "width=1000,height=760"
        );

    if (!janela) {
        alert(
            "O navegador bloqueou a janela do relatório. Libere os pop-ups e tente novamente."
        );

        return;
    }

    janela.document.open();

    janela.document.write(`
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Relatório Ekoo ETA
            </title>

            <style>
                * {
                    box-sizing: border-box;
                }

                @page {
                    size: A4;
                    margin: 14mm 15mm 15mm;
                }

                body {
                    margin: 0;

                    background: #e9eeeb;
                    color: #263238;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                .barra-acoes {
                    position: sticky;
                    top: 0;
                    z-index: 10;

                    display: flex;
                    justify-content: center;
                    gap: 10px;

                    padding: 12px;

                    background: #263238;
                }

                .barra-acoes button {
                    min-height: 40px;
                    padding: 0 18px;

                    border: none;
                    border-radius: 9px;

                    font-weight: 700;
                    cursor: pointer;
                }

                .botao-imprimir {
                    background: #00a34a;
                    color: #ffffff;
                }

                .botao-fechar {
                    background: #ffffff;
                    color: #344149;
                }

                .pagina-relatorio {
                    position: relative;

                    width: 210mm;
                    min-height: 297mm;

                    margin: 18px auto;
                    padding: 14mm 15mm 18mm;

                    background: #ffffff;

                    box-shadow:
                        0 10px 35px
                        rgba(20, 40, 30, 0.16);

                    page-break-after: always;
                }

                .pagina-relatorio:last-child {
                    page-break-after: auto;
                }

                .cabecalho-relatorio {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;

                    padding-bottom: 14px;

                    border-bottom: 2px solid #009846;
                }

                .marca-relatorio {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }

                .marca-relatorio img {
                    width: 74px;
                    max-height: 56px;

                    object-fit: contain;
                }

                .marca-relatorio h1 {
                    margin: 0;

                    color: #007238;
                    font-size: 24px;
                }

                .marca-relatorio p {
                    margin: 4px 0 0;

                    color: #56666d;
                    font-size: 11px;
                }

                .titulo-relatorio {
                    text-align: right;
                }

                .titulo-relatorio h2 {
                    margin: 0;

                    color: #007238;
                    font-size: 20px;
                }

                .titulo-relatorio p {
                    margin: 5px 0 0;

                    color: #748188;
                    font-size: 11px;
                }

                .tabela-identificacao,
                .tabela-resultados,
                .tabela-operacao {
                    width: 100%;

                    margin-top: 22px;

                    border-collapse: collapse;
                }

                .tabela-identificacao th,
                .tabela-identificacao td,
                .tabela-operacao th,
                .tabela-operacao td {
                    padding: 11px 12px;

                    border: 1px solid #cbd4cf;

                    font-size: 12px;
                    text-align: left;
                }

                .tabela-identificacao th,
                .tabela-operacao th {
                    width: 24%;

                    background: #e8f6ef;
                    color: #007238;
                }

                .titulo-secao {
                    margin: 28px 0 10px;

                    color: #007238;
                    font-size: 15px;
                }

                .tabela-resultados th {
                    padding: 11px 12px;

                    background: #009846;
                    color: #ffffff;

                    font-size: 12px;
                    text-align: left;
                }

                .tabela-resultados td {
                    padding: 11px 12px;

                    border: 1px solid #d1d8d4;

                    font-size: 12px;
                }

                .valor-indicador {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .indicador {
                    display: inline-block;

                    width: 15px;
                    height: 15px;

                    flex: 0 0 15px;

                    border-radius: 50%;
                }

                .indicador.nao-analisado {
                    background: #9aa6aa;
                }

                .indicador.ideal {
                    background: #009846;
                }

                .indicador.atencao {
                    background: #f6a623;
                }

                .indicador.correcao {
                    background: #d92929;
                }

                .observacoes-relatorio {
                    min-height: 74px;

                    padding: 13px;

                    border: 1px solid #d7dfda;
                    border-radius: 4px;

                    color: #344149;
                    font-size: 12px;
                    line-height: 1.55;
                }

                .legenda-relatorio {
                    margin-top: 25px;
                }

                .legenda-relatorio h3 {
                    margin: 0 0 10px;

                    color: #007238;
                    font-size: 13px;
                }

                .itens-legenda {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px 22px;

                    max-width: 390px;
                }

                .item-legenda {
                    display: flex;
                    align-items: center;
                    gap: 9px;

                    color: #344149;
                    font-size: 11px;
                }

                .assinaturas {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 55px;

                    margin-top: 45px;
                }

                .assinatura {
                    padding-top: 8px;

                    border-top: 1px solid #66757b;

                    color: #45535a;
                    font-size: 11px;
                    text-align: center;
                }

                .rodape-relatorio {
                    position: absolute;
                    right: 15mm;
                    bottom: 10mm;
                    left: 15mm;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding-top: 8px;

                    border-top: 1px solid #009846;

                    color: #59666d;
                    font-size: 10px;
                }

                .localizacao-relatorio a {
                    color: #007238;
                    font-weight: bold;
                    text-decoration: none;
                }

                .foto-visita-relatorio {
                    margin-top: 18px;
                }

                .foto-visita-relatorio img {
                    display: block;

                    width: 100%;
                    max-height: 360px;

                    object-fit: contain;

                    border: 1px solid #d7dfda;
                    border-radius: 6px;
                }

                @media print {
                    body {
                        background: #ffffff;
                    }

                    .barra-acoes {
                        display: none !important;
                    }

                    .pagina-relatorio {
                        width: auto;
                        min-height: 267mm;

                        margin: 0;
                        padding: 0;

                        box-shadow: none;
                    }
                }
            </style>
        </head>

        <body>

            <div class="barra-acoes">

                <button
                    class="botao-imprimir"
                    onclick="window.print()"
                >
                    Imprimir / Salvar PDF
                </button>

                <button
                    class="botao-fechar"
                    onclick="window.close()"
                >
                    Fechar
                </button>

            </div>

            ${visitas
                .map(
                    function (visita, indice) {
                        return criarPaginaRelatorio(
                            visita,
                            indice + 1,
                            visitas.length,
                            logoUrl
                        );
                    }
                )
                .join("")}

        </body>

        </html>
    `);

    janela.document.close();
}


function agruparMedicoesPorVisita(medicoes) {
    const grupos =
        new Map();

    medicoes.forEach(
        function (medicao) {
            const chave = [
                medicao.clienteId || "",
                medicao.etaId || "",
                medicao.dataHora || "",
                medicao.responsavel || ""
            ].join("|");

            if (!grupos.has(chave)) {
                grupos.set(
                    chave,
                    []
                );
            }

            grupos
                .get(chave)
                .push(medicao);
        }
    );

    return Array
        .from(grupos.values())
        .sort(
            function (a, b) {
                return String(
                    b[0]?.dataHora || ""
                ).localeCompare(
                    String(
                        a[0]?.dataHora || ""
                    )
                );
            }
        );
}


function criarPaginaRelatorio(
    medicoes,
    pagina,
    totalPaginas,
    logoUrl
) {
    const primeira =
        medicoes[0] || {};

    const medicaoComFoto =
        medicoes.find(
            function (medicao) {
                return Boolean(
                    medicao.fotoVisita
                );
            }
        ) || {};

    const medicaoComLocalizacao =
        medicoes.find(
            function (medicao) {
                return (
                    medicao.latitude &&
                    medicao.longitude
                );
            }
        ) || {};

    const observacoes =
        Array.from(
            new Set(
                medicoes
                    .flatMap(
                        function (medicao) {
                            return [
                                medicao.observacaoGeral,
                                medicao.observacao
                            ];
                        }
                    )
                    .filter(Boolean)
            )
        );

    const linhas =
        medicoes
            .map(
                function (medicao) {
                    const naoAnalisado =
                        medicao.status ===
                        "nao_analisado";

                    const classeCloro =
                        classificarIndicador(
                            "cloro",
                            medicao.cloro,
                            naoAnalisado
                        );

                    const classePh =
                        classificarIndicador(
                            "ph",
                            medicao.ph,
                            naoAnalisado
                        );

                    return `
                        <tr>
                            <td>
                                ${escaparHtml(
                                    medicao.pontoNome ||
                                    "Ponto"
                                )}
                            </td>

                            <td>
                                <div class="valor-indicador">

                                    <span>
                                        ${
                                            naoAnalisado
                                                ? "Não analisado"
                                                : formatarValorRelatorio(
                                                    medicao.cloro,
                                                    " mg/L"
                                                )
                                        }
                                    </span>

                                    <i
                                        class="
                                            indicador
                                            ${classeCloro}
                                        "
                                    ></i>

                                </div>
                            </td>

                            <td>
                                <div class="valor-indicador">

                                    <span>
                                        ${
                                            naoAnalisado
                                                ? "Não analisado"
                                                : formatarValorRelatorio(
                                                    medicao.ph
                                                )
                                        }
                                    </span>

                                    <i
                                        class="
                                            indicador
                                            ${classePh}
                                        "
                                    ></i>

                                </div>
                            </td>
                        </tr>
                    `;
                }
            )
            .join("");

    return `
        <main class="pagina-relatorio">

            <header class="cabecalho-relatorio">

                <div class="marca-relatorio">

                    <img
                        src="${logoUrl}"
                        alt="Ekoo Sys Engenharia"
                    >

                    <div>
                        <h1>
                            Ekoo Sys Engenharia
                        </h1>

                        <p>
                            Gestão e monitoramento ambiental
                        </p>
                    </div>

                </div>

                <div class="titulo-relatorio">

                    <h2>
                        Relatório de Monitoramento da ETA
                    </h2>

                    <p>
                        Documento gerado pelo Ekoo Manager
                    </p>

                </div>

            </header>

            <table class="tabela-identificacao">

                <tbody>

                    <tr>
                        <th>Cliente</th>

                        <td>
                            ${escaparHtml(
                                primeira.clienteNome ||
                                "Não informado"
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>ETA</th>

                        <td>
                            ${escaparHtml(
                                primeira.etaNome ||
                                "Não informada"
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>Data e hora</th>

                        <td>
                            ${formatarDataHora(
                                primeira.dataHora
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>Responsável</th>

                        <td>
                            ${escaparHtml(
                                primeira.responsavel ||
                                "Não informado"
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>Localização</th>

                        <td class="localizacao-relatorio">
                            ${
                                medicaoComLocalizacao.latitude &&
                                medicaoComLocalizacao.longitude
                                    ? `
                                        <a
                                            href="https://www.google.com/maps?q=${encodeURIComponent(
                                                medicaoComLocalizacao.latitude
                                            )},${encodeURIComponent(
                                                medicaoComLocalizacao.longitude
                                            )}"
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            ${escaparHtml(
                                                medicaoComLocalizacao.latitude
                                            )},
                                            ${escaparHtml(
                                                medicaoComLocalizacao.longitude
                                            )}
                                        </a>

                                        ${
                                            medicaoComLocalizacao.precisaoGps
                                                ? ` — precisão aproximada de ${escaparHtml(
                                                    medicaoComLocalizacao.precisaoGps
                                                )} m`
                                                : ""
                                        }
                                    `
                                    : "Não registrada"
                            }
                        </td>
                    </tr>

                </tbody>

            </table>

            <h3 class="titulo-secao">
                Resultados do monitoramento
            </h3>

            <table class="tabela-resultados">

                <thead>
                    <tr>
                        <th>Ponto de coleta</th>
                        <th>Cloro (mg/L)</th>
                        <th>pH</th>
                    </tr>
                </thead>

                <tbody>
                    ${linhas}
                </tbody>

            </table>

            <table class="tabela-operacao">

                <tbody>
                    <tr>
                        <th>
                            Volume de solução no tanque
                        </th>

                        <td>
                            ${escaparHtml(
                                primeira.volumeSolucao ||
                                primeira.volumeTanque ||
                                "Não informado"
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>
                            Cloro 12% adicionado
                        </th>

                        <td>
                            ${escaparHtml(
                                primeira.cloroAdicionado ||
                                primeira.quantidadeCloro ||
                                "Não informado"
                            )}
                        </td>
                    </tr>
                </tbody>

            </table>

            <h3 class="titulo-secao">
                Observações
            </h3>

            <div class="observacoes-relatorio">

                ${
                    observacoes.length
                        ? observacoes
                            .map(escaparHtml)
                            .join("<br><br>")
                        : "Nenhuma observação registrada."
                }

            </div>

            ${
                medicaoComFoto.fotoVisita
                    ? `
                        <h3 class="titulo-secao">
                            Registro fotográfico
                        </h3>

                        <div class="foto-visita-relatorio">

                            <img
                                src="${medicaoComFoto.fotoVisita}"
                                alt="Foto registrada durante a visita"
                            >

                        </div>
                    `
                    : ""
            }

            <section class="legenda-relatorio">

                <h3>
                    Legenda dos indicadores
                </h3>

                <div class="itens-legenda">

                    <div class="item-legenda">
                        <i class="indicador nao-analisado"></i>
                        Não analisado
                    </div>

                    <div class="item-legenda">
                        <i class="indicador ideal"></i>
                        Faixa de referência
                    </div>

                    <div class="item-legenda">
                        <i class="indicador atencao"></i>
                        Atenção
                    </div>

                    <div class="item-legenda">
                        <i class="indicador correcao"></i>
                        Necessita verificação
                    </div>

                </div>

            </section>

            <section class="assinaturas">

                <div class="assinatura">
                    Responsável pelo monitoramento
                </div>

                <div class="assinatura">
                    Responsável pela ETA
                </div>

            </section>

            <footer class="rodape-relatorio">

                <span>
                    Ekoo Sys Engenharia — Ekoo ETA
                </span>

                <span>
                    Página ${pagina} de ${totalPaginas}
                </span>

            </footer>

        </main>
    `;
}


function classificarIndicador(
    parametro,
    valor,
    naoAnalisado
) {
    if (
        naoAnalisado ||
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "nao-analisado";
    }

    const numero =
        Number(
            String(valor).replace(",", ".")
        );

    if (Number.isNaN(numero)) {
        return "nao-analisado";
    }

    if (parametro === "cloro") {
        if (numero < 2.5 || numero > 5.5) {
            return "correcao";
        }

        if (numero < 3 || numero > 5) {
            return "atencao";
        }

        return "ideal";
    }

    if (parametro === "ph") {
        if (numero < 6.8 || numero > 7.6) {
            return "correcao";
        }

        if (numero < 7 || numero > 7.4) {
            return "atencao";
        }

        return "ideal";
    }

    return "nao-analisado";
}


function formatarValorRelatorio(
    valor,
    sufixo = ""
) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "Não informado";
    }

    return `${valor}${sufixo}`;
}


function exportarCsv() {
    const medicoes =
        obterMedicoesFiltradas();

    if (medicoes.length === 0) {
        alert(
            "Não há registros para exportar."
        );

        return;
    }

    const cabecalho = [
        "Data",
        "Cliente",
        "ETA",
        "Ponto",
        "Status",
        "Cloro (mg/L)",
        "pH",
        "Responsável",
        "Observação",
        "Observação geral"
    ];

    const linhas =
        medicoes.map(
            function (medicao) {
                return [
                    formatarDataHora(
                        medicao.dataHora
                    ),
                    medicao.clienteNome || "",
                    medicao.etaNome || "",
                    medicao.pontoNome || "",
                    medicao.status ===
                    "nao_analisado"
                        ? "Não analisado"
                        : "Analisado",
                    medicao.cloro ?? "",
                    medicao.ph ?? "",
                    medicao.responsavel || "",
                    medicao.observacao || "",
                    medicao.observacaoGeral || ""
                ];
            }
        );

    const conteudo =
        [cabecalho, ...linhas]
            .map(function (linha) {
                return linha
                    .map(function (valor) {
                        const texto =
                            String(
                                valor ?? ""
                            )
                                .replaceAll(
                                    '"',
                                    '""'
                                );

                        return `"${texto}"`;
                    })
                    .join(";");
            })
            .join("\n");

    const blob =
        new Blob(
            [
                "\uFEFF",
                conteudo
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download =
        `relatorio-eta-${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}


function obterNomeCliente(cliente) {
    return (
        cliente.nome ||
        cliente.nomeFantasia ||
        cliente.razaoSocial ||
        "Cliente"
    );
}


function formatarDataHora(valor) {
    if (!valor) {
        return "—";
    }

    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return valor;
    }

    return data.toLocaleString(
        "pt-BR"
    );
}


function garantirEstiloRelatorios() {
    if (
        document.getElementById(
            "estiloModuloRelatorios"
        )
    ) {
        return;
    }

    const link =
        document.createElement("link");

    link.id =
        "estiloModuloRelatorios";

    link.rel =
        "stylesheet";

    link.href =
        "../css/relatoriosEta.css";

    document.head.appendChild(link);
}


function escaparHtml(valor) {
    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
