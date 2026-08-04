(function () {
    let etaAbertaId = null;

    function escaparHTML(valor) {
        const elemento = document.createElement("div");
        elemento.textContent = String(valor);
        return elemento.innerHTML;
    }

    function localizarClienteAtual() {
        const nomeCliente =
            document.getElementById("nomeClienteEtas");

        if (!nomeCliente) {
            return null;
        }

        const nome =
            nomeCliente.textContent.trim();

        return Banco.listarClientes().find(function (cliente) {
            return cliente.nome === nome;
        });
    }

    function localizarEtaDoCartao(cartao) {
        const cliente = localizarClienteAtual();

        if (!cliente) {
            return null;
        }

        const titulo =
            cartao.querySelector(".nome-eta h3");

        if (!titulo) {
            return null;
        }

        const nomeEta =
            titulo.textContent.trim();

        return Banco
            .listarEtasDoCliente(cliente.id)
            .find(function (eta) {
                return eta.nome === nomeEta;
            });
    }

    function criarEstilos() {
        if (
            document.getElementById(
                "estilosModuloPontos"
            )
        ) {
            return;
        }

        const estilos =
            document.createElement("style");

        estilos.id = "estilosModuloPontos";

        estilos.textContent = `
            .botao-gerenciar-pontos {
                width: 100%;
                min-height: 43px;
                margin-top: 14px;
                border: none;
                border-radius: 12px;
                background: #e8f7ef;
                color: #007238;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
            }

            .botao-gerenciar-pontos:hover {
                background: #d7f1e2;
            }

            .area-pontos-eta {
                margin-top: 14px;
                padding-top: 14px;
                border-top: 1px solid #dce5e9;
            }

            .area-pontos-eta.escondido {
                display: none;
            }

            .formulario-ponto {
                display: flex;
                gap: 8px;
                margin-bottom: 14px;
            }

            .formulario-ponto input {
                width: 100%;
                min-width: 0;
                padding: 12px;
                border: 1px solid #dce5e9;
                border-radius: 11px;
                outline: none;
                font-size: 14px;
            }

            .formulario-ponto input:focus {
                border-color: #009846;
                box-shadow:
                    0 0 0 3px rgba(0, 152, 70, 0.12);
            }

            .formulario-ponto button {
                flex-shrink: 0;
                padding: 11px 14px;
                border: none;
                border-radius: 11px;
                background: #009846;
                color: white;
                font-weight: bold;
                cursor: pointer;
            }

            .lista-pontos-eta {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .item-ponto {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 11px;
                border-radius: 11px;
                background: #f3f7f5;
            }

            .nome-ponto {
                min-width: 0;
                font-size: 14px;
                overflow-wrap: anywhere;
            }

            .acoes-ponto {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }

            .acoes-ponto button {
                min-height: 34px;
                padding: 7px 9px;
                border: 1px solid #dce5e9;
                border-radius: 9px;
                background: white;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
            }

            .acoes-ponto .excluir-ponto {
                color: #c62828;
            }

            .edicao-ponto {
                width: 100%;
                display: flex;
                gap: 7px;
            }

            .edicao-ponto input {
                width: 100%;
                min-width: 0;
                padding: 9px;
                border: 1px solid #009846;
                border-radius: 9px;
                outline: none;
                font-size: 14px;
            }

            .edicao-ponto button {
                flex-shrink: 0;
                padding: 8px 10px;
                border: none;
                border-radius: 9px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
            }

            .salvar-edicao-ponto {
                background: #009846;
                color: white;
            }

            .cancelar-edicao-ponto {
                background: #edf3f6;
                color: #1f2933;
            }

            .mensagem-sem-pontos {
                padding: 18px 12px;
                border: 1px dashed #dce5e9;
                border-radius: 11px;
                color: #65727d;
                text-align: center;
                font-size: 13px;
                line-height: 1.5;
            }

            @media (max-width: 470px) {
                .formulario-ponto {
                    flex-direction: column;
                }

                .formulario-ponto button {
                    min-height: 44px;
                }

                .item-ponto {
                    align-items: flex-start;
                    flex-direction: column;
                }

                .acoes-ponto {
                    width: 100%;
                }

                .acoes-ponto button {
                    flex: 1;
                }
            }
        `;

        document.head.appendChild(estilos);
    }

    function obterPontosDaEta(etaId) {
        return Banco
            .listarPontosDaEta(etaId)
            .sort(function (a, b) {
                return a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                );
            });
    }

    function salvarNovoPonto(
        evento,
        etaId,
        cartao
    ) {
        evento.preventDefault();

        const campo =
            evento.currentTarget.querySelector(
                "input"
            );

        const nome =
            campo.value.trim();

        if (nome.length < 2) {
            alert(
                "Informe o nome do ponto de coleta."
            );

            campo.focus();
            return;
        }

        const pontos =
            Banco.listarPontos();

        const duplicado =
            pontos.some(function (ponto) {
                return (
                    ponto.etaId === etaId &&
                    ponto.nome.toLowerCase() ===
                        nome.toLowerCase()
                );
            });

        if (duplicado) {
            alert(
                "Esse ponto já está cadastrado nesta ETA."
            );

            campo.focus();
            return;
        }

        pontos.push({
            id: Banco.gerarId(),
            etaId: etaId,
            nome: nome,
            criadoEm:
                new Date().toISOString()
        });

        Banco.salvarPontos(pontos);

        campo.value = "";

        etaAbertaId = etaId;

        montarAreaPontos(cartao, etaId);
        atualizarTextoBotao(cartao, etaId);
    }

    function excluirPonto(
        pontoId,
        etaId,
        cartao
    ) {
        const ponto =
            Banco.buscarPontoPorId(pontoId);

        if (!ponto) {
            return;
        }

        const confirmar =
            window.confirm(
                `Excluir o ponto "${ponto.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        const pontos =
            Banco
                .listarPontos()
                .filter(function (item) {
                    return item.id !== pontoId;
                });

        Banco.salvarPontos(pontos);

        montarAreaPontos(cartao, etaId);
        atualizarTextoBotao(cartao, etaId);
    }

    function iniciarEdicaoPonto(
        pontoId,
        etaId,
        cartao,
        item
    ) {
        const ponto =
            Banco.buscarPontoPorId(pontoId);

        if (!ponto) {
            return;
        }

        item.innerHTML = `
            <div class="edicao-ponto">

                <input
                    type="text"
                    maxlength="80"
                    value="${escaparHTML(ponto.nome)}"
                    aria-label="Nome do ponto"
                >

                <button
                    class="salvar-edicao-ponto"
                    type="button"
                >
                    Salvar
                </button>

                <button
                    class="cancelar-edicao-ponto"
                    type="button"
                >
                    Cancelar
                </button>

            </div>
        `;

        const campo =
            item.querySelector("input");

        campo.focus();
        campo.select();

        item
            .querySelector(
                ".salvar-edicao-ponto"
            )
            .addEventListener(
                "click",
                function () {
                    salvarEdicaoPonto(
                        pontoId,
                        etaId,
                        cartao,
                        campo.value
                    );
                }
            );

        item
            .querySelector(
                ".cancelar-edicao-ponto"
            )
            .addEventListener(
                "click",
                function () {
                    montarAreaPontos(
                        cartao,
                        etaId
                    );
                }
            );
    }

    function salvarEdicaoPonto(
        pontoId,
        etaId,
        cartao,
        novoNome
    ) {
        const nome =
            novoNome.trim();

        if (nome.length < 2) {
            alert(
                "Informe um nome válido."
            );

            return;
        }

        const pontos =
            Banco.listarPontos();

        const duplicado =
            pontos.some(function (ponto) {
                return (
                    ponto.etaId === etaId &&
                    ponto.id !== pontoId &&
                    ponto.nome.toLowerCase() ===
                        nome.toLowerCase()
                );
            });

        if (duplicado) {
            alert(
                "Já existe outro ponto com esse nome."
            );

            return;
        }

        const indice =
            pontos.findIndex(function (ponto) {
                return ponto.id === pontoId;
            });

        if (indice === -1) {
            return;
        }

        pontos[indice].nome = nome;

        Banco.salvarPontos(pontos);

        montarAreaPontos(cartao, etaId);
    }

    function criarItemPonto(
        ponto,
        etaId,
        cartao
    ) {
        const item =
            document.createElement("div");

        item.className = "item-ponto";

        item.innerHTML = `
            <span class="nome-ponto">
                ${escaparHTML(ponto.nome)}
            </span>

            <div class="acoes-ponto">

                <button
                    class="editar-ponto"
                    type="button"
                >
                    Editar
                </button>

                <button
                    class="excluir-ponto"
                    type="button"
                >
                    Excluir
                </button>

            </div>
        `;

        item
            .querySelector(".editar-ponto")
            .addEventListener(
                "click",
                function () {
                    iniciarEdicaoPonto(
                        ponto.id,
                        etaId,
                        cartao,
                        item
                    );
                }
            );

        item
            .querySelector(".excluir-ponto")
            .addEventListener(
                "click",
                function () {
                    excluirPonto(
                        ponto.id,
                        etaId,
                        cartao
                    );
                }
            );

        return item;
    }

    function montarAreaPontos(
        cartao,
        etaId
    ) {
        let area =
            cartao.querySelector(
                ".area-pontos-eta"
            );

        if (!area) {
            area =
                document.createElement("div");

            area.className =
                "area-pontos-eta";

            cartao.appendChild(area);
        }

        const pontos =
            obterPontosDaEta(etaId);

        area.innerHTML = `
            <form class="formulario-ponto">

                <input
                    type="text"
                    maxlength="80"
                    placeholder="Ex.: Saída ETA ou Cabana 1"
                    autocomplete="off"
                    required
                >

                <button type="submit">
                    Adicionar ponto
                </button>

            </form>

            <div class="lista-pontos-eta"></div>
        `;

        const lista =
            area.querySelector(
                ".lista-pontos-eta"
            );

        if (pontos.length === 0) {
            lista.innerHTML = `
                <div class="mensagem-sem-pontos">
                    Nenhum ponto cadastrado.<br>
                    Adicione o primeiro ponto acima.
                </div>
            `;
        } else {
            pontos.forEach(function (ponto) {
                lista.appendChild(
                    criarItemPonto(
                        ponto,
                        etaId,
                        cartao
                    )
                );
            });
        }

        area
            .querySelector(
                ".formulario-ponto"
            )
            .addEventListener(
                "submit",
                function (evento) {
                    salvarNovoPonto(
                        evento,
                        etaId,
                        cartao
                    );
                }
            );
    }

    function atualizarTextoBotao(
        cartao,
        etaId
    ) {
        const botao =
            cartao.querySelector(
                ".botao-gerenciar-pontos"
            );

        if (!botao) {
            return;
        }

        const quantidade =
            obterPontosDaEta(etaId).length;

        const aberto =
            etaAbertaId === etaId;

        botao.textContent =
            aberto
                ? `Fechar pontos (${quantidade})`
                : `Gerenciar pontos (${quantidade})`;
    }

    function alternarAreaPontos(
        cartao,
        etaId
    ) {
        const jaAberta =
            etaAbertaId === etaId;

        document
            .querySelectorAll(
                ".area-pontos-eta"
            )
            .forEach(function (area) {
                area.classList.add(
                    "escondido"
                );
            });

        document
            .querySelectorAll(
                ".cartao-eta"
            )
            .forEach(function (outroCartao) {
                const outraEta =
                    localizarEtaDoCartao(
                        outroCartao
                    );

                if (outraEta) {
                    const botao =
                        outroCartao.querySelector(
                            ".botao-gerenciar-pontos"
                        );

                    if (botao) {
                        const quantidade =
                            obterPontosDaEta(
                                outraEta.id
                            ).length;

                        botao.textContent =
                            `Gerenciar pontos (${quantidade})`;
                    }
                }
            });

        if (jaAberta) {
            etaAbertaId = null;
            return;
        }

        etaAbertaId = etaId;

        montarAreaPontos(cartao, etaId);

        const area =
            cartao.querySelector(
                ".area-pontos-eta"
            );

        area.classList.remove(
            "escondido"
        );

        atualizarTextoBotao(
            cartao,
            etaId
        );
    }

    function adicionarBotoesPontos() {
        const cartoes =
            document.querySelectorAll(
                ".cartao-eta"
            );

        cartoes.forEach(function (cartao) {
            const eta =
                localizarEtaDoCartao(cartao);

            if (!eta) {
                return;
            }

            let botao =
                cartao.querySelector(
                    ".botao-gerenciar-pontos"
                );

            if (!botao) {
                botao =
                    document.createElement(
                        "button"
                    );

                botao.type = "button";

                botao.className =
                    "botao-gerenciar-pontos";

                botao.addEventListener(
                    "click",
                    function () {
                        alternarAreaPontos(
                            cartao,
                            eta.id
                        );
                    }
                );

                cartao.appendChild(botao);
            }

            atualizarTextoBotao(
                cartao,
                eta.id
            );

            if (etaAbertaId === eta.id) {
                montarAreaPontos(
                    cartao,
                    eta.id
                );
            }
        });
    }

    function observarListaEtas() {
        const lista =
            document.getElementById(
                "listaEtasCliente"
            );

        if (!lista) {
            return;
        }

        const observador =
            new MutationObserver(
                function () {
                    adicionarBotoesPontos();
                }
            );

        observador.observe(lista, {
            childList: true,
            subtree: false
        });

        adicionarBotoesPontos();
    }

    criarEstilos();
    observarListaEtas();
})();