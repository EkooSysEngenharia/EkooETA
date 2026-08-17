import { auth } from "../firebase/firebase-config.js";
import {
 listarClientesVT, listarAgendaVT, criarClienteVT, atualizarClienteVT, excluirClienteVT,
 criarAgendaVT, atualizarAgendaVT, excluirAgendaVT,
 listarVisitasVT, criarVisitaVT, atualizarVisitaVT, excluirVisitaVT
} from "../firebase/visitaTecnica.js";

const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const nome=c=>c.nome||c.razaoSocial||"Cliente";
const hoje=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};
const status=a=>a.status==="realizada"?"realizada":(a.dataHora&&new Date(a.dataHora)<new Date()?"atrasada":"agendada");

const apenasNumeros = valor =>
    String(valor || "").replace(/\D/g, "");

function mascaraCpf(valor) {
    return apenasNumeros(valor)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraCnpj(valor) {
    return apenasNumeros(valor)
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}


export async function montarClientesVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>👥 Clientes</h1><p>Cadastro exclusivo da Visita Técnica.</p></div><button id="vtNovoCliente" class="vt-btn-principal">+ Novo cliente</button></header><div id="vtListaClientes" class="vt-lista"></div><div id="vtModalCliente" class="agenda-modal escondido"><div class="agenda-modal-card"><div class="agenda-modal-topo"><h2>Cliente</h2><button id="vtFechaCliente">×</button></div><form id="vtFormCliente"><input id="vtClienteId" type="hidden"><label>Nome / Razão social *</label><input id="vtNome" required><label>Tipo de cadastro *</label>
<div class="vt-tipo-pessoa">
    <label class="vt-opcao-tipo">
        <input
            type="radio"
            name="vtTipoPessoa"
            value="juridica"
            checked
        >
        <span>🏢 Pessoa Jurídica</span>
    </label>

    <label class="vt-opcao-tipo">
        <input
            type="radio"
            name="vtTipoPessoa"
            value="fisica"
        >
        <span>👤 Pessoa Física</span>
    </label>
</div>

<label id="vtLabelDocumento">CNPJ</label>
<input
    id="vtDocumento"
    inputmode="numeric"
    maxlength="18"
    placeholder="00.000.000/0000-00"
>

<div class="agenda-duas-colunas"><div><label>Telefone</label><input id="vtTelefone"></div><div><label>E-mail</label><input id="vtEmail" type="email"></div></div><label>Endereço</label><input id="vtEndereco"><label>Tipo de estabelecimento</label><input id="vtTipo" placeholder="Ex.: supermercado, hotel, indústria"><div class="agenda-acoes-form"><button type="button" id="vtCancelaCliente">Cancelar</button><button class="vt-btn-principal" type="submit">Salvar</button></div></form></div></div></section>`;
 let dados=[];
 const lista=container.querySelector("#vtListaClientes"),modal=container.querySelector("#vtModalCliente"),form=container.querySelector("#vtFormCliente");
 const documentoInput=container.querySelector("#vtDocumento");
 const labelDocumento=container.querySelector("#vtLabelDocumento");
 const radiosTipoPessoa=container.querySelectorAll('input[name="vtTipoPessoa"]');

 function tipoPessoaSelecionado(){
   return container.querySelector('input[name="vtTipoPessoa"]:checked')?.value || "juridica";
 }

 function atualizarTipoPessoa(){
   const tipo=tipoPessoaSelecionado();
   const valorAtual=apenasNumeros(documentoInput.value);

   if(tipo==="fisica"){
     labelDocumento.textContent="CPF";
     documentoInput.maxLength=14;
     documentoInput.placeholder="000.000.000-00";
     documentoInput.value=mascaraCpf(valorAtual);
   }else{
     labelDocumento.textContent="CNPJ";
     documentoInput.maxLength=18;
     documentoInput.placeholder="00.000.000/0000-00";
     documentoInput.value=mascaraCnpj(valorAtual);
   }
 }

 radiosTipoPessoa.forEach(radio=>radio.addEventListener("change",atualizarTipoPessoa));
 documentoInput.addEventListener("input",()=> {
   documentoInput.value =
     tipoPessoaSelecionado()==="fisica"
       ? mascaraCpf(documentoInput.value)
       : mascaraCnpj(documentoInput.value);
 });
 atualizarTipoPessoa();
 async function carregar(){dados=await listarClientesVT(uid);dados.sort((a,b)=>nome(a).localeCompare(nome(b)));lista.innerHTML=dados.length?dados.map(c=>`<article class="vt-item"><div><h3>${esc(nome(c))}</h3><p>${esc(c.tipo||"Tipo não informado")}${c.documento?" • "+esc(c.documento):""}</p><small>${esc(c.telefone||"")}${c.email?" • "+esc(c.email):""}</small></div><div class="vt-item-acoes"><button data-ed="${c.id}">Editar</button><button class="perigo" data-ex="${c.id}">Excluir</button></div></article>`).join(""):`<div class="vt-vazio"><span>👥</span><strong>Nenhum cliente cadastrado.</strong><p>Use “+ Novo cliente” para começar.</p></div>`;
 lista.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editar(b.dataset.ed));lista.querySelectorAll("[data-ex]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir este cliente?")){await excluirClienteVT(b.dataset.ex);await carregar()}})}
 function fechar(){modal.classList.add("escondido");form.reset();container.querySelector("#vtClienteId").value=""}
 function novo(){
 form.reset();
 container.querySelector("#vtClienteId").value="";
 const pj=container.querySelector('input[name="vtTipoPessoa"][value="juridica"]');
 if(pj){pj.checked=true;}
 atualizarTipoPessoa();
 modal.classList.remove("escondido");
}
 function editar(id){const c=dados.find(x=>x.id===id);if(!c)return;container.querySelector("#vtClienteId").value=id;container.querySelector("#vtNome").value=nome(c);
 const radioTipo=container.querySelector(`input[name="vtTipoPessoa"][value="${c.tipoPessoa||"juridica"}"]`);
 if(radioTipo){radioTipo.checked=true;}
 atualizarTipoPessoa();
 documentoInput.value=(c.tipoPessoa==="fisica"?mascaraCpf(c.documento||""):mascaraCnpj(c.documento||""));
 container.querySelector("#vtTelefone").value=c.telefone||"";container.querySelector("#vtEmail").value=c.email||"";container.querySelector("#vtEndereco").value=c.endereco||"";container.querySelector("#vtTipo").value=c.tipo||"";modal.classList.remove("escondido")}
 container.querySelector("#vtNovoCliente").onclick=novo;container.querySelector("#vtFechaCliente").onclick=fechar;container.querySelector("#vtCancelaCliente").onclick=fechar;
 form.onsubmit=async e=>{e.preventDefault();const id=container.querySelector("#vtClienteId").value,d={usuarioId:uid,nome:container.querySelector("#vtNome").value.trim(),tipoPessoa:tipoPessoaSelecionado(),documento:documentoInput.value.trim(),telefone:container.querySelector("#vtTelefone").value.trim(),email:container.querySelector("#vtEmail").value.trim(),endereco:container.querySelector("#vtEndereco").value.trim(),tipo:container.querySelector("#vtTipo").value.trim(),atualizadoEm:new Date().toISOString()};if(id)await atualizarClienteVT(id,d);else await criarClienteVT({...d,criadoEm:new Date().toISOString()});fechar();await carregar()};await carregar();
}

export async function montarAgendaVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;
 const clientes=await listarClientesVT(uid);
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📅 Agenda</h1><p>Agenda exclusiva das visitas técnicas.</p></div><button id="vtNovaAgenda" class="vt-btn-principal">+ Agendar visita</button></header><div id="vtListaAgenda" class="vt-lista"></div><div id="vtModalAgenda" class="agenda-modal escondido"><div class="agenda-modal-card"><div class="agenda-modal-topo"><h2>Agendar visita</h2><button id="vtFechaAgenda">×</button></div><form id="vtFormAgenda"><input id="vtAgendaId" type="hidden"><label>Cliente *</label><select id="vtAgendaCliente" required><option value="">Selecione</option>${clientes.map(c=>`<option value="${c.id}">${esc(nome(c))}</option>`).join("")}</select><label>Data e hora *</label><input id="vtAgendaData" type="datetime-local" required><label>Responsável</label><input id="vtAgendaResp"><label>Observação</label><textarea id="vtAgendaObs" rows="3"></textarea><div class="agenda-acoes-form"><button type="button" id="vtCancelaAgenda">Cancelar</button><button class="vt-btn-principal" type="submit">Salvar</button></div></form></div></div></section>`;
 let dados=[];const lista=container.querySelector("#vtListaAgenda"),modal=container.querySelector("#vtModalAgenda"),form=container.querySelector("#vtFormAgenda");
 async function carregar(){dados=await listarAgendaVT(uid);dados.sort((a,b)=>String(a.dataHora).localeCompare(String(b.dataHora)));lista.innerHTML=dados.length?dados.map(a=>{const s=status(a);return `<article class="vt-item status-${s}"><div><h3>${esc(a.clienteNome)}</h3><p>📅 ${new Date(a.dataHora).toLocaleString("pt-BR")}</p><small>${s==="atrasada"?"🔴 Atrasada":s==="realizada"?"✓ Realizada":"🟢 Agendada"}${a.responsavel?" • "+esc(a.responsavel):""}</small></div><div class="vt-item-acoes">${s!=="realizada"?`<button data-ok="${a.id}">✓ Realizada</button>`:""}<button data-ed="${a.id}">Editar</button><button class="perigo" data-ex="${a.id}">Excluir</button></div></article>`}).join(""):`<div class="vt-vazio"><span>📅</span><strong>Nenhuma visita agendada.</strong></div>`;
 lista.querySelectorAll("[data-ok]").forEach(b=>b.onclick=async()=>{await atualizarAgendaVT(b.dataset.ok,{status:"realizada",realizadaEm:new Date().toISOString()});await carregar()});lista.querySelectorAll("[data-ex]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir este agendamento?")){await excluirAgendaVT(b.dataset.ex);await carregar()}});lista.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editar(b.dataset.ed))}
 function fechar(){modal.classList.add("escondido");form.reset();container.querySelector("#vtAgendaId").value=""}
 function novo(){if(!clientes.length){alert("Cadastre primeiro um cliente da Visita Técnica.");return}form.reset();container.querySelector("#vtAgendaData").value=hoje();modal.classList.remove("escondido")}
 function editar(id){const a=dados.find(x=>x.id===id);if(!a)return;container.querySelector("#vtAgendaId").value=id;container.querySelector("#vtAgendaCliente").value=a.clienteId;container.querySelector("#vtAgendaData").value=a.dataHora;container.querySelector("#vtAgendaResp").value=a.responsavel||"";container.querySelector("#vtAgendaObs").value=a.observacao||"";modal.classList.remove("escondido")}
 container.querySelector("#vtNovaAgenda").onclick=novo;container.querySelector("#vtFechaAgenda").onclick=fechar;container.querySelector("#vtCancelaAgenda").onclick=fechar;
 form.onsubmit=async e=>{e.preventDefault();const id=container.querySelector("#vtAgendaId").value,c=clientes.find(x=>x.id===container.querySelector("#vtAgendaCliente").value),anterior=dados.find(x=>x.id===id),d={usuarioId:uid,clienteId:c.id,clienteNome:nome(c),dataHora:container.querySelector("#vtAgendaData").value,responsavel:container.querySelector("#vtAgendaResp").value.trim(),observacao:container.querySelector("#vtAgendaObs").value.trim(),status:anterior?.status||"agendada",atualizadoEm:new Date().toISOString()};if(id)await atualizarAgendaVT(id,d);else await criarAgendaVT({...d,criadoEm:new Date().toISOString()});fechar();await carregar()};await carregar();
}


