import { auth } from "../firebase/firebase-config.js";

import {
    listarPontos,
    excluirPonto
} from "../firebase/pontos.js";

import {
    configurarModalPonto
} from "./modalPonto.js";

import {
    montarModuloMedicoes
} from "./medicoesModulo.js";

import {
    montarHistoricoMedicoes
} from "./historicoMedicoes.js";

import {
    listarMedicoesPorEta,
    listarMedicoesPorPonto
} from "../firebase/medicoes.js";


let usuarioAtualId = null;
let clienteAtualId = null;
let clienteAtualNome = "";
let etaAtualId = null;
let etaAtualNome = "";

let controleModalPonto = null;
let listaPontosAtual = [];
let funcaoVoltar = null;
let containerAtual = null;


export function montarModuloPontos(
    container,
    opcoes = {}
) {
    garantirEstiloPontos();

    containerAtual = container;

    clienteAtualId =
        opcoes.clienteId || null;

    clienteAtualNome =
        opcoes.clienteNome || "";

    etaAtualId =
        opcoes.etaId || null;

    etaAtualNome =
        opcoes.etaNome || "";

    funcaoVoltar =
        typeof opcoes.aoVoltar === "function"
            ? opcoes.aoVoltar
            : null;

    container.innerHTML = `
        <section class="modulo-pontos">

            <header class="cabecalho-modulo-pontos">

                <div>

                    <button
                        id="botaoVoltarPontos"
                        class="botao-voltar-pontos"
                        type="button"
                    >
                        ← Voltar para ETAs
                    </button>

                    <p class="identificacao-modulo">
                        Pontos de coleta
                    </p>

                    <h1>
                        📍 ${escaparHtml(etaAtualNome || "ETA")}
                    </h1>

                    <p>
                        Cadastre e organize os pontos de coleta
                        vinculados a esta estação.
                    </p>

                    <div class="vinculo-pontos">

                        <div>
                            <small>Cliente</small>

                            <strong>
                                ${
                                    clienteAtualNome
                                        ? escaparHtml(
                                            clienteAtualNome
                                        )
                                        : "Não informado"
                                }
                            </strong>
                        </div>

                        <div>
                            <small>ETA</small>

                            <strong>
                                ${
                                    etaAtualNome
                                        ? escaparHtml(
                                            etaAtualNome
                                        )
                                        : "Não informada"
                                }
                            </strong>
                        </div>

                    </div>

                </div>

                <button
                    id="botaoNovoPonto"
                    class="botao-novo-ponto"
                    type="button"
                >
                    + Novo ponto
                </button>

            </header>

            <section class="resumo-pontos">

                <article>

                    <span>📍</span>

                    <div>
                        <small>Pontos cadastrados</small>

                        <strong id="quantidadePontosModulo">
                            0
                        </strong>
                    </div>

                </article>

                <article>

                    <span>✅</span>

                    <div>
                        <small>Pontos ativos</small>

                        <strong id="quantidadePontosAtivos">
                            0
                        </strong>
                    </div>

                </article>

                <article>

                    <span>🧪</span>

                    <div>
                        <small>Medições</small>

                        <strong id="quantidadeMedicoesPontos">
                            0
                        </strong>
                    </div>

                </article>

            </section>

            <section class="barra-pontos">

                <div>

                    <h2>Pontos de coleta</h2>

                    <p>
                        Selecione um ponto para registrar ou
                        consultar suas medições.
                    </p>

                </div>

                <input
                    id="pesquisaPontos"
                    type="search"
                    placeholder="Pesquisar ponto..."
                >

            </section>

            <section
                id="listaPontosModulo"
                class="lista-pontos-modulo"
            >

                <div class="estado-vazio-pontos">

                    <span>⏳</span>

                    <strong>
                        Carregando pontos...
                    </strong>

                </div>

            </section>

        </section>
    `;

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

    controleModalPonto =
        configurarModalPonto({
            usuarioId: usuarioAtualId,
            clienteId: clienteAtualId,
            clienteNome: clienteAtualNome,
            etaId: etaAtualId,
            etaNome: etaAtualNome,
            aoSalvar: carregarPontos
        });

    document
        .getElementById("botaoNovoPonto")
        .addEventListener(
            "click",
            function () {
                controleModalPonto
                    .abrirModal();
            }
        );

    document
        .getElementById("botaoVoltarPontos")
        .addEventListener(
            "click",
            function () {
                if (funcaoVoltar) {
                    funcaoVoltar();
                }
            }
        );

    document
        .getElementById("pesquisaPontos")
        .addEventListener(
            "input",
            function (evento) {
                const pesquisa =
                    evento.target.value
                        .trim()
                        .toLowerCase();

                const pontosFiltrados =
                    listaPontosAtual.filter(
                        function (ponto) {
                            const texto = [
                                ponto.nome,
                                ponto.tipo,
                                ponto.localizacao,
                                ponto.situacao,
                                ponto.observacoes
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return texto.includes(
                                pesquisa
                            );
                        }
                    );

                renderizarPontos(
                    pontosFiltrados
                );
            }
        );

    carregarPontos();
}


async function carregarPontos() {
    const listaContainer =
        document.getElementById(
            "listaPontosModulo"
        );

    const quantidadePontos =
        document.getElementById(
            "quantidadePontosModulo"
        );

    const quantidadeAtivos =
        document.getElementById(
            "quantidadePontosAtivos"
        );

    const quantidadeMedicoes =
        document.getElementById(
            "quantidadeMedicoesPontos"
        );

    if (
        !listaContainer ||
        !quantidadePontos ||
        !quantidadeAtivos ||
        !quantidadeMedicoes
    ) {
        return;
    }

    if (!usuarioAtualId || !etaAtualId) {
        listaContainer.innerHTML = `
            <div class="estado-vazio-pontos">

                <span>⚠️</span>

                <strong>
                    ETA ou usuário não identificado
                </strong>

                <p>
                    Volte para a lista de clientes e abra
                    novamente a ETA.
                </p>

            </div>
        `;

        return;
    }

    listaContainer.innerHTML = `
        <div class="estado-vazio-pontos">

            <span>⏳</span>

            <strong>
                Carregando pontos...
            </strong>

        </div>
    `;

    try {
        const pontos =
            await listarPontos(
                usuarioAtualId,
                etaAtualId
            );

        listaPontosAtual =
            await Promise.all(
                pontos.map(
                    async function (ponto) {
                        try {
                            const medicoes =
                                await listarMedicoesPorPonto(
                                    usuarioAtualId,
                                    ponto.id
                                );

                            return {
                                ...ponto,
                                quantidadeMedicoes:
                                    medicoes.length
                            };
                        } catch (erro) {
                            console.error(
                                `Erro ao contar medições do ponto ${ponto.id}:`,
                                erro
                            );

                            return {
                                ...ponto,
                                quantidadeMedicoes: 0
                            };
                        }
                    }
                )
            );

        quantidadePontos.textContent =
            String(
                listaPontosAtual.length
            );

        const ativos =
            listaPontosAtual.filter(
                function (ponto) {
                    return (
                        ponto.situacao !==
                        "inativo"
                    );
                }
            ).length;

        quantidadeAtivos.textContent =
            String(ativos);

        try {
            const medicoesDaEta =
                await listarMedicoesPorEta(
                    usuarioAtualId,
                    etaAtualId
                );

            quantidadeMedicoes.textContent =
                String(
                    medicoesDaEta.length
                );
        } catch (erro) {
            console.error(
                "Erro ao contar medições da ETA:",
                erro
            );

            quantidadeMedicoes.textContent =
                "0";
        }

        renderizarPontos(
            listaPontosAtual
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar pontos:",
            erro
        );

        listaContainer.innerHTML = `
            <div class="estado-vazio-pontos">

                <span>⚠️</span>

                <strong>
                    Não foi possível carregar os pontos
                </strong>

                <p>
                    Confira a conexão e as regras
                    do Firestore.
                </p>

            </div>
        `;
    }
}


function renderizarPontos(pontos) {
    const listaContainer =
        document.getElementById(
            "listaPontosModulo"
        );

    if (!listaContainer) {
        return;
    }

    if (pontos.length === 0) {
        listaContainer.innerHTML = `
            <div class="estado-vazio-pontos">

                <span>📍</span>

                <strong>
                    Nenhum ponto cadastrado
                </strong>

                <p>
                    Clique em “Novo ponto” para cadastrar
                    o primeiro ponto de coleta desta ETA.
                </p>

            </div>
        `;

        return;
    }

    listaContainer.innerHTML =
        pontos
            .map(criarCardPonto)
            .join("");

    conectarBotoesNovaVisita();
    conectarBotoesHistorico();
    conectarBotoesEditar();
    conectarBotoesExcluir();
}


function criarCardPonto(ponto) {
    const tipo =
        traduzirTipoPonto(
            ponto.tipo
        );

    const situacao =
        ponto.situacao === "inativo"
            ? "Inativo"
            : "Ativo";

    const classeSituacao =
        ponto.situacao === "inativo"
            ? "inativo"
            : "ativo";

    return `
        <article
            class="card-ponto"
            data-ponto-id="${ponto.id}"
        >

            <div class="cabecalho-card-ponto">

                <div class="identidade-ponto">

                    <span>📍</span>

                    <div>

                        <h3>
                            ${escaparHtml(ponto.nome)}
                        </h3>

                        <p>
                            ${escaparHtml(tipo)}
                        </p>

                    </div>

                </div>

                <div class="acoes-card-ponto">

                    <button
                        class="botao-nova-visita-ponto"
                        data-ponto-id="${ponto.id}"
                        type="button"
                    >
                        Nova visita
                    </button>

                    <button
                        class="botao-historico-ponto"
                        data-ponto-id="${ponto.id}"
                        type="button"
                    >
                        Histórico
                    </button>

                    <button
                        class="botao-editar-ponto"
                        data-ponto-id="${ponto.id}"
                        type="button"
                    >
                        Editar
                    </button>

                    <button
                        class="botao-excluir-ponto"
                        data-ponto-id="${ponto.id}"
                        type="button"
                    >
                        Excluir
                    </button>

                </div>

            </div>

            <div class="dados-card-ponto">

                <div>
                    <small>Ordem</small>

                    <strong>
                        ${Number(ponto.ordem || 0)}
                    </strong>
                </div>

                <div>
                    <small>Situação</small>

                    <span
                        class="
                            etiqueta-situacao-ponto
                            ${classeSituacao}
                        "
                    >
                        ${situacao}
                    </span>
                </div>

                <div>
                    <small>Localização</small>

                    <strong>
                        ${
                            ponto.localizacao
                                ? escaparHtml(
                                    ponto.localizacao
                                )
                                : "Não informada"
                        }
                    </strong>
                </div>

                <div>
                    <small>Medições</small>

                    <strong>
                        ${Number(
                            ponto.quantidadeMedicoes ||
                            0
                        )}
                    </strong>
                </div>

            </div>

        </article>
    `;
}


function conectarBotoesNovaVisita() {
    document
        .querySelectorAll(
            ".botao-nova-visita-ponto"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    const ponto =
                        encontrarPonto(
                            botao.dataset.pontoId
                        );

                    if (!ponto || !containerAtual) {
                        return;
                    }

                    montarModuloMedicoes(
                        containerAtual,
                        {
                            clienteId:
                                clienteAtualId,

                            clienteNome:
                                clienteAtualNome,

                            etaId:
                                etaAtualId,

                            etaNome:
                                etaAtualNome,

                            pontoId:
                                ponto.id,

                            pontoNome:
                                ponto.nome,

                            aoVoltar:
                                function () {
                                    montarModuloPontos(
                                        containerAtual,
                                        {
                                            clienteId:
                                                clienteAtualId,

                                            clienteNome:
                                                clienteAtualNome,

                                            etaId:
                                                etaAtualId,

                                            etaNome:
                                                etaAtualNome,

                                            aoVoltar:
                                                funcaoVoltar
                                        }
                                    );
                                }
                        }
                    );
                }
            );
        });
}


