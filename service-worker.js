const CACHE_NAME =
    "ekoo-manager-v1";

const BASE =
    self.location.pathname.replace(
        "service-worker.js",
        ""
    );

const ARQUIVOS = [
    "",
    "index.html",

    "pages/login.html",
    "pages/dashboard.html",
    "pages/cadastro.html",
    "pages/eta/lista.html",

    "css/login.css",
    "css/dashboard.css",
    "css/clientes.css",
    "css/cadastro.css",
    "css/eta.css",
    "css/pontos.css",
    "css/medicoes.css",
    "css/historicoMedicoes.css",
    "css/relatoriosEta.css",

    "js/login.js",
    "js/dashboard.js",
    "js/clientes.js",
    "js/cadastro.js",
    "js/eta.js",
    "js/pontosModulo.js",
    "js/medicoesModulo.js",
    "js/historicoMedicoes.js",
    "js/relatoriosEta.js",

    "firebase/firebase-config.js",
    "firebase/auth.js",
    "firebase/clientes.js",
    "firebase/etas.js",
    "firebase/medicoes.js",
    "firebase/pontos.js",
    "firebase/usuarios.js",

    "assets/logo.png",
    "manifest.json"
].map(function (caminho) {
    return BASE + caminho;
});


self.addEventListener(
    "install",
    function (evento) {
        evento.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(function (cache) {
                    return cache.addAll(
                        ARQUIVOS
                    );
                })
                .then(function () {
                    return self.skipWaiting();
                })
        );
    }
);


self.addEventListener(
    "activate",
    function (evento) {
        evento.waitUntil(
            caches
                .keys()
                .then(function (nomes) {
                    return Promise.all(
                        nomes.map(
                            function (nome) {
                                if (
                                    nome !==
                                    CACHE_NAME
                                ) {
                                    return caches.delete(
                                        nome
                                    );
                                }
                            }
                        )
                    );
                })
                .then(function () {
                    return self.clients.claim();
                })
        );
    }
);


self.addEventListener(
    "fetch",
    function (evento) {
        if (
            evento.request.method !==
            "GET"
        ) {
            return;
        }

        evento.respondWith(
            fetch(evento.request)
                .then(function (resposta) {
                    const copia =
                        resposta.clone();

                    caches
                        .open(CACHE_NAME)
                        .then(
                            function (cache) {
                                cache.put(
                                    evento.request,
                                    copia
                                );
                            }
                        );

                    return resposta;
                })
                .catch(function () {
                    return caches.match(
                        evento.request
                    );
                })
        );
    }
);