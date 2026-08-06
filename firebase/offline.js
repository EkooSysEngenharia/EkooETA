const CHAVE_PENDENTES =
    "ekoo-pendencias-offline";


function registrarPendencia(
    descricao
) {
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
}


function registrarErro(
    descricao,
    erro
) {
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


export async function executarEscritaOffline(
    criarPromessa,
    descricao = "alteração"
) {
    let promessa;

    try {
        promessa =
            criarPromessa();
    } catch (erro) {
        registrarErro(
            descricao,
            erro
        );

        throw erro;
    }

    if (!navigator.onLine) {
        registrarPendencia(
            descricao
        );

        promessa.catch(
            function (erro) {
                console.error(
                    `Erro posterior ao sincronizar ${descricao}:`,
                    erro
                );

                registrarErro(
                    descricao,
                    erro
                );
            }
        );

        return {
            offline: true,
            pendente: true
        };
    }

    try {
        const resultado =
            await promessa;

        return {
            offline: false,
            pendente: false,
            resultado
        };
    } catch (erro) {
        registrarErro(
            descricao,
            erro
        );

        throw erro;
    }
}


export function obterQuantidadePendenteOffline() {
    return Number(
        localStorage.getItem(
            CHAVE_PENDENTES
        ) || 0
    );
}
