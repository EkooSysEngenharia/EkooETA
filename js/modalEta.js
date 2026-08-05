import {
    cadastrarEta,
    atualizarEta
} from "../firebase/etas.js";


function removerModalEtaAntigo() {
    const modalAntigo =
        document.getElementById("modalEta");

    if (modalAntigo) {
        modalAntigo.remove();
    }
}


function criarEstruturaModalEta() {
    removerModalEtaAntigo();

    const modal =
        document.createElement("div");

    modal.id = "modalEta";
    modal.className = "modal-eta escondido";

    modal.innerHTML = `
        <div class="fundo-modal-eta"></div>

        <section class="conteudo-modal-eta">

            <header class="cabecalho-modal-eta">

                <div>
                    <p class="identificacao-modulo">
                        Módulo ETA
                    </p>

                    <h2 id="tituloModalEta">
                        Nova ETA
                    </h2>

                    <p
                        id="clienteModalEta"
                        class="cliente-modal-eta"
                    ></p>
                </div>

                <button
                    id="fecharModalEta"
                    class="fechar-modal-eta"
                    type="button"
                    aria-label="Fechar"
                >
                    ×
                </button>

            </header>

            <form id="formularioEta">

                <div class="grade-formulario-eta">

                    <div
                        class="
                            campo-formulario-eta
                            campo-eta-largo
                        "
                    >
                        <label for="nomeEta">
                            Nome da ETA *
                        </label>

                        <input
                            id="nomeEta"
                            type="text"
                            maxlength="120"
                            placeholder="Ex.: ETA Central"
                            required
                        >
                    </div>

                    <div class="campo-formulario-eta">

                        <label for="cidadeEta">
                            Cidade
                        </label>

                        <input
                            id="cidadeEta"
                            type="text"
                            maxlength="80"
                            placeholder="Digite a cidade"
                        >
                    </div>

                    <div class="campo-formulario-eta">

                        <label for="estadoEta">
                            Estado
                        </label>

                        <select id="estadoEta">

                            <option value="">
                                Selecione
                            </option>

                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>

                        </select>
                    </div>

                    <div
                        class="
                            campo-formulario-eta
                            campo-eta-largo
                        "
                    >
                        <label for="responsavelEta">
                            Responsável pela ETA
                        </label>

                        <input
                            id="responsavelEta"
                            type="text"
                            maxlength="120"
                            placeholder="Nome do responsável"
                        >
                    </div>

                    <div class="campo-formulario-eta">

                        <label for="capacidadeEta">
                            Capacidade
                        </label>

                        <input
                            id="capacidadeEta"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex.: 5000"
                        >
                    </div>

                    <div class="campo-formulario-eta">

                        <label for="unidadeCapacidadeEta">
                            Unidade
                        </label>

                        <select id="unidadeCapacidadeEta">

                            <option value="L">
                                Litros
                            </option>

                            <option value="m³">
                                Metros cúbicos
                            </option>

                            <option value="L/h">
                                Litros por hora
                            </option>

                            <option value="m³/h">
                                Metros cúbicos por hora
                            </option>

                        </select>
                    </div>

                    <div
                        class="
                            campo-formulario-eta
                            campo-eta-largo
                        "
                    >
                        <label for="observacoesEta">
                            Observações
                        </label>

                        <textarea
                            id="observacoesEta"
                            rows="4"
                            maxlength="500"
                            placeholder="Informações adicionais sobre a ETA"
                        ></textarea>
                    </div>

                </div>

                <div
                    id="mensagemModalEta"
                    class="mensagem-modal-eta"
                ></div>

                <footer class="acoes-modal-eta">

                    <button
                        id="cancelarModalEta"
                        class="botao-cancelar-eta"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
                        id="salvarEta"
                        class="botao-salvar-eta"
                        type="submit"
                    >
                        Salvar ETA
                    </button>

                </footer>

            </form>

        </section>
    `;

    document.body.appendChild(modal);

    return modal;
}