function conectarBotoesHistorico() {
    document
        .querySelectorAll(
            ".botao-historico-ponto"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    const ponto =
                        encontrarPonto(
                            botao.dataset.pontoId
                        );

                    if (!ponto || !containerAtual) {
                        return;
                    }

                    montarHistoricoMedicoes(
                        containerAtual,
                        {
                            clienteNome:
                                clienteAtualNome,

                            etaId:
                                etaAtualId,

                            etaNome:
                                etaAtualNome,

                            pontoId:
                                ponto.id,

                            pontoNome:
                                ponto.nome,

                            aoVoltar:
                                function () {
                                    montarModuloPontos(
                                        containerAtual,
                                        {
                                            clienteId:
                                                clienteAtualId,

                                            clienteNome:
                                                clienteAtualNome,

                                            etaId:
                                                etaAtualId,

                                            etaNome:
                                                etaAtualNome,

                                            aoVoltar:
                                                funcaoVoltar
                                        }
                                    );
                                }
                        }
                    );
                }
            );
        });
}

function conectarBotoesEditar() {
    document
        .querySelectorAll(
            ".botao-editar-ponto"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    const ponto =
                        encontrarPonto(
                            botao.dataset.pontoId
                        );

                    if (
                        ponto &&
                        controleModalPonto
                    ) {
                        controleModalPonto
                            .abrirModal(
                                ponto
                            );
                    }
                }
            );
        });
}


