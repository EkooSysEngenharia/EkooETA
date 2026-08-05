import {
    cadastrarCliente,
    atualizarCliente
} from "../firebase/clientes.js";


function somenteNumeros(valor) {
    return String(valor || "")
        .replace(/\D/g, "");
}


function formatarCpf(valor) {
    const numeros =
        somenteNumeros(valor)
            .slice(0, 11);

    return numeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(
            /^(\d{3})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1-$2"
        );
}


function formatarCnpj(valor) {
    const numeros =
        somenteNumeros(valor)
            .slice(0, 14);

    return numeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        )
        .replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );
}


function formatarDocumento(
    valor,
    tipoDocumento
) {
    return tipoDocumento === "CPF"
        ? formatarCpf(valor)
        : formatarCnpj(valor);
}


function removerModalAntigo() {
    const modalAntigo =
        document.getElementById(
            "modalCliente"
        );

    if (modalAntigo) {
        modalAntigo.remove();
    }
}


function criarEstruturaModalCliente() {
    removerModalAntigo();

    const modal =
        document.createElement("div");

    modal.id = "modalCliente";
    modal.className =
        "modal-cliente escondido";

    modal.innerHTML = `
        <div class="fundo-modal-cliente"></div>

        <section class="conteudo-modal-cliente">

            <header class="cabecalho-modal-cliente">

                <div>
                    <p class="identificacao-modulo">
                        Gestão de clientes
                    </p>

                    <h2 id="tituloModalCliente">
                        Novo cliente
                    </h2>
                </div>

                <button
                    id="fecharModalCliente"
                    class="fechar-modal-cliente"
                    type="button"
                    aria-label="Fechar"
                >
                    ×
                </button>

            </header>

            <form id="formularioCliente">

                <div class="grade-formulario-cliente">

                    <div
                        class="
                            campo-formulario-cliente
                            campo-cliente-largo
                        "
                    >
                        <label for="nomeCliente">
                            Nome do cliente *
                        </label>

                        <input
                            id="nomeCliente"
                            type="text"
                            maxlength="150"
                            placeholder="Nome da pessoa ou empresa"
                            required
                        >
                    </div>

                    <div class="campo-formulario-cliente">

                        <label for="tipoDocumentoCliente">
                            Tipo de documento
                        </label>

                        <select id="tipoDocumentoCliente">

                            <option value="CNPJ">
                                CNPJ
                            </option>

                            <option value="CPF">
                                CPF
                            </option>

                        </select>

                    </div>

                    <div class="campo-formulario-cliente">

                        <label
                            id="labelDocumentoCliente"
                            for="documentoCliente"
                        >
                            CNPJ
                        </label>

                        <input
                            id="documentoCliente"
                            type="text"
                            inputmode="numeric"
                            maxlength="18"
                            placeholder="00.000.000/0000-00"
                        >
                    </div>

                    <div
                        class="
                            campo-formulario-cliente
                            campo-cliente-largo
                        "
                    >
                        <label for="responsavelCliente">
                            Responsável ou contato
                        </label>

                        <input
                            id="responsavelCliente"
                            type="text"
                            maxlength="120"
                        >
                    </div>

                    <div class="campo-formulario-cliente">

                        <label for="telefoneCliente">
                            Telefone
                        </label>

                        <input
                            id="telefoneCliente"
                            type="tel"
                            maxlength="20"
                        >
                    </div>

                    <div class="campo-formulario-cliente">

                        <label for="emailCliente">
                            E-mail
                        </label>

                        <input
                            id="emailCliente"
                            type="email"
                            maxlength="150"
                        >
                    </div>

                    <div class="campo-formulario-cliente">

                        <label for="cidadeCliente">
                            Cidade
                        </label>

                        <input
                            id="cidadeCliente"
                            type="text"
                            maxlength="80"
                        >
                    </div>

                    <div class="campo-formulario-cliente">

                        <label for="estadoCliente">
                            Estado
                        </label>

                        <select id="estadoCliente">
                            <option value="">Selecione</option>
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
                            campo-formulario-cliente
                            campo-cliente-largo
                        "
                    >
                        <label for="observacoesCliente">
                            Observações
                        </label>

                        <textarea
                            id="observacoesCliente"
                            rows="4"
                            maxlength="600"
                        ></textarea>
                    </div>

                </div>

                <div
                    id="mensagemModalCliente"
                    class="mensagem-modal-cliente"
                ></div>

                <footer class="acoes-modal-cliente">

                    <button
                        id="cancelarModalCliente"
                        class="botao-cancelar-cliente"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
                        id="salvarCliente"
                        class="botao-salvar-cliente"
                        type="submit"
                    >
                        Salvar cliente
                    </button>

                </footer>

            </form>

        </section>
    `;

    document.body.appendChild(modal);

    return modal;
}


