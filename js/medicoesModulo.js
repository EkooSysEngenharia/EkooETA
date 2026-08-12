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
let funcaoAposSalvar = null;
let fotoVisitaAtual = "";
let historicoMedicoesAtual = [];


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

    funcaoAposSalvar =
        typeof opcoes.aoSalvar === "function"
            ? opcoes.aoSalvar
            : null;

    fotoVisitaAtual = "";
    historicoMedicoesAtual = [];

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

                <div class="campo-medicao-geral campo-medicao-geral-largo">

                    <label>
                        Localização da coleta
                    </label>

                    <div class="acoes-recurso-campo">

                        <button
                            id="botaoObterLocalizacao"
                            class="botao-recurso-campo"
                            type="button"
                        >
                            📍 Obter localização
                        </button>

                        <span
                            id="statusLocalizacaoMedicao"
                            class="status-recurso-campo"
                        >
                            Localização ainda não capturada
                        </span>

                    </div>

                    <input
                        id="latitudeMedicao"
                        type="hidden"
                    >

                    <input
                        id="longitudeMedicao"
                        type="hidden"
                    >

                    <input
                        id="precisaoGpsMedicao"
                        type="hidden"
                    >

                </div>

                <div class="campo-medicao-geral campo-medicao-geral-largo">

                    <label for="fotoVisitaMedicao">
                        Foto da visita
                    </label>

                    <div class="acoes-recurso-campo">

                        <label
                            class="botao-recurso-campo"
                            for="fotoVisitaMedicao"
                        >
                            📷 Tirar ou escolher foto
                        </label>

                        <button
                            id="botaoRemoverFotoVisita"
                            class="botao-remover-recurso"
                            type="button"
                            hidden
                        >
                            Remover foto
                        </button>

                    </div>

                    <input
                        id="fotoVisitaMedicao"
                        class="entrada-foto-visita"
                        type="file"
                        accept="image/*"
                        capture="environment"
                    >

                    <div
                        id="previewFotoVisita"
                        class="preview-foto-visita"
                        hidden
                    >
                        <img
                            id="imagemPreviewFotoVisita"
                            alt="Prévia da foto da visita"
                        >
                    </div>

                    <small class="ajuda-recurso-campo">
                        A imagem é reduzida antes de ser salva para evitar um arquivo muito pesado.
                    </small>

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

    document
        .getElementById(
            "botaoObterLocalizacao"
        )
        .addEventListener(
            "click",
            obterLocalizacaoDaColeta
        );

    document
        .getElementById(
            "fotoVisitaMedicao"
        )
        .addEventListener(
            "change",
            selecionarFotoDaVisita
        );

    document
        .getElementById(
            "botaoRemoverFotoVisita"
        )
        .addEventListener(
            "click",
            removerFotoDaVisita
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
        atualizarTendenciasDosPontos();
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

            <section
                class="avaliacao-tecnica-ponto neutro"
                aria-live="polite"
            >

                <div class="avaliacao-tecnica-cabecalho">

                    <strong>
                        Avaliação automática
                    </strong>

                    <span class="avaliacao-tecnica-status">
                        ⚪ Aguardando dados
                    </span>

                </div>

                <div class="avaliacao-tecnica-itens">

                    <p
                        class="avaliacao-parametro"
                        data-avaliacao-cloro
                    >
                        Informe o cloro para receber a orientação.
                    </p>

                    <p
                        class="avaliacao-parametro"
                        data-avaliacao-ph
                    >
                        Informe o pH para receber a orientação.
                    </p>

                </div>

            </section>

            <section
                class="inteligencia-historica-ponto neutro"
                aria-live="polite"
            >

                <div class="inteligencia-historica-cabecalho">

                    <strong>
                        Tendência das últimas medições
                    </strong>

                    <span class="inteligencia-historica-status">
                        ⚪ Histórico insuficiente
                    </span>

                </div>

                <div class="inteligencia-historica-conteudo">

                    <p data-tendencia-resumo>
                        São necessárias pelo menos três medições analisadas para identificar tendências.
                    </p>

                    <div
                        class="historico-valores-mini"
                        data-tendencia-valores
                    ></div>

                </div>

            </section>

        </article>
    `;
}


function conectarSeletoresDosPontos() {
    document
        .querySelectorAll(
            ".card-ponto-medicao"
        )
        .forEach(function (card) {
            const seletor =
                card.querySelector(
                    ".status-ponto-medicao"
                );

            const campoCloro =
                card.querySelector(
                    ".campo-cloro-medicao"
                );

            const campoPh =
                card.querySelector(
                    ".campo-ph-medicao"
                );

            seletor.addEventListener(
                "change",
                function () {
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

                    atualizarAvaliacaoTecnica(
                        card
                    );

                    if (!naoAnalisado) {
                        campoCloro.focus();
                    }
                }
            );

            campoCloro.addEventListener(
                "input",
                function () {
                    atualizarAvaliacaoTecnica(
                        card
                    );
                }
            );

            campoPh.addEventListener(
                "input",
                function () {
                    atualizarAvaliacaoTecnica(
                        card
                    );
                }
            );

            atualizarAvaliacaoTecnica(
                card
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

    const latitude =
        document.getElementById(
            "latitudeMedicao"
        ).value;

    const longitude =
        document.getElementById(
            "longitudeMedicao"
        ).value;

    const precisaoGps =
        document.getElementById(
            "precisaoGpsMedicao"
        ).value;

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

    for (
        let indiceCard = 0;
        indiceCard < cardsPontos.length;
        indiceCard++
    ) {
        const card =
            cardsPontos[indiceCard];

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
            latitude:
                latitude || null,
            longitude:
                longitude || null,
            precisaoGps:
                precisaoGps
                    ? Number(precisaoGps)
                    : null,
            fotoVisita:
                indiceCard === 0
                    ? fotoVisitaAtual || null
                    : null,
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
        limparRecursosDaVisita();
        configurarDataHoraAtual();

        await carregarHistorico();

        if (funcaoAposSalvar) {
            await funcaoAposSalvar();
        }
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

        historicoMedicoesAtual =
            medicoes;

        quantidade.textContent =
            String(medicoes.length);

        atualizarTendenciasDosPontos();

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

            atualizarAvaliacaoTecnica(
                card
            );
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


function obterLocalizacaoDaColeta() {
    const botao =
        document.getElementById(
            "botaoObterLocalizacao"
        );

    const status =
        document.getElementById(
            "statusLocalizacaoMedicao"
        );

    if (!navigator.geolocation) {
        status.textContent =
            "Este aparelho não oferece localização.";

        status.className =
            "status-recurso-campo erro";

        return;
    }

    botao.disabled = true;
    botao.textContent =
        "📍 Obtendo localização...";

    status.textContent =
        "Aguardando o GPS do aparelho...";

    navigator.geolocation.getCurrentPosition(
        function (posicao) {
            const latitude =
                posicao.coords.latitude;

            const longitude =
                posicao.coords.longitude;

            const precisao =
                posicao.coords.accuracy;

            document.getElementById(
                "latitudeMedicao"
            ).value =
                latitude.toFixed(7);

            document.getElementById(
                "longitudeMedicao"
            ).value =
                longitude.toFixed(7);

            document.getElementById(
                "precisaoGpsMedicao"
            ).value =
                String(
                    Math.round(precisao)
                );

            status.textContent =
                `Localização capturada — precisão aproximada de ${Math.round(precisao)} m`;

            status.className =
                "status-recurso-campo sucesso";

            botao.disabled = false;
            botao.textContent =
                "📍 Atualizar localização";
        },

        function (erro) {
            console.error(
                "Erro ao obter localização:",
                erro
            );

            let mensagem =
                "Não foi possível obter a localização.";

            if (erro.code === 1) {
                mensagem =
                    "Permissão de localização negada.";
            }

            if (erro.code === 2) {
                mensagem =
                    "Localização indisponível neste momento.";
            }

            if (erro.code === 3) {
                mensagem =
                    "O GPS demorou demais para responder.";
            }

            status.textContent =
                mensagem;

            status.className =
                "status-recurso-campo erro";

            botao.disabled = false;
            botao.textContent =
                "📍 Tentar novamente";
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000
        }
    );
}


async function selecionarFotoDaVisita(
    evento
) {
    const arquivo =
        evento.target.files[0];

    if (!arquivo) {
        return;
    }

    if (
        !arquivo.type.startsWith(
            "image/"
        )
    ) {
        alert(
            "Selecione um arquivo de imagem."
        );

        evento.target.value = "";
        return;
    }

    try {
        fotoVisitaAtual =
            await compactarImagem(
                arquivo
            );

        const preview =
            document.getElementById(
                "previewFotoVisita"
            );

        const imagem =
            document.getElementById(
                "imagemPreviewFotoVisita"
            );

        const remover =
            document.getElementById(
                "botaoRemoverFotoVisita"
            );

        imagem.src =
            fotoVisitaAtual;

        preview.hidden = false;
        remover.hidden = false;
    } catch (erro) {
        console.error(
            "Erro ao preparar foto:",
            erro
        );

        alert(
            "Não foi possível preparar a foto."
        );

        removerFotoDaVisita();
    }
}


function compactarImagem(arquivo) {
    return new Promise(
        function (resolve, reject) {
            const leitor =
                new FileReader();

            leitor.onerror =
                function () {
                    reject(
                        new Error(
                            "Falha ao ler imagem."
                        )
                    );
                };

            leitor.onload =
                function () {
                    const imagem =
                        new Image();

                    imagem.onerror =
                        function () {
                            reject(
                                new Error(
                                    "Imagem inválida."
                                )
                            );
                        };

                    imagem.onload =
                        function () {
                            const limite =
                                1280;

                            const proporcao =
                                Math.min(
                                    1,
                                    limite /
                                        Math.max(
                                            imagem.width,
                                            imagem.height
                                        )
                                );

                            const largura =
                                Math.max(
                                    1,
                                    Math.round(
                                        imagem.width *
                                        proporcao
                                    )
                                );

                            const altura =
                                Math.max(
                                    1,
                                    Math.round(
                                        imagem.height *
                                        proporcao
                                    )
                                );

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                largura;

                            canvas.height =
                                altura;

                            const contexto =
                                canvas.getContext(
                                    "2d"
                                );

                            contexto.drawImage(
                                imagem,
                                0,
                                0,
                                largura,
                                altura
                            );

                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.68
                                )
                            );
                        };

                    imagem.src =
                        leitor.result;
                };

            leitor.readAsDataURL(
                arquivo
            );
        }
    );
}


function removerFotoDaVisita() {
    fotoVisitaAtual = "";

    const entrada =
        document.getElementById(
            "fotoVisitaMedicao"
        );

    const preview =
        document.getElementById(
            "previewFotoVisita"
        );

    const imagem =
        document.getElementById(
            "imagemPreviewFotoVisita"
        );

    const remover =
        document.getElementById(
            "botaoRemoverFotoVisita"
        );

    if (entrada) {
        entrada.value = "";
    }

    if (imagem) {
        imagem.removeAttribute(
            "src"
        );
    }

    if (preview) {
        preview.hidden = true;
    }

    if (remover) {
        remover.hidden = true;
    }
}


function limparRecursosDaVisita() {
    removerFotoDaVisita();

    const latitude =
        document.getElementById(
            "latitudeMedicao"
        );

    const longitude =
        document.getElementById(
            "longitudeMedicao"
        );

    const precisao =
        document.getElementById(
            "precisaoGpsMedicao"
        );

    const status =
        document.getElementById(
            "statusLocalizacaoMedicao"
        );

    if (latitude) {
        latitude.value = "";
    }

    if (longitude) {
        longitude.value = "";
    }

    if (precisao) {
        precisao.value = "";
    }

    if (status) {
        status.textContent =
            "Localização ainda não capturada";

        status.className =
            "status-recurso-campo";
    }
}


function atualizarAvaliacaoTecnica(
    card
) {
    const seletor =
        card.querySelector(
            ".status-ponto-medicao"
        );

    const painel =
        card.querySelector(
            ".avaliacao-tecnica-ponto"
        );

    const statusGeral =
        card.querySelector(
            ".avaliacao-tecnica-status"
        );

    const textoCloro =
        card.querySelector(
            "[data-avaliacao-cloro]"
        );

    const textoPh =
        card.querySelector(
            "[data-avaliacao-ph]"
        );

    if (
        !seletor ||
        !painel ||
        !statusGeral ||
        !textoCloro ||
        !textoPh
    ) {
        return;
    }

    if (
        seletor.value ===
        "nao_analisado"
    ) {
        aplicarClasseAvaliacao(
            painel,
            "neutro"
        );

        statusGeral.textContent =
            "⚪ Não analisado";

        textoCloro.textContent =
            "Cloro não analisado nesta visita.";

        textoPh.textContent =
            "pH não analisado nesta visita.";

        return;
    }

    const campoCloro =
        card.querySelector(
            ".campo-cloro-medicao"
        );

    const campoPh =
        card.querySelector(
            ".campo-ph-medicao"
        );

    const resultadoCloro =
        avaliarCloro(
            converterNumeroDecimal(
                campoCloro.value
            )
        );

    const resultadoPh =
        avaliarPh(
            converterNumeroDecimal(
                campoPh.value
            )
        );

    textoCloro.textContent =
        resultadoCloro.texto;

    textoCloro.className =
        `avaliacao-parametro ${resultadoCloro.nivel}`;

    textoPh.textContent =
        resultadoPh.texto;

    textoPh.className =
        `avaliacao-parametro ${resultadoPh.nivel}`;

    const nivelGeral =
        obterNivelMaisCritico([
            resultadoCloro.nivel,
            resultadoPh.nivel
        ]);

    aplicarClasseAvaliacao(
        painel,
        nivelGeral
    );

    const rotulos = {
        neutro:
            "⚪ Aguardando dados",
        ideal:
            "🟢 Dentro da faixa",
        atencao:
            "🟡 Atenção",
        correcao:
            "🔴 Necessita correção"
    };

    statusGeral.textContent =
        rotulos[nivelGeral];
}


function avaliarCloro(valor) {
    if (
        valor === null ||
        Number.isNaN(valor)
    ) {
        return {
            nivel:
                "neutro",

            texto:
                "Informe o cloro para receber a orientação."
        };
    }

    if (
        valor < 2.5 ||
        valor > 5.5
    ) {
        return {
            nivel:
                "correcao",

            texto:
                valor < 2.5
                    ? `🔴 Cloro ${formatarNumeroTecnico(valor)} mg/L: abaixo da faixa de atenção. Verifique a dosagem e repita a análise.`
                    : `🔴 Cloro ${formatarNumeroTecnico(valor)} mg/L: acima da faixa de atenção. Verifique possível excesso de dosagem e repita a análise.`
        };
    }

    if (
        valor < 3 ||
        valor > 5
    ) {
        return {
            nivel:
                "atencao",

            texto:
                valor < 3
                    ? `🟡 Cloro ${formatarNumeroTecnico(valor)} mg/L: um pouco abaixo da faixa operacional de 3,0 a 5,0 mg/L.`
                    : `🟡 Cloro ${formatarNumeroTecnico(valor)} mg/L: um pouco acima da faixa operacional de 3,0 a 5,0 mg/L.`
        };
    }

    return {
        nivel:
            "ideal",

        texto:
            `🟢 Cloro ${formatarNumeroTecnico(valor)} mg/L: dentro da faixa operacional de 3,0 a 5,0 mg/L.`
    };
}

function avaliarPh(valor) {
    if (
        valor === null ||
        Number.isNaN(valor)
    ) {
        return {
            nivel:
                "neutro",

            texto:
                "Informe o pH para receber a orientação."
        };
    }

    if (
        valor < 6.8 ||
        valor > 7.6
    ) {
        return {
            nivel:
                "correcao",

            texto:
                valor < 6.8
                    ? `🔴 pH ${formatarNumeroTecnico(valor)}: abaixo da faixa de atenção. Verifique a condição da água e repita a análise.`
                    : `🔴 pH ${formatarNumeroTecnico(valor)}: acima da faixa de atenção. Verifique a condição da água e repita a análise.`
        };
    }

    if (
        valor < 7 ||
        valor > 7.4
    ) {
        return {
            nivel:
                "atencao",

            texto:
                valor < 7
                    ? `🟡 pH ${formatarNumeroTecnico(valor)}: um pouco abaixo da faixa operacional de 7,0 a 7,4.`
                    : `🟡 pH ${formatarNumeroTecnico(valor)}: um pouco acima da faixa operacional de 7,0 a 7,4.`
        };
    }

    return {
        nivel:
            "ideal",

        texto:
            `🟢 pH ${formatarNumeroTecnico(valor)}: dentro da faixa operacional de 7,0 a 7,4.`
    };
}

function obterNivelMaisCritico(
    niveis
) {
    const prioridade = {
        neutro: 0,
        ideal: 1,
        atencao: 2,
        correcao: 3
    };

    return niveis.reduce(
        function (
            nivelAtual,
            proximoNivel
        ) {
            return (
                prioridade[proximoNivel] >
                prioridade[nivelAtual]
                    ? proximoNivel
                    : nivelAtual
            );
        },
        "neutro"
    );
}


function aplicarClasseAvaliacao(
    elemento,
    nivel
) {
    elemento.classList.remove(
        "neutro",
        "ideal",
        "atencao",
        "correcao"
    );

    elemento.classList.add(
        nivel
    );
}


function formatarNumeroTecnico(
    valor
) {
    return Number(valor)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2
            }
        );
}


function atualizarTendenciasDosPontos() {
    document
        .querySelectorAll(
            ".card-ponto-medicao"
        )
        .forEach(
            function (card) {
                const pontoId =
                    card.dataset.pontoId;

                const medicoesDoPonto =
                    historicoMedicoesAtual
                        .filter(
                            function (medicao) {
                                return (
                                    medicao.pontoId ===
                                        pontoId &&
                                    medicao.status !==
                                        "nao_analisado"
                                );
                            }
                        )
                        .sort(
                            function (a, b) {
                                return String(
                                    b.dataHora || ""
                                ).localeCompare(
                                    String(
                                        a.dataHora || ""
                                    )
                                );
                            }
                        );

                renderizarTendenciaDoPonto(
                    card,
                    medicoesDoPonto
                );
            }
        );
}


function renderizarTendenciaDoPonto(
    card,
    medicoes
) {
    const painel =
        card.querySelector(
            ".inteligencia-historica-ponto"
        );

    const status =
        card.querySelector(
            ".inteligencia-historica-status"
        );

    const resumo =
        card.querySelector(
            "[data-tendencia-resumo]"
        );

    const valores =
        card.querySelector(
            "[data-tendencia-valores]"
        );

    if (
        !painel ||
        !status ||
        !resumo ||
        !valores
    ) {
        return;
    }

    if (medicoes.length === 0) {
        aplicarClasseHistorica(
            painel,
            "neutro"
        );

        status.textContent =
            "⚪ Sem histórico";

        resumo.textContent =
            "Ainda não existem medições analisadas para este ponto.";

        valores.innerHTML = "";
        return;
    }

    const recentes =
        medicoes.slice(0, 5);

    valores.innerHTML =
        recentes
            .map(
                function (medicao) {
                    return `
                        <span class="valor-mini-historico">
                            <small>
                                ${formatarDataCurta(
                                    medicao.dataHora
                                )}
                            </small>

                            <strong>
                                Cl:
                                ${
                                    medicao.cloro ??
                                    "—"
                                }
                            </strong>

                            <strong>
                                pH:
                                ${
                                    medicao.ph ??
                                    "—"
                                }
                            </strong>
                        </span>
                    `;
                }
            )
            .join("");

    const analise =
        analisarHistoricoTecnico(
            recentes
        );

    aplicarClasseHistorica(
        painel,
        analise.nivel
    );

    const rotulos = {
        neutro:
            "⚪ Histórico insuficiente",
        ideal:
            "🟢 Histórico estável",
        atencao:
            "🟡 Tendência de atenção",
        correcao:
            "🔴 Tendência crítica"
    };

    status.textContent =
        rotulos[analise.nivel];

    resumo.textContent =
        analise.mensagem;
}


function analisarHistoricoTecnico(
    medicoesRecentes
) {
    const cloros =
        medicoesRecentes
            .map(
                function (medicao) {
                    return numeroOuNulo(
                        medicao.cloro
                    );
                }
            )
            .filter(
                function (valor) {
                    return valor !== null;
                }
            );

    const phs =
        medicoesRecentes
            .map(
                function (medicao) {
                    return numeroOuNulo(
                        medicao.ph
                    );
                }
            )
            .filter(
                function (valor) {
                    return valor !== null;
                }
            );

    const mensagensCriticas = [];
    const mensagensAtencao = [];
    const mensagensIdeais = [];

    analisarSerieCloro(
        cloros,
        mensagensCriticas,
        mensagensAtencao,
        mensagensIdeais
    );

    analisarSeriePh(
        phs,
        mensagensCriticas,
        mensagensAtencao,
        mensagensIdeais
    );

    if (
        mensagensCriticas.length > 0
    ) {
        return {
            nivel:
                "correcao",

            mensagem:
                mensagensCriticas.join(
                    " "
                )
        };
    }

    if (
        mensagensAtencao.length > 0
    ) {
        return {
            nivel:
                "atencao",

            mensagem:
                mensagensAtencao.join(
                    " "
                )
        };
    }

    if (
        mensagensIdeais.length > 0
    ) {
        return {
            nivel:
                "ideal",

            mensagem:
                mensagensIdeais.join(
                    " "
                )
        };
    }

    return {
        nivel:
            "neutro",

        mensagem:
            "São necessárias pelo menos três medições comparáveis para identificar tendências."
    };
}


function analisarSerieCloro(
    valoresMaisRecentes,
    criticas,
    atencoes,
    ideais
) {
    if (
        valoresMaisRecentes.length < 3
    ) {
        return;
    }

    const ultimosTres =
        valoresMaisRecentes.slice(
            0,
            3
        );

    const todosFora =
        ultimosTres.every(
            function (valor) {
                return (
                    valor < 2.5 ||
                    valor > 5.5
                );
            }
        );

    if (todosFora) {
        criticas.push(
            "O cloro ficou fora da faixa em três medições consecutivas. Recomenda-se verificar o sistema de dosagem e repetir a análise após a correção."
        );

        return;
    }

    const cronologica =
        valoresMaisRecentes
            .slice(0, 5)
            .reverse();

    if (
        cronologica.length >= 3 &&
        serieEstaCaindo(
            cronologica,
            0.05
        )
    ) {
        const ultimo =
            valoresMaisRecentes[0];

        if (ultimo < 3) {
            criticas.push(
                "O cloro apresenta queda contínua e já está próximo ou abaixo do limite inferior. Inspecione a dosagem."
            );
        } else {
            atencoes.push(
                "O cloro apresenta tendência contínua de queda nas últimas medições. Acompanhe o dosador antes que o valor alcance o limite inferior."
            );
        }

        return;
    }

    if (
        cronologica.length >= 3 &&
        serieEstaSubindo(
            cronologica,
            0.05
        )
    ) {
        const ultimo =
            valoresMaisRecentes[0];

        if (ultimo > 5) {
            criticas.push(
                "O cloro apresenta elevação contínua e já está próximo ou acima do limite superior. Verifique possível excesso de dosagem."
            );
        } else {
            atencoes.push(
                "O cloro apresenta tendência contínua de elevação. Acompanhe a dosagem para evitar ultrapassar o limite superior."
            );
        }

        return;
    }

    const atencaoRepetida =
        ultimosTres.every(
            function (valor) {
                return (
                    valor < 3 ||
                    valor > 5
                );
            }
        );

    if (atencaoRepetida) {
        atencoes.push(
            "As três últimas medições de cloro permaneceram próximas dos limites operacionais."
        );

        return;
    }

    ideais.push(
        "O histórico recente de cloro não apresenta tendência crítica."
    );
}


function analisarSeriePh(
    valoresMaisRecentes,
    criticas,
    atencoes,
    ideais
) {
    if (
        valoresMaisRecentes.length < 3
    ) {
        return;
    }

    const ultimosTres =
        valoresMaisRecentes.slice(
            0,
            3
        );

    const todosFora =
        ultimosTres.every(
            function (valor) {
                return (
                    valor < 6.8 ||
                    valor > 7.6
                );
            }
        );

    if (todosFora) {
        criticas.push(
            "O pH ficou fora da faixa em três medições consecutivas. Recomenda-se investigar a causa e repetir a análise."
        );

        return;
    }

    const todosAtencao =
        ultimosTres.every(
            function (valor) {
                return (
                    valor < 7 ||
                    valor > 7.4
                );
            }
        );

    if (todosAtencao) {
        atencoes.push(
            "As três últimas medições de pH permaneceram afastadas da faixa ideal de 7,2."
        );

        return;
    }

    ideais.push(
        "O histórico recente de pH não apresenta repetição crítica."
    );
}


function serieEstaCaindo(
    valoresCronologicos,
    diferencaMinima
) {
    for (
        let indice = 1;
        indice < valoresCronologicos.length;
        indice++
    ) {
        const diferenca =
            valoresCronologicos[indice] -
            valoresCronologicos[
                indice - 1
            ];

        if (
            diferenca >
            -diferencaMinima
        ) {
            return false;
        }
    }

    return true;
}


function serieEstaSubindo(
    valoresCronologicos,
    diferencaMinima
) {
    for (
        let indice = 1;
        indice < valoresCronologicos.length;
        indice++
    ) {
        const diferenca =
            valoresCronologicos[indice] -
            valoresCronologicos[
                indice - 1
            ];

        if (
            diferenca <
            diferencaMinima
        ) {
            return false;
        }
    }

    return true;
}


function numeroOuNulo(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    const numero =
        Number(
            String(valor)
                .replace(",", ".")
        );

    return Number.isNaN(numero)
        ? null
        : numero;
}


function aplicarClasseHistorica(
    elemento,
    nivel
) {
    elemento.classList.remove(
        "neutro",
        "ideal",
        "atencao",
        "correcao"
    );

    elemento.classList.add(
        nivel
    );
}


function formatarDataCurta(valor) {
    if (!valor) {
        return "Sem data";
    }

    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return String(valor);
    }

    return data.toLocaleDateString(
        "pt-BR"
    );
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
