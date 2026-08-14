import { auth } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    sair,
    sessaoDentroDoPrazo
} from "../firebase/auth.js";

import {
    buscarUsuario
} from "../firebase/usuarios.js";

import {
    listarEtas
} from "../firebase/etas.js";

import {
    listarPontos
} from "../firebase/pontos.js";

import {
    listarMedicoesPorUsuario
} from "../firebase/medicoes.js";

import {
    montarModuloEta
} from "./eta.js";

import {
    montarModuloClientes
} from "./clientes.js";

import {
    montarModuloRelatorios
} from "./relatoriosEta.js";

import {
    montarModuloAgenda
} from "./agenda.js";


const nomeUsuario =
    document.getElementById("nomeUsuario");

const botaoSair =
    document.getElementById("botaoSair");

const botaoDashboard =
    document.getElementById("botaoDashboard");

const botaoModuloEta =
    document.getElementById("botaoModuloEta");

const botaoClientes =
    document.getElementById("botaoClientes");

const botaoRelatorios =
    document.getElementById("botaoRelatorios");

const botaoVisitaTecnica =
    document.getElementById("botaoVisitaTecnica");

const botaoAgenda =
    document.getElementById("botaoAgenda");

const botaoConfiguracoes =
    document.getElementById("botaoConfiguracoes");

const botaoNovaMedicao =
    document.getElementById("botaoNovaMedicao");

const botaoClientesRapido =
    document.getElementById("botaoClientesRapido");

const botaoRelatoriosRapido =
    document.getElementById("botaoRelatoriosRapido");

const telaDashboard =
    document.getElementById("telaDashboard");

const conteudoModulo =
    document.getElementById("conteudoModulo");

const totalEtas =
    document.getElementById("totalEtas");

const totalPontos =
    document.getElementById("totalPontos");

const totalMedicoes =
    document.getElementById("totalMedicoes");

const totalAlertas =
    document.getElementById("totalAlertas");


let usuarioAtualId = null;


function obterPrimeiroNome(nomeCompleto) {
    if (!nomeCompleto) {
        return "usuário";
    }

    return nomeCompleto
        .trim()
        .split(" ")[0];
}


function removerAtivoDosBotoes() {
    document
        .querySelectorAll(".item-menu")
        .forEach(function (botao) {
            botao.classList.remove(
                "ativo"
            );
        });
}


function prepararAreaModulo(botaoAtivo) {
    telaDashboard.classList.add(
        "escondido"
    );

    conteudoModulo.classList.remove(
        "escondido"
    );

    removerAtivoDosBotoes();

    if (botaoAtivo) {
        botaoAtivo.classList.add(
            "ativo"
        );
    }
}


async function contarTodosOsPontos(etas) {
    const resultados =
        await Promise.all(
            etas.map(
                async function (eta) {
                    try {
                        const pontos =
                            await listarPontos(
                                usuarioAtualId,
                                eta.id
                            );

                        return pontos.length;
                    } catch (erro) {
                        console.error(
                            `Erro ao contar pontos da ETA ${eta.id}:`,
                            erro
                        );

                        return 0;
                    }
                }
            )
        );

    return resultados.reduce(
        function (total, quantidade) {
            return total + quantidade;
        },
        0
    );
}


async function atualizarIndicadoresDashboard() {
    if (!usuarioAtualId) {
        return;
    }

    if (totalEtas) {
        totalEtas.textContent = "...";
    }

    if (totalPontos) {
        totalPontos.textContent = "...";
    }

    if (totalMedicoes) {
        totalMedicoes.textContent = "...";
    }

    try {
        const [
            etas,
            medicoes
        ] = await Promise.all([
            listarEtas(
                usuarioAtualId
            ),

            listarMedicoesPorUsuario(
                usuarioAtualId
            )
        ]);

        const quantidadePontos =
            await contarTodosOsPontos(
                etas
            );

        if (totalEtas) {
            totalEtas.textContent =
                String(etas.length);
        }

        if (totalPontos) {
            totalPontos.textContent =
                String(quantidadePontos);
        }

        if (totalMedicoes) {
            totalMedicoes.textContent =
                String(medicoes.length);
        }

        if (totalAlertas) {
            totalAlertas.textContent = "0";
        }
    } catch (erro) {
        console.error(
            "Erro ao atualizar o Dashboard:",
            erro
        );

        if (totalEtas) {
            totalEtas.textContent = "—";
        }

        if (totalPontos) {
            totalPontos.textContent = "—";
        }

        if (totalMedicoes) {
            totalMedicoes.textContent = "—";
        }
    }
}


