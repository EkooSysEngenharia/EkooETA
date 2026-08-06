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
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const colecaoMedicoes =
    collection(db, "medicoes");


export async function cadastrarMedicao(
    dadosMedicao
) {
    return await executarEscritaOffline(
        function () {
            return addDoc(
                colecaoMedicoes,
                dadosMedicao
            );
        },
        "cadastro de medição"
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

    return await executarEscritaOffline(
        function () {
            return lote.commit();
        },
        "lote de medições"
    );
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
    return await executarEscritaOffline(
        function () {
            return updateDoc(
                doc(
                    db,
                    "medicoes",
                    medicaoId
                ),
                dadosAtualizados
            );
        },
        "atualização de medição"
    );
}


export async function excluirMedicao(
    medicaoId
) {
    return await executarEscritaOffline(
        function () {
            return deleteDoc(
                doc(
                    db,
                    "medicoes",
                    medicaoId
                )
            );
        },
        "exclusão de medição"
    );
}
