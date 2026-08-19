const VERSAO_APP =
    "app17-seta-visita-v3";

const CACHE_APP =
    `ekoo-manager-${VERSAO_APP}`;

const BASE =
    self.location.pathname.replace(
        "service-worker.js",
        ""
    );

const ARQUIVOS_APP = [
    "",
    "index.html",
    "manifest.json",

    "pages/login.html",
    "pages/dashboard.html",
    "pages/cadastro.html",
    "pages/eta/lista.html",

    "css/style.css",
    "css/app.css",
    "css/login.css",
    "css/dashboard.css",
    "css/clientes.css",
    "css/cadastro.css",
    "css/eta.css",
    "css/pontos.css",
    "css/medicoes.css",
    "css/historicoMedicoes.css",
    "css/relatoriosEta.css",

    "js/pwa.js",
    "js/login.js",
    "js/dashboard.js",
    "js/visitaTecnica.js",
    "js/clientes.js",
    "js/cadastro.js",
    "js/eta.js",
    "js/pontosModulo.js",
    "js/medicoesModulo.js",
    "js/historicoMedicoes.js",
    "js/relatoriosEta.js",

    "firebase/firebase-config.js",
    "firebase/offline.js",
    "firebase/auth.js",
    "firebase/clientes.js",
    "firebase/etas.js",
    "firebase/medicoes.js",
    "firebase/pontos.js",
    "firebase/usuarios.js",

    "assets/logo.png",
    "assets/icons/apple-touch-icon.png",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png",
    "assets/icons/icon-mac-512.png",
    "assets/icons/icon-maskable-512.png"
].map(
    function (caminho) {
        return BASE + caminho;
    }
);


self.addEventListener(
    "install",
    function (evento) {
        evento.waitUntil(
            caches
                .open(CACHE_APP)
                .then(
                    function (cache) {
                        return cache.addAll(
                            ARQUIVOS_APP
                        );
                    }
                )
                .then(
                    function () {
                        return self.skipWaiting();
                    }
                )
        );
    }
);


self.addEventListener(
    "activate",
    function (evento) {
        evento.waitUntil(
            caches
                .keys()
                .then(
                    function (nomes) {
                        return Promise.all(
                            nomes.map(
                                function (nome) {
                                    if (
                                        nome.startsWith(
                                            "ekoo-manager-"
                                        ) &&
                                        nome !== CACHE_APP
                                    ) {
                                        return caches.delete(
                                            nome
                                        );
                                    }
                                }
                            )
                        );
                    }
                )
                .then(
                    function () {
                        return self.clients.claim();
                    }
                )
                .then(
                    async function () {
                        const clientes =
                            await self.clients.matchAll({
                                type: "window",
                                includeUncontrolled: true
                            });

                        clientes.forEach(
                            function (cliente) {
                                cliente.postMessage({
                                    tipo:
                                        "APP_ATUALIZADO",

                                    versao:
                                        VERSAO_APP
                                });
                            }
                        );
                    }
                )
        );
    }
);


self.addEventListener(
    "message",
    function (evento) {
        if (
            evento.data &&
            evento.data.tipo ===
                "ATIVAR_ATUALIZACAO"
        ) {
            self.skipWaiting();
        }
    }
);


async function responderNavegacao(
    requisicao
) {
    try {
        const resposta =
            await fetch(requisicao);

        const cache =
            await caches.open(
                CACHE_APP
            );

        cache.put(
            requisicao,
            resposta.clone()
        );

        return resposta;
    } catch (erro) {
        const armazenada =
            await caches.match(
                requisicao
            );

        if (armazenada) {
            return armazenada;
        }

        return caches.match(
            BASE + "pages/login.html"
        );
    }
}


async function responderRecurso(
    requisicao
) {
    const armazenada =
        await caches.match(
            requisicao
        );

    const atualizacao =
        fetch(requisicao)
            .then(
                async function (resposta) {
                    const cache =
                        await caches.open(
                            CACHE_APP
                        );

                    cache.put(
                        requisicao,
                        resposta.clone()
                    );

                    return resposta;
                }
            )
            .catch(
                function () {
                    return armazenada;
                }
            );

    return armazenada || atualizacao;
}


self.addEventListener(
    "fetch",
    function (evento) {
        if (
            evento.request.method !==
            "GET"
        ) {
            return;
        }

        if (
            evento.request.mode ===
            "navigate"
        ) {
            evento.respondWith(
                responderNavegacao(
                    evento.request
                )
            );

            return;
        }

        evento.respondWith(
            responderRecurso(
                evento.request
            )
        );
    }
);
