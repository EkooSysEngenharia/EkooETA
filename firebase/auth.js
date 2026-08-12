import { auth } from "./firebase-config.js";

import {

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,

    signOut,

    setPersistence,

    browserLocalPersistence

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function cadastrar(email, senha){

    return await createUserWithEmailAndPassword(
        auth,
        email,
        senha
    );

}

const CHAVE_INICIO_SESSAO =
    "ekooManagerInicioSessao";

const DURACAO_SESSAO_MS =
    30 * 24 * 60 * 60 * 1000;


export function registrarInicioSessao() {
    localStorage.setItem(
        CHAVE_INICIO_SESSAO,
        String(Date.now())
    );
}


export function limparControleSessao() {
    localStorage.removeItem(
        CHAVE_INICIO_SESSAO
    );
}


export function sessaoDentroDoPrazo() {
    const inicio =
        Number(
            localStorage.getItem(
                CHAVE_INICIO_SESSAO
            )
        );

    if (!inicio) {
        return false;
    }

    return (
        Date.now() - inicio <
        DURACAO_SESSAO_MS
    );
}


export async function entrar(email, senha){

    await setPersistence(
        auth,
        browserLocalPersistence
    );

    const resultado =
        await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );

    registrarInicioSessao();

    return resultado;
}

export async function recuperarSenha(email){

    return await sendPasswordResetEmail(
        auth,
        email
    );

}

export async function sair(){

    limparControleSessao();

    return await signOut(auth);

}