async function mostrarDashboard() {
    telaDashboard.classList.remove(
        "escondido"
    );

    conteudoModulo.classList.add(
        "escondido"
    );

    conteudoModulo.innerHTML = "";

    removerAtivoDosBotoes();

    botaoDashboard.classList.add(
        "ativo"
    );

    await atualizarIndicadoresDashboard();
}


function mostrarPreparacao(
    titulo,
    descricao,
    botaoAtivo
) {
    prepararAreaModulo(
        botaoAtivo
    );

    conteudoModulo.innerHTML = `
        <section class="tela-preparacao-modulo">

            <header class="cabecalho-dashboard">

                <div>
                    <p class="saudacao">
                        Ekoo Manager
                    </p>

                    <h1>${titulo}</h1>

                    <p>${descricao}</p>
                </div>

                <button
                    id="voltarDashboardTemporario"
                    class="botao-voltar-dashboard"
                    type="button"
                >
                    ← Voltar
                </button>

            </header>

            <div class="cartao-resumo">
                <strong>
                    Módulo em preparação
                </strong>
            </div>

        </section>
    `;

    document
        .getElementById(
            "voltarDashboardTemporario"
        )
        .addEventListener(
            "click",
            mostrarDashboard
        );
}


function abrirModuloEta() {
    prepararAreaModulo(
        botaoModuloEta
    );

    montarModuloEta(
        conteudoModulo
    );
}


function abrirModuloClientes() {
    prepararAreaModulo(
        botaoClientes
    );

    montarModuloClientes(
        conteudoModulo,

        function (cliente) {
            prepararAreaModulo(
                botaoClientes
            );

            montarModuloEta(
                conteudoModulo,
                {
                    clienteId:
                        cliente.id,

                    clienteNome:
                        cliente.nome ||
                        cliente.nomeFantasia ||
                        cliente.razaoSocial ||
                        "Cliente"
                }
            );
        }
    );
}


onAuthStateChanged(
    auth,
    async function (usuario) {
        if (!usuario) {
            window.location.href =
                "login.html";

            return;
        }

        if (!sessaoDentroDoPrazo()) {
            await sair();

            window.location.replace(
                "login.html"
            );

            return;
        }

        usuarioAtualId =
            usuario.uid;

        try {
            const dados =
                await buscarUsuario(
                    usuario.uid
                );

            nomeUsuario.textContent =
                dados
                    ? obterPrimeiroNome(
                        dados.nome
                    )
                    : "usuário";
        } catch (erro) {
            console.error(
                "Erro ao buscar usuário:",
                erro
            );

            nomeUsuario.textContent =
                "usuário";
        }

        await atualizarIndicadoresDashboard();
    }
);


botaoDashboard.addEventListener(
    "click",
    mostrarDashboard
);

botaoModuloEta.addEventListener(
    "click",
    abrirModuloEta
);

botaoClientes.addEventListener(
    "click",
    abrirModuloClientes
);

botaoAgenda.addEventListener(
    "click",
    function () {
        prepararAreaModulo(botaoAgenda);
        montarModuloAgenda(conteudoModulo);
    }
);

botaoVisitaTecnica.addEventListener(
    "click",
    function () {
        mostrarPreparacao(
            "Visita Técnica",
            "Módulo em preparação.",
            botaoVisitaTecnica
        );
    }
);

botaoRelatorios.addEventListener(
    "click",
    function () {
        prepararAreaModulo(
            botaoRelatorios
        );

        montarModuloRelatorios(
            conteudoModulo
        );
    }
);

botaoConfiguracoes.addEventListener(
    "click",
    function () {
        mostrarPreparacao(
            "Configurações",
            "Perfil e preferências.",
            botaoConfiguracoes
        );
    }
);

botaoNovaMedicao.addEventListener(
    "click",
    abrirModuloEta
);

botaoClientesRapido.addEventListener(
    "click",
    abrirModuloClientes
);

botaoRelatoriosRapido.addEventListener(
    "click",
    function () {
        botaoRelatorios.click();
    }
);

botaoSair.addEventListener(
    "click",
    async function () {
        try {
            await sair();

            window.location.href =
                "login.html";
        } catch (erro) {
            console.error(
                "Erro ao sair:",
                erro
            );

            alert(
                "Não foi possível sair."
            );
        }
    }
);

(function(){function i(){const a=document.getElementById("botao-menu-mobile"),f=document.getElementById("fechar-menu-mobile"),o=document.getElementById("overlay-menu-mobile"),m=document.querySelector("#menu-lateral-app,body>aside");if(!a||!f||!o||!m)return;const x=()=>document.body.classList.remove("menu-mobile-aberto");a.onclick=()=>document.body.classList.add("menu-mobile-aberto");f.onclick=x;o.onclick=x;m.querySelectorAll("a").forEach(e=>e.addEventListener("click",()=>{if(innerWidth<=768)x()}));}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i):i()})();