import { auth } from "../firebase/firebase-config.js";

import {
    listarEtas,
    excluirEta
} from "../firebase/etas.js";

import {
    configurarModalEta
} from "./modalEta.js";

import {
    montarModuloPontos
} from "./pontosModulo.js";

import {
    listarPontos
} from "../firebase/pontos.js";

import {
    listarMedicoesPorEta
} from "../firebase/medicoes.js";


let usuarioAtualId = null;
let clienteAtualId = null;
let clienteAtualNome = "";
let controleModalEta = null;
let containerAtual = null;


export function montarModuloEta(
    container,
    opcoes = {}
) {
    containerAtual = container;

    clienteAtualId =
        opcoes.clienteId || null;

    clienteAtualNome =
        opcoes.clienteNome || "";

    const tituloPagina =
        clienteAtualId
            ? "💧 Estações de Tratamento de Água"
            : "💧 Todas as Estações de Tratamento de Água";

    const descricaoPagina =
        clienteAtualId
            ? `ETAs vinculadas ao cliente ${clienteAtualNome}.`
            : "Visualize todas as ETAs cadastradas. Para cadastrar uma nova ETA, abra primeiro um cliente.";

    const identificacao =
        clienteAtualId && clienteAtualNome
            ? `
                <div class="cliente-vinculado-eta">
                    <span>🏢</span>
                    <div>
                        <small>Cliente selecionado</small>
                        <strong>
                            ${escaparHtml(clienteAtualNome)}
                        </strong>
                    </div>
                </div>
            `
            : "";

    container.innerHTML = `
        <section class="modulo-eta">

            <header class="cabecalho-modulo-eta">

                <div>
                    <p class="identificacao-modulo">
                        Módulo ambiental
                    </p>

                    <h1>${tituloPagina}</h1>

                    <p>
                        ${escaparHtml(descricaoPagina)}
                    </p>

                    ${identificacao}
                </div>

                <button
                    id="botaoNovaEta"
                    class="botao-nova-eta"
                    type="button"
                    ${clienteAtualId ? "" : "disabled"}
                    title="${
                        clienteAtualId
                            ? "Cadastrar nova ETA"
                            : "Abra um cliente para cadastrar uma ETA"
                    }"
                >
                    + Nova ETA
                </button>

            </header>

            <section class="resumo-eta">

                <article>
                    <span>💧</span>

                    <div>
                        <small>ETAs cadastradas</small>

                        <strong id="quantidadeEtasModulo">
                            0
                        </strong>
                    </div>
                </article>

                <article>
                    <span>📍</span>

                    <div>
                        <small>Pontos de coleta</small>

                        <strong id="quantidadePontosModulo">
                            0
                        </strong>
                    </div>
                </article>

                <article>
                    <span>🧪</span>

                    <div>
                        <small>Medições</small>

                        <strong id="quantidadeMedicoesModulo">
                            0
                        </strong>
                    </div>
                </article>

            </section>

            <section class="area-lista-etas">

                <div class="cabecalho-lista-etas">

                    <div>
                        <h2>
                            ${
                                clienteAtualId
                                    ? "ETAs deste cliente"
                                    : "ETAs cadastradas"
                            }
                        </h2>

                        <p>
                            Selecione uma ETA para acessar seus
                            pontos e medições.
                        </p>
                    </div>

                </div>

                <div
                    id="listaEtasModulo"
                    class="lista-etas-modulo"
                >
                    <div class="estado-vazio-eta">

                        <span>⏳</span>

                        <strong>
                            Carregando ETAs...
                        </strong>

                    </div>
                </div>

            </section>

        </section>
    `;

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

    const botaoNovaEta =
        document.getElementById(
            "botaoNovaEta"
        );

    controleModalEta =
        configurarModalEta({
            usuarioId: usuarioAtualId,
            clienteId: clienteAtualId,
            clienteNome: clienteAtualNome,
            aoSalvar: carregarEtasDoUsuario
        });

    if (clienteAtualId) {
        botaoNovaEta.addEventListener(
            "click",
            function () {
                controleModalEta.abrirModal();
            }
        );
    }

    carregarEtasDoUsuario();
}


