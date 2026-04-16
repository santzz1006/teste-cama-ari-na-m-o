/**
 * CAMAÇARI NA MÃO — script.js · Versão Integrada 3.0
 * Prefeitura de Camaçari/BA · Abril 2026
 *
 * Módulos:
 *   1. ESTADO       — dados e estado da aplicação
 *   2. DADOS        — mocks JSON (prontos para substituição por API REST)
 *   3. MAPA         — Leaflet.js com marcadores por secretaria (V1)
 *   4. ORÇAMENTO    — gráficos CSS sem dependências
 *   5. VOTAÇÃO      — 1 voto por pessoa, apenas do próprio bairro
 *   6. SOLICITAÇÕES — formulário de pedidos às secretarias
 *   7. PERFIL       — estado do usuário
 *   8. UI / UTILS   — toast, modal, acessibilidade
 *   9. APP          — controlador principal
 */

'use strict';

/* ================================================================
   1. ESTADO
================================================================ */
const Estado = {
  abaAtiva: 'inicio',
  usuario: null,

  /** voto do usuário { propostaId } — só 1 voto no total */
  votoRegistrado: null,

  filtros: {
    mapa:      { bairro: '', status: '', secretaria: '' },
    orcamento: { bairro: '' },
    votacao:   { bairro: '' },
    servicos:  { categoria: 'todos' },
  },

  solicitacaoAtiva: null, // objeto do tipo de serviço selecionado

  carregarSessao() {
    try {
      const u = sessionStorage.getItem('cnm_usuario');
      if (u) this.usuario = JSON.parse(u);
      const v = localStorage.getItem('cnm_voto');
      if (v) this.votoRegistrado = v;
    } catch (e) { /* ignora */ }
  },

  salvarSessao() {
    if (this.usuario) sessionStorage.setItem('cnm_usuario', JSON.stringify(this.usuario));
    else sessionStorage.removeItem('cnm_usuario');
  },

  salvarVoto() {
    if (this.votoRegistrado) localStorage.setItem('cnm_voto', this.votoRegistrado);
  },
};

