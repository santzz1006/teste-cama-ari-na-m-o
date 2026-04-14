/**
 * CAMAÇARI NA MÃO — script.js
 * Prefeitura de Camaçari/BA · Versão 1.0 · Abril 2026
 *
 * Arquitetura modular em JS puro:
 *   1. ESTADO     — dados e estado da aplicação
 *   2. DADOS      — mocks JSON (prontos para substituição por API REST)
 *   3. RENDERIZAÇÃO — funções de UI
 *   4. EVENTOS    — handlers de interação
 *   5. APP        — controlador principal (namespace público)
 */

'use strict';

/* ================================================================
   1. ESTADO DA APLICAÇÃO
================================================================ */
const Estado = {
  abaAtiva: 'inicio',

  /** Usuário logado (null = não autenticado) */
  usuario: null,

  /** CPFs que já votaram em cada proposta { propostaId: true } */
  votos: JSON.parse(localStorage.getItem('cnm_votos') || '{}'),

  /** Filtros ativos */
  filtros: {
    obras: { bairro: '', status: '', secretaria: '' },
    orcamento: { bairro: '' },
    votacao: { bairro: '' },
  },

  /**
   * Persiste votos no localStorage.
   * Em produção: substituir por chamada à API Firebase Firestore.
   */
  salvarVotos() {
    localStorage.setItem('cnm_votos', JSON.stringify(this.votos));
  },

  /** Carrega usuário salvo na sessão */
  carregarSessao() {
    const salvo = sessionStorage.getItem('cnm_usuario');
    if (salvo) this.usuario = JSON.parse(salvo);
  },

  salvarSessao() {
    if (this.usuario) {
      sessionStorage.setItem('cnm_usuario', JSON.stringify(this.usuario));
    } else {
      sessionStorage.removeItem('cnm_usuario');
    }
  },
};

