import {
    cadastrarPonto,
    atualizarPonto
} from "../firebase/pontos.js";


function removerModalPontoAntigo() {
    const modalAntigo =
        document.getElementById(
            "modalPonto"
        );

    if (modalAntigo) {
        modalAntigo.remove();
    }
}


function criarEstruturaModalPonto() {
    removerModalPontoAntigo();

    const modal =
        document.createElement("div");

    modal.id = "modalPonto";

    modal.className =
        "modal-ponto escondido";

    modal.innerHTML = `
        <div class="fundo-modal-ponto"></div>

        <section class="conteudo-modal-ponto">

            <header class="cabecalho-modal-ponto">

                <div>
                    <p class="identificacao-modulo">
                        Pontos de coleta
                    </p>

                    <h2 id="tituloModalPonto">
                        Novo ponto
                    </h2>

                    <p
                        id="etaModalPonto"
                        class="eta-modal-ponto"
                    ></p>
                </div>

                <button
                    id="fecharModalPonto"
                    class="fechar-modal-ponto"
                    type="button"
                    aria-label="Fechar"
                >
                    ×
                </button>

            </header>

            <form id="formularioPonto">

                <div class="grade-formulario-ponto">

                    <div
                        class="
                            campo-formulario-ponto
                            campo-ponto-largo
                        "
                    >
                        <label for="nomePonto">
                            Nome do ponto *
                        </label>

                        <input
                            id="nomePonto"
                            type="text"
                            maxlength="120"
                            placeholder="Ex.: Saída da ETA"
                            required
                        >
                    </div>

                    <div class="campo-formulario-ponto">

                        <label for="tipoPonto">
                            Tipo do ponto
                        </label>

                        <select id="tipoPonto">

                            <option value="saida_eta">
                                Saída da ETA
                            </option>

                            <option value="reservatorio">
                                Reservatório
                            </option>

                            <option value="rede_distribuicao">
                                Rede de distribuição
                            </option>

                            <option value="consumo">
                                Ponto de consumo
                            </option>

                            <option value="torneira">
                                Torneira
                            </option>

                            <option value="cozinha">
                                Cozinha
                            </option>

                            <option value="banheiro">
                                Banheiro
                            </option>

                            <option value="outro">
                                Outro
                            </option>

                        </select>
                    </div>

                    <div class="campo-formulario-ponto">

                        <label for="ordemPonto">
                            Ordem de exibição
                        </label>

                        <input
                            id="ordemPonto"
                            type="number"
                            min="0"
                            step="1"
                            value="1"
                        >
                    </div>

                    <div class="campo-formulario-ponto">

                        <label for="situacaoPonto">
                            Situação
                        </label>

                        <select id="situacaoPonto">

                            <option value="ativo">
                                Ativo
                            </option>

                            <option value="inativo">
                                Inativo
                            </option>

                        </select>
                    </div>

                    <div class="campo-formulario-ponto">

                        <label for="localizacaoPonto">
                            Localização
                        </label>

                        <input
                            id="localizacaoPonto"
                            type="text"
                            maxlength="150"
                            placeholder="Ex.: Cabana 01"
                        >
                    </div>

                    <div
                        class="
                            campo-formulario-ponto
                            campo-ponto-largo
                        "
                    >
                        <label for="observacoesPonto">
                            Observações
                        </label>

                        <textarea
                            id="observacoesPonto"
                            rows="4"
                            maxlength="500"
                            placeholder="Informações adicionais sobre o ponto"
                        ></textarea>
                    </div>

                </div>

                <div
                    id="mensagemModalPonto"
                    class="mensagem-modal-ponto"
                ></div>

                <footer class="acoes-modal-ponto">

                    <button
                        id="cancelarModalPonto"
                        class="botao-cancelar-ponto"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
                        id="salvarPonto"
                        class="botao-salvar-ponto"
                        type="submit"
                    >
                        Salvar ponto
                    </button>

                </footer>

            </form>

        </section>
    `;

    document.body.appendChild(modal);

    return modal;
}


