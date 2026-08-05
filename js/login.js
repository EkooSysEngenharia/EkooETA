import {
    entrar,
    recuperarSenha
} from "../firebase/auth.js";

const formulario =
    document.getElementById("formLogin");

const emailCampo =
    document.getElementById("emailLogin");

const senhaCampo =
    document.getElementById("senhaLogin");

const mensagem =
    document.getElementById("mensagemLogin");

const botaoEntrar =
    document.getElementById("botaoEntrar");

const botaoCriarConta =
    document.getElementById("botaoCriarConta");

const botaoRecuperarSenha =
    document.getElementById("botaoRecuperarSenha");

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className =
        `mensagem-login ${tipo}`;
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className =
        "mensagem-login";
}

function traduzirErroLogin(codigo) {
    const mensagens = {
        "auth/invalid-email":
            "Digite um e-mail válido.",

        "auth/invalid-credential":
            "E-mail ou senha incorretos.",

        "auth/user-disabled":
            "Esta conta está desativada.",

        "auth/too-many-requests":
            "Muitas tentativas. Aguarde e tente novamente.",

        "auth/network-request-failed":
            "Falha de conexão. Verifique sua internet."
    };

    return (
        mensagens[codigo] ||
        "Não foi possível entrar. Confira os dados."
    );
}

formulario.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        limparMensagem();

        const email =
            emailCampo.value
                .trim()
                .toLowerCase();

        const senha =
            senhaCampo.value;

        botaoEntrar.disabled = true;
        botaoEntrar.textContent =
            "Entrando...";

        try {
            await entrar(email, senha);

            mostrarMensagem(
                "Login realizado com sucesso!",
                "sucesso"
            );

            window.location.href =
                "dashboard.html";
        } catch (erro) {
            console.error(
                "Erro ao entrar:",
                erro
            );

            mostrarMensagem(
                traduzirErroLogin(erro.code),
                "erro"
            );
        } finally {
            botaoEntrar.disabled = false;
            botaoEntrar.textContent =
                "Entrar";
        }
    }
);

botaoCriarConta.addEventListener(
    "click",
    function () {
        window.location.href =
            "cadastro.html";
    }
);

botaoRecuperarSenha.addEventListener(
    "click",
    async function () {
        limparMensagem();

        const email =
            emailCampo.value
                .trim()
                .toLowerCase();

        if (!email) {
            mostrarMensagem(
                "Digite seu e-mail para recuperar a senha.",
                "erro"
            );

            emailCampo.focus();
            return;
        }

        try {
            await recuperarSenha(email);

            mostrarMensagem(
                "Enviamos as instruções de recuperação para o seu e-mail.",
                "sucesso"
            );
        } catch (erro) {
            console.error(
                "Erro ao recuperar senha:",
                erro
            );

            mostrarMensagem(
                traduzirErroLogin(erro.code),
                "erro"
            );
        }
    }
);