/* ================================================================
   2. DADOS MOCKADOS
   TODO (Semana 5): substituir por fetch('/api/obras') etc.
================================================================ */
const Dados = {

  obras: [
    {
      id: 'obra_001',
      titulo: 'Pavimentação Rua das Acácias',
      secretaria: 'SEINFRA',
      bairro: 'Nova Brasília',
      bairroSlug: 'nova-brasilia',
      status: 'em_andamento',
      percentual: 68,
      valorTotal: 420000,
      valorExecutado: 285600,
      dataInicio: '10/02/2026',
      dataFim: '30/06/2026',
      responsavel: 'Eng. Carlos Souza',
      descricao: 'Pavimentação asfáltica de 1,2 km com sarjetas e calçadas acessíveis.',
      lat: -12.6979, lng: -38.3249,
    },
    {
      id: 'obra_002',
      titulo: 'Revitalização Praça do Centro',
      secretaria: 'SEDUR',
      bairro: 'Centro',
      bairroSlug: 'centro',
      status: 'em_andamento',
      percentual: 45,
      valorTotal: 180000,
      valorExecutado: 81000,
      dataInicio: '15/03/2026',
      dataFim: '15/07/2026',
      responsavel: 'Arq. Luana Ferreira',
      descricao: 'Reforma do espaço público com nova iluminação LED, paisagismo e bancos acessíveis.',
      lat: -12.6960, lng: -38.3230,
    },
    {
      id: 'obra_003',
      titulo: 'Drenagem Avenida Radial A',
      secretaria: 'SEINFRA',
      bairro: 'Radial A',
      bairroSlug: 'radial-a',
      status: 'em_andamento',
      percentual: 30,
      valorTotal: 650000,
      valorExecutado: 195000,
      dataInicio: '01/04/2026',
      dataFim: '30/09/2026',
      responsavel: 'Eng. Marcos Lima',
      descricao: 'Microdrenagem para evitar alagamentos durante chuvas fortes.',
      lat: -12.6950, lng: -38.3280,
    },
    {
      id: 'obra_004',
      titulo: 'Reforma UBS Gleba A',
      secretaria: 'SEDUR',
      bairro: 'Gleba A',
      bairroSlug: 'gleba-a',
      status: 'concluida',
      percentual: 100,
      valorTotal: 320000,
      valorExecutado: 320000,
      dataInicio: '05/01/2026',
      dataFim: '28/03/2026',
      responsavel: 'Eng. Patrícia Alves',
      descricao: 'Reforma e ampliação da Unidade Básica de Saúde com acessibilidade.',
      lat: -12.7021, lng: -38.3190,
    },
    {
      id: 'obra_005',
      titulo: 'Iluminação LED Gleba B',
      secretaria: 'SEINFRA',
      bairro: 'Gleba B',
      bairroSlug: 'gleba-b',
      status: 'em_andamento',
      percentual: 55,
      valorTotal: 240000,
      valorExecutado: 132000,
      dataInicio: '20/02/2026',
      dataFim: '20/05/2026',
      responsavel: 'Téc. João Batista',
      descricao: 'Substituição de 320 postes convencionais por tecnologia LED de baixo consumo.',
      lat: -12.7040, lng: -38.3210,
    },
    {
      id: 'obra_006',
      titulo: 'Contenção de Encosta PHOC',
      secretaria: 'SEINFRA',
      bairro: 'PHOC',
      bairroSlug: 'phoc',
      status: 'paralisada',
      percentual: 20,
      valorTotal: 890000,
      valorExecutado: 178000,
      dataInicio: '10/01/2026',
      dataFim: '31/10/2026',
      responsavel: 'Eng. Roberto Neves',
      descricao: 'Contenção de encosta de risco. Paralisada aguardando licença ambiental.',
      lat: -12.7100, lng: -38.3300,
    },
    {
      id: 'obra_007',
      titulo: 'Calçadas Acessíveis Abrantes',
      secretaria: 'SEDUR',
      bairro: 'Abrantes',
      bairroSlug: 'abrantes',
      status: 'em_andamento',
      percentual: 72,
      valorTotal: 130000,
      valorExecutado: 93600,
      dataInicio: '01/03/2026',
      dataFim: '30/04/2026',
      responsavel: 'Arq. Flávia Duarte',
      descricao: 'Implantação de calçadas com piso tátil em 3 ruas principais.',
      lat: -12.6840, lng: -38.3170,
    },
    {
      id: 'obra_008',
      titulo: 'Recapeamento Av. Principal — Centro',
      secretaria: 'SEINFRA',
      bairro: 'Centro',
      bairroSlug: 'centro',
      status: 'concluida',
      percentual: 100,
      valorTotal: 520000,
      valorExecutado: 515000,
      dataInicio: '10/12/2025',
      dataFim: '28/02/2026',
      responsavel: 'Eng. Adriano Costa',
      descricao: 'Recapeamento asfáltico de 2,4 km da principal avenida da sede.',
      lat: -12.6970, lng: -38.3260,
    },
  ],

  propostas: [
    {
      id: 'prop_001',
      titulo: 'Nova iluminação na Praça de Abrantes',
      descricao: 'Instalação de 40 postes LED e reforma do piso para aumentar a segurança dos moradores.',
      bairro: 'Abrantes',
      secretaria: 'SEINFRA',
      votos: 1245,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
    {
      id: 'prop_002',
      titulo: 'Drenagem na Avenida Radial A',
      descricao: 'Obra de contenção e microdrenagem para evitar alagamentos durante chuvas fortes.',
      bairro: 'Radial A',
      secretaria: 'SEINFRA',
      votos: 890,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
    {
      id: 'prop_003',
      titulo: 'Parque infantil no Centro',
      descricao: 'Área de lazer com brinquedos acessíveis e bancos para famílias.',
      bairro: 'Centro',
      secretaria: 'SEDUR',
      votos: 672,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
    {
      id: 'prop_004',
      titulo: 'Escola de informática na Gleba A',
      descricao: 'Espaço público de capacitação digital com computadores e acesso à internet.',
      bairro: 'Gleba A',
      secretaria: 'SEDUR',
      votos: 1100,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
    {
      id: 'prop_005',
      titulo: 'Reforma do campo de futebol — Nova Brasília',
      descricao: 'Reforma do gramado, alambrado e vestiários para uso comunitário.',
      bairro: 'Nova Brasília',
      secretaria: 'SEDUR',
      votos: 543,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
    {
      id: 'prop_006',
      titulo: 'Calçadas acessíveis na Gleba B',
      descricao: 'Nivelamento com piso tátil em 5 ruas para cadeirantes e deficientes visuais.',
      bairro: 'Gleba B',
      secretaria: 'SEINFRA',
      votos: 791,
      maxVotos: 2000,
      prazo: '30/05/2026',
    },
  ],

  orcamento: {
    totalAnual: 520000000,
    porSecretaria: [
      { nome: 'SEINFRA', valor: 210000000, cor: '#D97706', percentual: 40 },
      { nome: 'SEDUR',   valor: 156000000, cor: '#0E7490', percentual: 30 },
      { nome: 'SEFAZ',   valor: 104000000, cor: '#1D4ED8', percentual: 20 },
      { nome: 'Outros',  valor: 50000000,  cor: '#6B7280', percentual: 10 },
    ],
    porBairro: [
      { nome: 'Nova Brasília', valor: 85000000, cor: '#1A7A4A' },
      { nome: 'Centro',        valor: 72000000, cor: '#D97706' },
      { nome: 'Gleba A',       valor: 65000000, cor: '#0E7490' },
      { nome: 'Gleba B',       valor: 58000000, cor: '#1D4ED8' },
      { nome: 'Abrantes',      valor: 41000000, cor: '#10B981' },
      { nome: 'PHOC',          valor: 35000000, cor: '#F59E0B' },
      { nome: 'Radial A',      valor: 28000000, cor: '#EF4444' },
    ],
  },

  /** Tipos de serviço solicitável às secretarias */
  tiposServico: [
    { id: 'ts_01', titulo: 'Buraco na rua',        secretaria: 'SEINFRA', icone: 'fa-solid fa-triangle-exclamation', classe: 'seinfra' },
    { id: 'ts_02', titulo: 'Calçada danificada',   secretaria: 'SEINFRA', icone: 'fa-solid fa-person-walking',       classe: 'seinfra' },
    { id: 'ts_03', titulo: 'Poste sem luz',         secretaria: 'SEINFRA', icone: 'fa-solid fa-lightbulb',            classe: 'seinfra' },
    { id: 'ts_04', titulo: 'Lixo não coletado',    secretaria: 'SEDUR',   icone: 'fa-solid fa-trash',                classe: 'sedur'   },
    { id: 'ts_05', titulo: 'Área de risco',         secretaria: 'SEDUR',   icone: 'fa-solid fa-house-crack',          classe: 'sedur'   },
    { id: 'ts_06', titulo: 'Desmatamento ilegal',  secretaria: 'SEDUR',   icone: 'fa-solid fa-tree',                 classe: 'sedur'   },
    { id: 'ts_07', titulo: 'Dívida / IPTU',         secretaria: 'SEFAZ',   icone: 'fa-solid fa-file-invoice-dollar',  classe: 'sefaz'   },
    { id: 'ts_08', titulo: 'Consulta tributária',  secretaria: 'SEFAZ',   icone: 'fa-solid fa-magnifying-glass-dollar', classe: 'sefaz' },
  ],

  /** Cores dos marcadores do mapa por secretaria */
  coresSecretaria: {
    'SEINFRA': '#D97706',
    'SEDUR':   '#0E7490',
    'SEFAZ':   '#1D4ED8',
  },
  coresStatus: {
    'concluida':    '#10B981',
    'paralisada':   '#EF4444',
    'em_andamento': null, // usa cor da secretaria
  },
};

/* ================================================================
   3. UTILITÁRIOS
================================================================ */
const Utils = {
  moeda(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  },
  numero(v) {
    return new Intl.NumberFormat('pt-BR').format(v);
  },
  mascaraCPF(v) {
    return v.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },
  validarCPF(cpf) {
    return cpf.replace(/\D/g, '').length === 11;
  },
  labelStatus(s) {
    return { em_andamento: 'Em andamento', concluida: 'Concluída', paralisada: 'Paralisada' }[s] || s;
  },
  iconStatus(s) {
    return { em_andamento: 'fa-solid fa-hammer', concluida: 'fa-solid fa-circle-check', paralisada: 'fa-solid fa-circle-pause' }[s] || '';
  },
};

/* ================================================================
   4. MÓDULO DO MAPA (Leaflet.js — retirado da V1)
================================================================ */
const Mapa = {
  instancia: null,
  camadaMarcadores: null,
  inicializado: false,

  init() {
    if (this.inicializado) return;
    const container = document.getElementById('mapa-container');
    if (!container || typeof L === 'undefined') return;

    // Centralizado em Camaçari/BA
    this.instancia = L.map('mapa-container').setView([-12.6975, -38.3241], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> | Camaçari na Mão'
    }).addTo(this.instancia);

    this.camadaMarcadores = L.layerGroup().addTo(this.instancia);
    this.inicializado = true;
    this.renderizarMarcadores(Dados.obras);
  },

  renderizarMarcadores(obras) {
    if (!this.instancia) return;
    this.camadaMarcadores.clearLayers();

    obras.forEach(obra => {
      // Cor do marcador: status tem prioridade sobre secretaria
      const corStatus = Dados.coresStatus[obra.status];
      const cor = corStatus || Dados.coresSecretaria[obra.secretaria] || '#1A7A4A';

      const icone = L.divIcon({
        className: '',
        html: `<div style="
          width: 26px; height: 26px;
          background: ${cor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -28],
      });

      const popup = `
        <div style="font-family:'DM Sans',sans-serif; min-width:180px;">
          <div style="font-size:11px; font-weight:700; color:${cor}; text-transform:uppercase; letter-spacing:.04em; margin-bottom:4px;">
            ${obra.secretaria}
          </div>
          <div style="font-size:14px; font-weight:600; color:#1F2937; margin-bottom:6px; line-height:1.3;">
            ${obra.titulo}
          </div>
          <div style="font-size:12px; color:#4B5563; margin-bottom:4px;">
            <strong>Situação:</strong> ${Utils.labelStatus(obra.status)}
          </div>
          <div style="font-size:12px; color:#4B5563; margin-bottom:4px;">
            <strong>Execução:</strong> ${obra.percentual}%
          </div>
          <div style="background:#E5E7EB; border-radius:99px; height:6px; overflow:hidden; margin-bottom:6px;">
            <div style="width:${obra.percentual}%; height:100%; background:${cor}; border-radius:99px;"></div>
          </div>
          <div style="font-size:12px; font-weight:600; color:#1F2937;">
            ${Utils.moeda(obra.valorTotal)}
          </div>
          <button
            onclick="App.abrirDetalheObra('${obra.id}')"
            style="
              margin-top:8px; width:100%; background:${cor};
              color:white; border:none; border-radius:99px;
              padding:6px 12px; font-size:12px; font-weight:600;
              cursor:pointer; font-family:'DM Sans',sans-serif;
            ">
            Ver detalhes
          </button>
        </div>
      `;

      L.marker([obra.lat, obra.lng], { icon: icone })
        .bindPopup(popup)
        .addTo(this.camadaMarcadores);
    });
  },

  aplicarFiltros() {
    const { bairro, status, secretaria } = Estado.filtros.mapa;
    let obras = Dados.obras;
    if (bairro)     obras = obras.filter(o => o.bairroSlug === bairro);
    if (status)     obras = obras.filter(o => o.status === status);
    if (secretaria) obras = obras.filter(o => o.secretaria === secretaria);
    this.renderizarMarcadores(obras);
    return obras;
  },

  invalidar() {
    if (this.instancia) {
      setTimeout(() => this.instancia.invalidateSize(), 50);
    }
  },
};

/* ================================================================
   5. RENDERIZAÇÃO
================================================================ */
const Render = {

  /** Lista de obras + mapa */
  obras() {
    const obras = Mapa.aplicarFiltros();
    const lista = document.getElementById('lista-obras');
    const vazio = document.getElementById('obras-vazio');
    const contador = document.getElementById('obras-contador');

    if (contador) contador.textContent = obras.length;

    if (obras.length === 0) {
      lista.innerHTML = '';
      vazio.hidden = false;
      return;
    }
    vazio.hidden = true;

    lista.innerHTML = obras.map(obra => `
      <article
        class="obra-card"
        data-secretaria="${obra.secretaria}"
        role="button"
        tabindex="0"
        aria-label="Ver detalhes: ${obra.titulo}"
        onclick="App.abrirDetalheObra('${obra.id}')"
        onkeypress="if(event.key==='Enter')App.abrirDetalheObra('${obra.id}')"
      >
        <div class="obra-topo">
          <h3 class="obra-titulo">${obra.titulo}</h3>
          <span class="status-badge status-${obra.status}">
            <i class="${Utils.iconStatus(obra.status)}" aria-hidden="true"></i>
            ${Utils.labelStatus(obra.status)}
          </span>
        </div>
        <div class="obra-progresso-label">
          <span>Execução</span>
          <span><strong>${obra.percentual}%</strong></span>
        </div>
        <div class="barra-progresso" role="progressbar" aria-valuenow="${obra.percentual}" aria-valuemin="0" aria-valuemax="100" aria-label="${obra.percentual}% concluído">
          <div class="barra-progresso-fill ${obra.status === 'paralisada' ? 'paralisada' : ''}" style="width:${obra.percentual}%"></div>
        </div>
        <div class="obra-meta">
          <span class="obra-meta-item"><i class="fa-solid fa-building-columns" aria-hidden="true"></i>${obra.secretaria}</span>
          <span class="obra-meta-item"><i class="fa-solid fa-map-pin" aria-hidden="true"></i>${obra.bairro}</span>
          <span class="obra-meta-item"><i class="fa-solid fa-sack-dollar" aria-hidden="true"></i>${Utils.moeda(obra.valorTotal)}</span>
        </div>
      </article>
    `).join('');
  },

  /** Gráficos de orçamento (CSS puro) */
  orcamento() {
    const filtroBairro = Estado.filtros.orcamento.bairro;

    // Por secretaria
    const grafSec = document.getElementById('grafico-secretarias');
    grafSec.innerHTML = Dados.orcamento.porSecretaria.map(it => `
      <div class="grafico-item">
        <span class="grafico-item-label">${it.nome}</span>
        <div class="grafico-item-barra-wrap">
          <div class="grafico-item-barra"
            style="width:${it.percentual}%; background:${it.cor};"
            role="img" aria-label="${it.nome}: ${it.percentual}% — ${Utils.moeda(it.valor)}">
            ${it.percentual}%
          </div>
        </div>
      </div>
    `).join('');

    // Por bairro
    let bairros = Dados.orcamento.porBairro;
    if (filtroBairro) bairros = bairros.filter(b => b.nome === filtroBairro);

    const max = Math.max(...bairros.map(b => b.valor));
    const grafBairro = document.getElementById('grafico-bairros');
    grafBairro.innerHTML = bairros.map(b => {
      const pct = Math.round((b.valor / max) * 100);
      const valorM = (b.valor / 1000000).toFixed(0);
      return `
        <div class="grafico-item">
          <span class="grafico-item-label">${b.nome}</span>
          <div class="grafico-item-barra-wrap">
            <div class="grafico-item-barra"
              style="width:${pct}%; background:${b.cor};"
              role="img" aria-label="${b.nome}: R$ ${valorM} milhões">
              R$${valorM}M
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /** Propostas de votação com regra: 1 voto, só no próprio bairro */
  propostas() {
    const filtroBairro = Estado.filtros.votacao.bairro;
    const lista = document.getElementById('lista-propostas');
    const infoEl = document.getElementById('votacao-info-usuario');

    let propostas = Dados.propostas;
    if (filtroBairro) propostas = propostas.filter(p => p.bairro === filtroBairro);

    const bairroUsuario = Estado.usuario?.bairro || null;
    const jaVotou = Boolean(Estado.votoRegistrado);

    // Atualiza informação contextual
    if (infoEl) {
      if (!Estado.usuario) {
        infoEl.innerHTML = 'Faça login para votar. Você pode votar em <strong>1 proposta</strong> do seu bairro.';
      } else if (jaVotou) {
        const prop = Dados.propostas.find(p => p.id === Estado.votoRegistrado);
        infoEl.innerHTML = `Você votou em: <strong>${prop ? prop.titulo : 'proposta'}</strong>. Obrigado por participar!`;
      } else {
        infoEl.innerHTML = `Seu bairro: <strong>${bairroUsuario}</strong>. Escolha 1 proposta para apoiar.`;
      }
    }

    lista.innerHTML = propostas.map(p => {
      const ehDoMeuBairro   = bairroUsuario && p.bairro === bairroUsuario;
      const estaVotada      = Estado.votoRegistrado === p.id;
      const podeVotar       = Estado.usuario && ehDoMeuBairro && !jaVotou;
      const bloqueadoPorVoto = Estado.usuario && jaVotou && !estaVotada;
      const bloqueadoBairro  = Estado.usuario && !ehDoMeuBairro && !jaVotou;

      const pctVotos = Math.round((p.votos / p.maxVotos) * 100);

      let btnHtml = '';
      let cardClass = 'proposta-card';
      let avisoHtml = '';

      if (!Estado.usuario) {
        btnHtml = `<button class="btn-votar" onclick="App.abrirModal()" aria-label="Faça login para votar em ${p.titulo}">
          <i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Entrar para votar
        </button>`;
      } else if (estaVotada) {
        cardClass += ' votada';
        btnHtml = `<button class="btn-votar votado" disabled aria-disabled="true">
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i> Seu voto foi registrado aqui
        </button>`;
      } else if (bloqueadoPorVoto) {
        cardClass += ' bloqueada';
        btnHtml = `<button class="btn-votar bloqueado" disabled aria-disabled="true">
          <i class="fa-solid fa-lock" aria-hidden="true"></i> Você já usou seu voto
        </button>`;
      } else if (bloqueadoBairro) {
        cardClass += ' bloqueada';
        btnHtml = `<button class="btn-votar bloqueado" disabled aria-disabled="true">
          <i class="fa-solid fa-map-pin" aria-hidden="true"></i> Não é do seu bairro
        </button>`;
        avisoHtml = `<p class="proposta-aviso-bairro">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          Você só pode votar em propostas do bairro <strong>${bairroUsuario}</strong>.
        </p>`;
      } else if (podeVotar) {
        btnHtml = `<button class="btn-votar" onclick="App.votar('${p.id}')" aria-label="Votar em ${p.titulo}">
          <i class="fa-solid fa-check-to-slot" aria-hidden="true"></i> Quero votar nesta proposta
        </button>`;
      }

      return `
        <article class="${cardClass}" data-id="${p.id}">
          <div class="proposta-topo">
            <span class="proposta-bairro">
              <i class="fa-solid fa-map-pin" aria-hidden="true"></i> ${p.bairro}
            </span>
            <span class="proposta-secretaria">${p.secretaria}</span>
          </div>
          <h3 class="proposta-titulo">${p.titulo}</h3>
          <p class="proposta-descricao">${p.descricao}</p>
          <div class="proposta-votos-label">
            <span><strong>${Utils.numero(p.votos)}</strong> votos</span>
            <span>Meta: ${Utils.numero(p.maxVotos)}</span>
          </div>
          <div class="proposta-votos-barra" role="progressbar" aria-valuenow="${pctVotos}" aria-valuemin="0" aria-valuemax="100">
            <div class="proposta-votos-fill" style="width:${pctVotos}%"></div>
          </div>
          ${btnHtml}
          ${avisoHtml}
          <p style="font-size:0.73rem; color:var(--text-suave); text-align:center; margin-top:6px;">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i> Votação aberta até ${p.prazo}
          </p>
        </article>
      `;
    }).join('');
  },

  /** Grid de tipos de serviço */
  tiposServico() {
    const cat = Estado.filtros.servicos.categoria;
    const grid = document.getElementById('tipos-servico');

    let tipos = Dados.tiposServico;
    if (cat !== 'todos') tipos = tipos.filter(t => t.secretaria === cat);

    grid.innerHTML = tipos.map(t => `
      <button
        class="servico-btn ${t.classe}"
        onclick="App.selecionarServico('${t.id}')"
        aria-label="Solicitar: ${t.titulo} — ${t.secretaria}"
      >
        <i class="${t.icone}" aria-hidden="true"></i>
        <span>${t.titulo}</span>
      </button>
    `).join('');
  },

  /** Perfil do usuário */
  perfil() {
    const naoLogado = document.getElementById('perfil-nao-logado');
    const logado    = document.getElementById('perfil-logado');

    if (Estado.usuario) {
      naoLogado.hidden = true;
      logado.hidden    = false;
      document.getElementById('perfil-nome-usuario').textContent = 'Cidadão(ã)';
      document.getElementById('perfil-cpf-usuario').textContent  = 'CPF: ' + Estado.usuario.cpfMascarado;
      document.getElementById('perfil-bairro-usuario').textContent = 'Bairro: ' + (Estado.usuario.bairro || '—');
      document.getElementById('meus-votos-count').textContent = Estado.votoRegistrado ? '1' : '0';
      document.getElementById('minhas-solicitacoes-count').textContent = Estado.usuario.solicitacoes || '0';
    } else {
      naoLogado.hidden = false;
      logado.hidden    = true;
    }
  },

  /** Modal de detalhe de uma obra */
  detalheObra(id) {
    const obra = Dados.obras.find(o => o.id === id);
    if (!obra) return;

    const cor = Dados.coresSecretaria[obra.secretaria] || '#1A7A4A';
    const conteudo = document.getElementById('obra-modal-conteudo');
    conteudo.innerHTML = `
      <span class="status-badge status-${obra.status}" style="margin-bottom:12px; display:inline-flex;">
        <i class="${Utils.iconStatus(obra.status)}" aria-hidden="true"></i>
        ${Utils.labelStatus(obra.status)}
      </span>
      <h2 class="obra-detalhe-titulo" id="obra-modal-titulo">${obra.titulo}</h2>
      <p style="font-size:0.88rem; color:var(--text-secundario); margin-bottom:14px; line-height:1.6;">${obra.descricao}</p>

      <div class="obra-progresso-label">
        <span>Execução da obra</span>
        <strong>${obra.percentual}%</strong>
      </div>
      <div class="barra-progresso" style="margin-bottom:16px;" role="progressbar" aria-valuenow="${obra.percentual}" aria-valuemin="0" aria-valuemax="100">
        <div class="barra-progresso-fill" style="width:${obra.percentual}%; background:linear-gradient(90deg,${cor},${cor}aa)"></div>
      </div>

      <div class="obra-detalhe-grid">
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Secretaria</span>
          <span class="obra-detalhe-item-valor" style="color:${cor}">${obra.secretaria}</span>
        </div>
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Bairro</span>
          <span class="obra-detalhe-item-valor">${obra.bairro}</span>
        </div>
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Início</span>
          <span class="obra-detalhe-item-valor">${obra.dataInicio}</span>
        </div>
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Previsão de Fim</span>
          <span class="obra-detalhe-item-valor">${obra.dataFim}</span>
        </div>
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Valor Total</span>
          <span class="obra-detalhe-item-valor">${Utils.moeda(obra.valorTotal)}</span>
        </div>
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Executado</span>
          <span class="obra-detalhe-item-valor">${Utils.moeda(obra.valorExecutado)}</span>
        </div>
      </div>

      <div class="obra-detalhe-item">
        <span class="obra-detalhe-item-label">Responsável técnico</span>
        <span class="obra-detalhe-item-valor">${obra.responsavel}</span>
      </div>
    `;

    const modal = document.getElementById('modal-obra');
    modal.hidden = false;
    document.getElementById('btn-fechar-obra').focus();
    document.body.style.overflow = 'hidden';
  },

  /** Toast de notificação */
  _toastTimer: null,
  toast(msg, tipo = 'sucesso', ms = 3200) {
    const el = document.getElementById('toast');
    const icones = { sucesso: 'fa-solid fa-circle-check', erro: 'fa-solid fa-circle-xmark', aviso: 'fa-solid fa-triangle-exclamation' };
    el.innerHTML = `<i class="${icones[tipo] || ''}" aria-hidden="true"></i> ${msg}`;
    el.className = `toast toast-${tipo}`;
    el.hidden = false;
    el.offsetHeight; // forçar reflow
    el.classList.add('visivel');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      el.classList.remove('visivel');
      setTimeout(() => { el.hidden = true; }, 300);
    }, ms);
  },

  /** Efeito confetti ao votar */
  confetti(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const cores = ['#1A7A4A', '#D97706', '#0E7490', '#2ECC71', '#F59E0B'];
    for (let i = 0; i < 14; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti';
      dot.style.cssText = `
        left:${cx + (Math.random() - 0.5) * 120}px;
        top:${cy}px;
        background:${cores[Math.floor(Math.random() * cores.length)]};
        animation-delay:${Math.random() * 0.25}s;
      `;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    }
  },
};

/* ================================================================
   6. EVENTOS
================================================================ */
const Eventos = {
  init() {
    // Máscara CPF
    document.getElementById('input-cpf').addEventListener('input', e => {
      e.target.value = Utils.mascaraCPF(e.target.value);
    });

    // Fechar modais ao clicar no overlay
    ['modal-login', 'modal-obra'].forEach(id => {
      document.getElementById(id).addEventListener('click', e => {
        if (e.target === e.currentTarget) App[id === 'modal-login' ? 'fecharModal' : 'fecharModalObra']();
      });
    });

    // ESC fecha modais
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { App.fecharModal(); App.fecharModalObra(); }
    });

    // Botões fechar modal
    document.getElementById('btn-fechar-modal').addEventListener('click', App.fecharModal);
    document.getElementById('btn-fechar-obra').addEventListener('click', App.fecharModalObra);

    // Botão header login
    document.getElementById('btn-abrir-login').addEventListener('click', App.abrirModal);

    // Enter nos campos de login
    document.getElementById('input-cpf').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('input-email').focus(); });
    document.getElementById('input-email').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('input-bairro').focus(); });
    document.getElementById('input-bairro').addEventListener('keydown', e => { if (e.key === 'Enter') App.fazerLogin(); });

    // Filtros do mapa
    document.getElementById('filtro-bairro-mapa').addEventListener('change', e => { Estado.filtros.mapa.bairro = e.target.value; Render.obras(); });
    document.getElementById('filtro-status-mapa').addEventListener('change', e => { Estado.filtros.mapa.status = e.target.value; Render.obras(); });
    document.getElementById('filtro-secretaria-mapa').addEventListener('change', e => { Estado.filtros.mapa.secretaria = e.target.value; Render.obras(); });

    // Filtro orçamento
    document.getElementById('filtro-bairro-orcamento').addEventListener('change', e => { Estado.filtros.orcamento.bairro = e.target.value; Render.orcamento(); });

    // Filtro votação
    document.getElementById('filtro-bairro-votacao').addEventListener('change', e => { Estado.filtros.votacao.bairro = e.target.value; Render.propostas(); });

    // Botões de satisfação
    document.getElementById('satisfacao-opcoes').addEventListener('click', e => {
      const btn = e.target.closest('.satisfacao-btn');
      if (!btn) return;
      document.querySelectorAll('.satisfacao-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      document.getElementById('satisfacao-feedback').hidden = false;
    });

    // Alto contraste
    document.getElementById('btn-contraste').addEventListener('click', () => {
      const ativo = document.body.classList.toggle('alto-contraste');
      document.getElementById('btn-contraste').setAttribute('aria-pressed', String(ativo));
      localStorage.setItem('cnm_contraste', ativo ? '1' : '0');
      Render.toast(ativo ? 'Alto contraste ativado' : 'Alto contraste desativado', 'sucesso', 1800);
    });

    // Tamanho de fonte
    document.getElementById('btn-fonte').addEventListener('click', () => {
      const ativo = document.body.classList.toggle('fonte-aumentada');
      localStorage.setItem('cnm_fonte', ativo ? '1' : '0');
      Render.toast(ativo ? 'Texto maior ativado' : 'Tamanho de texto normal', 'sucesso', 1800);
    });

    // Restaura preferências salvas
    if (localStorage.getItem('cnm_contraste') === '1') document.body.classList.add('alto-contraste');
    if (localStorage.getItem('cnm_fonte') === '1') document.body.classList.add('fonte-aumentada');
  },
};

/* ================================================================
   7. APP — controlador principal
================================================================ */
const App = {

  navegarPara(aba) {
    document.getElementById(`aba-${Estado.abaAtiva}`).hidden = true;
    document.getElementById(`tab-${Estado.abaAtiva}`).classList.remove('nav-ativo');
    document.getElementById(`tab-${Estado.abaAtiva}`).setAttribute('aria-selected', 'false');

    Estado.abaAtiva = aba;
    const novaAba = document.getElementById(`aba-${aba}`);
    novaAba.hidden = false;
    const novoTab = document.getElementById(`tab-${aba}`);
    novoTab.classList.add('nav-ativo');
    novoTab.setAttribute('aria-selected', 'true');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (aba === 'mapa') {
      Mapa.init();
      Mapa.invalidar();
      Render.obras();
    }
    if (aba === 'orcamento')     Render.orcamento();
    if (aba === 'votacao')       Render.propostas();
    if (aba === 'solicitacoes')  Render.tiposServico();
    if (aba === 'perfil')        Render.perfil();
  },

  /** Registra um voto — regra: 1 voto, somente no próprio bairro */
  votar(propostaId) {
    if (!Estado.usuario) {
      App.abrirModal();
      return;
    }

    const proposta = Dados.propostas.find(p => p.id === propostaId);
    if (!proposta) return;

    // Verifica bairro
    if (Estado.usuario.bairro !== proposta.bairro) {
      Render.toast(`Você só pode votar em propostas do bairro ${Estado.usuario.bairro}.`, 'aviso');
      return;
    }

    // Verifica se já votou
    if (Estado.votoRegistrado) {
      Render.toast('Você já usou seu voto. Cada cidadão tem direito a 1 voto.', 'aviso');
      return;
    }

    // Registra voto
    Estado.votoRegistrado = propostaId;
    Estado.salvarVoto();
    proposta.votos += 1;

    if (Estado.usuario) Estado.usuario.solicitacoes = (Estado.usuario.solicitacoes || 0);

    // Feedback visual
    const btn = document.querySelector(`.proposta-card[data-id="${propostaId}"] .btn-votar`);
    if (btn) {
      const ripple = document.createElement('span');
      ripple.className = 'voto-ripple';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
      Render.confetti(btn);
    }

    Render.propostas();
    Render.toast('Voto registrado com sucesso! Obrigado por participar.', 'sucesso');

    // Badge desaparece após votar
    const badge = document.getElementById('votacao-badge');
    if (badge) badge.hidden = true;
  },

  /** Seleção de tipo de serviço para solicitação */
  selecionarServico(tipoId) {
    const tipo = Dados.tiposServico.find(t => t.id === tipoId);
    if (!tipo) return;
    Estado.solicitacaoAtiva = tipo;

    document.getElementById('form-solicitacao-titulo').textContent = tipo.titulo + ' — ' + tipo.secretaria;
    document.getElementById('form-solicitacao-container').hidden = false;
    document.getElementById('form-solicitacao-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  fecharFormSolicitacao() {
    document.getElementById('form-solicitacao-container').hidden = true;
    Estado.solicitacaoAtiva = null;
  },

  filtrarCategorias(cat) {
    Estado.filtros.servicos.categoria = cat;
    document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('ativa'));
    document.querySelector(`[data-cat="${cat}"]`)?.classList.add('ativa');
    App.fecharFormSolicitacao();
    Render.tiposServico();
  },

  enviarSolicitacao() {
    const bairro    = document.getElementById('sol-bairro').value;
    const endereco  = document.getElementById('sol-endereco').value.trim();
    const descricao = document.getElementById('sol-descricao').value.trim();
    const erroEl    = document.getElementById('sol-erro');
    const sucess    = document.getElementById('sol-sucesso');

    erroEl.hidden = true;
    sucess.hidden = true;

    if (!bairro) {
      erroEl.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Selecione seu bairro.';
      erroEl.hidden = false;
      document.getElementById('sol-bairro').focus();
      return;
    }
    if (!descricao) {
      erroEl.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Descreva o problema antes de enviar.';
      erroEl.hidden = false;
      document.getElementById('sol-descricao').focus();
      return;
    }

    // TODO (produção): POST /api/solicitacoes
    if (Estado.usuario) Estado.usuario.solicitacoes = (Estado.usuario.solicitacoes || 0) + 1;

    sucess.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Solicitação enviada para <strong>${Estado.solicitacaoAtiva?.secretaria || 'a secretaria'}</strong>! Número de protocolo: <strong>#${Date.now().toString().slice(-6)}</strong>`;
    sucess.hidden = false;
    document.getElementById('sol-bairro').value = '';
    document.getElementById('sol-endereco').value = '';
    document.getElementById('sol-descricao').value = '';
    Render.toast('Solicitação enviada com sucesso!', 'sucesso');
  },

  /** Abre o modal de login */
  abrirModal() {
    if (Estado.usuario) { App.navegarPara('perfil'); return; }
    const modal = document.getElementById('modal-login');
    modal.hidden = false;
    document.getElementById('input-cpf').focus();
    document.body.style.overflow = 'hidden';
  },

  fecharModal() {
    document.getElementById('modal-login').hidden = true;
    document.body.style.overflow = '';
    document.getElementById('login-erro').hidden = true;
    ['input-cpf', 'input-email'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('btn-abrir-login').focus();
  },

  fazerLogin() {
    const cpf    = document.getElementById('input-cpf').value.trim();
    const email  = document.getElementById('input-email').value.trim();
    const bairro = document.getElementById('input-bairro').value;
    const erroEl = document.getElementById('login-erro');

    erroEl.hidden = true;

    if (!Utils.validarCPF(cpf)) {
      erroEl.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Informe um CPF válido com 11 dígitos.';
      erroEl.hidden = false;
      document.getElementById('input-cpf').focus();
      return;
    }
    if (!email || !email.includes('@')) {
      erroEl.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Informe um e-mail válido.';
      erroEl.hidden = false;
      document.getElementById('input-email').focus();
      return;
    }
    if (!bairro) {
      erroEl.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Selecione seu bairro para poder votar.';
      erroEl.hidden = false;
      document.getElementById('input-bairro').focus();
      return;
    }

    // TODO (produção): Firebase Auth
    Estado.usuario = {
      cpf: cpf.replace(/\D/g, ''),
      cpfMascarado: cpf,
      email,
      bairro,
      solicitacoes: 0,
    };
    Estado.salvarSessao();

    App.fecharModal();
    document.getElementById('btn-login-texto').textContent = 'Meu Perfil';
    Render.toast(`Bem-vindo(a)! Bairro registrado: ${bairro}.`, 'sucesso');
    Render.propostas(); // atualiza votação com novo usuário
  },

  sair() {
    Estado.usuario = null;
    Estado.salvarSessao();
    document.getElementById('btn-login-texto').textContent = 'Entrar';
    Render.perfil();
    Render.propostas();
    Render.toast('Você saiu da sua conta.', 'sucesso', 2000);
  },

  abrirDetalheObra(id) {
    Render.detalheObra(id);
  },

  fecharModalObra() {
    document.getElementById('modal-obra').hidden = true;
    document.body.style.overflow = '';
  },

  limparFiltrosMapa() {
    Estado.filtros.mapa = { bairro: '', status: '', secretaria: '' };
    document.getElementById('filtro-bairro-mapa').value = '';
    document.getElementById('filtro-status-mapa').value = '';
    document.getElementById('filtro-secretaria-mapa').value = '';
    Render.obras();
  },

  /** Inicialização geral */
  init() {
    Estado.carregarSessao();
    Eventos.init();

    // Renderização inicial das abas não-mapa
    Render.orcamento();
    Render.propostas();
    Render.tiposServico();

    // Botão login
    if (Estado.usuario) {
      document.getElementById('btn-login-texto').textContent = 'Meu Perfil';
    }

    // Badge de votação
    const badge = document.getElementById('votacao-badge');
    if (badge) {
      badge.textContent = Dados.propostas.length;
      if (Estado.votoRegistrado) badge.hidden = true;
    }

    // Hash URL
    const hash = window.location.hash.replace('#', '');
    const valid = ['inicio', 'mapa', 'orcamento', 'votacao', 'solicitacoes', 'perfil'];
    if (hash && valid.includes(hash)) App.navegarPara(hash);

    console.info(
      '%c Camaçari na Mão v3.0 ',
      'background:#1A7A4A; color:#fff; padding:4px 10px; border-radius:4px; font-weight:bold;',
      '\nPrefeitura de Camaçari/BA · Sprint 10 Dias · Abril 2026'
    );
  },
};

/* Expõe App globalmente (onclick no HTML) */
window.App = App;

/* ================================================================
   MÓDULO SIDEBAR — colunas laterais desktop
   Totalmente independente do App; não altera nenhum código existente.
================================================================ */
const Sidebar = (() => {

  /* ── Dados do Feed de Atividade ─── */
  const feedItens = [
    { cor: 'verde',  texto: 'Obra da <strong>Radial A</strong> atualizada pela SEINFRA',        tempo: 'agora' },
    { cor: 'ambar',  texto: '<strong>150 cidadãos</strong> do Centro já votaram hoje',           tempo: '2 min' },
    { cor: 'teal',   texto: 'Nova proposta lançada para a <strong>Gleba B</strong>',             tempo: '8 min' },
    { cor: 'azul',   texto: 'Orçamento de <strong>Abrantes</strong> atualizado pela SEFAZ',     tempo: '15 min' },
    { cor: 'verde',  texto: 'Obra da <strong>UBS Gleba A</strong> marcada como concluída',      tempo: '22 min' },
    { cor: 'ambar',  texto: '<strong>Nova Brasília</strong> ultrapassou 500 votos esta semana',  tempo: '40 min' },
    { cor: 'teal',   texto: 'Calçadas de <strong>Abrantes</strong> chegaram a 72% de execução', tempo: '1 h' },
    { cor: 'azul',   texto: 'Solicitação de <strong>Gleba A</strong> encaminhada à SEDUR',      tempo: '1 h' },
  ];

  /* ── Dados de Educação Cidadã ─── */
  const dicas = [
    {
      termo: 'O que é Licitação?',
      explicacao: 'É o processo obrigatório que a prefeitura usa para contratar empresas de forma transparente. Garante que o dinheiro público seja bem gasto e evita favorecimentos.',
    },
    {
      termo: 'O que faz a SEDUR?',
      explicacao: 'A Secretaria de Desenvolvimento Urbano cuida do crescimento ordenado da cidade: licenças de construção, áreas verdes, parques e mobilidade urbana.',
    },
    {
      termo: 'Como o orçamento municipal é dividido?',
      explicacao: 'O orçamento é aprovado pela Câmara Municipal todo ano. Cada secretaria recebe uma fatia conforme as prioridades da cidade — saúde, infraestrutura, educação e mais.',
    },
    {
      termo: 'O que é Transparência Pública?',
      explicacao: 'É o dever do governo de mostrar ao cidadão como o dinheiro público está sendo usado. Qualquer pessoa tem o direito de pedir informações pelo acesso à informação (Lei 12.527).',
    },
    {
      termo: 'O que é a SEINFRA?',
      explicacao: 'Secretaria de Infraestrutura. Cuida de estradas, pavimentação, drenagem, iluminação pública e obras de contenção. É a que mais obras executa no município.',
    },
    {
      termo: 'O que é Participação Cidadã?',
      explicacao: 'É quando o morador participa das decisões da cidade — votando em propostas, enviando solicitações ou acompanhando obras. Mais participação significa melhor gestão pública.',
    },
  ];

  /* ── Dados dos bairros com contagem de obras ─── */
  const bairros = [
    { nome: 'Centro',        slug: 'centro',        obras: 2 },
    { nome: 'Gleba A',       slug: 'gleba-a',       obras: 1 },
    { nome: 'Gleba B',       slug: 'gleba-b',       obras: 1 },
    { nome: 'Nova Brasília', slug: 'nova-brasilia',  obras: 1 },
    { nome: 'Abrantes',      slug: 'abrantes',      obras: 1 },
    { nome: 'PHOC',          slug: 'phoc',           obras: 1 },
    { nome: 'Radial A',      slug: 'radial-a',       obras: 1 },
  ];

  /* ── Ranking de engajamento por bairro ─── */
  const ranking = [
    { bairro: 'Centro',        votos: 1243, pct: 100 },
    { bairro: 'Nova Brasília', votos: 987,  pct: 79  },
    { bairro: 'Gleba A',       votos: 876,  pct: 70  },
    { bairro: 'Abrantes',      votos: 754,  pct: 61  },
    { bairro: 'Gleba B',       votos: 612,  pct: 49  },
    { bairro: 'Radial A',      votos: 489,  pct: 39  },
    { bairro: 'PHOC',          votos: 280,  pct: 23  },
  ];

  let dicaAtual = 0;
  let bairroFiltroAtivo = '';

  /* ── Helpers ─── */
  function posIcon(i) {
    if (i === 0) return { cls: 'ranking-pos-1', txt: '1°' };
    if (i === 1) return { cls: 'ranking-pos-2', txt: '2°' };
    if (i === 2) return { cls: 'ranking-pos-3', txt: '3°' };
    return { cls: 'ranking-pos-n', txt: `${i + 1}°` };
  }

  /* ── Renderização ─── */
  function renderFeed() {
    const ul = document.getElementById('feed-lista');
    if (!ul) return;
    ul.innerHTML = feedItens.map(item => `
      <li class="feed-item">
        <span class="feed-dot feed-dot-${item.cor}" aria-hidden="true"></span>
        <span class="feed-texto">${item.texto}</span>
        <span class="feed-tempo" aria-label="${item.tempo} atrás">${item.tempo}</span>
      </li>
    `).join('');
  }

  function renderDica() {
    const el = document.getElementById('educacao-conteudo');
    if (!el) return;
    const d = dicas[dicaAtual];
    el.innerHTML = `
      <span class="educacao-termo">${d.termo}</span>
      <span class="educacao-explicacao">${d.explicacao}</span>
    `;
  }

  function renderBairros() {
    const ul = document.getElementById('bairros-lista');
    if (!ul) return;
    ul.innerHTML = bairros.map(b => `
      <li>
        <button
          class="bairro-item-btn ${bairroFiltroAtivo === b.slug ? 'ativo' : ''}"
          onclick="Sidebar.selecionarBairro('${b.slug}', '${b.nome}')"
          aria-pressed="${bairroFiltroAtivo === b.slug}"
          aria-label="Filtrar por ${b.nome}: ${b.obras} obra${b.obras > 1 ? 's' : ''}"
        >
          <span>${b.nome}</span>
          <span class="bairro-obras-count">${b.obras} obra${b.obras > 1 ? 's' : ''}</span>
        </button>
      </li>
    `).join('');

    const btnLimpar = document.getElementById('btn-limpar-bairro');
    if (btnLimpar) btnLimpar.hidden = !bairroFiltroAtivo;
  }

  function renderRanking() {
    const ol = document.getElementById('ranking-lista');
    if (!ol) return;
    ol.innerHTML = ranking.map((r, i) => {
      const pos = posIcon(i);
      return `
        <li class="ranking-item">
          <span class="ranking-pos ${pos.cls}" aria-hidden="true">${pos.txt}</span>
          <div class="ranking-info">
            <span class="ranking-bairro">${r.bairro}</span>
            <span class="ranking-votos">${r.votos.toLocaleString('pt-BR')} votos</span>
          </div>
          <div class="ranking-barra-wrap" role="img" aria-label="${r.pct}% do máximo">
            <div class="ranking-barra-fill" style="width:${r.pct}%"></div>
          </div>
        </li>
      `;
    }).join('');
  }

  /* Banner que aparece no conteúdo central quando um bairro está ativo */
  function atualizarBannerBairro() {
    const abas = ['aba-inicio', 'aba-mapa', 'aba-orcamento', 'aba-votacao'];
    abas.forEach(id => {
      const aba = document.getElementById(id);
      if (!aba) return;
      const bannerExist = aba.querySelector('.bairro-ativo-banner');
      if (bannerExist) bannerExist.remove();

      if (bairroFiltroAtivo) {
        const nomeBairro = bairros.find(b => b.slug === bairroFiltroAtivo)?.nome || bairroFiltroAtivo;
        const banner = document.createElement('div');
        banner.className = 'bairro-ativo-banner';
        banner.setAttribute('role', 'status');
        banner.setAttribute('aria-live', 'polite');
        banner.innerHTML = `
          <span><i class="fa-solid fa-map-pin" aria-hidden="true"></i> Mostrando: <strong>${nomeBairro}</strong></span>
          <button onclick="Sidebar.limparFiltroBairro()" aria-label="Remover filtro de bairro">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i> Remover filtro
          </button>
        `;
        aba.insertBefore(banner, aba.firstChild);
      }
    });
  }

  /* ── API pública do módulo ─── */
  return {
    init() {
      renderFeed();
      renderDica();
      renderBairros();
      renderRanking();

      /* Simula novos itens no feed a cada 25 segundos */
      const novosFeed = [
        { cor: 'verde',  texto: 'Obra da <strong>Gleba B</strong> teve % atualizado', tempo: 'agora' },
        { cor: 'ambar',  texto: '<strong>PHOC</strong> recebeu nova solicitação cidadã',     tempo: 'agora' },
        { cor: 'teal',   texto: 'Prefeitura abriu <strong>consulta pública</strong> para Abrantes', tempo: 'agora' },
      ];
      let feedIdx = 0;
      setInterval(() => {
        const novo = { ...novosFeed[feedIdx % novosFeed.length], tempo: 'agora' };
        feedIdx++;
        const el = document.getElementById('feed-lista');
        if (!el) return;
        // Redefine tempos dos existentes
        feedItens.forEach((f, i) => {
          const tempos = ['1 min', '3 min', '10 min', '18 min', '25 min', '35 min', '50 min', '1 h'];
          f.tempo = tempos[i] || '1 h';
        });
        feedItens.unshift(novo);
        if (feedItens.length > 8) feedItens.pop();
        renderFeed();
      }, 25000);
    },

    proximaDica() {
      dicaAtual = (dicaAtual + 1) % dicas.length;
      renderDica();
    },

    selecionarBairro(slug, nome) {
      bairroFiltroAtivo = slug;

      /* Aplica filtro nas abas de mapa, orçamento e votação */
      const selMapa = document.getElementById('filtro-bairro-mapa');
      if (selMapa) { selMapa.value = slug; selMapa.dispatchEvent(new Event('change')); }

      const selVotacao = document.getElementById('filtro-bairro-votacao');
      if (selVotacao) { selVotacao.value = nome; selVotacao.dispatchEvent(new Event('change')); }

      const selOrc = document.getElementById('filtro-bairro-orcamento');
      if (selOrc) { selOrc.value = nome; selOrc.dispatchEvent(new Event('change')); }

      renderBairros();
      atualizarBannerBairro();
    },

    limparFiltroBairro() {
      bairroFiltroAtivo = '';

      ['filtro-bairro-mapa', 'filtro-bairro-votacao', 'filtro-bairro-orcamento'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) { sel.value = ''; sel.dispatchEvent(new Event('change')); }
      });

      renderBairros();
      atualizarBannerBairro();
    },
  };
})();

window.Sidebar = Sidebar;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  Sidebar.init();
});
