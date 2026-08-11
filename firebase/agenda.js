import { db } from "./firebase-config.js";
import { executarEscritaOffline } from "./offline.js";
import {
    collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const colecaoAgenda = collection(db, "agenda");

export async function cadastrarVisita(dados) {
    return executarEscritaOffline(
        () => addDoc(colecaoAgenda, dados),
        "agendamento de visita"
    );
}

export async function listarVisitas(usuarioId) {
    const consulta = query(colecaoAgenda, where("usuarioId", "==", usuarioId));
    const resultado = await getDocs(consulta);
    const lista = [];
    resultado.forEach(d => lista.push({ id: d.id, ...d.data() }));
    lista.sort((a,b) => String(a.dataHora || "").localeCompare(String(b.dataHora || "")));
    return lista;
}

export async function atualizarVisita(id, dados) {
    return executarEscritaOffline(
        () => updateDoc(doc(db, "agenda", id), dados),
        "atualização de visita"
    );
}

export async function excluirVisita(id) {
    return executarEscritaOffline(
        () => deleteDoc(doc(db, "agenda", id)),
        "exclusão de visita"
    );
}
