import { auth } from "../firebase/firebase-config.js";

import {
    listarPontos
} from "../firebase/pontos.js";

import {
    cadastrarMedicoesEmLote,
    listarMedicoesPorEta
} from "../firebase/medicoes.js";


let usuarioAtualId = null;
let clienteAtualId = null;
let clienteAtualNome = "";
let etaAtualId = null;
let etaAtualNome = "";
let funcaoVoltar = null;


export function montarModuloMedicoes(
    container,
    opcoes = {}
) {
    garantirEstiloMedicoes();

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

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
        <section class="modulo-medicoes">

            <header class="cabecalho-modulo-medicoes">

                <div>

                    <button
                        id="botaoVoltarMedicoes"
                        class="botao-voltar-medicoes"
                        type="button"
                    >
                        ← Voltar para pontos
                    </button>

                    <p class="identificacao-modulo">
                        Registro de campo
                    </p>

                    <h1>
                        🧪 Nova medição em lote
                    </h1>

                    <p>
                        Preencha os resultados dos pontos ativos
                        desta ETA e salve todos de uma vez.
                    </p>

                    <div class="vinculo-medicoes">

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

            </header>

            <section class="dados-visita-medicao">

                <div class="campo-medicao-geral">

                    <label for="dataHoraMedicao">
                        Data e hora *
                    </label>

                    <input
                        id="dataHoraMedicao"
                        type="datetime-local"
                        required
                    >

                </div>

                <div class="campo-medicao-geral">

                    <label for="responsavelMedicao">
                        Responsável pela medição
                    </label>

                    <input
                        id="responsavelMedicao"
                        type="text"
                        maxlength="120"
                        placeholder="Nome do responsável"
                    >

                </div>

                <div class="campo-medicao-geral campo-medicao-geral-largo">

                    <label for="observacaoGeralMedicao">
                        Observação geral da visita
                    </label>

                    <textarea
                        id="observacaoGeralMedicao"
                        rows="3"
                        maxlength="600"
                        placeholder="Informações gerais da visita"
                    ></textarea>

                </div>

            </section>

            <section class="cabecalho-pontos-medicao">

                <div>
                    <h2>Pontos ativos</h2>

                    <p>
                        Preencha cloro, pH e observação nos pontos
                        que foram medidos.
                    </p>
                </div>

                <span id="quantidadePontosMedicao">
                    0 pontos
                </span>

            </section>

            <form id="formularioMedicoesLote" novalidate>

                <section
                    id="listaPontosMedicao"
                    class="lista-pontos-medicao"
                >
                    <div class="estado-vazio-medicoes">

                        <span>⏳</span>

                        <strong>
                            Carregando pontos...
                        </strong>

                    </div>
                </section>

                <div
                    id="mensagemMedicoes"
                    class="mensagem-medicoes"
                ></div>

                <footer class="acoes-medicoes">

                    <button
                        id="botaoLimparMedicoes"
                        class="botao-limpar-medicoes"
                        type="button"
                    >
                        Limpar campos
                    </button>

                    <button
                        id="botaoSalvarMedicoes"
                        class="botao-salvar-medicoes"
                        type="submit"
                    >
                        Salvar medições
                    </button>

                </footer>

            </form>

            <section class="historico-resumo-medicoes">

                <div class="cabecalho-historico-medicoes">

                    <div>
                        <h2>Últimas medições</h2>

                        <p>
                            Registros mais recentes desta ETA.
                        </p>
                    </div>

                    <strong id="quantidadeMedicoesEta">
                        0
                    </strong>

                </div>

                <div
                    id="listaHistoricoMedicoes"
                    class="lista-historico-medicoes"
                >
                    <div class="estado-vazio-medicoes">

                        <span>🧪</span>

                        <strong>
                            Nenhuma medição registrada
                        </strong>

                    </div>
                </div>

            </section>

        </section>
    `;

    configurarDataHoraAtual();
    configurarEventos();
    carregarTelaMedicoes();
}


function configurarEventos() {
    document
        .getElementById(
            "botaoVoltarMedicoes"
        )
        .addEventListener(
            "click",
            function () {
                if (funcaoVoltar) {
                    funcaoVoltar();
                }
            }
        );

    document
        .getElementById(
            "botaoLimparMedicoes"
        )
        .addEventListener(
            "click",
            limparCamposDosPontos
        );

    document
        .getElementById(
            "formularioMedicoesLote"
        )
        .addEventListener(
            "submit",
            salvarMedicoes
        );
}


async function carregarTelaMedicoes() {
    await Promise.all([
        carregarPontosAtivos(),
        carregarHistorico()
    ]);
}


async function carregarPontosAtivos() {
    const lista =
        document.getElementById(
            "listaPontosMedicao"
        );

    const quantidade =
        document.getElementById(
            "quantidadePontosMedicao"
        );

    if (!usuarioAtualId || !etaAtualId) {
        lista.innerHTML = `
            <div class="estado-vazio-medicoes">

                <span>⚠️</span>

                <strong>
                    ETA ou usuário não identificado
                </strong>

            </div>
        `;

        return;
    }

    try {
        const pontos =
            await listarPontos(
                usuarioAtualId,
                etaAtualId
            );

        const pontosAtivos =
            pontos.filter(
                function (ponto) {
                    return (
                        ponto.situacao !==
                        "inativo"
                    );
                }
            );

        quantidade.textContent =
            `${pontosAtivos.length} ${
                pontosAtivos.length === 1
                    ? "ponto"
                    : "pontos"
            }`;

        if (pontosAtivos.length === 0) {
            lista.innerHTML = `
                <div class="estado-vazio-medicoes">

                    <span>📍</span>

                    <strong>
                        Nenhum ponto ativo
                    </strong>

                    <p>
                        Cadastre ou ative um ponto antes
                        de registrar medições.
                    </p>

                </div>
            `;

            document
                .getElementById(
                    "botaoSalvarMedicoes"
                )
                .disabled = true;

            return;
        }

        lista.innerHTML =
            pontosAtivos
                .map(criarCardPontoMedicao)
                .join("");

        conectarSeletoresDosPontos();
    } catch (erro) {
        console.error(
            "Erro ao carregar pontos:",
            erro
        );

        lista.innerHTML = `
            <div class="estado-vazio-medicoes">

                <span>⚠️</span>

                <strong>
                    Não foi possível carregar os pontos
                </strong>

            </div>
        `;
    }
}


function criarCardPontoMedicao(ponto) {
    return `
        <article
            class="card-ponto-medicao"
            data-ponto-id="${ponto.id}"
            data-ponto-nome="${escaparAtributo(ponto.nome)}"
        >

            <div class="topo-card-ponto-medicao">

                <label class="seletor-ponto-medicao">

                    <span>
                        Situação na visita
                    </span>

                    <select
                        class="status-ponto-medicao"
                        data-ponto-id="${ponto.id}"
                    >
                        <option value="analisado">
                            Analisado
                        </option>

                        <option value="nao_analisado">
                            Não analisado
                        </option>
                    </select>

                </label>

                <div>

                    <h3>
                        📍 ${escaparHtml(ponto.nome)}
                    </h3>

                    <p>
                        ${
                            ponto.localizacao
                                ? escaparHtml(
                                    ponto.localizacao
                                )
                                : traduzirTipoPonto(
                                    ponto.tipo
                                )
                        }
                    </p>

                </div>

            </div>

            <div class="grade-campos-ponto-medicao">

                <div>

                    <label>
                        Cloro (mg/L)
                    </label>

                    <input
                        class="campo-cloro-medicao"
                        type="text"
                        inputmode="decimal"
                        placeholder="Ex.: 0,80"
                    >

                </div>

                <div>

                    <label>
                        pH
                    </label>

                    <input
                        class="campo-ph-medicao"
                        type="text"
                        inputmode="decimal"
                        placeholder="Ex.: 7,20"
                    >

                </div>

                <div class="campo-observacao-ponto-medicao">

                    <label>
                        Observação
                    </label>

                    <input
                        class="campo-observacao-medicao"
                        type="text"
                        maxlength="300"
                        placeholder="Observação específica do ponto"
                    >

                </div>

            </div>

        </article>
    `;
}


function conectarSeletoresDosPontos() {
    document
        .querySelectorAll(
            ".status-ponto-medicao"
        )
        .forEach(function (seletor) {
            seletor.addEventListener(
                "change",
                function () {
                    const card =
                        seletor.closest(
                            ".card-ponto-medicao"
                        );

                    const naoAnalisado =
                        seletor.value ===
                        "nao_analisado";

                    const campos =
                        card.querySelectorAll(
                            ".grade-campos-ponto-medicao input"
                        );

                    campos.forEach(
                        function (campo) {
                            campo.disabled =
                                naoAnalisado;

                            if (naoAnalisado) {
                                campo.value = "";
                            }
                        }
                    );

                    card.classList.toggle(
                        "nao-analisado",
                        naoAnalisado
                    );

                    card.classList.toggle(
                        "selecionado",
                        !naoAnalisado
                    );

                    if (!naoAnalisado) {
                        const cloro =
                            card.querySelector(
                                ".campo-cloro-medicao"
                            );

                        cloro.focus();
                    }
                }
            );
        });
}

async function salvarMedicoes(evento) {
    evento.preventDefault();

    const mensagem =
        document.getElementById(
            "mensagemMedicoes"
        );

    limparMensagem(mensagem);

    if (!usuarioAtualId || !etaAtualId) {
        mostrarMensagem(
            mensagem,
            "Usuário ou ETA não identificado.",
            "erro"
        );

        return;
    }

    const dataHora =
        document.getElementById(
            "dataHoraMedicao"
        ).value;

    if (!dataHora) {
        mostrarMensagem(
            mensagem,
            "Informe a data e hora da medição.",
            "erro"
        );

        return;
    }

    const responsavel =
        document.getElementById(
            "responsavelMedicao"
        ).value.trim();

    const observacaoGeral =
        document.getElementById(
            "observacaoGeralMedicao"
        ).value.trim();

    const cardsPontos =
        Array.from(
            document.querySelectorAll(
                ".card-ponto-medicao"
            )
        );

    if (cardsPontos.length === 0) {
        mostrarMensagem(
            mensagem,
            "Nenhum ponto ativo foi encontrado.",
            "erro"
        );

        return;
    }

    const medicoes = [];

    for (const card of cardsPontos) {
        const pontoId =
            card.dataset.pontoId;

        const pontoNome =
            card.dataset.pontoNome;

        const status =
            card.querySelector(
                ".status-ponto-medicao"
            ).value;

        const cloroTexto =
            card.querySelector(
                ".campo-cloro-medicao"
            ).value;

        const phTexto =
            card.querySelector(
                ".campo-ph-medicao"
            ).value;

        const observacao =
            card.querySelector(
                ".campo-observacao-medicao"
            ).value.trim();

        if (
            status === "analisado" &&
            !cloroTexto &&
            !phTexto
        ) {
            mostrarMensagem(
                mensagem,
                `Informe cloro ou pH para o ponto "${pontoNome}", ou marque como não analisado.`,
                "erro"
            );

            return;
        }

        const cloro =
            status === "analisado" &&
            cloroTexto
                ? converterNumeroDecimal(
                    cloroTexto
                )
                : null;

        const ph =
            status === "analisado" &&
            phTexto
                ? converterNumeroDecimal(
                    phTexto
                )
                : null;

        if (
            cloro !== null &&
            (
                Number.isNaN(cloro) ||
                cloro < 0
            )
        ) {
            mostrarMensagem(
                mensagem,
                `Valor de cloro inválido no ponto "${pontoNome}".`,
                "erro"
            );

            return;
        }

        if (
            ph !== null &&
            (
                Number.isNaN(ph) ||
                ph < 0 ||
                ph > 14
            )
        ) {
            mostrarMensagem(
                mensagem,
                `Valor de pH inválido no ponto "${pontoNome}".`,
                "erro"
            );

            return;
        }

       medicoes.push({
    usuarioId: usuarioAtualId,
            clienteId:
                clienteAtualId || null,
            clienteNome:
                clienteAtualNome || "",
            etaId:
                etaAtualId,
            etaNome:
                etaAtualNome || "",
            pontoId,
            pontoNome,
            status,
            dataHora,
            responsavel,
            cloro,
            ph,
            observacao:
                status === "nao_analisado" &&
                !observacao
                    ? "Não analisado nesta visita."
                    : observacao,
            observacaoGeral,
            criadoEm:
                new Date().toISOString(),
            atualizadoEm:
                new Date().toISOString()
        });
    }

    const botaoSalvar =
        document.getElementById(
            "botaoSalvarMedicoes"
        );

    botaoSalvar.disabled = true;

    botaoSalvar.textContent =
        "Salvando medições...";

    try {
        await cadastrarMedicoesEmLote(
            medicoes
        );

        mostrarMensagem(
            mensagem,
            `${medicoes.length} ${
                medicoes.length === 1
                    ? "medição salva"
                    : "medições salvas"
            } com sucesso!`,
            "sucesso"
        );

        limparCamposDosPontos();
        configurarDataHoraAtual();

        await carregarHistorico();
    } catch (erro) {
        console.error(
            "Erro ao salvar medições:",
            erro
        );

        mostrarMensagem(
            mensagem,
            "Não foi possível salvar as medições.",
            "erro"
        );
    } finally {
        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "Salvar medições";
    }
}


async function carregarHistorico() {
    const lista =
        document.getElementById(
            "listaHistoricoMedicoes"
        );

    const quantidade =
        document.getElementById(
            "quantidadeMedicoesEta"
        );

    if (!lista || !quantidade) {
        return;
    }

    if (!usuarioAtualId || !etaAtualId) {
        return;
    }

    try {
        const medicoes =
            await listarMedicoesPorEta(
                usuarioAtualId,
                etaAtualId
            );

        quantidade.textContent =
            String(medicoes.length);

        if (medicoes.length === 0) {
            lista.innerHTML = `
                <div class="estado-vazio-medicoes">

                    <span>🧪</span>

                    <strong>
                        Nenhuma medição registrada
                    </strong>

                </div>
            `;

            return;
        }

        lista.innerHTML =
            medicoes
                .slice(0, 10)
                .map(criarItemHistorico)
                .join("");
    } catch (erro) {
        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        lista.innerHTML = `
            <div class="estado-vazio-medicoes">

                <span>⚠️</span>

                <strong>
                    Não foi possível carregar o histórico
                </strong>

            </div>
        `;
    }
}


function criarItemHistorico(medicao) {
    return `
        <article class="item-historico-medicao">

            <div>

                <strong>
                    ${escaparHtml(
                        medicao.pontoNome ||
                        "Ponto"
                    )}
                </strong>

                <span>
                    ${formatarDataHora(
                        medicao.dataHora
                    )}
                </span>

            </div>

            <div class="valores-historico-medicao">

                <span>
                    Status:
                    <strong>
                        ${
                            medicao.status ===
                            "nao_analisado"
                                ? "Não analisado"
                                : "Analisado"
                        }
                    </strong>
                </span>

                <span>
                    Cloro:
                    <strong>
                        ${
                            medicao.cloro !== null &&
                            medicao.cloro !== undefined
                                ? medicao.cloro
                                : "—"
                        }
                    </strong>
                </span>

                <span>
                    pH:
                    <strong>
                        ${
                            medicao.ph !== null &&
                            medicao.ph !== undefined
                                ? medicao.ph
                                : "—"
                        }
                    </strong>
                </span>

            </div>

        </article>
    `;
}


function limparCamposDosPontos() {
    document
        .querySelectorAll(
            ".card-ponto-medicao"
        )
        .forEach(function (card) {
            const seletor =
                card.querySelector(
                    ".status-ponto-medicao"
                );

            seletor.value =
                "analisado";

            card.classList.remove(
                "nao-analisado"
            );

            card.classList.add(
                "selecionado"
            );

            card
                .querySelectorAll(
                    ".grade-campos-ponto-medicao input"
                )
                .forEach(function (campo) {
                    campo.value = "";
                    campo.disabled = false;
                });
        });

    document.getElementById(
        "observacaoGeralMedicao"
    ).value = "";
}

function configurarDataHoraAtual() {
    const campo =
        document.getElementById(
            "dataHoraMedicao"
        );

    if (!campo) {
        return;
    }

    const agora =
        new Date();

    const deslocamento =
        agora.getTimezoneOffset() *
        60000;

    const local =
        new Date(
            agora.getTime() -
            deslocamento
        );

    campo.value =
        local
            .toISOString()
            .slice(0, 16);
}


function mostrarMensagem(
    elemento,
    texto,
    tipo
) {
    elemento.textContent = texto;

    elemento.className =
        `mensagem-medicoes ${tipo}`;
}


function limparMensagem(elemento) {
    elemento.textContent = "";

    elemento.className =
        "mensagem-medicoes";
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


function converterNumeroDecimal(valor) {
    const texto =
        String(valor || "")
            .trim()
            .replace(",", ".");

    if (!texto) {
        return null;
    }

    return Number(texto);
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


function garantirEstiloMedicoes() {
    if (
        document.getElementById(
            "estiloModuloMedicoes"
        )
    ) {
        return;
    }

    const link =
        document.createElement("link");

    link.id =
        "estiloModuloMedicoes";

    link.rel =
        "stylesheet";

    link.href =
        "../css/medicoes.css";

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


function escaparAtributo(valor) {
    return escaparHtml(valor);
}
