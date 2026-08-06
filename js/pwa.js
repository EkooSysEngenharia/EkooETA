function mostrarStatusConexao() {
    let aviso =
        document.getElementById(
            "avisoConexaoPwa"
        );

    if (!aviso) {
        aviso =
            document.createElement("div");

        aviso.id =
            "avisoConexaoPwa";

        aviso.style.position =
            "fixed";

        aviso.style.right =
            "16px";

        aviso.style.bottom =
            "16px";

        aviso.style.zIndex =
            "9999";

        aviso.style.padding =
            "10px 14px";

        aviso.style.borderRadius =
            "10px";

        aviso.style.fontSize =
            "13px";

        aviso.style.fontWeight =
            "bold";

        aviso.style.boxShadow =
            "0 8px 20px rgba(0, 0, 0, 0.18)";

        aviso.style.transition =
            "opacity 0.25s";

        document.body.appendChild(
            aviso
        );
    }

    if (navigator.onLine) {
        aviso.textContent =
            "🟢 Online";

        aviso.style.background =
            "#e8f7ef";

        aviso.style.color =
            "#007238";
    } else {
        aviso.textContent =
            "🟠 Trabalhando offline";

        aviso.style.background =
            "#fff3df";

        aviso.style.color =
            "#9a5a00";
    }

    aviso.style.opacity = "1";

    clearTimeout(
        window.tempoAvisoPwa
    );

    window.tempoAvisoPwa =
        setTimeout(
            function () {
                aviso.style.opacity =
                    "0.75";
            },
            3000
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
    "online",
    mostrarStatusConexao
);

window.addEventListener(
    "offline",
    mostrarStatusConexao
);

window.addEventListener(
    "load",
    async function () {
        mostrarStatusConexao();

        await registrarServiceWorker();
    }
);