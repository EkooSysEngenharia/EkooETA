import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const colecaoMedicoes =
    collection(db, "medicoes");


export async function cadastrarMedicao(
    dadosMedicao
) {
    return await addDoc(
        colecaoMedicoes,
        dadosMedicao
    );
}


export async function cadastrarMedicoesEmLote(
    medicoes
) {
    if (
        !Array.isArray(medicoes) ||
        medicoes.length === 0
    ) {
        throw new Error(
            "Nenhuma medição foi informada."
        );
    }

    const lote =
        writeBatch(db);

    medicoes.forEach(function (medicao) {
        const referencia =
            doc(colecaoMedicoes);

        lote.set(
            referencia,
            medicao
        );
    });

    await lote.commit();
}


export async function listarMedicoesPorUsuario(
    usuarioId
) {
    const consulta =
        query(
            colecaoMedicoes,

            where(
                "usuarioId",
                "==",
                usuarioId
            )
        );

    const resultado =
        await getDocs(consulta);

    const medicoes = [];

    resultado.forEach(function (documento) {
        medicoes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    medicoes.sort(function (a, b) {
        return String(
            b.dataHora || ""
        ).localeCompare(
            String(
                a.dataHora || ""
            )
        );
    });

    return medicoes;
}


export async function listarMedicoesPorEta(
    usuarioId,
    etaId
) {
    const consulta =
        query(
            colecaoMedicoes,

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

    const medicoes = [];

    resultado.forEach(function (documento) {
        medicoes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    medicoes.sort(function (a, b) {
        return String(
            b.dataHora || ""
        ).localeCompare(
            String(
                a.dataHora || ""
            )
        );
    });

    return medicoes;
}


export async function listarMedicoesPorPonto(
    usuarioId,
    pontoId
) {
    const consulta =
        query(
            colecaoMedicoes,

            where(
                "usuarioId",
                "==",
                usuarioId
            ),

            where(
                "pontoId",
                "==",
                pontoId
            )
        );

    const resultado =
        await getDocs(consulta);

    const medicoes = [];

    resultado.forEach(function (documento) {
        medicoes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    medicoes.sort(function (a, b) {
        return String(
            b.dataHora || ""
        ).localeCompare(
            String(
                a.dataHora || ""
            )
        );
    });

    return medicoes;
}


export async function atualizarMedicao(
    medicaoId,
    dadosAtualizados
) {
    return await updateDoc(
        doc(
            db,
            "medicoes",
            medicaoId
        ),
        dadosAtualizados
    );
}


export async function excluirMedicao(
    medicaoId
) {
    return await deleteDoc(
        doc(
            db,
            "medicoes",
            medicaoId
        )
    );
}
