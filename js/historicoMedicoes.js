import { auth } from "../firebase/firebase-config.js";

import {
    listarMedicoesPorPonto,
    excluirMedicao
} from "../firebase/medicoes.js";


let usuarioAtualId = null;
let pontoAtualId = null;
let pontoAtualNome = "";
let etaAtualId = null;
let etaAtualNome = "";
let clienteAtualNome = "";
let funcaoVoltar = null;
let listaMedicoesAtual = [];


export function montarHistoricoMedicoes(
    container,
    opcoes = {}
) {
    garantirEstiloHistorico();

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

    pontoAtualId =
        opcoes.pontoId || null;

    pontoAtualNome =
        opcoes.pontoNome || "";

    etaAtualId =
        opcoes.etaId || null;

    etaAtualNome =
        opcoes.etaNome || "";

    clienteAtualNome =
        opcoes.clienteNome || "";

    funcaoVoltar =
        typeof opcoes.aoVoltar === "function"
            ? opcoes.aoVoltar
            : null;

    container.innerHTML = `
        <section class="historico-medicoes">

            <header class="cabecalho-historico">

                <div>

                    <button
                        id="botaoVoltarHistorico"
                        class="botao-voltar-historico"
                        type="button"
                    >
                        ← Voltar
                    </button>

                    <p class="identificacao-modulo">
                        Histórico de medições
                    </p>

                    <h1>
                        🧪 ${escaparHtml(pontoAtualNome || "Ponto")}
                    </h1>

                    <p>
                        Consulte, filtre e exclua as medições
                        registradas neste ponto.
                    </p>

                    <div class="vinculos-historico">

                        <div>
                            <small>Cliente</small>
                            <strong>
                                ${escaparHtml(
                                    clienteAtualNome ||
                                    "Não informado"
                                )}
                            </strong>
                        </div>

                        <div>
                            <small>ETA</small>
                            <strong>
                                ${escaparHtml(
                                    etaAtualNome ||
                                    "Não informada"
                                )}
                            </strong>
                        </div>

                    </div>

                </div>

            </header>

            <section class="filtros-historico">

                <input
                    id="pesquisaHistorico"
                    type="search"
                    placeholder="Pesquisar responsável ou observação..."
                >

                <input
                    id="dataInicialHistorico"
                    type="date"
                    aria-label="Data inicial"
                >

                <input
                    id="dataFinalHistorico"
                    type="date"
                    aria-label="Data final"
                >

                <select
                    id="statusHistorico"
                    aria-label="Status"
                >
                    <option value="">
                        Todos os status
                    </option>

                    <option value="analisado">
                        Analisado
                    </option>

                    <option value="nao_analisado">
                        Não analisado
                    </option>
                </select>

                <button
                    id="limparFiltrosHistorico"
                    type="button"
                >
                    Limpar
                </button>

            </section>

            <section class="resumo-historico">

                <article>
                    <small>Total de registros</small>
                    <strong id="totalHistorico">0</strong>
                </article>

                <article>
                    <small>Analisados</small>
                    <strong id="totalAnalisadosHistorico">0</strong>
                </article>

                <article>
                    <small>Não analisados</small>
                    <strong id="totalNaoAnalisadosHistorico">0</strong>
                </article>

            </section>

            <section
                id="listaHistoricoCompleto"
                class="lista-historico-completo"
            >
                <div class="estado-vazio-historico">
                    <span>⏳</span>
                    <strong>Carregando medições...</strong>
                </div>
            </section>

        </section>
    `;

    configurarEventos();
    carregarHistorico();
}