function conectarBotoesExcluir() {
    document
        .querySelectorAll(
            ".botao-excluir-ponto"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                async function () {
                    const ponto =
                        encontrarPonto(
                            botao.dataset.pontoId
                        );

                    if (!ponto) {
                        return;
                    }

                    const confirmou =
                        window.confirm(
                            `Deseja excluir o ponto "${ponto.nome}"?`
                        );

                    if (!confirmou) {
                        return;
                    }

                    botao.disabled = true;

                    botao.textContent =
                        "Excluindo...";

                    try {
                        await excluirPonto(
                            ponto.id
                        );

                        await carregarPontos();
                    } catch (erro) {
                        console.error(
                            "Erro ao excluir ponto:",
                            erro
                        );

                        alert(
                            "Não foi possível excluir o ponto."
                        );

                        botao.disabled = false;

                        botao.textContent =
                            "Excluir";
                    }
                }
            );
        });
}


function encontrarPonto(pontoId) {
    return listaPontosAtual.find(
        function (ponto) {
            return (
                ponto.id === pontoId
            );
        }
    );
}


function traduzirTipoPonto(tipo) {
    const tipos = {
        saida_eta:
            "Saída da ETA",

        reservatorio:
            "Reservatório",

        rede_distribuicao:
            "Rede de distribuição",

        consumo:
            "Ponto de consumo",

        torneira:
            "Torneira",

        cozinha:
            "Cozinha",

        banheiro:
            "Banheiro",

        outro:
            "Outro"
    };

    return tipos[tipo] || "Outro";
}


function garantirEstiloPontos() {
    if (
        document.getElementById(
            "estiloModuloPontos"
        )
    ) {
        return;
    }

    const link =
        document.createElement("link");

    link.id =
        "estiloModuloPontos";

    link.rel =
        "stylesheet";

    link.href =
        "../css/pontos.css";

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
