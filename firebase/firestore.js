import { db } from "./firebase-config.js";

import {

    doc,

    setDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


export async function criarEmpresa(uid,dados){

    await setDoc(

        doc(db,"empresas",uid),

        dados

    );

}


export async function criarUsuario(uid,dados){

    await setDoc(

        doc(db,"usuarios",uid),

        dados

    );

}