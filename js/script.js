const CHAVE_CLIENTES = "ekooEtaClientes";

const telaInicial =
    document.getElementById("telaInicial");

const telaClientes =
    document.getElementById("telaClientes");

const telaFormularioCliente =
    document.getElementById("telaFormularioCliente");

const tituloTela =
    document.getElementById("tituloTela");

const subtituloTela =
    document.getElementById("subtituloTela");

const botaoVoltar =
    document.getElementById("botaoVoltar");

const botaoClientes =
    document.getElementById("botaoClientes");

const botaoNovaMedicao =
    document.getElementById("botaoNovaMedicao");

const botaoHistorico =
    document.getElementById("botaoHistorico");

const botaoRelatorios =
    document.getElementById("botaoRelatorios");

const botaoNovoCliente =
    document.getElementById("botaoNovoCliente");

const botaoCancelarCliente =
    document.getElementById("botaoCancelarCliente");

const formularioCliente =
    document.getElementById("formularioCliente");

const clienteId =
    document.getElementById("clienteId");

const documentoCliente =
    document.getElementById("documentoCliente");

const nomeCliente =
    document.getElementById("nomeCliente");

const ajudaDocumento =
    document.getElementById("ajudaDocumento");

const mensagemFormulario =
    document.getElementById("mensagemFormulario");

const listaClientes =
    document.getElementById("listaClientes");

const mensagemSemClientes =
    document.getElementById("mensagemSemClientes");

const pesquisaCliente =
    document.getElementById("pesquisaCliente");

const modalExclusao =
    document.getElementById("modalExclusao");

const textoExclusao =
    document.getElementById("textoExclusao");

const cancelarExclusao =
    document.getElementById("cancelarExclusao");

const confirmarExclusao =
    document.getElementById("confirmarExclusao");

let telaAnterior = "inicio";
let clienteParaExcluir = null;

function obterClientes() {
    try {
        const dados =
            localStorage.getItem(CHAVE_CLIENTES);

        return dados
            ? JSON.parse(dados)
            : [];
    } catch (erro) {
        console.error(
            "Não foi possível carregar os clientes:",
            erro
        );

        return [];
    }
}

function salvarClientes(clientes) {
    localStorage.setItem(
        CHAVE_CLIENTES,
        JSON.stringify(clientes)
    );
}

function abrirTela(nomeTela) {
    const telas =
        document.querySelectorAll(".tela");

    telas.forEach(function (tela) {
        tela.classList.remove("ativa");
    });

    botaoVoltar.classList.add("escondido");

    if (nomeTela === "inicio") {
        telaInicial.classList.add("ativa");

        tituloTela.textContent = "Ekoo ETA";

        subtituloTela.textContent =
            "Sistema de Monitoramento de Estações de Tratamento de Água";

        telaAnterior = "inicio";
        return;
    }

    botaoVoltar.classList.remove("escondido");

    if (nomeTela === "clientes") {
        telaClientes.classList.add("ativa");

        tituloTela.textContent = "Clientes";

        subtituloTela.textContent =
            "Cadastre clientes pelo CPF ou CNPJ";

        telaAnterior = "inicio";

        pesquisaCliente.value = "";

        renderizarClientes();
        return;
    }

    if (nomeTela === "formularioCliente") {
        telaFormularioCliente.classList.add("ativa");

        const editando =
            Boolean(clienteId.value);

        tituloTela.textContent =
            editando
                ? "Editar cliente"
                : "Novo cliente";

        subtituloTela.textContent =
            editando
                ? "Atualize os dados do cliente"
                : "Informe o CPF ou CNPJ e o nome";

        telaAnterior = "clientes";
    }
}

function apenasNumeros(valor) {
    return valor.replace(/\D/g, "");
}

function formatarCPF(valor) {
    const numeros =
        apenasNumeros(valor).slice(0, 11);

    return numeros
        .replace(
            /(\d{3})(\d)/,
            "$1.$2"
        )
        .replace(
            /(\d{3})(\d)/,
            "$1.$2"
        )
        .replace(
            /(\d{3})(\d{1,2})$/,
            "$1-$2"
        );
}

function formatarCNPJ(valor) {
    const numeros =
        apenasNumeros(valor).slice(0, 14);

    return numeros
        .replace(
            /^(\d{2})(\d)/,
            "$1.$2"
        )
        .replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        )
        .replace(
            /(\d{4})(\d{1,2})$/,
            "$1-$2"
        );
}

function obterTipoDocumentoSelecionado() {
    return document.querySelector(
        'input[name="tipoDocumento"]:checked'
    ).value;
}

