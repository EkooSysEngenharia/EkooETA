import { db } from "./firebase-config.js";
import { executarEscritaOffline } from "./offline.js";
import {
 collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, query, where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const clientesVT = collection(db,"clientesVisitaTecnica");
const agendaVT = collection(db,"agendaVisitaTecnica");
const visitasVT = collection(db,"visitasTecnicas");
const condicionantesVT = collection(db,"condicionantesVisitaTecnica");
const fotosVT = collection(db,"fotosVisitaTecnica");

async function listar(colecao,uid){
 const q=query(colecao,where("usuarioId","==",uid));
 const r=await getDocs(q); const a=[]; r.forEach(d=>a.push({id:d.id,...d.data()})); return a;
}
export const listarClientesVT=uid=>listar(clientesVT,uid);
export const listarAgendaVT=uid=>listar(agendaVT,uid);
export const criarClienteVT=d=>executarEscritaOffline(()=>addDoc(clientesVT,d),"cliente de visita técnica");
export const atualizarClienteVT=(id,d)=>executarEscritaOffline(()=>updateDoc(doc(db,"clientesVisitaTecnica",id),d),"cliente de visita técnica");
export const excluirClienteVT=id=>executarEscritaOffline(()=>deleteDoc(doc(db,"clientesVisitaTecnica",id)),"cliente de visita técnica");
export const criarAgendaVT=d=>executarEscritaOffline(()=>addDoc(agendaVT,d),"agenda de visita técnica");
export const atualizarAgendaVT=(id,d)=>executarEscritaOffline(()=>updateDoc(doc(db,"agendaVisitaTecnica",id),d),"agenda de visita técnica");
export const excluirAgendaVT=id=>executarEscritaOffline(()=>deleteDoc(doc(db,"agendaVisitaTecnica",id)),"agenda de visita técnica");

export const listarVisitasVT=uid=>listar(visitasVT,uid);
// Gera o ID da visita no cliente (funciona offline, pois não depende do servidor responder).
export const novoIdVisitaVT=()=>doc(visitasVT).id;
export const criarVisitaVTComId=(id,d)=>executarEscritaOffline(()=>setDoc(doc(db,"visitasTecnicas",id),d),"visita técnica");
export const criarVisitaVT=d=>executarEscritaOffline(()=>addDoc(visitasVT,d),"visita técnica");
export const atualizarVisitaVT=(id,d)=>executarEscritaOffline(()=>updateDoc(doc(db,"visitasTecnicas",id),d),"visita técnica");
export const excluirVisitaVT=id=>executarEscritaOffline(()=>deleteDoc(doc(db,"visitasTecnicas",id)),"visita técnica");

// FOTOS DA VISITA TÉCNICA — cada foto é um documento próprio (evita o limite de 1MB por documento do Firestore,
// que era o motivo real de só "caber" 1-2 fotos quando iam todas dentro do documento da visita).
export async function listarFotosVisitaTecnicaPorVisita(uid,visitaId){
 const q=query(fotosVT,where("usuarioId","==",uid),where("visitaId","==",visitaId));
 const r=await getDocs(q); const a=[]; r.forEach(d=>a.push({id:d.id,...d.data()})); return a;
}
export const criarFotoVisitaTecnica=d=>executarEscritaOffline(()=>addDoc(fotosVT,d),"foto da visita técnica");
export const excluirFotoVisitaTecnica=id=>executarEscritaOffline(()=>deleteDoc(doc(db,"fotosVisitaTecnica",id)),"foto da visita técnica");

export async function listarCondicionantesVT(uid,clienteId){
 const q=query(condicionantesVT,where("usuarioId","==",uid));
 const r=await getDocs(q); const a=[];
 r.forEach(d=>{const x={id:d.id,...d.data()};if(x.clienteId===clienteId)a.push(x)});
 return a;
}
export const criarCondicionanteVT=d=>executarEscritaOffline(()=>addDoc(condicionantesVT,d),"condicionante");
export const atualizarCondicionanteVT=(id,d)=>executarEscritaOffline(()=>updateDoc(doc(db,"condicionantesVisitaTecnica",id),d),"condicionante");
export const excluirCondicionanteVT=id=>executarEscritaOffline(()=>deleteDoc(doc(db,"condicionantesVisitaTecnica",id)),"condicionante");
