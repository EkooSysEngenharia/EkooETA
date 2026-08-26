import { auth } from "../firebase/firebase-config.js";
import {
 listarClientesVT, listarAgendaVT, criarClienteVT, atualizarClienteVT, excluirClienteVT,
 criarAgendaVT, atualizarAgendaVT, excluirAgendaVT,
 listarVisitasVT, novoIdVisitaVT, criarVisitaVTComId, atualizarVisitaVT, excluirVisitaVT,
 listarCondicionantesVT, criarCondicionanteVT, atualizarCondicionanteVT, excluirCondicionanteVT,
 listarFotosVisitaTecnicaPorVisita, criarFotoVisitaTecnica, excluirFotoVisitaTecnica
} from "../firebase/visitaTecnica.js";

const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const nome=c=>c.nome||c.razaoSocial||"Cliente";
const hoje=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};
const status=a=>a.status==="realizada"?"realizada":(a.dataHora&&new Date(a.dataHora)<new Date()?"atrasada":"agendada");

const VT_FOTO_MAX_LADO=1280;
const VT_FOTO_QUALIDADE=.72;
function vtLerImagem(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error("Não foi possível ler a foto."));
  reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>reject(new Error("Imagem inválida."));
   img.onload=()=>{
    let w=img.width,h=img.height;
    const escala=Math.min(1,VT_FOTO_MAX_LADO/Math.max(w,h));w=Math.round(w*escala);h=Math.round(h*escala);
    const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
    resolve({dataUrl:c.toDataURL("image/jpeg",VT_FOTO_QUALIDADE),nome:file.name||"foto.jpg",criadaEm:new Date().toISOString()});
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}


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
 async function carregar(){dados=await listarClientesVT(uid);dados.sort((a,b)=>nome(a).localeCompare(nome(b)));lista.innerHTML=dados.length?dados.map(c=>`<article class="vt-item"><div><h3>${esc(nome(c))}</h3><p>${esc(c.tipo||"Tipo não informado")}${c.documento?" • "+esc(c.documento):""}</p><small>${esc(c.telefone||"")}${c.email?" • "+esc(c.email):""}</small></div><div class="vt-item-acoes"><button class="vt-btn-cond" data-cond="${c.id}">Condicionantes</button><button data-ed="${c.id}">Editar</button><button class="perigo" data-ex="${c.id}">Excluir</button></div></article>`).join(""):`<div class="vt-vazio"><span>👥</span><strong>Nenhum cliente cadastrado.</strong><p>Use “+ Novo cliente” para começar.</p></div>`;
 lista.querySelectorAll("[data-cond]").forEach(b=>b.onclick=()=>montarCondicionantesVT(container,b.dataset.cond));
 lista.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editar(b.dataset.ed));
 lista.querySelectorAll("[data-ex]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir este cliente?")){await excluirClienteVT(b.dataset.ex);await carregar()}})}
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


export async function montarCondicionantesVT(container,clienteId){
 const uid=auth.currentUser?.uid;if(!uid)return;
 const clientes=await listarClientesVT(uid);
 const cliente=clientes.find(c=>c.id===clienteId);
 if(!cliente){alert("Cliente não encontrado.");return;}

 container.innerHTML=`<section class="vt-dashboard">
 <header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica • Cliente</p><h1>📋 Condicionantes Ambientais</h1><p><strong>${esc(nome(cliente))}</strong> — checklist específico deste cliente.</p></div><div class="vt-header-acoes"><button id="condVoltar" class="vt-btn-secundario">← Clientes</button><button id="condNova" class="vt-btn-principal">+ Nova condicionante</button></div></header>
 <div id="condLista" class="vt-cond-lista"></div>
 <div id="condModal" class="agenda-modal escondido"><div class="agenda-modal-card"><div class="agenda-modal-topo"><h2>Condicionante ambiental</h2><button id="condFecha">×</button></div>
 <form id="condForm"><input id="condId" type="hidden">
 <div class="agenda-duas-colunas"><div><label>Item</label><input id="condItem" placeholder="Ex.: 8.1"></div><div><label>Quem executa *</label><input id="condExecuta" required placeholder="Ex.: Cliente, Ekoo, Geólogo"></div></div>
 <label>Descrição *</label><input id="condDescricao" required placeholder="Ex.: PPCI">
 <label>Quando executa *</label><input id="condQuando" required placeholder="Ex.: Anual, Maio e Nov., 20/03/2027">
 <label>Observação da condicionante</label><textarea id="condObs" rows="3"></textarea>
 <div class="agenda-acoes-form"><button type="button" id="condCancela">Cancelar</button><button type="submit" class="vt-btn-principal">Salvar condicionante</button></div>
 </form></div></div></section>`;

 let dados=[];
 const lista=container.querySelector("#condLista"),modal=container.querySelector("#condModal"),form=container.querySelector("#condForm");
 const q=s=>container.querySelector(s);

 async function carregar(){
   dados=await listarCondicionantesVT(uid,clienteId);
   dados.sort((a,b)=>String(a.item||"").localeCompare(String(b.item||""),undefined,{numeric:true}));
   lista.innerHTML=dados.length?`
   <div class="vt-cond-tabela-wrap"><table class="vt-cond-tabela"><thead><tr><th>Item</th><th>Descrição</th><th>Quem executa</th><th>Quando executa</th><th>Ações</th></tr></thead><tbody>
   ${dados.map(c=>`<tr><td>${esc(c.item||"—")}</td><td><strong>${esc(c.descricao)}</strong>${c.observacao?`<small>${esc(c.observacao)}</small>`:""}</td><td>${esc(c.quemExecuta)}</td><td>${esc(c.quandoExecuta)}</td><td><div class="vt-item-acoes"><button data-ce="${c.id}">Editar</button><button class="perigo" data-cx="${c.id}">Excluir</button></div></td></tr>`).join("")}
   </tbody></table></div>`:`<div class="vt-vazio"><span>📋</span><strong>Nenhuma condicionante cadastrada.</strong><p>Cadastre aqui os itens específicos da licença e das obrigações deste cliente.</p></div>`;
   lista.querySelectorAll("[data-ce]").forEach(b=>b.onclick=()=>editar(b.dataset.ce));
   lista.querySelectorAll("[data-cx]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir esta condicionante?")){await excluirCondicionanteVT(b.dataset.cx);await carregar()}});
 }
 function fechar(){modal.classList.add("escondido");form.reset();q("#condId").value=""}
 function novo(){form.reset();q("#condId").value="";modal.classList.remove("escondido")}
 function editar(id){const c=dados.find(x=>x.id===id);if(!c)return;q("#condId").value=id;q("#condItem").value=c.item||"";q("#condDescricao").value=c.descricao||"";q("#condExecuta").value=c.quemExecuta||"";q("#condQuando").value=c.quandoExecuta||"";q("#condObs").value=c.observacao||"";modal.classList.remove("escondido")}
 q("#condVoltar").onclick=()=>montarClientesVT(container);q("#condNova").onclick=novo;q("#condFecha").onclick=fechar;q("#condCancela").onclick=fechar;
 form.onsubmit=async e=>{e.preventDefault();const id=q("#condId").value,d={usuarioId:uid,clienteId,item:q("#condItem").value.trim(),descricao:q("#condDescricao").value.trim(),quemExecuta:q("#condExecuta").value.trim(),quandoExecuta:q("#condQuando").value.trim(),observacao:q("#condObs").value.trim(),atualizadoEm:new Date().toISOString()};if(id)await atualizarCondicionanteVT(id,d);else await criarCondicionanteVT({...d,criadoEm:new Date().toISOString()});fechar();await carregar()};
 await carregar();
}

