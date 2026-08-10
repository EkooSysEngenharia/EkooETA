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

        configurarAtualizacoesDoApp(
            registro
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


/* =========================================================
   APP01 — experiência instalada e atualização automática
   ========================================================= */

let eventoInstalacaoPendente =
    null;


function estaEmModoAplicativo() {
    return (
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone ===
            true
    );
}


function dispositivoIos() {
    return /iphone|ipad|ipod/i.test(
        navigator.userAgent
    );
}


function criarSplashAplicativo() {
    if (
        document.getElementById(
            "ekooSplash"
        )
    ) {
        return;
    }

    const splash =
        document.createElement("div");

    splash.id =
        "ekooSplash";

    splash.className =
        "ekoo-splash";

    splash.innerHTML = `
        <img
            src="../assets/logo.png"
            alt="Ekoo Sys Engenharia"
        >

        <h1>Ekoo Manager</h1>

        <p>
            Gestão ambiental em campo
        </p>

        <div
            class="ekoo-splash-carregando"
            aria-label="Carregando"
        ></div>
    `;

    document.body.appendChild(
        splash
    );

    window.setTimeout(
        ocultarSplashAplicativo,
        2400
    );
}


function ocultarSplashAplicativo() {
    const splash =
        document.getElementById(
            "ekooSplash"
        );

    if (!splash) {
        return;
    }

    splash.classList.add(
        "oculto"
    );

    window.setTimeout(
        function () {
            splash.remove();
        },
        420
    );
}


function criarBannerApp({
    id,
    classe = "",
    icone,
    titulo,
    texto,
    acaoPrincipal,
    textoPrincipal,
    textoSecundario =
        "Agora não"
}) {
    const anterior =
        document.getElementById(id);

    if (anterior) {
        anterior.remove();
    }

    const banner =
        document.createElement("section");

    banner.id = id;

    banner.className =
        `ekoo-banner-app ${classe}`;

    banner.innerHTML = `
        <div class="ekoo-banner-app-conteudo">

            <span class="ekoo-banner-app-icone">
                ${icone}
            </span>

            <div>
                <strong>${titulo}</strong>
                <p>${texto}</p>
            </div>

        </div>

        <div class="ekoo-banner-app-acoes">

            <button
                class="secundario"
                type="button"
                data-fechar
            >
                ${textoSecundario}
            </button>

            <button
                class="primario"
                type="button"
                data-confirmar
            >
                ${textoPrincipal}
            </button>

        </div>
    `;

    banner
        .querySelector(
            "[data-fechar]"
        )
        .addEventListener(
            "click",
            function () {
                banner.remove();
            }
        );

    banner
        .querySelector(
            "[data-confirmar]"
        )
        .addEventListener(
            "click",
            async function () {
                await acaoPrincipal(
                    banner
                );
            }
        );

    document.body.appendChild(
        banner
    );

    return banner;
}


function mostrarInstrucaoIos() {
    const fundo =
        document.createElement("div");

    fundo.className =
        "ekoo-modal-app-fundo";

    fundo.innerHTML = `
        <section
            class="ekoo-modal-app"
            role="dialog"
            aria-modal="true"
            aria-label="Instalar Ekoo Manager"
        >

            <h2>
                Instalar no iPhone
            </h2>

            <p>
                No Safari, faça:
            </p>

            <ol>
                <li>
                    Toque no botão
                    <strong>Compartilhar</strong>.
                </li>

                <li>
                    Escolha
                    <strong>
                        Adicionar à Tela de Início
                    </strong>.
                </li>

                <li>
                    Confirme em
                    <strong>Adicionar</strong>.
                </li>
            </ol>

            <button type="button">
                Entendi
            </button>

        </section>
    `;

    fundo
        .querySelector("button")
        .addEventListener(
            "click",
            function () {
                fundo.remove();
            }
        );

    document.body.appendChild(
        fundo
    );
}


function sugerirInstalacao() {
    if (
        estaEmModoAplicativo() ||
        sessionStorage.getItem(
            "ekoo-instalacao-adiada"
        )
    ) {
        return;
    }

    if (
        dispositivoIos() &&
        !eventoInstalacaoPendente
    ) {
        criarBannerApp({
            id:
                "ekooBannerInstalar",

            classe:
                "ekoo-banner-instalar",

            icone:
                "📲",

            titulo:
                "Instale o Ekoo Manager",

            texto:
                "Use em tela cheia e abra direto pelo ícone.",

            textoPrincipal:
                "Ver como instalar",

            acaoPrincipal:
                async function (
                    banner
                ) {
                    banner.remove();
                    mostrarInstrucaoIos();
                }
        });

        return;
    }

    if (!eventoInstalacaoPendente) {
        return;
    }

    criarBannerApp({
        id:
            "ekooBannerInstalar",

        classe:
            "ekoo-banner-instalar",

        icone:
            "📲",

        titulo:
            "Instale o Ekoo Manager",

        texto:
            "Abra mais rápido e use como aplicativo.",

        textoPrincipal:
            "Instalar",

        acaoPrincipal:
            async function (
                banner
            ) {
                eventoInstalacaoPendente.prompt();

                await eventoInstalacaoPendente
                    .userChoice;

                eventoInstalacaoPendente =
                    null;

                banner.remove();
            }
    });
}


function mostrarAtualizacaoDisponivel(
    registro
) {
    criarBannerApp({
        id:
            "ekooBannerAtualizacao",

        icone:
            "🚀",

        titulo:
            "Nova versão disponível",

        texto:
            "Atualize para usar as melhorias mais recentes.",

        textoPrincipal:
            "Atualizar agora",

        textoSecundario:
            "Depois",

        acaoPrincipal:
            async function (
                banner
            ) {
                banner
                    .querySelector(
                        "[data-confirmar]"
                    )
                    .textContent =
                        "Atualizando...";

                if (registro.waiting) {
                    registro.waiting
                        .postMessage({
                            tipo:
                                "ATIVAR_ATUALIZACAO"
                        });
                } else {
                    window.location.reload();
                }
            }
    });
}


function configurarAtualizacoesDoApp(
    registro
) {
    if (
        registro.waiting &&
        navigator.serviceWorker
            .controller
    ) {
        mostrarAtualizacaoDisponivel(
            registro
        );
    }

    registro.addEventListener(
        "updatefound",
        function () {
            const instalando =
                registro.installing;

            if (!instalando) {
                return;
            }

            instalando.addEventListener(
                "statechange",
                function () {
                    if (
                        instalando.state ===
                            "installed" &&
                        navigator.serviceWorker
                            .controller
                    ) {
                        mostrarAtualizacaoDisponivel(
                            registro
                        );
                    }
                }
            );
        }
    );
}


window.addEventListener(
    "beforeinstallprompt",
    function (evento) {
        evento.preventDefault();

        eventoInstalacaoPendente =
            evento;

        sugerirInstalacao();
    }
);


window.addEventListener(
    "appinstalled",
    function () {
        eventoInstalacaoPendente =
            null;

        const banner =
            document.getElementById(
                "ekooBannerInstalar"
            );

        if (banner) {
            banner.remove();
        }
    }
);


navigator.serviceWorker
    ?.addEventListener(
        "controllerchange",
        function () {
            window.location.reload();
        }
    );


navigator.serviceWorker
    ?.addEventListener(
        "message",
        function (evento) {
            if (
                evento.data &&
                evento.data.tipo ===
                    "APP_ATUALIZADO"
            ) {
                console.log(
                    "Aplicativo atualizado:",
                    evento.data.versao
                );
            }
        }
    );


criarSplashAplicativo();


window.addEventListener(
    "load",
    function () {
        window.setTimeout(
            ocultarSplashAplicativo,
            450
        );

        window.setTimeout(
            sugerirInstalacao,
            1800
        );
    }
);