/* ================================================================
   2. DADOS MOCKADOS
   TODO (Semana 5 do Roadmap): substituir por fetch() às APIs REST:
     GET /api/obras
     GET /api/propostas
     GET /api/orcamento
================================================================ */
const Dados = {

  obras: [
    {
      id: 'obra_001',
      titulo: 'Pavimentação Rua das Acácias',
      secretaria: 'SEINFRA',
      bairro: 'Nova Brasília',
      status: 'em_andamento',
      percentual: 68,
      valorTotal: 420000,
      valorExecutado: 285600,
      dataInicio: '10/02/2026',
      dataFim: '30/06/2026',
      responsavel: 'Eng. Carlos Souza',
      descricao: 'Pavimentação asfáltica de 1,2 km com sarjetas e calçadas acessíveis.',
    },
    {
      id: 'obra_002',
      titulo: 'Revitalização da Praça do Centro',
      secretaria: 'SEDUR',
      bairro: 'Centro',
      status: 'em_andamento',
      percentual: 45,
      valorTotal: 180000,
      valorExecutado: 81000,
      dataInicio: '15/03/2026',
      dataFim: '15/07/2026',
      responsavel: 'Arq. Luana Ferreira',
      descricao: 'Reforma completa do espaço público com nova iluminação LED, paisagismo e banco acessível.',
    },
    {
      id: 'obra_003',
      titulo: 'Drenagem Avenida Radial A',
      secretaria: 'SEINFRA',
      bairro: 'Radial A',
      status: 'em_andamento',
      percentual: 30,
      valorTotal: 650000,
      valorExecutado: 195000,
      dataInicio: '01/04/2026',
      dataFim: '30/09/2026',
      responsavel: 'Eng. Marcos Lima',
      descricao: 'Obra de microdrenagem para evitar alagamentos durante chuvas fortes.',
    },
    {
      id: 'obra_004',
      titulo: 'Reforma da UBS Gleba A',
      secretaria: 'SEDUR',
      bairro: 'Gleba A',
      status: 'concluida',
      percentual: 100,
      valorTotal: 320000,
      valorExecutado: 320000,
      dataInicio: '05/01/2026',
      dataFim: '28/03/2026',
      responsavel: 'Eng. Patrícia Alves',
      descricao: 'Reforma e ampliação da Unidade Básica de Saúde, incluindo acessibilidade.',
    },
    {
      id: 'obra_005',
      titulo: 'Iluminação Pública LED — Gleba B',
      secretaria: 'SEINFRA',
      bairro: 'Gleba B',
      status: 'em_andamento',
      percentual: 55,
      valorTotal: 240000,
      valorExecutado: 132000,
      dataInicio: '20/02/2026',
      dataFim: '20/05/2026',
      responsavel: 'Téc. João Batista',
      descricao: 'Substituição de 320 postes por tecnologia LED de baixo consumo.',
    },
    {
      id: 'obra_006',
      titulo: 'Contenção de Encosta — PHOC',
      secretaria: 'SEINFRA',
      bairro: 'PHOC',
      status: 'paralisada',
      percentual: 20,
      valorTotal: 890000,
      valorExecutado: 178000,
      dataInicio: '10/01/2026',
      dataFim: '31/10/2026',
      responsavel: 'Eng. Roberto Neves',
      descricao: 'Contenção de encosta de risco em área habitada. Paralisada aguardando liberação ambiental.',
    },
    {
      id: 'obra_007',
      titulo: 'Calçadas Acessíveis — Abrantes',
      secretaria: 'SEDUR',
      bairro: 'Abrantes',
      status: 'em_andamento',
      percentual: 72,
      valorTotal: 130000,
      valorExecutado: 93600,
      dataInicio: '01/03/2026',
      dataFim: '30/04/2026',
      responsavel: 'Arq. Flávia Duarte',
      descricao: 'Implantação de calçadas niveladas com piso tátil em 3 ruas principais.',
    },
    {
      id: 'obra_008',
      titulo: 'Recapeamento Avenida Principal — Centro',
      secretaria: 'SEINFRA',
      bairro: 'Centro',
      status: 'concluida',
      percentual: 100,
      valorTotal: 520000,
      valorExecutado: 515000,
      dataInicio: '10/12/2025',
      dataFim: '28/02/2026',
      responsavel: 'Eng. Adriano Costa',
      descricao: 'Recapeamento asfáltico de 2,4 km da principal avenida da sede municipal.',
    },
  ],

  propostas: [
    {
      id: 'prop_001',
      titulo: 'Nova iluminação LED na Praça de Abrantes',
      descricao: 'Instalação de 40 postes LED e reforma do piso para aumentar a segurança dos moradores.',
      bairro: 'Abrantes',
      secretaria: 'SEINFRA',
      votos: 1245,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
    {
      id: 'prop_002',
      titulo: 'Drenagem na Avenida Radial A',
      descricao: 'Obra de contenção e microdrenagem para evitar alagamentos durante chuvas fortes no bairro.',
      bairro: 'Radial A',
      secretaria: 'SEINFRA',
      votos: 890,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
    {
      id: 'prop_003',
      titulo: 'Parque infantil no Centro',
      descricao: 'Criação de área de lazer com brinquedos acessíveis e bancos para toda a família.',
      bairro: 'Centro',
      secretaria: 'SEDUR',
      votos: 672,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
    {
      id: 'prop_004',
      titulo: 'Escola de informática na Gleba A',
      descricao: 'Criação de espaço público de capacitação digital com computadores e acesso à internet.',
      bairro: 'Gleba A',
      secretaria: 'SEDUR',
      votos: 1100,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
    {
      id: 'prop_005',
      titulo: 'Reforma do campo de futebol — Nova Brasília',
      descricao: 'Reforma do gramado, instalação de alambrado e vestiários para uso comunitário.',
      bairro: 'Nova Brasília',
      secretaria: 'SEDUR',
      votos: 543,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
    {
      id: 'prop_006',
      titulo: 'Calçadas acessíveis na Gleba B',
      descricao: 'Nivelamento e instalação de piso tátil em 5 ruas para cadeirantes e pessoas com deficiência visual.',
      bairro: 'Gleba B',
      secretaria: 'SEINFRA',
      votos: 791,
      maxVotos: 2000,
      status: 'aberta',
      prazo: '30/05/2026',
    },
  ],

  orcamento: {
    totalAnual: 520000000,
    porSecretaria: [
      { nome: 'SEINFRA', valor: 210000000, cor: '#1A7A4A', percentual: 40 },
      { nome: 'SEDUR',   valor: 156000000, cor: '#E8900A', percentual: 30 },
      { nome: 'SEFAZ',   valor: 104000000, cor: '#1A5F9E', percentual: 20 },
      { nome: 'Outros',  valor: 50000000,  cor: '#868E96', percentual: 10 },
    ],
    porBairro: [
      { nome: 'Nova Brasília', valor: 85000000, cor: '#1A7A4A' },
      { nome: 'Centro',        valor: 72000000, cor: '#E8900A' },
      { nome: 'Gleba A',       valor: 65000000, cor: '#1A5F9E' },
      { nome: 'Gleba B',       valor: 58000000, cor: '#9B59B6' },
      { nome: 'Abrantes',      valor: 41000000, cor: '#E74C3C' },
      { nome: 'PHOC',          valor: 35000000, cor: '#F39C12' },
      { nome: 'Radial A',      valor: 28000000, cor: '#16A085' },
    ],
  },
};

/* ================================================================
   3. UTILITÁRIOS
================================================================ */
const Utils = {
  /** Formata moeda brasileira */
  moeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor);
  },

  /** Formata número com pontos de milhar */
  numero(valor) {
    return new Intl.NumberFormat('pt-BR').format(valor);
  },

  /** Mascara CPF enquanto digita */
  mascaraCPF(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },

  /** Valida CPF simples (formato) */
  validarCPF(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11;
  },

  /** Retorna label legível para status */
  labelStatus(status) {
    const mapa = {
      em_andamento: '🔨 Em andamento',
      concluida:    '✅ Concluída',
      paralisada:   '⏸️ Paralisada',
    };
    return mapa[status] || status;
  },

  /** Debounce simples */
  debounce(fn, ms = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },
};

/* ================================================================
   4. RENDERIZAÇÃO
================================================================ */
const Render = {

  /** Renderiza os cards de obras filtrados */
  obras() {
    const { bairro, status, secretaria } = Estado.filtros.obras;
    const lista = document.getElementById('lista-obras');
    const vazio = document.getElementById('obras-vazio');

    let obras = Dados.obras;
    if (bairro)     obras = obras.filter(o => o.bairro === bairro);
    if (status)     obras = obras.filter(o => o.status === status);
    if (secretaria) obras = obras.filter(o => o.secretaria === secretaria);

    if (obras.length === 0) {
      lista.innerHTML = '';
      vazio.hidden = false;
      return;
    }

    vazio.hidden = true;
    lista.innerHTML = obras.map(obra => `
      <article
        class="obra-card"
        role="button"
        tabindex="0"
        aria-label="Ver detalhes: ${obra.titulo}"
        data-id="${obra.id}"
        onclick="App.abrirDetalheObra('${obra.id}')"
        onkeypress="if(event.key==='Enter') App.abrirDetalheObra('${obra.id}')"
      >
        <div class="obra-topo">
          <h3 class="obra-titulo">${obra.titulo}</h3>
          <span class="status-badge status-${obra.status}" aria-label="Situação: ${Utils.labelStatus(obra.status)}">
            ${Utils.labelStatus(obra.status)}
          </span>
        </div>

        <div class="obra-progresso-label">
          <span>Execução</span>
          <span><strong>${obra.percentual}%</strong> concluído</span>
        </div>
        <div class="barra-progresso" role="progressbar" aria-valuenow="${obra.percentual}" aria-valuemin="0" aria-valuemax="100">
          <div
            class="barra-progresso-fill ${obra.status === 'paralisada' ? 'atrasada' : ''}"
            style="width: ${obra.percentual}%"
          ></div>
        </div>

        <div class="obra-meta">
          <span class="obra-meta-item">🏛️ ${obra.secretaria}</span>
          <span class="obra-meta-item">📍 ${obra.bairro}</span>
          <span class="obra-meta-item">💰 ${Utils.moeda(obra.valorTotal)}</span>
        </div>
      </article>
    `).join('');
  },

  /** Renderiza gráficos de orçamento */
  orcamento() {
    const filtroBairro = Estado.filtros.orcamento.bairro;

    // Gráfico por secretaria
    const grafSec = document.getElementById('grafico-secretarias');
    grafSec.innerHTML = Dados.orcamento.porSecretaria.map(item => `
      <div class="grafico-item">
        <span class="grafico-item-label">${item.nome}</span>
        <div class="grafico-item-barra-wrap">
          <div
            class="grafico-item-barra"
            style="width: ${item.percentual}%; background: ${item.cor};"
            role="img"
            aria-label="${item.nome}: ${item.percentual}% — ${Utils.moeda(item.valor)}"
          >${item.percentual}%</div>
        </div>
      </div>
    `).join('');

    // Gráfico por bairro
    let bairros = Dados.orcamento.porBairro;
    if (filtroBairro) bairros = bairros.filter(b => b.nome === filtroBairro);

    const maxBairro = Math.max(...bairros.map(b => b.valor));
    const grafBairro = document.getElementById('grafico-bairros');
    grafBairro.innerHTML = bairros.map(item => {
      const pct = Math.round((item.valor / maxBairro) * 100);
      return `
        <div class="grafico-item">
          <span class="grafico-item-label">${item.nome}</span>
          <div class="grafico-item-barra-wrap">
            <div
              class="grafico-item-barra"
              style="width: ${pct}%; background: ${item.cor};"
              role="img"
              aria-label="${item.nome}: ${Utils.moeda(item.valor)}"
            >${Utils.moeda(item.valor / 1000000).replace('R$\u00a0', '')}M</div>
          </div>
        </div>
      `;
    }).join('');
  },

  /** Renderiza propostas de votação */
  propostas() {
    const filtroBairro = Estado.filtros.votacao.bairro;
    const lista = document.getElementById('lista-propostas');

    let propostas = Dados.propostas;
    if (filtroBairro) propostas = propostas.filter(p => p.bairro === filtroBairro);

    lista.innerHTML = propostas.map(p => {
      const jaVotou = Boolean(Estado.votos[p.id]);
      const pctVotos = Math.round((p.votos / p.maxVotos) * 100);

      return `
        <article class="proposta-card ${jaVotou ? 'votada' : ''}" data-id="${p.id}">
          <div class="proposta-topo">
            <span class="proposta-bairro">📍 ${p.bairro}</span>
            <span class="proposta-secretaria">${p.secretaria}</span>
          </div>

          <h3 class="proposta-titulo">${p.titulo}</h3>
          <p class="proposta-descricao">${p.descricao}</p>

          <div class="proposta-votos-label">
            <span><strong>${Utils.numero(p.votos)}</strong> votos</span>
            <span>Meta: ${Utils.numero(p.maxVotos)}</span>
          </div>
          <div class="proposta-votos-barra" role="progressbar" aria-valuenow="${pctVotos}" aria-valuemin="0" aria-valuemax="100">
            <div class="proposta-votos-fill" style="width: ${pctVotos}%"></div>
          </div>

          <button
            class="btn-votar ${jaVotou ? 'votado' : ''}"
            onclick="App.votar('${p.id}')"
            ${jaVotou ? 'disabled aria-disabled="true"' : ''}
            aria-label="${jaVotou ? 'Você já votou nesta proposta' : 'Votar em: ' + p.titulo}"
          >
            ${jaVotou
              ? '✅ Você já votou aqui'
              : '🗳️ Quero votar nesta proposta'
            }
          </button>

          <p style="font-size:0.75rem; color: var(--text-suave); margin-top: 8px; text-align:center;">
            Votação aberta até ${p.prazo}
          </p>
        </article>
      `;
    }).join('');
  },

  /** Renderiza aba de perfil */
  perfil() {
    const naoLogado = document.getElementById('perfil-nao-logado');
    const logado    = document.getElementById('perfil-logado');

    if (Estado.usuario) {
      naoLogado.hidden = true;
      logado.hidden = false;
      document.getElementById('perfil-nome-usuario').textContent = Estado.usuario.nome || 'Cidadão';
      document.getElementById('perfil-cpf-usuario').textContent = 'CPF: ' + Estado.usuario.cpfMascarado;
      document.getElementById('meus-votos').textContent = Estado.usuario.totalVotos || 0;
      document.getElementById('obras-seguidas').textContent = Estado.usuario.obrasSeguidas || 2;
    } else {
      naoLogado.hidden = false;
      logado.hidden = true;
    }
  },

  /** Abre modal com detalhes completos de uma obra */
  detalheObra(id) {
    const obra = Dados.obras.find(o => o.id === id);
    if (!obra) return;

    const conteudo = document.getElementById('obra-modal-conteudo');
    conteudo.innerHTML = `
      <div class="status-badge status-${obra.status}" style="margin-bottom: 12px; display: inline-flex;">
        ${Utils.labelStatus(obra.status)}
      </div>
      <h2 class="obra-detalhe-titulo">${obra.titulo}</h2>
      <p style="font-size:0.9rem; color: var(--text-secundario); margin-bottom: 16px; line-height:1.6;">
        ${obra.descricao}
      </p>

      <div class="obra-progresso-label">
        <span>Execução</span>
        <span><strong>${obra.percentual}%</strong></span>
      </div>
      <div class="barra-progresso" style="margin-bottom:16px;" role="progressbar" aria-valuenow="${obra.percentual}" aria-valuemin="0" aria-valuemax="100">
        <div class="barra-progresso-fill" style="width:${obra.percentual}%"></div>
      </div>

      <div class="obra-detalhe-grid">
        <div class="obra-detalhe-item">
          <span class="obra-detalhe-item-label">Secretaria</span>
          <span class="obra-detalhe-item-valor">${obra.secretaria}</span>
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
          <span class="obra-detalhe-item-label">Valor Executado</span>
          <span class="obra-detalhe-item-valor">${Utils.moeda(obra.valorExecutado)}</span>
        </div>
      </div>

      <div class="obra-detalhe-item" style="margin-bottom:0;">
        <span class="obra-detalhe-item-label">Responsável técnico</span>
        <span class="obra-detalhe-item-valor">${obra.responsavel}</span>
      </div>
    `;

    const modal = document.getElementById('modal-obra');
    modal.hidden = false;
    document.getElementById('btn-fechar-obra').focus();
    document.body.style.overflow = 'hidden';
  },

  /** Toast de feedback */
  toast(mensagem, tipo = 'sucesso', duracao = 3000) {
    const el = document.getElementById('toast');
    el.textContent = mensagem;
    el.className = `toast toast-${tipo}`;
    el.hidden = false;

    // Força reflow para animação
    el.offsetHeight; // eslint-disable-line

    el.classList.add('visivel');

    clearTimeout(Render._toastTimer);
    Render._toastTimer = setTimeout(() => {
      el.classList.remove('visivel');
      setTimeout(() => { el.hidden = true; }, 300);
    }, duracao);
  },

  /** Animação de confetti ao votar */
  confetti(btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const cores = ['#1A7A4A', '#E8900A', '#1A5F9E', '#2ECC71', '#F39C12'];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = (cx + (Math.random() - 0.5) * 100) + 'px';
      el.style.top  = (cy) + 'px';
      el.style.background = cores[Math.floor(Math.random() * cores.length)];
      el.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  },
};

/* ================================================================
   5. EVENTOS (handlers)
================================================================ */
const Eventos = {

  init() {
    // Máscara de CPF no input do modal
    const inputCPF = document.getElementById('input-cpf');
    if (inputCPF) {
      inputCPF.addEventListener('input', (e) => {
        e.target.value = Utils.mascaraCPF(e.target.value);
      });
    }

    // Fechar modais ao clicar no overlay
    document.getElementById('modal-login').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) App.fecharModal();
    });
    document.getElementById('modal-obra').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) App.fecharModalObra();
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        App.fecharModal();
        App.fecharModalObra();
      }
    });

    // Botão fechar modal de login
    document.getElementById('btn-fechar-modal').addEventListener('click', App.fecharModal);
    document.getElementById('btn-fechar-obra').addEventListener('click', App.fecharModalObra);

    // Botão header login
    document.getElementById('btn-abrir-login').addEventListener('click', App.abrirModal);

    // Filtros de obras
    document.getElementById('filtro-bairro-obras').addEventListener('change', (e) => {
      Estado.filtros.obras.bairro = e.target.value;
      Render.obras();
    });
    document.getElementById('filtro-status-obras').addEventListener('change', (e) => {
      Estado.filtros.obras.status = e.target.value;
      Render.obras();
    });
    document.getElementById('filtro-secretaria-obras').addEventListener('change', (e) => {
      Estado.filtros.obras.secretaria = e.target.value;
      Render.obras();
    });

    // Filtro de orçamento
    document.getElementById('filtro-bairro-orcamento').addEventListener('change', (e) => {
      Estado.filtros.orcamento.bairro = e.target.value;
      Render.orcamento();
    });

    // Filtro de votação
    document.getElementById('filtro-bairro-votacao').addEventListener('change', (e) => {
      Estado.filtros.votacao.bairro = e.target.value;
      Render.propostas();
    });

    // Botões de satisfação
    document.getElementById('satisfacao-opcoes').addEventListener('click', (e) => {
      const btn = e.target.closest('.satisfacao-btn');
      if (!btn) return;

      // Remove seleção anterior
      document.querySelectorAll('.satisfacao-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');

      // Mostra feedback
      document.getElementById('satisfacao-feedback').hidden = false;

      // TODO: enviar avaliação para Firebase Analytics
      // firebase.analytics().logEvent('satisfacao', { valor: btn.dataset.valor });
    });

    // Alto contraste
    document.getElementById('btn-contraste').addEventListener('click', () => {
      document.body.classList.toggle('alto-contraste');
      const ativo = document.body.classList.contains('alto-contraste');
      document.getElementById('btn-contraste').setAttribute('aria-pressed', String(ativo));
      localStorage.setItem('cnm_contraste', ativo ? '1' : '0');
      Render.toast(ativo ? '♿ Alto contraste ativado' : '♿ Alto contraste desativado', 'sucesso', 2000);
    });

    // Restaura preferência de contraste
    if (localStorage.getItem('cnm_contraste') === '1') {
      document.body.classList.add('alto-contraste');
    }

    // Login com Enter no formulário
    document.getElementById('input-email').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') App.fazerLogin();
    });
    document.getElementById('input-cpf').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('input-email').focus();
    });
  },
};