export function configurarModalCliente({
    usuarioId,
    aoSalvar
}) {
    const modal =
        criarEstruturaModalCliente();

    const formulario =
        document.getElementById(
            "formularioCliente"
        );

    const titulo =
        document.getElementById(
            "tituloModalCliente"
        );

    const mensagem =
        document.getElementById(
            "mensagemModalCliente"
        );

    const botaoSalvar =
        document.getElementById(
            "salvarCliente"
        );

    const botaoFechar =
        document.getElementById(
            "fecharModalCliente"
        );

    const botaoCancelar =
        document.getElementById(
            "cancelarModalCliente"
        );

    const fundoModal =
        modal.querySelector(
            ".fundo-modal-cliente"
        );

    const tipoDocumentoCampo =
        document.getElementById(
            "tipoDocumentoCliente"
        );

    const documentoCampo =
        document.getElementById(
            "documentoCliente"
        );

    const labelDocumento =
        document.getElementById(
            "labelDocumentoCliente"
        );

    let clienteEmEdicao = null;
    let envioEmAndamento = false;


    function atualizarCampoDocumento() {
        const tipoDocumento =
            tipoDocumentoCampo.value;

        labelDocumento.textContent =
            tipoDocumento;

        documentoCampo.placeholder =
            tipoDocumento === "CPF"
                ? "000.000.000-00"
                : "00.000.000/0000-00";

        documentoCampo.maxLength =
            tipoDocumento === "CPF"
                ? 14
                : 18;

        documentoCampo.value =
            formatarDocumento(
                documentoCampo.value,
                tipoDocumento
            );
    }


    function limparMensagem() {
        mensagem.textContent = "";
        mensagem.className =
            "mensagem-modal-cliente";
    }


    function mostrarMensagem(
        texto,
        tipo
    ) {
        mensagem.textContent = texto;
        mensagem.className =
            `mensagem-modal-cliente ${tipo}`;
    }


    function limparFormulario() {
        formulario.reset();

        clienteEmEdicao = null;
        envioEmAndamento = false;

        tipoDocumentoCampo.value =
            "CNPJ";

        titulo.textContent =
            "Novo cliente";

        botaoSalvar.disabled = false;
        botaoSalvar.textContent =
            "Salvar cliente";

        atualizarCampoDocumento();
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
        cliente = null
    ) {
        limparFormulario();

        if (cliente) {
            clienteEmEdicao = cliente;

            titulo.textContent =
                "Editar cliente";

            botaoSalvar.textContent =
                "Salvar alterações";

            document.getElementById(
                "nomeCliente"
            ).value =
                cliente.nome ||
                cliente.nomeFantasia ||
                cliente.razaoSocial ||
                "";

            tipoDocumentoCampo.value =
                cliente.tipoDocumento ||
                (
                    somenteNumeros(
                        cliente.documento ||
                        cliente.cnpj ||
                        cliente.cpf
                    ).length <= 11
                        ? "CPF"
                        : "CNPJ"
                );

            documentoCampo.value =
                cliente.documento ||
                cliente.cnpj ||
                cliente.cpf ||
                "";

            atualizarCampoDocumento();

            documentoCampo.value =
                formatarDocumento(
                    documentoCampo.value,
                    tipoDocumentoCampo.value
                );

            document.getElementById(
                "responsavelCliente"
            ).value =
                cliente.responsavel || "";

            document.getElementById(
                "telefoneCliente"
            ).value =
                cliente.telefone || "";

            document.getElementById(
                "emailCliente"
            ).value =
                cliente.email || "";

            document.getElementById(
                "cidadeCliente"
            ).value =
                cliente.cidade || "";

            document.getElementById(
                "estadoCliente"
            ).value =
                cliente.estado || "";

            document.getElementById(
                "observacoesCliente"
            ).value =
                cliente.observacoes || "";
        }

        modal.classList.remove(
            "escondido"
        );

        document.body.classList.add(
            "modal-aberto"
        );

        setTimeout(function () {
            document.getElementById(
                "nomeCliente"
            ).focus();
        }, 50);
    }


    tipoDocumentoCampo.addEventListener(
        "change",
        function () {
            documentoCampo.value = "";
            atualizarCampoDocumento();
            documentoCampo.focus();
        }
    );


    documentoCampo.addEventListener(
        "input",
        function () {
            documentoCampo.value =
                formatarDocumento(
                    documentoCampo.value,
                    tipoDocumentoCampo.value
                );
        }
    );


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

            const nome =
                document.getElementById(
                    "nomeCliente"
                ).value.trim();

            if (!nome) {
                mostrarMensagem(
                    "Informe o nome do cliente.",
                    "erro"
                );

                return;
            }

            const tipoDocumento =
                tipoDocumentoCampo.value;

            const documento =
                formatarDocumento(
                    documentoCampo.value,
                    tipoDocumento
                );

            const quantidadeNumeros =
                somenteNumeros(
                    documento
                ).length;

            if (
                documento &&
                (
                    tipoDocumento === "CPF"
                        ? quantidadeNumeros !== 11
                        : quantidadeNumeros !== 14
                )
            ) {
                mostrarMensagem(
                    tipoDocumento === "CPF"
                        ? "Digite um CPF completo."
                        : "Digite um CNPJ completo.",
                    "erro"
                );

                return;
            }

            const dadosCliente = {
                nome,
                tipoDocumento,
                documento,

                responsavel:
                    document.getElementById(
                        "responsavelCliente"
                    ).value.trim(),

                telefone:
                    document.getElementById(
                        "telefoneCliente"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "emailCliente"
                    ).value
                        .trim()
                        .toLowerCase(),

                cidade:
                    document.getElementById(
                        "cidadeCliente"
                    ).value.trim(),

                estado:
                    document.getElementById(
                        "estadoCliente"
                    ).value,

                observacoes:
                    document.getElementById(
                        "observacoesCliente"
                    ).value.trim(),

                usuarioId,

                atualizadoEm:
                    new Date().toISOString()
            };

            envioEmAndamento = true;
            botaoSalvar.disabled = true;

            botaoSalvar.textContent =
                clienteEmEdicao
                    ? "Salvando alterações..."
                    : "Salvando cliente...";

            try {
                if (clienteEmEdicao) {
                    await atualizarCliente(
                        clienteEmEdicao.id,
                        dadosCliente
                    );
                } else {
                    dadosCliente.criadoEm =
                        new Date().toISOString();

                    await cadastrarCliente(
                        dadosCliente
                    );
                }

                mostrarMensagem(
                    clienteEmEdicao
                        ? "Cliente atualizado!"
                        : "Cliente cadastrado!",
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
                    "Erro ao salvar cliente:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível salvar o cliente.",
                    "erro"
                );

                envioEmAndamento = false;
                botaoSalvar.disabled = false;

                botaoSalvar.textContent =
                    clienteEmEdicao
                        ? "Salvar alterações"
                        : "Salvar cliente";
            }
        }
    );


    return {
        abrirModal,
        fecharModal
    };
}