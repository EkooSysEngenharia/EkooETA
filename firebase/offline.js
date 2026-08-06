export async function executarEscritaOffline(
    criarPromessa,
    descricao = "alteração"
) {
    let promessa;

    try {
        promessa =
            criarPromessa();
    } catch (erro) {
        throw erro;
    }

    if (!navigator.onLine) {
        window.dispatchEvent(
            new CustomEvent(
                "ekoo-escrita-pendente",
                {
                    detail: {
                        descricao
                    }
                }
            )
        );

        promessa.catch(
            function (erro) {
                console.error(
                    `Erro posterior ao sincronizar ${descricao}:`,
                    erro
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "ekoo-erro-sincronizacao",
                        {
                            detail: {
                                descricao,
                                erro
                            }
                        }
                    )
                );
            }
        );

        return {
            offline: true,
            pendente: true
        };
    }

    const resultado =
        await promessa;

    return {
        offline: false,
        pendente: false,
        resultado
    };
}
