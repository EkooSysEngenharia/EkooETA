import { auth } from "../firebase/firebase-config.js";
import { listarClientes } from "../firebase/clientes.js";
import { listarEtas } from "../firebase/etas.js";
import { cadastrarVisita, listarVisitas, atualizarVisita, excluirVisita } from "../firebase/agenda.js";
import { montarModuloMedicoes } from "./medicoesModulo.js";

function nomeCliente(c){ return c.nomeFantasia || c.razaoSocial || c.nome || "Cliente"; }
function esc(v=""){ return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
function agoraLocal(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16); }
function statusVisita(v){
    if(v.status==="realizada") return "realizada";
    return v.dataHora && new Date(v.dataHora) < new Date() ? "atrasada" : "agendada";
}
function formatarData(v){
    if(!v) return "Sem data";
    const d=new Date(v); return d.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
}

export async function montarModuloAgenda(container){
    const uid=auth.currentUser?.uid;
    if(!uid){ return; }
    container.innerHTML=`<section class="agenda-modulo">
      <header class="agenda-cabecalho"><div><p class="saudacao">Ekoo Manager</p><h1>Agenda de visitas</h1><p>Organize as próximas visitas às ETAs.</p></div>
      <button id="novaVisita" class="agenda-btn-principal" type="button">＋ Nova visita</button></header>
      <div class="agenda-filtros"><button data-filtro="todas" class="ativo">Todas</button><button data-filtro="agendada">Agendadas</button><button data-filtro="atrasada">Atrasadas</button><button data-filtro="realizada">Realizadas</button></div>
      <div id="listaAgenda" class="agenda-lista"><div class="agenda-vazio">Carregando agenda...</div></div>
      <div id="modalAgenda" class="agenda-modal escondido"><div class="agenda-modal-card">
        <div class="agenda-modal-topo"><h2 id="tituloModalAgenda">Nova visita</h2><button id="fecharAgenda" type="button">×</button></div>
        <form id="formAgenda">
          <input id="agendaId" type="hidden">
          <label>Cliente *</label><select id="agendaCliente" required><option value="">Selecione</option></select>
          <label>ETA *</label><select id="agendaEta" required disabled><option value="">Selecione o cliente primeiro</option></select>
          <div class="agenda-duas-colunas"><div><label>Data e hora *</label><input id="agendaData" type="datetime-local" required></div><div><label>Responsável</label><input id="agendaResponsavel" type="text" placeholder="Nome do responsável"></div></div>
          <label>Observação</label><textarea id="agendaObs" rows="3" placeholder="Informações sobre a visita"></textarea>
          <div class="agenda-acoes-form"><button id="cancelarAgenda" type="button">Cancelar</button><button class="agenda-btn-principal" type="submit">Salvar visita</button></div>
        </form></div></div>
    </section>`;

    const listaEl=container.querySelector("#listaAgenda"), modal=container.querySelector("#modalAgenda"),
      clienteSel=container.querySelector("#agendaCliente"), etaSel=container.querySelector("#agendaEta"),
      form=container.querySelector("#formAgenda");
    let visitas=[], clientes=[], filtro="todas";

    async function carregarClientes(){
      clientes=await listarClientes(uid);
      clienteSel.innerHTML='<option value="">Selecione</option>'+clientes.map(c=>`<option value="${c.id}">${esc(nomeCliente(c))}</option>`).join("");
    }
    async function carregarEtas(clienteId, selecionada=""){
      if(!clienteId){etaSel.disabled=true;etaSel.innerHTML='<option value="">Selecione o cliente primeiro</option>';return;}
      const etas=await listarEtas(uid,clienteId); etaSel.disabled=false;
      etaSel.innerHTML='<option value="">Selecione</option>'+etas.map(e=>`<option value="${e.id}" ${e.id===selecionada?"selected":""}>${esc(e.nome||"ETA")}</option>`).join("");
    }
    function render(){
      const itens=visitas.filter(v=>filtro==="todas"||statusVisita(v)===filtro);
      if(!itens.length){listaEl.innerHTML='<div class="agenda-vazio"><strong>Nenhuma visita aqui.</strong><span>Use “Nova visita” para agendar.</span></div>';return;}
      listaEl.innerHTML=itens.map(v=>{const s=statusVisita(v);return `<article class="agenda-card status-${s}">
        <div class="agenda-data"><strong>${esc(formatarData(v.dataHora))}</strong><span class="agenda-status">${s==="agendada"?"🟢 Agendada":s==="atrasada"?"🔴 Atrasada":"✓ Realizada"}</span></div>
        <div class="agenda-info"><h3>${esc(v.clienteNome||"Cliente")}</h3><p>💧 ${esc(v.etaNome||"ETA")}</p>${v.responsavel?`<p>👤 ${esc(v.responsavel)}</p>`:""}${v.observacao?`<p class="agenda-obs">${esc(v.observacao)}</p>`:""}</div>
        <div class="agenda-card-acoes">${s!=="realizada"?`<button class="agenda-iniciar-medicao" data-medir="${v.id}">💧 Iniciar medição</button><button data-realizar="${v.id}">✓ Realizada</button>`:""}<button data-editar="${v.id}">Editar</button><button class="perigo" data-excluir="${v.id}">Excluir</button></div>
      </article>`}).join("");
      listaEl.querySelectorAll("[data-medir]").forEach(b=>b.onclick=()=>{
        const v=visitas.find(x=>x.id===b.dataset.medir);
        if(!v)return;
        montarModuloMedicoes(container,{
          clienteId:v.clienteId,
          clienteNome:v.clienteNome||"Cliente",
          etaId:v.etaId,
          etaNome:v.etaNome||"ETA",
          aoVoltar:()=>montarModuloAgenda(container),
          aoSalvar:async()=>{
            await atualizarVisita(v.id,{
              status:"realizada",
              realizadaEm:new Date().toISOString(),
              atualizadoEm:new Date().toISOString()
            });
          }
        });
      });
      listaEl.querySelectorAll("[data-realizar]").forEach(b=>b.onclick=async()=>{await atualizarVisita(b.dataset.realizar,{status:"realizada",realizadaEm:new Date().toISOString(),atualizadoEm:new Date().toISOString()});await recarregar();});
      listaEl.querySelectorAll("[data-excluir]").forEach(b=>b.onclick=async()=>{if(confirm("Excluir esta visita da agenda?")){await excluirVisita(b.dataset.excluir);await recarregar();}});
      listaEl.querySelectorAll("[data-editar]").forEach(b=>b.onclick=()=>abrirEdicao(b.dataset.editar));
    }
    async function recarregar(){ visitas=await listarVisitas(uid); render(); }
    function fechar(){modal.classList.add("escondido");form.reset();container.querySelector("#agendaId").value="";etaSel.disabled=true;}
    function nova(){form.reset();container.querySelector("#agendaId").value="";container.querySelector("#tituloModalAgenda").textContent="Nova visita";container.querySelector("#agendaData").value=agoraLocal();etaSel.disabled=true;etaSel.innerHTML='<option value="">Selecione o cliente primeiro</option>';modal.classList.remove("escondido");}
    async function abrirEdicao(id){
      const v=visitas.find(x=>x.id===id);if(!v)return;
      container.querySelector("#tituloModalAgenda").textContent="Editar visita";container.querySelector("#agendaId").value=v.id;clienteSel.value=v.clienteId||"";
      await carregarEtas(v.clienteId,v.etaId);container.querySelector("#agendaData").value=v.dataHora||"";container.querySelector("#agendaResponsavel").value=v.responsavel||"";container.querySelector("#agendaObs").value=v.observacao||"";modal.classList.remove("escondido");
    }
    clienteSel.onchange=()=>carregarEtas(clienteSel.value);
    container.querySelector("#novaVisita").onclick=nova;container.querySelector("#fecharAgenda").onclick=fechar;container.querySelector("#cancelarAgenda").onclick=fechar;
    modal.onclick=e=>{if(e.target===modal)fechar();};
    container.querySelectorAll(".agenda-filtros button").forEach(b=>b.onclick=()=>{container.querySelectorAll(".agenda-filtros button").forEach(x=>x.classList.remove("ativo"));b.classList.add("ativo");filtro=b.dataset.filtro;render();});
    form.onsubmit=async e=>{
      e.preventDefault();
      const cliente=clientes.find(c=>c.id===clienteSel.value), etaOpt=etaSel.options[etaSel.selectedIndex], id=container.querySelector("#agendaId").value;
      const dados={usuarioId:uid,clienteId:clienteSel.value,clienteNome:nomeCliente(cliente||{}),etaId:etaSel.value,etaNome:etaOpt?.text||"ETA",dataHora:container.querySelector("#agendaData").value,responsavel:container.querySelector("#agendaResponsavel").value.trim(),observacao:container.querySelector("#agendaObs").value.trim(),status:id?(visitas.find(v=>v.id===id)?.status||"agendada"):"agendada",atualizadoEm:new Date().toISOString()};
      if(id) await atualizarVisita(id,dados); else await cadastrarVisita({...dados,criadoEm:new Date().toISOString()});
      fechar();await recarregar();
    };
    await carregarClientes();await recarregar();
}