async function carregarEtasDoUsuario() {
    const listaContainer =
        document.getElementById(
            "listaEtasModulo"
        );

    const quantidadeEtas =
        document.getElementById(
            "quantidadeEtasModulo"
        );

    const quantidadePontos =
        document.getElementById(
            "quantidadePontosModulo"
        );

    const quantidadeMedicoes =
        document.getElementById(
            "quantidadeMedicoesModulo"
        );

    if (
        !listaContainer ||
        !quantidadeEtas ||
        !quantidadePontos ||
        !quantidadeMedicoes
    ) {
        return;
    }

    if (!usuarioAtualId) {
        listaContainer.innerHTML = `
            <div class="estado-vazio-eta">

                <span>⚠️</span>

                <strong>
                    Usuário não identificado
                </strong>

                <p>
                    Saia da plataforma e entre novamente.
                </p>

            </div>
        `;

        return;
    }

    listaContainer.innerHTML = `
        <div class="estado-vazio-eta">

            <span>⏳</span>

            <strong>
                Carregando ETAs...
            </strong>

        </div>
    `;

    try {
        const etas =
            await listarEtas(
                usuarioAtualId,
                clienteAtualId
            );

        quantidadeEtas.textContent =
            String(etas.length);

        const etasComTotais =
            await Promise.all(
                etas.map(
                    async function (eta) {
                        try {
                            const [
                                pontos,
                                medicoes
                            ] = await Promise.all([
                                listarPontos(
                                    usuarioAtualId,
                                    eta.id
                                ),

                                listarMedicoesPorEta(
                                    usuarioAtualId,
                                    eta.id
                                )
                            ]);

                            return {
                                ...eta,

                                quantidadePontos:
                                    pontos.length,

                                quantidadeMedicoes:
                                    medicoes.length
                            };
                        } catch (erro) {
                            console.error(
                                `Erro ao contar dados da ETA ${eta.id}:`,
                                erro
                            );

                            return {
                                ...eta,
                                quantidadePontos: 0,
                                quantidadeMedicoes: 0
                            };
                        }
                    }
                )
            );

        const totalDePontos =
            etasComTotais.reduce(
                function (total, eta) {
                    return (
                        total +
                        Number(
                            eta.quantidadePontos ||
                            0
                        )
                    );
                },
                0
            );

        quantidadePontos.textContent =
            String(totalDePontos);

        const totalDeMedicoes =
            etasComTotais.reduce(
                function (total, eta) {
                    return (
                        total +
                        Number(
                            eta.quantidadeMedicoes ||
                            0
                        )
                    );
                },
                0
            );

        quantidadeMedicoes.textContent =
            String(totalDeMedicoes);

        if (etasComTotais.length === 0) {
            listaContainer.innerHTML = `
                <div class="estado-vazio-eta">

                    <span>💧</span>

                    <strong>
                        ${
                            clienteAtualId
                                ? "Nenhuma ETA vinculada a este cliente"
                                : "Nenhuma ETA cadastrada na nuvem"
                        }
                    </strong>

                    <p>
                        ${
                            clienteAtualId
                                ? "Clique em “Nova ETA” para cadastrar a primeira estação deste cliente."
                                : "Abra um cliente para cadastrar e vincular uma nova ETA."
                        }
                    </p>

                </div>
            `;

            return;
        }

        listaContainer.innerHTML =
            etasComTotais
                .map(criarCardEta)
                .join("");

        conectarAcoesDosCards(
            etasComTotais
        );
    } catch (erro) {
        console.error(
            "Erro ao listar ETAs:",
            erro
        );

        listaContainer.innerHTML = `
            <div class="estado-vazio-eta">

                <span>⚠️</span>

                <strong>
                    Não foi possível carregar as ETAs
                </strong>

                <p>
                    Confira sua conexão e as regras do Firestore.
                </p>

            </div>
        `;
    }
}