export async function montarAgendaVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;
 const clientes=await listarClientesVT(uid);
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📅 Agenda</h1><p>Agenda exclusiva das visitas técnicas.</p></div><div class="vt-header-acoes"><button id="vtNovaVisitaDireta" class="vt-btn-secundario">+ Nova visita técnica</button><button id="vtNovaAgenda" class="vt-btn-principal">+ Agendar visita</button></div></header><div id="vtListaAgenda" class="vt-lista"></div><div id="vtModalAgenda" class="agenda-modal escondido"><div class="agenda-modal-card"><div class="agenda-modal-topo"><h2>Agendar visita</h2><button id="vtFechaAgenda">×</button></div><form id="vtFormAgenda"><input id="vtAgendaId" type="hidden"><label>Cliente *</label><select id="vtAgendaCliente" required><option value="">Selecione</option>${clientes.map(c=>`<option value="${c.id}">${esc(nome(c))}</option>`).join("")}</select><label>Data e hora *</label><input id="vtAgendaData" type="datetime-local" required><label>Responsável</label><input id="vtAgendaResp"><label>Observação</label><textarea id="vtAgendaObs" rows="3"></textarea><div class="agenda-acoes-form"><button type="button" id="vtCancelaAgenda">Cancelar</button><button class="vt-btn-principal" type="submit">Salvar</button></div></form></div></div></section>`;
 let dados=[];const lista=container.querySelector("#vtListaAgenda"),modal=container.querySelector("#vtModalAgenda"),form=container.querySelector("#vtFormAgenda");
 async function carregar(){dados=await listarAgendaVT(uid);dados.sort((a,b)=>String(a.dataHora).localeCompare(String(b.dataHora)));lista.innerHTML=dados.length?dados.map(a=>{const s=status(a);return `<article class="vt-item status-${s}"><div><h3>${esc(a.clienteNome)}</h3><p>📅 ${new Date(a.dataHora).toLocaleString("pt-BR")}</p><small>${s==="atrasada"?"🔴 Atrasada":s==="realizada"?"✓ Realizada":"🟢 Agendada"}${a.responsavel?" • "+esc(a.responsavel):""}</small></div><div class="vt-item-acoes">${s!=="realizada"?`<button class="vt-btn-cond" data-iniciar="${a.id}">▶ Iniciar visita</button><button data-ok="${a.id}">✓ Realizada</button>`:""}<button data-ed="${a.id}">Editar</button><button class="perigo" data-ex="${a.id}">Excluir</button></div></article>`}).join(""):`<div class="vt-vazio"><span>📅</span><strong>Nenhuma visita agendada.</strong></div>`;
 lista.querySelectorAll("[data-iniciar]").forEach(b=>b.onclick=()=>{const a=dados.find(x=>x.id===b.dataset.iniciar);if(a)montarNovaVisitaVT(container,null,{clienteId:a.clienteId,dataHora:a.dataHora,responsavel:a.responsavel||"",agendaId:a.id})});
 lista.querySelectorAll("[data-ok]").forEach(b=>b.onclick=async()=>{await atualizarAgendaVT(b.dataset.ok,{status:"realizada",realizadaEm:new Date().toISOString()});await carregar()});lista.querySelectorAll("[data-ex]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir este agendamento?")){await excluirAgendaVT(b.dataset.ex);await carregar()}});lista.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editar(b.dataset.ed))}
 function fechar(){modal.classList.add("escondido");form.reset();container.querySelector("#vtAgendaId").value=""}
 function novo(){if(!clientes.length){alert("Cadastre primeiro um cliente da Visita Técnica.");return}form.reset();container.querySelector("#vtAgendaData").value=hoje();modal.classList.remove("escondido")}
 function editar(id){const a=dados.find(x=>x.id===id);if(!a)return;container.querySelector("#vtAgendaId").value=id;container.querySelector("#vtAgendaCliente").value=a.clienteId;container.querySelector("#vtAgendaData").value=a.dataHora;container.querySelector("#vtAgendaResp").value=a.responsavel||"";container.querySelector("#vtAgendaObs").value=a.observacao||"";modal.classList.remove("escondido")}
 container.querySelector("#vtNovaVisitaDireta").onclick=()=>montarNovaVisitaVT(container);container.querySelector("#vtNovaAgenda").onclick=novo;container.querySelector("#vtFechaAgenda").onclick=fechar;container.querySelector("#vtCancelaAgenda").onclick=fechar;
 form.onsubmit=async e=>{e.preventDefault();const id=container.querySelector("#vtAgendaId").value,c=clientes.find(x=>x.id===container.querySelector("#vtAgendaCliente").value),anterior=dados.find(x=>x.id===id),d={usuarioId:uid,clienteId:c.id,clienteNome:nome(c),dataHora:container.querySelector("#vtAgendaData").value,responsavel:container.querySelector("#vtAgendaResp").value.trim(),observacao:container.querySelector("#vtAgendaObs").value.trim(),status:anterior?.status||"agendada",atualizadoEm:new Date().toISOString()};if(id)await atualizarAgendaVT(id,d);else await criarAgendaVT({...d,criadoEm:new Date().toISOString()});fechar();await carregar()};await carregar();
}


export async function montarNovaVisitaVT(container,visitaId=null,preselecionado=null){
 const uid=auth.currentUser?.uid;if(!uid)return;
 const clientes=await listarClientesVT(uid),visitas=await listarVisitasVT(uid),atual=visitaId?visitas.find(v=>v.id===visitaId):null;
 if(!clientes.length){container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><h1>📋 Nova Visita Técnica</h1></header><section class="vt-bloco"><div class="vt-vazio"><span>👥</span><strong>Cadastre um cliente primeiro.</strong></div></section></section>`;return}

 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📋 ${atual?"Editar":"Nova"} Visita Técnica</h1><p>Selecione o cliente para carregar automaticamente suas condicionantes.</p></div></header>
 <section class="vt-bloco"><form id="vtFormVisita" class="vt-form-visita">
 <label>Cliente *</label><select id="vCliente" required><option value="">Selecione</option>${clientes.map(c=>`<option value="${c.id}">${esc(nome(c))}</option>`).join("")}</select>
 <div class="agenda-duas-colunas"><div><label>Data e hora *</label><input id="vData" type="datetime-local" required></div><div><label>Responsável Ekoo Sys</label><input id="vResp"></div></div>
 <label>Local da visita</label><input id="vLocal">
 <div class="vt-checklist-topo"><div><h2>Condicionantes ambientais</h2><p>Marque a situação verificada nesta visita.</p></div></div>
 <div id="vChecklist"><div class="vt-vazio compacto"><span>📋</span><strong>Selecione um cliente.</strong><p>As condicionantes cadastradas para ele aparecerão aqui.</p></div></div>
 <section class="vt-fotos-bloco"><div class="vt-fotos-topo"><div><h2>📷 Registro fotográfico</h2><p>Adicione fotos tiradas agora ou escolha imagens da galeria.</p></div><span id="vFotoContador" class="vt-foto-contador">0 fotos</span></div>
 <div class="vt-foto-acoes"><button type="button" id="vAbrirCamera" class="vt-btn-principal">📷 Tirar foto</button><button type="button" id="vAbrirGaleria" class="vt-btn-secundario">🖼️ Escolher da galeria</button></div>
 <input id="vInputCamera" type="file" accept="image/*" capture="environment" hidden>
 <input id="vInputGaleria" type="file" accept="image/*" multiple hidden>
 <div id="vFotosPreview" class="vt-fotos-grid"><div class="vt-vazio compacto"><span>📷</span><strong>Nenhuma foto adicionada.</strong></div></div></section>
 <label>Observações gerais da visita</label><textarea id="vObs" rows="4" placeholder="Informações gerais que não pertencem a uma condicionante específica."></textarea>
 <div class="agenda-acoes-form"><button type="button" id="vCancelar">Cancelar</button><button type="submit" class="vt-btn-principal">Salvar visita técnica</button></div>
 </form></section></section>`;

 const q=s=>container.querySelector(s),set=(s,v="")=>q(s).value=v||"";
 let condicionantesAtuais=[];
 // Fotos já salvas (uma por documento no Firestore) + fotos novas ainda não salvas (sem "id").
 let fotosVisita=atual?(await listarFotosVisitaTecnicaPorVisita(uid,atual.id)):[];
 if(atual&&!fotosVisita.length&&atual.fotos?.length)fotosVisita=atual.fotos.map(f=>({...f})); // compatibilidade com visitas antigas
 function renderFotos(){
  const area=q("#vFotosPreview"),contador=q("#vFotoContador");
  contador.textContent=`${fotosVisita.length} ${fotosVisita.length===1?"foto":"fotos"}`;
  area.innerHTML=fotosVisita.length?fotosVisita.map((f,i)=>`<figure class="vt-foto-card"><img src="${f.dataUrl}" alt="Registro fotográfico ${i+1}"><figcaption><span>Foto ${i+1}</span><button type="button" class="perigo" data-remover-foto="${i}">Excluir</button></figcaption></figure>`).join(""):`<div class="vt-vazio compacto"><span>📷</span><strong>Nenhuma foto adicionada.</strong></div>`;
  area.querySelectorAll("[data-remover-foto]").forEach(b=>b.onclick=async()=>{
   const i=Number(b.dataset.removerFoto),f=fotosVisita[i];
   if(f.id)await excluirFotoVisitaTecnica(f.id); // já estava salva no Firestore
   fotosVisita.splice(i,1);renderFotos();
  });
 }
 async function adicionarFotos(files){
  for(const file of [...files]){
   if(!file.type.startsWith("image/"))continue;
   try{fotosVisita.push(await vtLerImagem(file));renderFotos()}catch(e){alert(e.message)}
  }
 }
 q("#vAbrirCamera").onclick=()=>q("#vInputCamera").click();
 q("#vAbrirGaleria").onclick=()=>q("#vInputGaleria").click();
 q("#vInputCamera").onchange=async e=>{await adicionarFotos(e.target.files);e.target.value=""};
 q("#vInputGaleria").onchange=async e=>{await adicionarFotos(e.target.files);e.target.value=""};
 renderFotos();

 function renderChecklist(condicionantes,respostas=[]){
   condicionantesAtuais=condicionantes;
   const mapa=new Map((respostas||[]).map(r=>[r.condicionanteId,r]));
   q("#vChecklist").innerHTML=condicionantes.length?`<div class="vt-checklist">${condicionantes.map((c,i)=>{
     const r=mapa.get(c.id)||{};
     return `<article class="vt-check-item" data-check-id="${c.id}">
       <div class="vt-check-info"><span class="vt-check-num">${esc(c.item||String(i+1))}</span><div><h3>${esc(c.descricao)}</h3><p><strong>Quem executa:</strong> ${esc(c.quemExecuta)} &nbsp; • &nbsp; <strong>Quando:</strong> ${esc(c.quandoExecuta)}</p>${c.observacao?`<small>${esc(c.observacao)}</small>`:""}</div></div>
       <div class="vt-status-opcoes">
        <label class="ok"><input type="radio" name="st_${c.id}" value="OK" ${r.status==="OK"?"checked":""}><span>✓ OK</span></label>
        <label class="nok"><input type="radio" name="st_${c.id}" value="NOK" ${r.status==="NOK"?"checked":""}><span>✕ NOK</span></label>
        <label class="nv"><input type="radio" name="st_${c.id}" value="NAO_VERIFICADO" ${!r.status||r.status==="NAO_VERIFICADO"?"checked":""}><span>— Não verificado</span></label>
       </div>
       <label>Observação deste item</label><textarea class="vCheckObs" rows="2" placeholder="Opcional">${esc(r.observacao||"")}</textarea>
     </article>`;
   }).join("")}</div>`:`<div class="vt-vazio compacto"><span>⚠️</span><strong>Este cliente ainda não possui condicionantes.</strong><p>Vá em Clientes → Condicionantes e cadastre os itens antes de realizar a visita.</p></div>`;
 }

 async function carregarCliente(clienteId,respostas=[]){
   if(!clienteId){renderChecklist([],[]);return}
   const cs=await listarCondicionantesVT(uid,clienteId);
   cs.sort((a,b)=>String(a.item||"").localeCompare(String(b.item||""),undefined,{numeric:true}));
   renderChecklist(cs,respostas);
 }

 q("#vCliente").addEventListener("change",()=>carregarCliente(q("#vCliente").value,[]));

 if(atual){
   set("#vCliente",atual.clienteId);set("#vData",atual.dataHora);set("#vResp",atual.responsavel);set("#vLocal",atual.local);set("#vObs",atual.observacoes);
   // Usa o snapshot salvo na visita antiga para preservar o histórico mesmo se a condicionante mudar depois.
   if(atual.checklist?.length){
     const snapshot=atual.checklist.map((r,i)=>({id:r.condicionanteId||`historico_${i}`,item:r.item,descricao:r.descricao,quemExecuta:r.quemExecuta,quandoExecuta:r.quandoExecuta,observacaoCondicionante:r.observacaoCondicionante}));
     condicionantesAtuais=snapshot;
     q("#vChecklist").innerHTML=`<div class="vt-checklist">${atual.checklist.map((r,i)=>`<article class="vt-check-item" data-check-id="${r.condicionanteId||`historico_${i}`}"><div class="vt-check-info"><span class="vt-check-num">${esc(r.item||String(i+1))}</span><div><h3>${esc(r.descricao)}</h3><p><strong>Quem executa:</strong> ${esc(r.quemExecuta||"")} &nbsp; • &nbsp; <strong>Quando:</strong> ${esc(r.quandoExecuta||"")}</p></div></div><div class="vt-status-opcoes"><label class="ok"><input type="radio" name="st_${r.condicionanteId||`historico_${i}`}" value="OK" ${r.status==="OK"?"checked":""}><span>✓ OK</span></label><label class="nok"><input type="radio" name="st_${r.condicionanteId||`historico_${i}`}" value="NOK" ${r.status==="NOK"?"checked":""}><span>✕ NOK</span></label><label class="nv"><input type="radio" name="st_${r.condicionanteId||`historico_${i}`}" value="NAO_VERIFICADO" ${r.status==="NAO_VERIFICADO"?"checked":""}><span>— Não verificado</span></label></div><label>Observação deste item</label><textarea class="vCheckObs" rows="2">${esc(r.observacao||"")}</textarea></article>`).join("")}</div>`;
   } else await carregarCliente(atual.clienteId,[]);
 } else {
   set("#vData",preselecionado?.dataHora||hoje());
   if(preselecionado?.clienteId){set("#vCliente",preselecionado.clienteId);await carregarCliente(preselecionado.clienteId,[])}
   if(preselecionado?.responsavel)set("#vResp",preselecionado.responsavel);
 }

 q("#vCancelar").onclick=()=>montarHistoricoVT(container);

 q("#vtFormVisita").onsubmit=async e=>{
   e.preventDefault();
   const c=clientes.find(x=>x.id===q("#vCliente").value);
   if(!c)return;
   const cards=[...container.querySelectorAll(".vt-check-item")];
   const checklist=cards.map((card,i)=>{
     const base=condicionantesAtuais[i]||{};
     const statusMarcado=card.querySelector('input[type="radio"]:checked')?.value||"NAO_VERIFICADO";
     return {
       condicionanteId: base.id||card.dataset.checkId,
       item: base.item||"",
       descricao: base.descricao||"",
       quemExecuta: base.quemExecuta||"",
       quandoExecuta: base.quandoExecuta||"",
       observacaoCondicionante: base.observacao||base.observacaoCondicionante||"",
       status: statusMarcado,
       observacao: card.querySelector(".vCheckObs")?.value.trim()||""
     };
   });
   const d={usuarioId:uid,clienteId:c.id,clienteNome:nome(c),dataHora:q("#vData").value,responsavel:q("#vResp").value.trim(),local:q("#vLocal").value.trim(),checklist,observacoes:q("#vObs").value.trim(),fotosQtd:fotosVisita.length,status:"concluida",atualizadoEm:new Date().toISOString()};
   let visitaId=atual?.id;
   if(atual)await atualizarVisitaVT(atual.id,d);
   else{visitaId=novoIdVisitaVT();await criarVisitaVTComId(visitaId,{...d,criadoEm:new Date().toISOString()})}
   // Salva no Firestore só as fotos novas (as que já tinham "id" já estão salvas). Cada foto é um documento próprio,
   // então o número de fotos deixa de ser limitado pelo tamanho máximo (1MB) do documento da visita.
   for(const f of fotosVisita.filter(f=>!f.id)){
    await criarFotoVisitaTecnica({usuarioId:uid,visitaId,dataUrl:f.dataUrl,nome:f.nome,criadaEm:f.criadaEm});
   }
   if(!atual&&preselecionado?.agendaId)await atualizarAgendaVT(preselecionado.agendaId,{status:"realizada",realizadaEm:new Date().toISOString(),atualizadoEm:new Date().toISOString()});
   alert("Visita técnica salva com sucesso.");
   await montarHistoricoVT(container);
 };
}

export async function montarHistoricoVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;let a=await listarVisitasVT(uid);a.sort((x,y)=>String(y.dataHora).localeCompare(String(x.dataHora)));
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📋 Visitas Técnicas</h1><p>Histórico de visitas registradas.</p></div><button id="vNova" class="vt-btn-principal">+ Nova visita</button></header><div class="vt-lista">${a.length?a.map(v=>`<article class="vt-item"><div><h3>${esc(v.clienteNome)}</h3><p>${v.checklist?.length?`✓ ${v.checklist.filter(x=>x.status==="OK").length} OK • ✕ ${v.checklist.filter(x=>x.status==="NOK").length} NOK • — ${v.checklist.filter(x=>x.status==="NAO_VERIFICADO").length} não verificados`:esc(v.objetivo||"Visita técnica")}</p><small>📅 ${new Date(v.dataHora).toLocaleString("pt-BR")} • ${v.status==="concluida"?"✓ Concluída":"🕒 Em aberto"}${(v.fotosQtd??v.fotos?.length??0)?` • 📷 ${v.fotosQtd??v.fotos.length} foto${(v.fotosQtd??v.fotos.length)===1?"":"s"}`:""}</small></div><div class="vt-item-acoes"><button data-ve="${v.id}">Editar</button><button class="perigo" data-vx="${v.id}">Excluir</button></div></article>`).join(""):`<div class="vt-vazio"><span>📋</span><strong>Nenhuma visita técnica registrada.</strong></div>`}</div></section>`;
 container.querySelector("#vNova").onclick=()=>montarNovaVisitaVT(container);container.querySelectorAll("[data-ve]").forEach(b=>b.onclick=()=>montarNovaVisitaVT(container,b.dataset.ve));container.querySelectorAll("[data-vx]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir esta visita técnica?")){const fotos=await listarFotosVisitaTecnicaPorVisita(uid,b.dataset.vx);for(const f of fotos)await excluirFotoVisitaTecnica(f.id);await excluirVisitaVT(b.dataset.vx);await montarHistoricoVT(container)}});
}
function vtStatusLabel(status){return status==="OK"?"OK":status==="NOK"?"NOK":"Não verificado"}
function vtDataBR(valor){if(!valor)return "—";const d=new Date(valor);return Number.isNaN(d.getTime())?valor:d.toLocaleString("pt-BR")}
function vtNomeArquivo(t){return String(t||"cliente").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"")}
function vtXml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function vtBaixar(c,n,t){const b=new Blob([c],{type:t}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function vtGerarExcel(v){
 const itens=v.checklist||[],ok=itens.filter(x=>x.status==="OK").length,nok=itens.filter(x=>x.status==="NOK").length,nv=itens.filter(x=>x.status==="NAO_VERIFICADO").length;
 const rows=itens.map((x,i)=>`<Row><Cell ss:StyleID="center"><Data ss:Type="String">${vtXml(x.item||i+1)}</Data></Cell><Cell ss:StyleID="wrap"><Data ss:Type="String">${vtXml(x.descricao)}</Data></Cell><Cell><Data ss:Type="String">${vtXml(x.quemExecuta)}</Data></Cell><Cell><Data ss:Type="String">${vtXml(x.quandoExecuta)}</Data></Cell><Cell ss:StyleID="${x.status==="OK"?"ok":x.status==="NOK"?"nok":"nv"}"><Data ss:Type="String">${vtXml(vtStatusLabel(x.status))}</Data></Cell><Cell ss:StyleID="wrap"><Data ss:Type="String">${vtXml(x.observacao||"")}</Data></Cell></Row>`).join("");
 const xml=`<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles>
 <Style ss:ID="Default"><Alignment ss:Vertical="Top"/><Font ss:FontName="Aptos" ss:Size="10"/></Style>
 <Style ss:ID="title"><Alignment ss:Vertical="Center"/><Font ss:Size="18" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#078C45" ss:Pattern="Solid"/></Style>
 <Style ss:ID="label"><Font ss:Bold="1" ss:Color="#087C43"/><Interior ss:Color="#EAF8F0" ss:Pattern="Solid"/></Style>
 <Style ss:ID="head"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#078C45" ss:Pattern="Solid"/></Style>
 <Style ss:ID="wrap"><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style><Style ss:ID="center"><Alignment ss:Horizontal="Center"/></Style>
 <Style ss:ID="ok"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#087C43"/><Interior ss:Color="#E8F8EF" ss:Pattern="Solid"/></Style>
 <Style ss:ID="nok"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#B42318"/><Interior ss:Color="#FFF0F0" ss:Pattern="Solid"/></Style>
 <Style ss:ID="nv"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#56615C"/><Interior ss:Color="#F2F4F3" ss:Pattern="Solid"/></Style></Styles>
 <Worksheet ss:Name="Relatório da Visita"><Table><Column ss:Width="55"/><Column ss:Width="220"/><Column ss:Width="110"/><Column ss:Width="120"/><Column ss:Width="95"/><Column ss:Width="240"/>
 <Row ss:Height="34"><Cell ss:MergeAcross="5" ss:StyleID="title"><Data ss:Type="String">Ekoo Sys Engenharia — Relatório de Visita Técnica</Data></Cell></Row><Row><Cell ss:MergeAcross="5"><Data ss:Type="String"></Data></Cell></Row>
 <Row><Cell ss:StyleID="label"><Data ss:Type="String">Cliente</Data></Cell><Cell ss:MergeAcross="4"><Data ss:Type="String">${vtXml(v.clienteNome)}</Data></Cell></Row>
 <Row><Cell ss:StyleID="label"><Data ss:Type="String">Data</Data></Cell><Cell><Data ss:Type="String">${vtXml(vtDataBR(v.dataHora))}</Data></Cell><Cell ss:StyleID="label"><Data ss:Type="String">Responsável</Data></Cell><Cell ss:MergeAcross="2"><Data ss:Type="String">${vtXml(v.responsavel||"—")}</Data></Cell></Row>
 <Row><Cell ss:StyleID="label"><Data ss:Type="String">Local</Data></Cell><Cell ss:MergeAcross="4"><Data ss:Type="String">${vtXml(v.local||"—")}</Data></Cell></Row>
 <Row><Cell ss:StyleID="label"><Data ss:Type="String">Resumo</Data></Cell><Cell ss:MergeAcross="4"><Data ss:Type="String">${ok} OK | ${nok} NOK | ${nv} não verificados</Data></Cell></Row><Row><Cell ss:MergeAcross="5"><Data ss:Type="String"></Data></Cell></Row>
 <Row ss:Height="28"><Cell ss:StyleID="head"><Data ss:Type="String">Item</Data></Cell><Cell ss:StyleID="head"><Data ss:Type="String">Condicionante</Data></Cell><Cell ss:StyleID="head"><Data ss:Type="String">Quem executa</Data></Cell><Cell ss:StyleID="head"><Data ss:Type="String">Quando executa</Data></Cell><Cell ss:StyleID="head"><Data ss:Type="String">Status</Data></Cell><Cell ss:StyleID="head"><Data ss:Type="String">Observação</Data></Cell></Row>${rows}
 <Row><Cell ss:MergeAcross="5"><Data ss:Type="String"></Data></Cell></Row><Row><Cell ss:StyleID="label"><Data ss:Type="String">Observações gerais</Data></Cell><Cell ss:MergeAcross="4" ss:StyleID="wrap"><Data ss:Type="String">${vtXml(v.observacoes||"Sem observações gerais.")}</Data></Cell></Row>
 </Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>8</SplitHorizontal><TopRowBottomPane>8</TopRowBottomPane></WorksheetOptions></Worksheet></Workbook>`;
 vtBaixar("\ufeff"+xml,`Visita_Tecnica_${vtNomeArquivo(v.clienteNome)}_${String(v.dataHora||"").slice(0,10)}.xls`,"application/vnd.ms-excel;charset=utf-8");
}
async function vtFotosDaVisita(v){return v.fotos?.length?v.fotos:await listarFotosVisitaTecnicaPorVisita(v.usuarioId,v.id)}
async function vtGerarPDF(v){
 const fotos=await vtFotosDaVisita(v);
 const itens=v.checklist||[],ok=itens.filter(x=>x.status==="OK").length,nok=itens.filter(x=>x.status==="NOK").length,nv=itens.filter(x=>x.status==="NAO_VERIFICADO").length;
 const linhas=itens.map((x,i)=>`<tr><td class="item">${esc(x.item||i+1)}</td><td><strong>${esc(x.descricao||"")}</strong>${x.observacaoCondicionante?`<small>${esc(x.observacaoCondicionante)}</small>`:""}</td><td>${esc(x.quemExecuta||"—")}</td><td>${esc(x.quandoExecuta||"—")}</td><td><span class="status ${x.status==="OK"?"ok":x.status==="NOK"?"nok":"nv"}">${esc(vtStatusLabel(x.status))}</span></td><td>${esc(x.observacao||"—")}</td></tr>`).join("");
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Visita Técnica</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#24332b;margin:0;font-size:10px}.top{border-bottom:4px solid #078c45;padding-bottom:12px;display:flex;justify-content:space-between;align-items:center}.brand{font-size:22px;font-weight:800;color:#078c45}.brand small{display:block;font-size:9px;color:#68756e;letter-spacing:1px;margin-top:3px}.doc{text-align:right}.doc strong{display:block;font-size:16px}.doc span{color:#6b7771}.info{margin:18px 0;display:grid;grid-template-columns:1.3fr 1fr;gap:8px}.box{border:1px solid #dce6e1;border-radius:8px;padding:10px}.box label{display:block;color:#738078;font-size:8px;text-transform:uppercase;font-weight:bold;margin-bottom:4px}.box strong{font-size:11px}.resumo{display:flex;gap:8px;margin:12px 0 16px}.pill{flex:1;text-align:center;border-radius:8px;padding:9px;font-weight:bold}.pill b{font-size:18px;display:block}.ok{background:#e8f8ef;color:#087c43}.nok{background:#fff0f0;color:#b42318}.nv{background:#f2f4f3;color:#56615c}h2{font-size:13px;color:#087c43;margin:18px 0 8px}table{width:100%;border-collapse:collapse;table-layout:fixed}th{background:#078c45;color:white;padding:7px 5px;text-align:left;font-size:8px}td{padding:7px 5px;border-bottom:1px solid #e2e9e5;vertical-align:top;word-wrap:break-word}th:nth-child(1){width:7%}th:nth-child(2){width:26%}th:nth-child(3){width:13%}th:nth-child(4){width:14%}th:nth-child(5){width:13%}th:nth-child(6){width:27%}.item{text-align:center;font-weight:bold;color:#087c43}.status{display:inline-block;border-radius:12px;padding:4px 7px;font-weight:bold;white-space:nowrap}.status.ok{background:#e8f8ef}.status.nok{background:#fff0f0}.status.nv{background:#f2f4f3}td small{display:block;color:#7a857f;margin-top:3px}.obs{background:#f7faf8;border-left:4px solid #078c45;padding:10px;white-space:pre-wrap}.fotos{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.foto{border:1px solid #dce6e1;border-radius:7px;padding:5px;page-break-inside:avoid}.foto img{display:block;width:100%;height:180px;object-fit:cover;border-radius:4px}.foto small{display:block;padding:5px 2px 1px;color:#6b7771}.rodape{margin-top:24px;padding-top:8px;border-top:1px solid #dce6e1;color:#7a857f;display:flex;justify-content:space-between;font-size:8px}tr{page-break-inside:avoid}</style></head><body><div class="top"><div class="brand">EKOO SYS<small>ENGENHARIA & GESTÃO AMBIENTAL</small></div><div class="doc"><strong>Relatório de Visita Técnica</strong><span>${esc(vtDataBR(v.dataHora))}</span></div></div><div class="info"><div class="box"><label>Cliente</label><strong>${esc(v.clienteNome||"—")}</strong></div><div class="box"><label>Responsável Ekoo Sys</label><strong>${esc(v.responsavel||"—")}</strong></div><div class="box"><label>Local da visita</label><strong>${esc(v.local||"—")}</strong></div><div class="box"><label>Data e hora</label><strong>${esc(vtDataBR(v.dataHora))}</strong></div></div><div class="resumo"><div class="pill ok"><b>${ok}</b>Itens OK</div><div class="pill nok"><b>${nok}</b>Itens NOK</div><div class="pill nv"><b>${nv}</b>Não verificados</div></div><h2>Checklist de condicionantes ambientais</h2><table><thead><tr><th>Item</th><th>Condicionante</th><th>Responsável</th><th>Prazo/Frequência</th><th>Status</th><th>Observação da visita</th></tr></thead><tbody>${linhas||'<tr><td colspan="6">Nenhuma condicionante registrada.</td></tr>'}</tbody></table>${fotos?.length?`<h2>Registro fotográfico</h2><div class="fotos">${fotos.map((f,i)=>`<div class="foto"><img src="${f.dataUrl}" alt="Foto ${i+1}"><small>Registro fotográfico ${i+1}</small></div>`).join("")}</div>`:""}<h2>Observações gerais</h2><div class="obs">${esc(v.observacoes||"Sem observações gerais.")}</div><div class="rodape"><span>Ekoo Sys Engenharia — Gestão Ambiental</span><span>Documento gerado pelo Ekoo Manager</span></div><script>window.onload=()=>setTimeout(()=>window.print(),250);<\/script></body></html>`;
 const w=window.open("","_blank");if(!w){alert("Permita pop-ups para gerar o PDF.");return}w.document.open();w.document.write(html);w.document.close();
}
async function vtPreviewRelatorio(v){
 const fotos=await vtFotosDaVisita(v);
 const itens=v.checklist||[],ok=itens.filter(x=>x.status==="OK").length,nok=itens.filter(x=>x.status==="NOK").length,nv=itens.filter(x=>x.status==="NAO_VERIFICADO").length;
 return `<div class="vt-rel-preview"><div class="vt-rel-faixa"><div><span>EKOO SYS</span><small>ENGENHARIA & GESTÃO AMBIENTAL</small></div><strong>RELATÓRIO DE VISITA TÉCNICA</strong></div><div class="vt-rel-dados"><div><small>Cliente</small><strong>${esc(v.clienteNome)}</strong></div><div><small>Data</small><strong>${esc(vtDataBR(v.dataHora))}</strong></div><div><small>Responsável</small><strong>${esc(v.responsavel||"—")}</strong></div><div><small>Local</small><strong>${esc(v.local||"—")}</strong></div></div><div class="vt-rel-resumo"><span class="ok"><b>${ok}</b> OK</span><span class="nok"><b>${nok}</b> NOK</span><span class="nv"><b>${nv}</b> Não verificados</span></div><div class="vt-rel-table-wrap"><table class="vt-rel-table"><thead><tr><th>Item</th><th>Condicionante</th><th>Responsável</th><th>Quando</th><th>Status</th><th>Observação</th></tr></thead><tbody>${itens.map((x,i)=>`<tr><td>${esc(x.item||i+1)}</td><td>${esc(x.descricao||"")}</td><td>${esc(x.quemExecuta||"—")}</td><td>${esc(x.quandoExecuta||"—")}</td><td><span class="vt-rel-status ${x.status==="OK"?"ok":x.status==="NOK"?"nok":"nv"}">${esc(vtStatusLabel(x.status))}</span></td><td>${esc(x.observacao||"—")}</td></tr>`).join("")}</tbody></table></div>${fotos?.length?`<div class="vt-rel-fotos"><h3>📷 Registro fotográfico</h3><div class="vt-fotos-grid">${fotos.map((f,i)=>`<figure class="vt-foto-card"><img src="${f.dataUrl}" alt="Foto ${i+1}"><figcaption><span>Foto ${i+1}</span></figcaption></figure>`).join("")}</div></div>`:""}${v.observacoes?`<div class="vt-rel-obs"><strong>Observações gerais</strong><p>${esc(v.observacoes)}</p></div>`:""}</div>`;
}
export async function montarRelatoriosVT(container){
 const uid=auth.currentUser?.uid;if(!uid)return;const a=(await listarVisitasVT(uid)).filter(v=>v.status==="concluida").sort((x,y)=>String(y.dataHora).localeCompare(String(x.dataHora)));
 container.innerHTML=`<section class="vt-dashboard"><header class="vt-cabecalho"><div><p class="saudacao">Visita Técnica</p><h1>📄 Relatórios</h1><p>Relatórios profissionais em PDF e Excel.</p></div></header><div class="vt-lista">${a.length?a.map(v=>{const ok=(v.checklist||[]).filter(x=>x.status==="OK").length,nok=(v.checklist||[]).filter(x=>x.status==="NOK").length;return `<article class="vt-item vt-rel-card"><div><h3>${esc(v.clienteNome)}</h3><p>✓ ${ok} OK • ✕ ${nok} NOK • ${(v.checklist||[]).length} condicionantes</p><small>📅 ${vtDataBR(v.dataHora)} • ${esc(v.responsavel||"Responsável não informado")}</small></div><div class="vt-item-acoes"><button data-prev="${v.id}">👁 Visualizar</button><button class="vt-btn-pdf" data-pdf="${v.id}">📄 PDF</button><button class="vt-btn-excel" data-xls="${v.id}">📊 Excel</button></div></article>`}).join(""):`<div class="vt-vazio"><span>📄</span><strong>Nenhuma visita concluída ainda.</strong></div>`}</div><div id="vtRelDetalhe"></div></section>`;
 const detalhe=container.querySelector("#vtRelDetalhe");container.querySelectorAll("[data-prev]").forEach(b=>b.onclick=async()=>{const v=a.find(x=>x.id===b.dataset.prev);if(v){detalhe.innerHTML=await vtPreviewRelatorio(v);detalhe.scrollIntoView({behavior:"smooth",block:"start"})}});container.querySelectorAll("[data-pdf]").forEach(b=>b.onclick=async()=>{const v=a.find(x=>x.id===b.dataset.pdf);if(v)await vtGerarPDF(v)});container.querySelectorAll("[data-xls]").forEach(b=>b.onclick=()=>{const v=a.find(x=>x.id===b.dataset.xls);if(v)vtGerarExcel(v)});
}