export function configurarModalPonto({
    usuarioId,
    clienteId,
    clienteNome,
    etaId,
    etaNome,
    aoSalvar
}) {
    const modal =
        criarEstruturaModalPonto();

    const formulario =
        document.getElementById(
            "formularioPonto"
        );

    const titulo =
        document.getElementById(
            "tituloModalPonto"
        );

    const etaModal =
        document.getElementById(
            "etaModalPonto"
        );

    const mensagem =
        document.getElementById(
            "mensagemModalPonto"
        );

    const botaoSalvar =
        document.getElementById(
            "salvarPonto"
        );

    const botaoFechar =
        document.getElementById(
            "fecharModalPonto"
        );

    const botaoCancelar =
        document.getElementById(
            "cancelarModalPonto"
        );

    const fundoModal =
        modal.querySelector(
            ".fundo-modal-ponto"
        );

    let pontoEmEdicao = null;
    let envioEmAndamento = false;


    function mostrarEtaVinculada() {
        etaModal.textContent =
            etaNome
                ? `ETA: ${etaNome}`
                : "";

        etaModal.style.display =
            etaNome
                ? "block"
                : "none";
    }


    function limparMensagem() {
        mensagem.textContent = "";

        mensagem.className =
            "mensagem-modal-ponto";
    }


    function mostrarMensagem(
        texto,
        tipo
    ) {
        mensagem.textContent = texto;

        mensagem.className =
            `mensagem-modal-ponto ${tipo}`;
    }


    function limparFormulario() {
        formulario.reset();

        pontoEmEdicao = null;
        envioEmAndamento = false;

        titulo.textContent =
            "Novo ponto";

        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "Salvar ponto";

        document.getElementById(
            "tipoPonto"
        ).value = "saida_eta";

        document.getElementById(
            "ordemPonto"
        ).value = "1";

        document.getElementById(
            "situacaoPonto"
        ).value = "ativo";

        mostrarEtaVinculada();
        limparMensagem();
    }


    function fecharModal() {
        modal.classList.add(
            "escondido"
        );

        document.body.classList.remove(
            "modal-aberto"
        );

        limparFormulario();
    }


    function abrirModal(
        ponto = null
    ) {
        limparFormulario();

        if (ponto) {
            pontoEmEdicao = ponto;

            titulo.textContent =
                "Editar ponto";

            botaoSalvar.textContent =
                "Salvar alterações";

            document.getElementById(
                "nomePonto"
            ).value =
                ponto.nome || "";

            document.getElementById(
                "tipoPonto"
            ).value =
                ponto.tipo ||
                "saida_eta";

            document.getElementById(
                "ordemPonto"
            ).value =
                ponto.ordem ?? 1;

            document.getElementById(
                "situacaoPonto"
            ).value =
                ponto.situacao ||
                "ativo";

            document.getElementById(
                "localizacaoPonto"
            ).value =
                ponto.localizacao || "";

            document.getElementById(
                "observacoesPonto"
            ).value =
                ponto.observacoes || "";
        }

        mostrarEtaVinculada();

        modal.classList.remove(
            "escondido"
        );

        document.body.classList.add(
            "modal-aberto"
        );

        setTimeout(function () {
            document.getElementById(
                "nomePonto"
            ).focus();
        }, 50);
    }


    botaoFechar.addEventListener(
        "click",
        fecharModal
    );

    botaoCancelar.addEventListener(
        "click",
        fecharModal
    );

    fundoModal.addEventListener(
        "click",
        fecharModal
    );


    formulario.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            if (envioEmAndamento) {
                return;
            }

            limparMensagem();

            if (!usuarioId) {
                mostrarMensagem(
                    "Usuário não identificado. Entre novamente.",
                    "erro"
                );

                return;
            }

            if (!etaId) {
                mostrarMensagem(
                    "Abra uma ETA antes de cadastrar o ponto.",
                    "erro"
                );

                return;
            }

            const nome =
                document.getElementById(
                    "nomePonto"
                ).value.trim();

            if (!nome) {
                mostrarMensagem(
                    "Informe o nome do ponto.",
                    "erro"
                );

                return;
            }

            const dadosPonto = {
                nome,

                tipo:
                    document.getElementById(
                        "tipoPonto"
                    ).value,

                ordem:
                    Number(
                        document.getElementById(
                            "ordemPonto"
                        ).value || 0
                    ),

                situacao:
                    document.getElementById(
                        "situacaoPonto"
                    ).value,

                localizacao:
                    document.getElementById(
                        "localizacaoPonto"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "observacoesPonto"
                    ).value.trim(),

                usuarioId,

                clienteId:
                    clienteId || null,

                clienteNome:
                    clienteNome || "",

                etaId,

                etaNome:
                    etaNome || "",

                atualizadoEm:
                    new Date().toISOString()
            };

            envioEmAndamento = true;

            botaoSalvar.disabled = true;

            botaoSalvar.textContent =
                pontoEmEdicao
                    ? "Salvando alterações..."
                    : "Salvando ponto...";

            try {
                if (pontoEmEdicao) {
                    await atualizarPonto(
                        pontoEmEdicao.id,
                        dadosPonto
                    );
                } else {
                    dadosPonto.criadoEm =
                        new Date().toISOString();

                    await cadastrarPonto(
                        dadosPonto
                    );
                }

                mostrarMensagem(
                    pontoEmEdicao
                        ? "Ponto atualizado com sucesso!"
                        : "Ponto cadastrado com sucesso!",
                    "sucesso"
                );

                if (
                    typeof aoSalvar ===
                    "function"
                ) {
                    await aoSalvar();
                }

                setTimeout(
                    fecharModal,
                    400
                );
            } catch (erro) {
                console.error(
                    "Erro ao salvar ponto:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível salvar o ponto.",
                    "erro"
                );

                envioEmAndamento = false;

                botaoSalvar.disabled = false;

                botaoSalvar.textContent =
                    pontoEmEdicao
                        ? "Salvar alterações"
                        : "Salvar ponto";
            }
        }
    );


    return {
        abrirModal,
        fecharModal
    };
}