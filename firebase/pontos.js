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


const colecaoPontos =
    collection(db, "pontos");


export async function cadastrarPonto(
    dadosPonto
) {
    return await executarEscritaOffline(
        function () {
            return addDoc(
                colecaoPontos,
                dadosPonto
            );
        },
        "cadastro de ponto"
    );
}


export async function listarPontos(
    usuarioId,
    etaId
) {
    const consulta =
        query(
            colecaoPontos,

            where(
                "usuarioId",
                "==",
                usuarioId
            ),

            where(
                "etaId",
                "==",
                etaId
            )
        );

    const resultado =
        await getDocs(consulta);

    const pontos = [];

    resultado.forEach(function (documento) {
        pontos.push({
            id: documento.id,
            ...documento.data()
        });
    });

    pontos.sort(function (a, b) {
        const ordemA =
            Number(a.ordem || 0);

        const ordemB =
            Number(b.ordem || 0);

        if (ordemA !== ordemB) {
            return ordemA - ordemB;
        }

        return String(a.nome || "")
            .localeCompare(
                String(b.nome || ""),
                "pt-BR"
            );
    });

    return pontos;
}


export async function atualizarPonto(
    pontoId,
    dadosAtualizados
) {
    return await executarEscritaOffline(
        function () {
            return updateDoc(
                doc(
                    db,
                    "pontos",
                    pontoId
                ),
                dadosAtualizados
            );
        },
        "atualização de ponto"
    );
}


export async function excluirPonto(
    pontoId
) {
    return await executarEscritaOffline(
        function () {
            return deleteDoc(
                doc(
                    db,
                    "pontos",
                    pontoId
                )
            );
        },
        "exclusão de ponto"
    );
}