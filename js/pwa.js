import {
    db
} from "../firebase/firebase-config.js";

import {
    waitForPendingWrites
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const CHAVE_PENDENTES =
    "ekoo-pendencias-offline";

let sincronizacaoEmAndamento =
    false;

let temporizadorAviso =
    null;


function obterQuantidadePendente() {
    const valor =
        Number(
            localStorage.getItem(
                CHAVE_PENDENTES
            ) || 0
        );

    return Number.isFinite(valor)
        ? Math.max(0, valor)
        : 0;
}


function salvarQuantidadePendente(
    quantidade
) {
    const valor =
        Math.max(
            0,
            Number(quantidade) || 0
        );

    localStorage.setItem(
        CHAVE_PENDENTES,
        String(valor)
    );

    return valor;
}


function adicionarPendencia() {
    const quantidade =
        salvarQuantidadePendente(
            obterQuantidadePendente() + 1
        );

    atualizarStatusVisual(
        "offline",
        quantidade
    );
}


function limparPendencias() {
    salvarQuantidadePendente(0);
}


function obterAvisoFlutuante() {
    let aviso =
        document.getElementById(
            "avisoConexaoPwa"
        );

    if (!aviso) {
        aviso =
            document.createElement("div");

        aviso.id =
            "avisoConexaoPwa";

        Object.assign(
            aviso.style,
            {
                position: "fixed",
                right: "16px",
                bottom: "16px",
                zIndex: "9999",
                maxWidth: "calc(100vw - 32px)",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "bold",
                boxShadow:
                    "0 8px 20px rgba(0, 0, 0, 0.18)",
                transition:
                    "opacity 0.25s, transform 0.25s",
                lineHeight: "1.35"
            }
        );

        document.body.appendChild(
            aviso
        );
    }

    return aviso;
}


function obterStatusDashboard() {
    return document.querySelector(
        ".status-nuvem"
    );
}


function definirAparencia(
    elemento,
    fundo,
    texto
) {
    if (!elemento) {
        return;
    }

    elemento.style.background =
        fundo;

    elemento.style.color =
        texto;

    elemento.style.borderRadius =
        "999px";

    elemento.style.padding =
        "9px 13px";

    elemento.style.fontWeight =
        "bold";
}


function atualizarStatusVisual(
    estado,
    quantidade =
        obterQuantidadePendente()
) {
    const aviso =
        obterAvisoFlutuante();

    const statusDashboard =
        obterStatusDashboard();

    let mensagem =
        "🟢 Online";

    let fundo =
        "#e8f7ef";

    let cor =
        "#007238";

    if (estado === "offline") {
        mensagem =
            quantidade > 0
                ? `🟠 Offline — ${quantidade} ${
                    quantidade === 1
                        ? "alteração pendente"
                        : "alterações pendentes"
                }`
                : "🟠 Trabalhando offline";

        fundo =
            "#fff3df";

        cor =
            "#9a5a00";
    }

    if (estado === "sincronizando") {
        mensagem =
            quantidade > 0
                ? `🔄 Sincronizando ${quantidade} ${
                    quantidade === 1
                        ? "alteração"
                        : "alterações"
                }...`
                : "🔄 Sincronizando...";

        fundo =
            "#e9f2ff";

        cor =
            "#1457a6";
    }

    if (estado === "sincronizado") {
        mensagem =
            "✅ Dados sincronizados";

        fundo =
            "#e8f7ef";

        cor =
            "#007238";
    }

    if (estado === "erro") {
        mensagem =
            quantidade > 0
                ? `❌ Erro ao sincronizar — ${quantidade} ${
                    quantidade === 1
                        ? "alteração pendente"
                        : "alterações pendentes"
                }`
                : "❌ Erro ao sincronizar";

        fundo =
            "#ffeaea";

        cor =
            "#b42318";
    }

    aviso.textContent =
        mensagem;

    aviso.style.opacity =
        "1";

    aviso.style.transform =
        "translateY(0)";

    definirAparencia(
        aviso,
        fundo,
        cor
    );

    if (statusDashboard) {
        statusDashboard.textContent =
            mensagem;

        definirAparencia(
            statusDashboard,
            fundo,
            cor
        );
    }

    clearTimeout(
        temporizadorAviso
    );

    if (
        estado === "online" ||
        estado === "sincronizado"
    ) {
        temporizadorAviso =
            setTimeout(
                function () {
                    aviso.style.opacity =
                        "0.72";
                },
                3500
            );
    }
}


async function sincronizarPendencias() {
    if (
        sincronizacaoEmAndamento ||
        !navigator.onLine
    ) {
        return;
    }

    const quantidade =
        obterQuantidadePendente();

    if (quantidade === 0) {
        atualizarStatusVisual(
            "online",
            0
        );

        return;
    }

    sincronizacaoEmAndamento =
        true;

    atualizarStatusVisual(
        "sincronizando",
        quantidade
    );

    try {
        await waitForPendingWrites(
            db
        );

        limparPendencias();

        atualizarStatusVisual(
            "sincronizado",
            0
        );

        window.dispatchEvent(
            new CustomEvent(
                "ekoo-sincronizado"
            )
        );
    } catch (erro) {
        console.error(
            "Erro ao aguardar sincronização:",
            erro
        );

        atualizarStatusVisual(
            "erro",
            obterQuantidadePendente()
        );
    } finally {
        sincronizacaoEmAndamento =
            false;
    }
}


function atualizarConexao() {
    const quantidade =
        obterQuantidadePendente();

    if (!navigator.onLine) {
        atualizarStatusVisual(
            "offline",
            quantidade
        );

        return;
    }

    if (quantidade > 0) {
        sincronizarPendencias();

        return;
    }

    atualizarStatusVisual(
        "online",
        0
    );
}


async function registrarServiceWorker() {
    if (
        !(
            "serviceWorker" in
            navigator
        )
    ) {
        console.warn(
            "Service Worker não é suportado neste navegador."
        );

        return;
    }

    try {
        const base =
            window.location.pathname
                .includes("/pages/")
                ? "../"
                : "./";

        const registro =
            await navigator
                .serviceWorker
                .register(
                    `${base}service-worker.js`,
                    {
                        scope: base
                    }
                );

        await registro.update();

        console.log(
            "Service Worker registrado:",
            registro.scope
        );
    } catch (erro) {
        console.error(
            "Erro ao registrar o Service Worker:",
            erro
        );
    }
}


window.addEventListener(
    "ekoo-escrita-pendente",
    adicionarPendencia
);


window.addEventListener(
    "ekoo-erro-sincronizacao",
    function () {
        atualizarStatusVisual(
            "erro",
            obterQuantidadePendente()
        );
    }
);


window.addEventListener(
    "online",
    sincronizarPendencias
);


window.addEventListener(
    "offline",
    function () {
        atualizarStatusVisual(
            "offline",
            obterQuantidadePendente()
        );
    }
);


window.addEventListener(
    "load",
    async function () {
        atualizarConexao();

        await registrarServiceWorker();

        if (navigator.onLine) {
            await sincronizarPendencias();
        }
    }
);