function configurarEventos() {
    document
        .getElementById("botaoVoltarHistorico")
        .addEventListener(
            "click",
            function () {
                if (funcaoVoltar) {
                    funcaoVoltar();
                }
            }
        );

    [
        "pesquisaHistorico",
        "dataInicialHistorico",
        "dataFinalHistorico",
        "statusHistorico"
    ].forEach(function (id) {
        document
            .getElementById(id)
            .addEventListener(
                "input",
                aplicarFiltros
            );
    });

    document
        .getElementById("limparFiltrosHistorico")
        .addEventListener(
            "click",
            function () {
                document.getElementById(
                    "pesquisaHistorico"
                ).value = "";

                document.getElementById(
                    "dataInicialHistorico"
                ).value = "";

                document.getElementById(
                    "dataFinalHistorico"
                ).value = "";

                document.getElementById(
                    "statusHistorico"
                ).value = "";

                renderizarHistorico(
                    listaMedicoesAtual
                );
            }
        );
}


async function carregarHistorico() {
    const lista =
        document.getElementById(
            "listaHistoricoCompleto"
        );

    if (!usuarioAtualId || !pontoAtualId) {
        lista.innerHTML = `
            <div class="estado-vazio-historico">
                <span>⚠️</span>
                <strong>
                    Usuário ou ponto não identificado
                </strong>
            </div>
        `;

        return;
    }

    try {
        listaMedicoesAtual =
            await listarMedicoesPorPonto(
                usuarioAtualId,
                pontoAtualId
            );

        atualizarResumo(
            listaMedicoesAtual
        );

        renderizarHistorico(
            listaMedicoesAtual
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        lista.innerHTML = `
            <div class="estado-vazio-historico">
                <span>⚠️</span>
                <strong>
                    Não foi possível carregar o histórico
                </strong>
            </div>
        `;
    }
}


function aplicarFiltros() {
    const pesquisa =
        document.getElementById(
            "pesquisaHistorico"
        ).value
            .trim()
            .toLowerCase();

    const dataInicial =
        document.getElementById(
            "dataInicialHistorico"
        ).value;

    const dataFinal =
        document.getElementById(
            "dataFinalHistorico"
        ).value;

    const status =
        document.getElementById(
            "statusHistorico"
        ).value;

    const filtradas =
        listaMedicoesAtual.filter(
            function (medicao) {
                const texto = [
                    medicao.responsavel,
                    medicao.observacao,
                    medicao.observacaoGeral,
                    medicao.pontoNome
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const data =
                    String(
                        medicao.dataHora ||
                        ""
                    ).slice(0, 10);

                const atendePesquisa =
                    !pesquisa ||
                    texto.includes(pesquisa);

                const atendeInicial =
                    !dataInicial ||
                    data >= dataInicial;

                const atendeFinal =
                    !dataFinal ||
                    data <= dataFinal;

                const atendeStatus =
                    !status ||
                    normalizarStatus(
                        medicao.status
                    ) === status;

                return (
                    atendePesquisa &&
                    atendeInicial &&
                    atendeFinal &&
                    atendeStatus
                );
            }
        );

    atualizarResumo(filtradas);
    renderizarHistorico(filtradas);
}


function renderizarHistorico(medicoes) {
    const lista =
        document.getElementById(
            "listaHistoricoCompleto"
        );

    if (medicoes.length === 0) {
        lista.innerHTML = `
            <div class="estado-vazio-historico">
                <span>🧪</span>

                <strong>
                    Nenhuma medição encontrada
                </strong>

                <p>
                    Registre uma nova visita ou altere os filtros.
                </p>
            </div>
        `;

        return;
    }

    lista.innerHTML =
        medicoes
            .map(criarCardMedicao)
            .join("");

    conectarBotoesExcluir();
}


function criarCardMedicao(medicao) {
    const status =
        normalizarStatus(
            medicao.status
        );

    const statusTexto =
        status === "nao_analisado"
            ? "Não analisado"
            : "Analisado";

    return `
        <article
            class="card-historico-medicao"
            data-medicao-id="${medicao.id}"
        >

            <div class="topo-card-historico">

                <div>
                    <h3>
                        ${formatarDataHora(
                            medicao.dataHora
                        )}
                    </h3>

                    <p>
                        Responsável:
                        ${
                            medicao.responsavel
                                ? escaparHtml(
                                    medicao.responsavel
                                )
                                : "Não informado"
                        }
                    </p>
                </div>

                <span
                    class="
                        status-historico
                        ${status}
                    "
                >
                    ${statusTexto}
                </span>

            </div>

            <div class="dados-historico-medicao">

                <div>
                    <small>Cloro</small>

                    <strong>
                        ${
                            medicao.cloro !== null &&
                            medicao.cloro !== undefined
                                ? `${medicao.cloro} mg/L`
                                : "—"
                        }
                    </strong>
                </div>

                <div>
                    <small>pH</small>

                    <strong>
                        ${
                            medicao.ph !== null &&
                            medicao.ph !== undefined
                                ? medicao.ph
                                : "—"
                        }
                    </strong>
                </div>

                <div>
                    <small>Observação</small>

                    <strong>
                        ${
                            medicao.observacao
                                ? escaparHtml(
                                    medicao.observacao
                                )
                                : "Sem observação"
                        }
                    </strong>
                </div>

            </div>

            ${
                medicao.observacaoGeral
                    ? `
                        <div class="observacao-geral-historico">
                            <small>
                                Observação geral da visita
                            </small>

                            <p>
                                ${escaparHtml(
                                    medicao.observacaoGeral
                                )}
                            </p>
                        </div>
                    `
                    : ""
            }

            <footer class="acoes-historico-medicao">

                <button
                    class="botao-excluir-medicao"
                    data-medicao-id="${medicao.id}"
                    type="button"
                >
                    Excluir
                </button>

            </footer>

        </article>
    `;
}


function conectarBotoesExcluir() {
    document
        .querySelectorAll(
            ".botao-excluir-medicao"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                async function () {
                    const medicao =
                        listaMedicoesAtual.find(
                            function (item) {
                                return (
                                    item.id ===
                                    botao.dataset.medicaoId
                                );
                            }
                        );

                    if (!medicao) {
                        return;
                    }

                    const confirmou =
                        window.confirm(
                            "Deseja excluir esta medição?"
                        );

                    if (!confirmou) {
                        return;
                    }

                    botao.disabled = true;
                    botao.textContent =
                        "Excluindo...";

                    try {
                        await excluirMedicao(
                            medicao.id
                        );

                        await carregarHistorico();
                    } catch (erro) {
                        console.error(
                            "Erro ao excluir medição:",
                            erro
                        );

                        alert(
                            "Não foi possível excluir a medição."
                        );

                        botao.disabled = false;
                        botao.textContent =
                            "Excluir";
                    }
                }
            );
        });
}


function atualizarResumo(medicoes) {
    const analisadas =
        medicoes.filter(
            function (medicao) {
                return (
                    normalizarStatus(
                        medicao.status
                    ) === "analisado"
                );
            }
        ).length;

    const naoAnalisadas =
        medicoes.length -
        analisadas;

    document.getElementById(
        "totalHistorico"
    ).textContent =
        String(medicoes.length);

    document.getElementById(
        "totalAnalisadosHistorico"
    ).textContent =
        String(analisadas);

    document.getElementById(
        "totalNaoAnalisadosHistorico"
    ).textContent =
        String(naoAnalisadas);
}


function normalizarStatus(status) {
    return status === "nao_analisado"
        ? "nao_analisado"
        : "analisado";
}


function formatarDataHora(valor) {
    if (!valor) {
        return "Data não informada";
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


function garantirEstiloHistorico() {
    if (
        document.getElementById(
            "estiloHistoricoMedicoes"
        )
    ) {
        return;
    }

    const link =
        document.createElement("link");

    link.id =
        "estiloHistoricoMedicoes";

    link.rel =
        "stylesheet";

    link.href =
        "../css/historicoMedicoes.css";

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
