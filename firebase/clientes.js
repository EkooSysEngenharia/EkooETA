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

const colecaoClientes =
    collection(db, "clientes");

export async function cadastrarCliente(dados) {
    return await executarEscritaOffline(
        function () {
            return addDoc(
                colecaoClientes,
                dados
            );
        },
        "cadastro de cliente"
    );
}

export async function listarClientes(usuarioId) {
    const consulta =
        query(
            colecaoClientes,
            where(
                "usuarioId",
                "==",
                usuarioId
            )
        );

    const resultado =
        await getDocs(consulta);

    const clientes = [];

    resultado.forEach(function (documento) {
        clientes.push({
            id: documento.id,
            ...documento.data()
        });
    });

    clientes.sort(function (a, b) {
        return String(
            a.nomeFantasia ||
            a.razaoSocial ||
            ""
        ).localeCompare(
            String(
                b.nomeFantasia ||
                b.razaoSocial ||
                ""
            ),
            "pt-BR"
        );
    });

    return clientes;
}

export async function atualizarCliente(
    clienteId,
    dados
) {
    return await executarEscritaOffline(
        function () {
            return updateDoc(
                doc(
                    db,
                    "clientes",
                    clienteId
                ),
                dados
            );
        },
        "atualização de cliente"
    );
}

export async function excluirCliente(
    clienteId
) {
    return await executarEscritaOffline(
        function () {
            return deleteDoc(
                doc(
                    db,
                    "clientes",
                    clienteId
                )
            );
        },
        "exclusão de cliente"
    );
}