/* ================================================================
   6. APP — Controlador principal (namespace público)
   Exposto globalmente para uso nos atributos onclick do HTML
================================================================ */
const App = {

  /** Navega para uma aba pelo ID */
  navegarPara(aba) {
    // Oculta aba anterior
    document.getElementById(`aba-${Estado.abaAtiva}`).hidden = true;
    document.getElementById(`tab-${Estado.abaAtiva}`).classList.remove('nav-ativo');
    document.getElementById(`tab-${Estado.abaAtiva}`).setAttribute('aria-selected', 'false');

    // Ativa nova aba
    Estado.abaAtiva = aba;
    const novaAba = document.getElementById(`aba-${aba}`);
    novaAba.hidden = false;
    novaAba.classList.add('aba-ativa');

    const novoTab = document.getElementById(`tab-${aba}`);
    novoTab.classList.add('nav-ativo');
    novoTab.setAttribute('aria-selected', 'true');

    // Rola para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Renderiza conteúdo específico
    if (aba === 'obras')     Render.obras();
    if (aba === 'orcamento') Render.orcamento();
    if (aba === 'votacao')   Render.propostas();
    if (aba === 'perfil')    Render.perfil();
  },

  /** Processa votação em uma proposta */
  votar(propostaId) {
    const proposta = Dados.propostas.find(p => p.id === propostaId);
    if (!proposta) return;

    // Verifica se já votou
    if (Estado.votos[propostaId]) {
      Render.toast('Você já votou nesta proposta.', 'aviso');
      return;
    }

    // Registra voto (simula API)
    Estado.votos[propostaId] = true;
    Estado.salvarVotos();
    proposta.votos += 1;

    // Atualiza stats do usuário
    if (Estado.usuario) {
      Estado.usuario.totalVotos = (Estado.usuario.totalVotos || 0) + 1;
      Estado.salvarSessao();
    }

    // Feedback visual
    const btn = document.querySelector(`.proposta-card[data-id="${propostaId}"] .btn-votar`);
    if (btn) {
      // Ripple
      const ripple = document.createElement('span');
      ripple.className = 'voto-ripple';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());

      // Confetti
      Render.confetti(btn);
    }

    // Re-renderiza propostas
    Render.propostas();
    Render.toast('✅ Voto registrado com sucesso! Obrigado por participar.', 'sucesso');

    // Atualiza badge
    const votosRestantes = Dados.propostas.filter(p => !Estado.votos[p.id]).length;
    const badge = document.getElementById('votacao-badge');
    if (badge) badge.textContent = votosRestantes;

    // TODO (produção): POST /api/votos com CPF + propostaId
    // fetch('/api/votos', { method:'POST', body: JSON.stringify({...}) });
  },

  /** Abre modal de login */
  abrirModal() {
    if (Estado.usuario) {
      App.navegarPara('perfil');
      return;
    }
    const modal = document.getElementById('modal-login');
    modal.hidden = false;
    document.getElementById('input-cpf').focus();
    document.body.style.overflow = 'hidden';
  },

  /** Fecha modal de login */
  fecharModal() {
    const modal = document.getElementById('modal-login');
    modal.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('login-erro').hidden = true;
    document.getElementById('input-cpf').value = '';
    document.getElementById('input-email').value = '';
    document.getElementById('btn-abrir-login').focus();
  },

  /** Processa login */
  fazerLogin() {
    const cpf   = document.getElementById('input-cpf').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const erroEl = document.getElementById('login-erro');

    erroEl.hidden = true;

    if (!Utils.validarCPF(cpf)) {
      erroEl.textContent = 'Por favor, informe um CPF válido com 11 dígitos.';
      erroEl.hidden = false;
      document.getElementById('input-cpf').focus();
      return;
    }

    if (!email || !email.includes('@')) {
      erroEl.textContent = 'Por favor, informe um e-mail válido.';
      erroEl.hidden = false;
      document.getElementById('input-email').focus();
      return;
    }

    // Simula autenticação (em produção: Firebase Auth)
    Estado.usuario = {
      cpf: cpf.replace(/\D/g, ''),
      cpfMascarado: cpf,
      email,
      nome: 'Cidadão(ã)',
      totalVotos: Object.keys(Estado.votos).length,
      obrasSeguidas: 2,
    };
    Estado.salvarSessao();

    App.fecharModal();
    Render.toast('👋 Bem-vindo(a)! Login realizado com sucesso.', 'sucesso');

    // Atualiza botão header
    document.getElementById('btn-abrir-login').innerHTML = '<span aria-hidden="true">✅</span> Meu Perfil';
  },

  /** Faz logout */
  sair() {
    Estado.usuario = null;
    Estado.salvarSessao();
    document.getElementById('btn-abrir-login').innerHTML = '<span aria-hidden="true">👤</span> Entrar';
    Render.perfil();
    Render.toast('Você saiu da sua conta.', 'sucesso', 2000);
  },

  /** Abre modal com detalhe de obra */
  abrirDetalheObra(id) {
    Render.detalheObra(id);
  },

  /** Fecha modal de obra */
  fecharModalObra() {
    document.getElementById('modal-obra').hidden = true;
    document.body.style.overflow = '';
  },

  /** Limpa filtros de obras */
  limparFiltrosObras() {
    Estado.filtros.obras = { bairro: '', status: '', secretaria: '' };
    document.getElementById('filtro-bairro-obras').value = '';
    document.getElementById('filtro-status-obras').value = '';
    document.getElementById('filtro-secretaria-obras').value = '';
    Render.obras();
  },

  /** Inicializa toda a aplicação */
  init() {
    Estado.carregarSessao();
    Eventos.init();

    // Renderiza conteúdo inicial
    Render.obras();
    Render.orcamento();
    Render.propostas();

    // Ajusta botão de login se já estiver logado
    if (Estado.usuario) {
      document.getElementById('btn-abrir-login').innerHTML = '<span aria-hidden="true">✅</span> Meu Perfil';
    }

    // Atualiza badge de votações disponíveis
    const disponiveis = Dados.propostas.filter(p => !Estado.votos[p.id]).length;
    const badge = document.getElementById('votacao-badge');
    if (badge) badge.textContent = disponiveis;
    if (badge) badge.setAttribute('aria-label', `${disponiveis} propostas abertas para votar`);

    // Se a URL tem hash, navega direto
    const hash = window.location.hash.replace('#', '');
    const abasValidas = ['inicio', 'obras', 'orcamento', 'votacao', 'perfil'];
    if (hash && abasValidas.includes(hash)) {
      App.navegarPara(hash);
    }

    console.info(
      '%c Camaçari na Mão v1.0 ',
      'background:#1A7A4A; color:white; padding:4px 8px; border-radius:4px; font-weight:bold;',
      '\nPrefeitura de Camaçari/BA · Sprint 10 Dias · Abril 2026'
    );
  },
};

/* ================================================================
   INICIALIZAÇÃO
================================================================ */
document.addEventListener('DOMContentLoaded', App.init.bind(App));

// Expõe App globalmente (necessário para onclick no HTML)
window.App = App;