export async function montarNovaVisitaVT(container,visitaId=null){
 const uid=auth.currentUser?.uid;if(!uid)return;
 const clientes=await listarClientesVT(uid),visitas=await listarVisitasVT(uid),atual=visitaId?visitas.find(v=>v.id===visitaId):null;
 if(!clientes.length){container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><h1>📋 Nova Visita Técnica</h1></header><section class="vt-bloco"><div class="vt-vazio"><span>👥</span><strong>Cadastre um cliente primeiro.</strong></div></section></section>`;return}
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📋 ${atual?"Editar":"Nova"} Visita Técnica</h1><p>Registro independente da ETA.</p></div></header><section class="vt-bloco"><form id="vtFormVisita" class="vt-form-visita">
 <label>Cliente *</label><select id="vCliente" required><option value="">Selecione</option>${clientes.map(c=>`<option value="${c.id}">${esc(nome(c))}</option>`).join("")}</select>
 <div class="agenda-duas-colunas"><div><label>Data e hora *</label><input id="vData" type="datetime-local" required></div><div><label>Responsável Ekoo Sys</label><input id="vResp"></div></div>
 <label>Local da visita</label><input id="vLocal"><label>Objetivo *</label><input id="vObjetivo" required>
 <label>Descrição / itens verificados *</label><textarea id="vDescricao" rows="7" required></textarea>
 <label>Pendências encontradas</label><textarea id="vPendencias" rows="4"></textarea>
 <label>Orientações / recomendações</label><textarea id="vOrientacoes" rows="4"></textarea>
 <div class="agenda-duas-colunas"><div><label>Prazo combinado</label><input id="vPrazo" type="date"></div><div><label>Status</label><select id="vStatus"><option value="aberta">Em aberto</option><option value="concluida">Concluída</option></select></div></div>
 <label>Observações finais</label><textarea id="vObs" rows="3"></textarea>
 <div class="agenda-acoes-form"><button type="button" id="vCancelar">Cancelar</button><button type="submit" class="vt-btn-principal">Salvar visita técnica</button></div></form></section></section>`;
 const q=s=>container.querySelector(s),set=(s,v="")=>q(s).value=v||"";
 if(atual){set("#vCliente",atual.clienteId);set("#vData",atual.dataHora);set("#vResp",atual.responsavel);set("#vLocal",atual.local);set("#vObjetivo",atual.objetivo);set("#vDescricao",atual.descricao);set("#vPendencias",atual.pendencias);set("#vOrientacoes",atual.orientacoes);set("#vPrazo",atual.prazo);set("#vStatus",atual.status||"aberta");set("#vObs",atual.observacoes)}else set("#vData",hoje());
 q("#vCancelar").onclick=()=>montarHistoricoVT(container);
 q("#vtFormVisita").onsubmit=async e=>{e.preventDefault();const c=clientes.find(x=>x.id===q("#vCliente").value),d={usuarioId:uid,clienteId:c.id,clienteNome:nome(c),dataHora:q("#vData").value,responsavel:q("#vResp").value.trim(),local:q("#vLocal").value.trim(),objetivo:q("#vObjetivo").value.trim(),descricao:q("#vDescricao").value.trim(),pendencias:q("#vPendencias").value.trim(),orientacoes:q("#vOrientacoes").value.trim(),prazo:q("#vPrazo").value,status:q("#vStatus").value,observacoes:q("#vObs").value.trim(),atualizadoEm:new Date().toISOString()};if(atual)await atualizarVisitaVT(atual.id,d);else await criarVisitaVT({...d,criadoEm:new Date().toISOString()});alert("Visita técnica salva com sucesso.");await montarHistoricoVT(container)};
}
export async function montarHistoricoVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;let a=await listarVisitasVT(uid);a.sort((x,y)=>String(y.dataHora).localeCompare(String(x.dataHora)));
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📋 Visitas Técnicas</h1><p>Histórico de visitas registradas.</p></div><button id="vNova" class="vt-btn-principal">+ Nova visita</button></header><div class="vt-lista">${a.length?a.map(v=>`<article class="vt-item"><div><h3>${esc(v.clienteNome)}</h3><p>${esc(v.objetivo)}</p><small>📅 ${new Date(v.dataHora).toLocaleString("pt-BR")} • ${v.status==="concluida"?"✓ Concluída":"🕒 Em aberto"}</small></div><div class="vt-item-acoes"><button data-ve="${v.id}">Editar</button><button class="perigo" data-vx="${v.id}">Excluir</button></div></article>`).join(""):`<div class="vt-vazio"><span>📋</span><strong>Nenhuma visita técnica registrada.</strong></div>`}</div></section>`;
 container.querySelector("#vNova").onclick=()=>montarNovaVisitaVT(container);container.querySelectorAll("[data-ve]").forEach(b=>b.onclick=()=>montarNovaVisitaVT(container,b.dataset.ve));container.querySelectorAll("[data-vx]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir esta visita técnica?")){await excluirVisitaVT(b.dataset.vx);await montarHistoricoVT(container)}});
}
export async function montarRelatoriosVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;const a=(await listarVisitasVT(uid)).filter(v=>v.status==="concluida").sort((x,y)=>String(y.dataHora).localeCompare(String(x.dataHora)));
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📄 Relatórios</h1><p>Visitas concluídas.</p></div></header><div class="vt-lista">${a.length?a.map(v=>`<article class="vt-item"><div><h3>${esc(v.clienteNome)}</h3><p>${esc(v.objetivo)}</p><small>📅 ${new Date(v.dataHora).toLocaleString("pt-BR")} • ✓ Concluída</small></div></article>`).join(""):`<div class="vt-vazio"><span>📄</span><strong>Nenhuma visita concluída ainda.</strong></div>`}</div></section>`;
}
