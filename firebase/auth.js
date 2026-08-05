import { auth } from "./firebase-config.js";

import {

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,

    signOut

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function cadastrar(email, senha){

    return await createUserWithEmailAndPassword(
        auth,
        email,
        senha
    );

}

export async function entrar(email, senha){

    return await signInWithEmailAndPassword(
        auth,
        email,
        senha
    );

}

export async function recuperarSenha(email){

    return await sendPasswordResetEmail(
        auth,
        email
    );

}

export async function sair(){

    return await signOut(auth);

}