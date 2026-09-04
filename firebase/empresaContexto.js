let contextoEmpresaAtual = null;

export function definirContextoEmpresa(usuarioId, dadosUsuario = null) {
    contextoEmpresaAtual = {
        usuarioId,
        empresaId:
            dadosUsuario?.empresaId ||
            usuarioId,
        empresaNome:
            dadosUsuario?.empresaNome ||
            "",
        perfil:
            dadosUsuario?.perfil ||
            "usuario"
    };

    return contextoEmpresaAtual;
}

export function obterContextoEmpresa() {
    return contextoEmpresaAtual;
}

export function obterEmpresaId() {
    return (
        contextoEmpresaAtual?.empresaId ||
        null
    );
}
