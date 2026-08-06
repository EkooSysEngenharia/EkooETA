import { db } from "./firebase-config.js";

import {
    executarEscritaOffline
} from "./offline.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const colecaoEtas =
    collection(db, "etas");


export async function cadastrarEta(dadosEta) {
    return await executarEscritaOffline(
        function () {
            return addDoc(
                colecaoEtas,
                dadosEta
            );
        },
        "cadastro de ETA"
    );
}


export async function listarEtas(
    usuarioId,
    clienteId = null
) {
    let consulta;

    if (clienteId) {
        consulta = query(
            colecaoEtas,

            where(
                "usuarioId",
                "==",
                usuarioId
            ),

            where(
                "clienteId",
                "==",
                clienteId
            )
        );
    } else {
        consulta = query(
            colecaoEtas,

            where(
                "usuarioId",
                "==",
                usuarioId
            )
        );
    }

    const resultado =
        await getDocs(consulta);

    const lista = [];

    resultado.forEach(function (documento) {
        lista.push({
            id: documento.id,
            ...documento.data()
        });
    });

    lista.sort(function (a, b) {
        return String(a.nome || "")
            .localeCompare(
                String(b.nome || ""),
                "pt-BR"
            );
    });

    return lista;
}


export async function atualizarEta(
    etaId,
    dadosAtualizados
) {
    const referencia =
        doc(
            db,
            "etas",
            etaId
        );

    return await executarEscritaOffline(
        function () {
            return updateDoc(
                referencia,
                dadosAtualizados
            );
        },
        "atualização de ETA"
    );
}


export async function excluirEta(etaId) {
    const referencia =
        doc(
            db,
            "etas",
            etaId
        );

    return await executarEscritaOffline(
        function () {
            return deleteDoc(
                referencia
            );
        },
        "exclusão de ETA"
    );
}