function criarCardEta(eta) {
    const localizacao =
        [eta.cidade, eta.estado]
            .filter(Boolean)
            .join(" - ");

    const capacidade =
        eta.capacidade !== null &&
        eta.capacidade !== undefined
            ? `${eta.capacidade} ${
                eta.unidadeCapacidade || ""
            }`
            : "Não informada";

    const clienteExibido =
        eta.clienteNome ||
        clienteAtualNome ||
        "Não vinculado";

    return `
        <article
            class="card-eta-modulo"
            data-eta-id="${eta.id}"
        >

            <div class="cabecalho-card-eta">

                <div>

                    <span class="icone-card-eta">
                        💧
                    </span>

                    <div>

                        <h3>
                            ${escaparHtml(eta.nome)}
                        </h3>

                        <p>
                            ${
                                localizacao
                                    ? escaparHtml(localizacao)
                                    : "Localização não informada"
                            }
                        </p>

                    </div>

                </div>

                <div class="acoes-card-eta">

                    <button
                        class="botao-abrir-eta"
                        type="button"
                        data-eta-id="${eta.id}"
                    >
                        Abrir
                    </button>

                    <button
                        class="botao-editar-eta"
                        type="button"
                        data-eta-id="${eta.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="botao-excluir-eta"
                        type="button"
                        data-eta-id="${eta.id}"
                    >
                        Excluir
                    </button>

                </div>

            </div>

            <div class="dados-card-eta">

                <div>
                    <small>Cliente</small>

                    <strong>
                        ${escaparHtml(clienteExibido)}
                    </strong>
                </div>

                <div>
                    <small>Responsável</small>

                    <strong>
                        ${
                            eta.responsavel
                                ? escaparHtml(
                                    eta.responsavel
                                )
                                : "Não informado"
                        }
                    </strong>
                </div>

                <div>
                    <small>Capacidade</small>

                    <strong>
                        ${escaparHtml(capacidade)}
                    </strong>
                </div>

                <div>
                    <small>Pontos</small>

                    <strong>
                        ${Number(
                            eta.quantidadePontos ||
                            0
                        )}
                    </strong>
                </div>

                <div>
                    <small>Medições</small>

                    <strong>
                        ${Number(
                            eta.quantidadeMedicoes ||
                            0
                        )}
                    </strong>
                </div>

            </div>

        </article>
    `;
}


function conectarAcoesDosCards(etas) {
    const botoesAbrir =
        document.querySelectorAll(
            ".botao-abrir-eta"
        );

    const botoesEditar =
        document.querySelectorAll(
            ".botao-editar-eta"
        );

    const botoesExcluir =
        document.querySelectorAll(
            ".botao-excluir-eta"
        );

    botoesAbrir.forEach(function (botao) {
        botao.addEventListener(
            "click",
            function () {
                const eta =
                    encontrarEta(
                        etas,
                        botao.dataset.etaId
                    );

                if (!eta) {
                    return;
                }

                if (!containerAtual) {
                    return;
                }

                montarModuloPontos(
                    containerAtual,
                    {
                        clienteId:
                            eta.clienteId ||
                            clienteAtualId,

                        clienteNome:
                            eta.clienteNome ||
                            clienteAtualNome,

                        etaId:
                            eta.id,

                        etaNome:
                            eta.nome,

                        aoVoltar:
                            function () {
                                montarModuloEta(
                                    containerAtual,
                                    {
                                        clienteId:
                                            eta.clienteId ||
                                            clienteAtualId,

                                        clienteNome:
                                            eta.clienteNome ||
                                            clienteAtualNome
                                    }
                                );
                            },

                        aoAbrirPonto:
                            function (ponto) {
                                alert(
                                    `Na próxima etapa vamos abrir as medições do ponto "${ponto.nome}".`
                                );
                            }
                    }
                );
            }
        );
    });

    botoesEditar.forEach(function (botao) {
        botao.addEventListener(
            "click",
            function () {
                const eta =
                    encontrarEta(
                        etas,
                        botao.dataset.etaId
                    );

                if (eta && controleModalEta) {
                    controleModalEta.abrirModal(
                        eta
                    );
                }
            }
        );
    });

    botoesExcluir.forEach(function (botao) {
        botao.addEventListener(
            "click",
            async function () {
                const eta =
                    encontrarEta(
                        etas,
                        botao.dataset.etaId
                    );

                if (!eta) {
                    return;
                }

                const confirmou =
                    window.confirm(
                        `Deseja excluir a ETA "${eta.nome}"?`
                    );

                if (!confirmou) {
                    return;
                }

                botao.disabled = true;
                botao.textContent =
                    "Excluindo...";

                try {
                    await excluirEta(
                        eta.id
                    );

                    await carregarEtasDoUsuario();
                } catch (erro) {
                    console.error(
                        "Erro ao excluir ETA:",
                        erro
                    );

                    alert(
                        "Não foi possível excluir a ETA."
                    );

                    botao.disabled = false;
                    botao.textContent =
                        "Excluir";
                }
            }
        );
    });
}


function encontrarEta(etas, etaId) {
    return etas.find(
        function (eta) {
            return eta.id === etaId;
        }
    );
}


function escaparHtml(valor) {
    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
