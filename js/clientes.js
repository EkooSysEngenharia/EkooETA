import { auth } from "../firebase/firebase-config.js";

import {
    listarClientes,
    excluirCliente
} from "../firebase/clientes.js";

import {
    configurarModalCliente
} from "./modalCliente.js";


let usuarioAtualId = null;
let controleModalCliente = null;
let listaClientesAtual = [];
let funcaoAbrirCliente = null;


export function montarModuloClientes(
    container,
    aoAbrirCliente
) {
    garantirEstiloClientes();

    funcaoAbrirCliente =
        typeof aoAbrirCliente === "function"
            ? aoAbrirCliente
            : null;

    container.innerHTML = `
        <section class="modulo-clientes">

            <header class="cabecalho-modulo-clientes">

                <div>
                    <p class="identificacao-modulo">
                        Gestão comercial e técnica
                    </p>

                    <h1>👥 Clientes</h1>

                    <p>
                        Cadastre seus clientes e acesse as
                        ETAs vinculadas a cada um.
                    </p>
                </div>

                <button
                    id="botaoNovoCliente"
                    class="botao-novo-cliente"
                    type="button"
                >
                    + Novo cliente
                </button>

            </header>

            <section class="barra-clientes">

                <div>
                    <strong id="quantidadeClientes">
                        0
                    </strong>

                    <span>
                        clientes cadastrados
                    </span>
                </div>

                <input
                    id="pesquisaClientes"
                    type="search"
                    placeholder="Pesquisar nome, CPF, CNPJ ou cidade..."
                >

            </section>

            <section
                id="listaClientesModulo"
                class="lista-clientes-modulo"
            >
                <div class="estado-vazio-clientes">

                    <span>⏳</span>

                    <strong>
                        Carregando clientes...
                    </strong>

                </div>
            </section>

        </section>
    `;

    usuarioAtualId =
        auth.currentUser
            ? auth.currentUser.uid
            : null;

    controleModalCliente =
        configurarModalCliente({
            usuarioId: usuarioAtualId,

            aoSalvar: async function () {
                await carregarClientes();
            }
        });

    document
        .getElementById("botaoNovoCliente")
        .addEventListener(
            "click",
            function () {
                controleModalCliente
                    .abrirModal();
            }
        );

    document
        .getElementById("pesquisaClientes")
        .addEventListener(
            "input",
            function (evento) {
                const pesquisa =
                    evento.target.value
                        .trim()
                        .toLowerCase();

                const clientesFiltrados =
                    listaClientesAtual.filter(
                        function (cliente) {
                            const texto = [
                                obterNomeCliente(cliente),
                                cliente.documento,
                                cliente.cpf,
                                cliente.cnpj,
                                cliente.responsavel,
                                cliente.cidade,
                                cliente.estado
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return texto.includes(
                                pesquisa
                            );
                        }
                    );

                renderizarClientes(
                    clientesFiltrados
                );
            }
        );

    carregarClientes();
}


async function carregarClientes() {
    const listaContainer =
        document.getElementById(
            "listaClientesModulo"
        );

    const quantidade =
        document.getElementById(
            "quantidadeClientes"
        );

    if (!listaContainer || !quantidade) {
        return;
    }

    if (!usuarioAtualId) {
        listaContainer.innerHTML = `
            <div class="estado-vazio-clientes">

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
        <div class="estado-vazio-clientes">

            <span>⏳</span>

            <strong>
                Carregando clientes...
            </strong>

        </div>
    `;

    try {
        listaClientesAtual =
            await listarClientes(
                usuarioAtualId
            );

        quantidade.textContent =
            String(
                listaClientesAtual.length
            );

        renderizarClientes(
            listaClientesAtual
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar clientes:",
            erro
        );

        listaContainer.innerHTML = `
            <div class="estado-vazio-clientes">

                <span>⚠️</span>

                <strong>
                    Não foi possível carregar os clientes
                </strong>

                <p>
                    Confira a conexão e as regras do Firestore.
                </p>

            </div>
        `;
    }
}


function renderizarClientes(clientes) {
    const listaContainer =
        document.getElementById(
            "listaClientesModulo"
        );

    if (!listaContainer) {
        return;
    }

    if (clientes.length === 0) {
        listaContainer.innerHTML = `
            <div class="estado-vazio-clientes">

                <span>👥</span>

                <strong>
                    Nenhum cliente encontrado
                </strong>

                <p>
                    Cadastre um cliente ou altere a pesquisa.
                </p>

            </div>
        `;

        return;
    }

    listaContainer.innerHTML =
        clientes
            .map(criarCardCliente)
            .join("");

    conectarBotoesAbrir();
    conectarBotoesEditar();
    conectarBotoesExcluir();
}


function criarCardCliente(cliente) {
    const nome =
        obterNomeCliente(cliente);

    const documento =
        cliente.documento ||
        cliente.cpf ||
        cliente.cnpj ||
        "";

    const tipoDocumento =
        cliente.tipoDocumento ||
        (
            somenteNumeros(documento)
                .length === 11
                ? "CPF"
                : "CNPJ"
        );

    const localizacao =
        [
            cliente.cidade,
            cliente.estado
        ]
            .filter(Boolean)
            .join(" - ");

    return `
        <article
            class="card-cliente"
            data-cliente-id="${cliente.id}"
        >

            <div class="cabecalho-card-cliente">

                <div class="identidade-cliente">

                    <span>🏢</span>

                    <div>
                        <h3>
                            ${escaparHtml(nome)}
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

                <div class="acoes-card-cliente">

                    <button
                        class="botao-abrir-cliente"
                        data-cliente-id="${cliente.id}"
                        type="button"
                    >
                        Abrir
                    </button>

                    <button
                        class="botao-editar-cliente"
                        data-cliente-id="${cliente.id}"
                        type="button"
                    >
                        Editar
                    </button>

                    <button
                        class="botao-excluir-cliente"
                        data-cliente-id="${cliente.id}"
                        type="button"
                    >
                        Excluir
                    </button>

                </div>

            </div>

            <div class="dados-card-cliente">

                <div>
                    <small>
                        ${escaparHtml(tipoDocumento)}
                    </small>

                    <strong>
                        ${
                            documento
                                ? escaparHtml(documento)
                                : "Não informado"
                        }
                    </strong>
                </div>

                <div>
                    <small>Responsável</small>

                    <strong>
                        ${
                            cliente.responsavel
                                ? escaparHtml(
                                    cliente.responsavel
                                )
                                : "Não informado"
                        }
                    </strong>
                </div>

                <div>
                    <small>Telefone</small>

                    <strong>
                        ${
                            cliente.telefone
                                ? escaparHtml(
                                    cliente.telefone
                                )
                                : "Não informado"
                        }
                    </strong>
                </div>

                <div>
                    <small>ETAs</small>

                    <strong>
                        Acessar
                    </strong>
                </div>

            </div>

        </article>
    `;
}


function conectarBotoesAbrir() {
    document
        .querySelectorAll(
            ".botao-abrir-cliente"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    const cliente =
                        encontrarCliente(
                            botao.dataset.clienteId
                        );

                    if (!cliente) {
                        alert(
                            "Cliente não encontrado."
                        );

                        return;
                    }

                    if (!funcaoAbrirCliente) {
                        alert(
                            "A abertura das ETAs ainda não foi conectada."
                        );

                        return;
                    }

                    funcaoAbrirCliente(
                        cliente
                    );
                }
            );
        });
}