function atualizarCampoDocumento() {
    const tipo =
        obterTipoDocumentoSelecionado();

    const numeros =
        apenasNumeros(documentoCliente.value);

    if (tipo === "CPF") {
        documentoCliente.value =
            formatarCPF(numeros);

        documentoCliente.maxLength = 14;

        documentoCliente.placeholder =
            "000.000.000-00";

        ajudaDocumento.textContent =
            "Informe um CPF com 11 números.";
    } else {
        documentoCliente.value =
            formatarCNPJ(numeros);

        documentoCliente.maxLength = 18;

        documentoCliente.placeholder =
            "00.000.000/0000-00";

        ajudaDocumento.textContent =
            "Informe um CNPJ com 14 números.";
    }
}

function validarDocumento(tipo, documento) {
    const numeros =
        apenasNumeros(documento);

    if (tipo === "CPF") {
        return numeros.length === 11;
    }

    return numeros.length === 14;
}

function mostrarErro(mensagem) {
    mensagemFormulario.textContent =
        mensagem;

    mensagemFormulario.classList.remove(
        "escondido"
    );
}

function ocultarErro() {
    mensagemFormulario.textContent = "";

    mensagemFormulario.classList.add(
        "escondido"
    );
}

function limparFormularioCliente() {
    formularioCliente.reset();

    clienteId.value = "";

    documentoCliente.value = "";

    nomeCliente.value = "";

    document.querySelector(
        'input[name="tipoDocumento"][value="CPF"]'
    ).checked = true;

    atualizarCampoDocumento();
    ocultarErro();
}

function abrirNovoCliente() {
    limparFormularioCliente();

    abrirTela("formularioCliente");
}

function editarCliente(id) {
    const clientes =
        obterClientes();

    const cliente =
        clientes.find(function (item) {
            return item.id === id;
        });

    if (!cliente) {
        return;
    }

    clienteId.value = cliente.id;

    const radioDocumento =
        document.querySelector(
            `input[name="tipoDocumento"][value="${cliente.tipoDocumento}"]`
        );

    radioDocumento.checked = true;

    documentoCliente.value =
        cliente.documento;

    nomeCliente.value =
        cliente.nome;

    atualizarCampoDocumento();
    ocultarErro();

    abrirTela("formularioCliente");
}

function pedirExclusao(id) {
    const clientes =
        obterClientes();

    const cliente =
        clientes.find(function (item) {
            return item.id === id;
        });

    if (!cliente) {
        return;
    }

    clienteParaExcluir = id;

    textoExclusao.textContent =
        `O cliente "${cliente.nome}" será removido do sistema.`;

    modalExclusao.classList.remove(
        "escondido"
    );
}

function fecharModalExclusao() {
    clienteParaExcluir = null;

    modalExclusao.classList.add(
        "escondido"
    );
}

function excluirClienteConfirmado() {
    if (!clienteParaExcluir) {
        return;
    }

    const clientes =
        obterClientes().filter(
            function (cliente) {
                return cliente.id !==
                    clienteParaExcluir;
            }
        );

    salvarClientes(clientes);

    fecharModalExclusao();

    renderizarClientes();
}

function criarCartaoCliente(cliente) {
    const cartao =
        document.createElement("article");

    cartao.className =
        "cartao-cliente";

    cartao.innerHTML = `
        <div class="cabecalho-cliente">

            <div class="informacoes-cliente">

                <span class="tipo-cliente">
                    ${cliente.tipoDocumento}
                </span>

                <h3>${escaparHTML(cliente.nome)}</h3>

                <p class="documento-cliente">
                    ${escaparHTML(cliente.documento)}
                </p>

            </div>

        </div>

        <div class="acoes-cliente">

            <button
                class="acao-cliente editar"
                type="button"
            >
                Editar
            </button>

            <button
                class="acao-cliente excluir"
                type="button"
            >
                Excluir
            </button>

        </div>
    `;

    const botaoEditar =
        cartao.querySelector(".editar");

    const botaoExcluir =
        cartao.querySelector(".excluir");

    botaoEditar.addEventListener(
        "click",
        function () {
            editarCliente(cliente.id);
        }
    );

    botaoExcluir.addEventListener(
        "click",
        function () {
            pedirExclusao(cliente.id);
        }
    );

    return cartao;
}

function escaparHTML(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(valor);

    return elemento.innerHTML;
}