export function configurarModalEta({
    usuarioId,
    clienteId = null,
    clienteNome = "",
    aoSalvar
}) {
    const modal =
        criarEstruturaModalEta();

    const formulario =
        document.getElementById(
            "formularioEta"
        );

    const titulo =
        document.getElementById(
            "tituloModalEta"
        );

    const clienteModal =
        document.getElementById(
            "clienteModalEta"
        );

    const mensagem =
        document.getElementById(
            "mensagemModalEta"
        );

    const botaoSalvar =
        document.getElementById(
            "salvarEta"
        );

    const botaoFechar =
        document.getElementById(
            "fecharModalEta"
        );

    const botaoCancelar =
        document.getElementById(
            "cancelarModalEta"
        );

    const fundoModal =
        modal.querySelector(
            ".fundo-modal-eta"
        );

    let etaEmEdicao = null;
    let envioEmAndamento = false;


    function mostrarClienteVinculado() {
        if (clienteId && clienteNome) {
            clienteModal.textContent =
                `Cliente: ${clienteNome}`;

            clienteModal.style.display =
                "block";
        } else {
            clienteModal.textContent = "";
            clienteModal.style.display =
                "none";
        }
    }


    function mostrarMensagem(
        texto,
        tipo
    ) {
        mensagem.textContent = texto;

        mensagem.className =
            `mensagem-modal-eta ${tipo}`;
    }


    function limparMensagem() {
        mensagem.textContent = "";

        mensagem.className =
            "mensagem-modal-eta";
    }


    function limparFormulario() {
        formulario.reset();

        etaEmEdicao = null;
        envioEmAndamento = false;

        titulo.textContent =
            "Nova ETA";

        botaoSalvar.disabled = false;

        botaoSalvar.textContent =
            "Salvar ETA";

        document.getElementById(
            "unidadeCapacidadeEta"
        ).value = "L";

        mostrarClienteVinculado();
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
        eta = null
    ) {
        limparFormulario();

        if (eta) {
            etaEmEdicao = eta;

            titulo.textContent =
                "Editar ETA";

            botaoSalvar.textContent =
                "Salvar alterações";

            document.getElementById(
                "nomeEta"
            ).value =
                eta.nome || "";

            document.getElementById(
                "cidadeEta"
            ).value =
                eta.cidade || "";

            document.getElementById(
                "estadoEta"
            ).value =
                eta.estado || "";

            document.getElementById(
                "responsavelEta"
            ).value =
                eta.responsavel || "";

            document.getElementById(
                "capacidadeEta"
            ).value =
                eta.capacidade ?? "";

            document.getElementById(
                "unidadeCapacidadeEta"
            ).value =
                eta.unidadeCapacidade ||
                "L";

            document.getElementById(
                "observacoesEta"
            ).value =
                eta.observacoes || "";
        }

        mostrarClienteVinculado();

        modal.classList.remove(
            "escondido"
        );

        document.body.classList.add(
            "modal-aberto"
        );

        setTimeout(function () {
            document.getElementById(
                "nomeEta"
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

            if (!clienteId) {
                mostrarMensagem(
                    "Abra um cliente antes de cadastrar a ETA.",
                    "erro"
                );

                return;
            }

            const nome =
                document.getElementById(
                    "nomeEta"
                ).value.trim();

            if (!nome) {
                mostrarMensagem(
                    "Informe o nome da ETA.",
                    "erro"
                );

                return;
            }

            const capacidadeTexto =
                document.getElementById(
                    "capacidadeEta"
                ).value;

            const dadosEta = {
                nome,

                cidade:
                    document.getElementById(
                        "cidadeEta"
                    ).value.trim(),

                estado:
                    document.getElementById(
                        "estadoEta"
                    ).value,

                responsavel:
                    document.getElementById(
                        "responsavelEta"
                    ).value.trim(),

                capacidade:
                    capacidadeTexto
                        ? Number(
                            capacidadeTexto
                        )
                        : null,

                unidadeCapacidade:
                    document.getElementById(
                        "unidadeCapacidadeEta"
                    ).value,

                observacoes:
                    document.getElementById(
                        "observacoesEta"
                    ).value.trim(),

                usuarioId,
                clienteId,
                clienteNome,

                atualizadoEm:
                    new Date().toISOString()
            };

            envioEmAndamento = true;
            botaoSalvar.disabled = true;

            botaoSalvar.textContent =
                etaEmEdicao
                    ? "Salvando alterações..."
                    : "Salvando ETA...";

            try {
                if (etaEmEdicao) {
                    await atualizarEta(
                        etaEmEdicao.id,
                        dadosEta
                    );
                } else {
                    dadosEta.criadoEm =
                        new Date().toISOString();

                    await cadastrarEta(
                        dadosEta
                    );
                }

                mostrarMensagem(
                    etaEmEdicao
                        ? "ETA atualizada com sucesso!"
                        : "ETA cadastrada com sucesso!",
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
                    "Erro ao salvar ETA:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível salvar a ETA.",
                    "erro"
                );

                envioEmAndamento = false;
                botaoSalvar.disabled = false;

                botaoSalvar.textContent =
                    etaEmEdicao
                        ? "Salvar alterações"
                        : "Salvar ETA";
            }
        }
    );


    return {
        abrirModal,
        fecharModal
    };
}