function conectarBotoesEditar() {
    document
        .querySelectorAll(
            ".botao-editar-cliente"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                function () {
                    const cliente =
                        encontrarCliente(
                            botao.dataset.clienteId
                        );

                    if (
                        cliente &&
                        controleModalCliente
                    ) {
                        controleModalCliente
                            .abrirModal(
                                cliente
                            );
                    }
                }
            );
        });
}


function conectarBotoesExcluir() {
    document
        .querySelectorAll(
            ".botao-excluir-cliente"
        )
        .forEach(function (botao) {
            botao.addEventListener(
                "click",
                async function () {
                    const cliente =
                        encontrarCliente(
                            botao.dataset.clienteId
                        );

                    if (!cliente) {
                        return;
                    }

                    const confirmou =
                        window.confirm(
                            `Deseja excluir o cliente "${obterNomeCliente(cliente)}"?`
                        );

                    if (!confirmou) {
                        return;
                    }

                    botao.disabled = true;
                    botao.textContent =
                        "Excluindo...";

                    try {
                        await excluirCliente(
                            cliente.id
                        );

                        await carregarClientes();
                    } catch (erro) {
                        console.error(
                            "Erro ao excluir cliente:",
                            erro
                        );

                        alert(
                            "Não foi possível excluir o cliente."
                        );

                        botao.disabled = false;
                        botao.textContent =
                            "Excluir";
                    }
                }
            );
        });
}


function encontrarCliente(clienteId) {
    return listaClientesAtual.find(
        function (cliente) {
            return (
                cliente.id === clienteId
            );
        }
    );
}


function obterNomeCliente(cliente) {
    return (
        cliente.nome ||
        cliente.nomeFantasia ||
        cliente.razaoSocial ||
        "Cliente"
    );
}


function garantirEstiloClientes() {
    if (
        document.getElementById(
            "estiloModuloClientes"
        )
    ) {
        return;
    }

    const link =
        document.createElement("link");

    link.id =
        "estiloModuloClientes";

    link.rel =
        "stylesheet";

    link.href =
        "../css/clientes.css";

    document.head.appendChild(link);
}


function somenteNumeros(valor) {
    return String(valor || "")
        .replace(/\D/g, "");
}


function escaparHtml(valor) {
    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}