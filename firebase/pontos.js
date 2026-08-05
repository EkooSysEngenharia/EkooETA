import { db } from "./firebase-config.js";

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
    return await addDoc(
        colecaoPontos,
        dadosPonto
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
    return await updateDoc(
        doc(
            db,
            "pontos",
            pontoId
        ),
        dadosAtualizados
    );
}


export async function excluirPonto(
    pontoId
) {
    return await deleteDoc(
        doc(
            db,
            "pontos",
            pontoId
        )
    );
}