function renderizarClientes() {
    const termo =
        pesquisaCliente.value
            .trim()
            .toLowerCase();

    const clientes =
        obterClientes()
            .filter(function (cliente) {
                const texto =
                    `${cliente.nome} ${cliente.documento} ${cliente.tipoDocumento}`
                        .toLowerCase();

                return texto.includes(termo);
            })
            .sort(function (a, b) {
                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );
            });

    listaClientes.innerHTML = "";

    if (clientes.length === 0) {
        mensagemSemClientes.classList.remove(
            "escondido"
        );

        if (termo) {
            mensagemSemClientes.querySelector(
                "h2"
            ).textContent =
                "Nenhum cliente encontrado";

            mensagemSemClientes.querySelector(
                "p"
            ).textContent =
                "Tente pesquisar usando outro nome, CPF ou CNPJ.";
        } else {
            mensagemSemClientes.querySelector(
                "h2"
            ).textContent =
                "Nenhum cliente cadastrado";

            mensagemSemClientes.querySelector(
                "p"
            ).textContent =
                "Cadastre o primeiro cliente para começar a registrar ETAs e medições.";
        }

        return;
    }

    mensagemSemClientes.classList.add(
        "escondido"
    );

    clientes.forEach(function (cliente) {
        listaClientes.appendChild(
            criarCartaoCliente(cliente)
        );
    });
}

function salvarCliente(evento) {
    evento.preventDefault();

    ocultarErro();

    const tipoDocumento =
        obterTipoDocumentoSelecionado();

    const documento =
        documentoCliente.value.trim();

    const documentoNumerico =
        apenasNumeros(documento);

    const nome =
        nomeCliente.value.trim();

    if (
        !validarDocumento(
            tipoDocumento,
            documento
        )
    ) {
        mostrarErro(
            tipoDocumento === "CPF"
                ? "O CPF precisa ter 11 números."
                : "O CNPJ precisa ter 14 números."
        );

        documentoCliente.focus();
        return;
    }

    if (nome.length < 2) {
        mostrarErro(
            "Informe o nome do cliente ou empreendimento."
        );

        nomeCliente.focus();
        return;
    }

    const clientes =
        obterClientes();

    const idAtual =
        clienteId.value;

    const documentoDuplicado =
        clientes.some(function (cliente) {
            return (
                apenasNumeros(cliente.documento) ===
                    documentoNumerico &&
                cliente.id !== idAtual
            );
        });

    if (documentoDuplicado) {
        mostrarErro(
            "Já existe um cliente cadastrado com esse CPF ou CNPJ."
        );

        return;
    }

    if (idAtual) {
        const indice =
            clientes.findIndex(
                function (cliente) {
                    return cliente.id === idAtual;
                }
            );

        if (indice !== -1) {
            clientes[indice] = {
                ...clientes[indice],

                tipoDocumento,
                documento,
                nome
            };
        }
    } else {
        clientes.push({
            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),

            tipoDocumento,
            documento,
            nome,

            criadoEm:
                new Date().toISOString()
        });
    }

    salvarClientes(clientes);

    limparFormularioCliente();

    abrirTela("clientes");
}

botaoClientes.addEventListener(
    "click",
    function () {
        abrirTela("clientes");
    }
);

botaoNovoCliente.addEventListener(
    "click",
    abrirNovoCliente
);

botaoCancelarCliente.addEventListener(
    "click",
    function () {
        limparFormularioCliente();

        abrirTela("clientes");
    }
);

botaoVoltar.addEventListener(
    "click",
    function () {
        abrirTela(telaAnterior);
    }
);

formularioCliente.addEventListener(
    "submit",
    salvarCliente
);

documentoCliente.addEventListener(
    "input",
    atualizarCampoDocumento
);

document
    .querySelectorAll(
        'input[name="tipoDocumento"]'
    )
    .forEach(function (radio) {
        radio.addEventListener(
            "change",
            function () {
                documentoCliente.value = "";

                atualizarCampoDocumento();
            }
        );
    });

pesquisaCliente.addEventListener(
    "input",
    renderizarClientes
);

cancelarExclusao.addEventListener(
    "click",
    fecharModalExclusao
);

confirmarExclusao.addEventListener(
    "click",
    excluirClienteConfirmado
);

modalExclusao.addEventListener(
    "click",
    function (evento) {
        if (evento.target === modalExclusao) {
            fecharModalExclusao();
        }
    }
);

botaoNovaMedicao.addEventListener(
    "click",
    function () {
        alert(
            "Primeiro vamos cadastrar os clientes, ETAs e pontos de coleta."
        );
    }
);

botaoHistorico.addEventListener(
    "click",
    function () {
        alert(
            "O Histórico será desenvolvido depois das medições."
        );
    }
);

botaoRelatorios.addEventListener(
    "click",
    function () {
        alert(
            "A exportação para Excel será desenvolvida após o módulo de medições."
        );
    }
);

atualizarCampoDocumento();
abrirTela("inicio");