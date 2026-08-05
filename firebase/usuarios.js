import { db } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function salvarUsuario(uid, dados) {

    await setDoc(
        doc(db, "usuarios", uid),
        dados
    );

}

export async function buscarUsuario(uid) {

    const documento =
        await getDoc(
            doc(db, "usuarios", uid)
        );

    if (documento.exists()) {
        return documento.data();
    }

    return null;

}

export async function atualizarUsuario(uid, dados) {

    await updateDoc(
        doc(db, "usuarios", uid),
        dados
    );

}

export async function excluirUsuario(uid) {

    await deleteDoc(
        doc(db, "usuarios", uid)
    );

}