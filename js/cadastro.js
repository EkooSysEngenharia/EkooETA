import { cadastrar } from "../firebase/auth.js";

import {
    criarEmpresa,
    criarUsuario
} from "../firebase/firestore.js";

const formulario =
    document.getElementById("formCadastro");

const botaoVoltar =
    document.getElementById("voltarLogin");

const botaoCadastrar =
    document.getElementById("botaoCadastrar");

const mensagem =
    document.getElementById("mensagemCadastro");

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem-cadastro ${tipo}`;
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "mensagem-cadastro";
}

function traduzirErroFirebase(codigo) {
    const mensagens = {
        "auth/email-already-in-use":
            "Este e-mail já está cadastrado.",

        "auth/invalid-email":
            "Digite um e-mail válido.",

        "auth/weak-password":
            "A senha deve possuir pelo menos 6 caracteres.",

        "auth/network-request-failed":
            "Falha de conexão. Verifique sua internet."
    };

    return (
        mensagens[codigo] ||
        "Não foi possível criar a conta. Tente novamente."
    );
}

botaoVoltar.addEventListener("click", function () {
    window.location.href = "login.html";
});

formulario.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        limparMensagem();

        const nome =
            document
                .getElementById("nomeCadastro")
                .value
                .trim();

        const empresa =
            document
                .getElementById("empresaCadastro")
                .value
                .trim();

        const cnpj =
            document
                .getElementById("cnpjCadastro")
                .value
                .trim();

        const telefone =
            document
                .getElementById("telefoneCadastro")
                .value
                .trim();

        const cidade =
            document
                .getElementById("cidadeCadastro")
                .value
                .trim();

        const estado =
            document
                .getElementById("estadoCadastro")
                .value;

        const email =
            document
                .getElementById("emailCadastro")
                .value
                .trim()
                .toLowerCase();

        const senha =
            document
                .getElementById("senhaCadastro")
                .value;

        const confirmarSenha =
            document
                .getElementById(
                    "confirmarSenhaCadastro"
                )
                .value;

        if (senha !== confirmarSenha) {
            mostrarMensagem(
                "As senhas não são iguais.",
                "erro"
            );

            return;
        }

        botaoCadastrar.disabled = true;
        botaoCadastrar.textContent =
            "Criando conta...";

        try {
            const credencial =
                await cadastrar(email, senha);

            const uid =
                credencial.user.uid;

            const dataCriacao =
                new Date().toISOString();

            await criarEmpresa(uid, {
                nome: empresa,
                cnpj,
                telefone,
                cidade,
                estado,
                administradorUid: uid,
                criadoEm: dataCriacao,
                plano: "gratuito",
                status: "ativo"
            });

            await criarUsuario(uid, {
                nome,
                email,
                empresaId: uid,
                empresaNome: empresa,
                perfil: "administrador",
                criadoEm: dataCriacao,
                status: "ativo"
            });

            mostrarMensagem(
                "Conta criada com sucesso!",
                "sucesso"
            );

            setTimeout(function () {
               window.location.href =
    "dashboard.html";
            }, 900);
        } catch (erro) {
            console.error(
                "Erro ao criar conta:",
                erro
            );

            mostrarMensagem(
                traduzirErroFirebase(
                    erro.code
                ),
                "erro"
            );
        } finally {
            botaoCadastrar.disabled = false;
            botaoCadastrar.textContent =
                "Criar conta";
        }
    }
);