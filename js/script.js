/* ==========================================================
   PhotoFrame - script.js
   Um único arquivo para todas as páginas. Cada página tem
   <body data-page="..."> e só o código dela é executado.
   ========================================================== */
(() => {
  'use strict';

  // =========================================================
  // 1. DADOS (simulam um banco de dados)
  // =========================================================
  const STORAGE_KEY = 'photoframe_owner';
  const OWNER_ID = 1; // fotógrafo "logado" (simulação): Paulo Giovanni

  const CATEGORIES = {
    documental:  { label: 'Documental',  role: 'Fotógrafo documental' },
    retrato:     { label: 'Retrato',     role: 'Fotógrafo de retrato' },
    paisagem:    { label: 'Paisagem',    role: 'Fotógrafo de paisagem' },
    arquitetura: { label: 'Arquitetura', role: 'Fotógrafo de arquitetura' }
  };

  // Dados de exemplo (nomes, cidades e telefones são fictícios)
  const BASE_PHOTOGRAPHERS = [
    {
      id: 1,
      name: 'Paulo Giovanni',
      category: 'documental',
      location: 'São Paulo, Brasil',
      phone: '(11) 98765-4321',
      bio: 'Acredito que cada imagem carrega uma história que merece ser contada. Meu trabalho é registrar momentos reais, pessoas e lugares de forma autêntica e sensível.',
      avatar: 'images/logoperfil.png',
      photos: [
        'images/fotopaulo1.png',
        'images/fotopaulo2.png',
        'images/fotopaulo3.png',
        'images/fotopaulo4.png'
      ]
    },
    {
      id: 2,
      name: 'Ana Costa',
      category: 'paisagem',
      location: 'Florianópolis, Brasil',
      phone: '(48) 99999-0002',
      bio: 'Fotografo a natureza em busca de silêncio. Cada paisagem é um convite para desacelerar e olhar com calma.',
      photos: ['images/paisagem.png', 'images/paisagem2.png']
    },
    {
      id: 3,
      name: 'Lucas Ferreira',
      category: 'arquitetura',
      location: 'Curitiba, Brasil',
      phone: '(41) 99999-0003',
      bio: 'Interessado em linhas, formas e na relação entre as pessoas e o espaço urbano.',
      photos: ['images/arquitetura.png', 'images/saopaulo3.png', 'images/saopaulo5.png', 'images/saopaulo6.png']
    },
    {
      id: 4,
      name: 'Mariana Souza',
      category: 'retrato',
      location: 'Rio de Janeiro, Brasil',
      phone: '(21) 99999-0004',
      bio: 'Retratos que mostram quem a pessoa é, sem poses forçadas e com muita luz natural.',
      photos: ['images/fotopaulo2.png', 'images/fotopaulo3.png']
    },
    {
      id: 5,
      name: 'Rafael Mendes',
      category: 'paisagem',
      location: 'Belo Horizonte, Brasil',
      phone: '(31) 99999-0005',
      bio: 'Trilhas, montanhas e o horário dourado: é onde eu estou sempre que a luz está boa.',
      photos: ['images/paisagem2.png', 'images/paisagem.png']
    },
    {
      id: 6,
      name: 'Camila Torres',
      category: 'arquitetura',
      location: 'São Paulo, Brasil',
      phone: '(11) 99999-0006',
      bio: 'Registro a arquitetura paulistana e os detalhes que passam despercebidos no dia a dia.',
      photos: ['images/saopaulo3.png', 'images/saopaulo5.png', 'images/saopaulo6.png']
    }
  ];

  // Dados editáveis do "dono" (id 1), salvos no navegador
  const DEFAULT_OWNER = (() => {
    const { name, category, phone, bio, avatar, photos } = BASE_PHOTOGRAPHERS[0];
    return { name, category, phone, bio, avatar, photos: [...photos] };
  })();

  // =========================================================
  // 2. FUNÇÕES AUXILIARES
  // =========================================================
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  /** Cria um elemento sem usar innerHTML (evita problemas com aspas e injeção de HTML). */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else node.setAttribute(key, value);
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  /** Remove acentos e deixa minúsculo (busca "joao" encontra "João"). */
  function normalize(text) {
    return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  let toastTimer;
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.append(toast);
    }
    toast.textContent = message;
    // força o navegador a reiniciar a animação
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function loadOwner() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && typeof stored === 'object') {
        return { ...DEFAULT_OWNER, ...stored };
      }
    } catch (err) {
      console.warn('Não foi possível ler os dados salvos:', err);
    }
    return { ...DEFAULT_OWNER, photos: [...DEFAULT_OWNER.photos] };
  }

  /** Retorna true se salvou, false se o armazenamento do navegador estiver cheio/bloqueado. */
  function saveOwner(owner) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(owner));
      return true;
    } catch (err) {
      console.warn('Não foi possível salvar:', err);
      return false;
    }
  }

  /** Lista final de fotógrafos (o id 1 usa os dados editados no dashboard). */
  function getPhotographers() {
    const owner = loadOwner();
    return BASE_PHOTOGRAPHERS.map((base) => {
      const merged = base.id === OWNER_ID ? { ...base, ...owner } : { ...base };
      merged.avatar = merged.avatar || merged.photos[0] || '';
      merged.roleLabel = (CATEGORIES[merged.category] || {}).role || 'Fotógrafo';
      merged.categoryLabel = (CATEGORIES[merged.category] || {}).label || '';
      return merged;
    });
  }

  function getPhotographer(id) {
    return getPhotographers().find((p) => p.id === id) || null;
  }

  function getIdFromUrl() {
    const raw = new URLSearchParams(window.location.search).get('id');
    const id = parseInt(raw, 10);
    return Number.isNaN(id) ? OWNER_ID : id;
  }

  /**
   * Lê uma imagem, reduz para no máximo `maxSize` pixels e devolve como JPEG (data URL).
   * Isso evita estourar o limite de ~5 MB do localStorage.
   */
  function fileToDataURL(file, maxSize, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Imagem inválida'));
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff'; // PNG transparente não vira fundo preto
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // =========================================================
  // 3. PÁGINA EXPLORAR (explorar.html)
  // =========================================================
  function initExplorar() {
    const grid = $('#photographers-grid');
    const searchInput = $('#search');
    const pills = $$('.filter-pills .pill');
    const loadMoreBox = $('#load-more');
    const loadMoreBtn = $('#load-more-btn');
    const emptyState = $('#empty-state');
    if (!grid) return;

    const PER_PAGE = 3;
    const photographers = getPhotographers();
    let category = 'todos';
    let term = '';
    let visibleCount = PER_PAGE;

    function createCard(p) {
      const cover = p.photos[0] || p.avatar;
      return el('div', { class: 'card', dataset: { category: p.category } }, [
        el('img', { src: cover, alt: `Fotografia de ${p.name}`, loading: 'lazy' }),
        el('h3', { text: p.name }),
        el('p', { class: 'category', text: p.categoryLabel }),
        el('a', { href: `perfil.html?id=${p.id}`, class: 'link-portfolio', text: 'Ver Portfólio' })
      ]);
    }

    function render() {
      const filtered = photographers.filter((p) => {
        const matchesCategory = category === 'todos' || p.category === category;
        const matchesSearch = normalize(p.name).includes(term);
        return matchesCategory && matchesSearch;
      });

      grid.replaceChildren(...filtered.slice(0, visibleCount).map(createCard));
      emptyState.hidden = filtered.length > 0;
      loadMoreBox.hidden = filtered.length <= visibleCount;
    }

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        category = pill.dataset.filter;
        visibleCount = PER_PAGE;
        render();
      });
    });

    searchInput.addEventListener('input', (e) => {
      term = normalize(e.target.value.trim());
      visibleCount = PER_PAGE;
      render();
    });

    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PER_PAGE;
      render();
    });

    render();
  }

  // =========================================================
  // 4. PÁGINA DE PERFIL (perfil.html?id=1)
  // =========================================================
  function initPerfil() {
    const id = getIdFromUrl();
    const p = getPhotographer(id);

    const container = $('#profile-container');
    const notFound = $('#not-found');
    const grid = $('#portfolio-grid');
    const portfolioEmpty = $('#portfolio-empty');

    if (!p) {
      container.hidden = true;
      notFound.hidden = false;
      document.title = 'PhotoFrame - Fotógrafo não encontrado';
      return;
    }

    document.title = `PhotoFrame - ${p.name}`;
    $('#profile-name').textContent = p.name;
    $('#profile-role').textContent = p.roleLabel;
    $('#profile-location').textContent = p.location;
    $('#profile-bio').textContent = p.bio;

    const avatar = $('#profile-avatar-img');
    avatar.src = p.avatar;
    avatar.alt = `Foto de perfil de ${p.name}`;

    // WhatsApp com mensagem pronta
    const whatsappBtn = $('#btn-whatsapp');
    const digits = (p.phone || '').replace(/\D/g, '');
    if (digits) {
      const number = digits.length <= 11 ? `55${digits}` : digits;
      const message = encodeURIComponent(`Olá ${p.name}, vi seu portfólio no PhotoFrame e gostaria de solicitar um orçamento!`);
      whatsappBtn.href = `https://wa.me/${number}?text=${message}`;
    } else {
      whatsappBtn.hidden = true;
    }

    // Botão "Gerenciar perfil" só aparece no perfil do dono (simulação de login)
    $('#btn-manage').hidden = p.id !== OWNER_ID;

    // Portfólio: cada foto abre a galeria exatamente naquele índice
    if (p.photos.length === 0) {
      portfolioEmpty.hidden = false;
      return;
    }
    grid.replaceChildren(
      ...p.photos.map((src, index) =>
        el('a', { href: `galeria.html?id=${p.id}&foto=${index}`, 'aria-label': `Abrir foto ${index + 1} de ${p.photos.length}` }, [
          el('img', { src, alt: `Foto ${index + 1} de ${p.name}`, loading: 'lazy' })
        ])
      )
    );
  }

  // =========================================================
  // 5. GALERIA / LIGHTBOX (galeria.html?id=1&foto=0)
  // =========================================================
  function initGaleria() {
    const id = getIdFromUrl();
    const p = getPhotographer(id);
    const photos = p ? p.photos : [];

    const mainImage = $('#main-image');
    const thumbsBox = $('#thumbs');
    const counter = $('#counter');
    const prevBtn = $('#prev-btn');
    const nextBtn = $('#next-btn');
    const backLink = $('#back-to-profile');
    const profileUrl = `perfil.html?id=${p ? p.id : OWNER_ID}`;

    backLink.href = profileUrl;

    if (photos.length === 0) {
      mainImage.hidden = true;
      $('#gallery-empty').hidden = false;
      prevBtn.hidden = true;
      nextBtn.hidden = true;
      counter.textContent = '00/00';
      return;
    }

    document.title = `PhotoFrame - Fotos de ${p.name}`;

    const pad = (n) => String(n).padStart(2, '0');
    let current = 0;

    const thumbButtons = photos.map((src, index) => {
      const btn = el('button', { type: 'button', class: 'thumb', 'aria-label': `Ver foto ${index + 1}` }, [
        el('img', { src, alt: '' })
      ]);
      btn.addEventListener('click', () => show(index));
      return btn;
    });
    thumbsBox.replaceChildren(...thumbButtons);

    function show(index) {
      current = (index + photos.length) % photos.length; // navegação circular
      mainImage.src = photos[current];
      mainImage.alt = `Foto ${current + 1} de ${p.name}`;

      thumbButtons.forEach((btn, i) => {
        const active = i === current;
        btn.classList.toggle('active-thumb', active);
        if (active) {
          btn.setAttribute('aria-current', 'true');
          btn.scrollIntoView({ block: 'nearest', inline: 'center' });
        } else {
          btn.removeAttribute('aria-current');
        }
      });

      counter.textContent = `${pad(current + 1)}/${pad(photos.length)}`;
    }

    const goPrev = () => show(current - 1);
    const goNext = () => show(current + 1);

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') window.location.href = profileUrl;
    });

    const start = parseInt(new URLSearchParams(window.location.search).get('foto'), 10);
    show(!Number.isNaN(start) && start >= 0 && start < photos.length ? start : 0);
  }

  // =========================================================
  // 6. DASHBOARD (dashboard.html)
  // =========================================================
  function initDashboard() {
    let owner = loadOwner();

    const nameEl = $('#dash-name');
    const roleEl = $('#dash-role');
    const bioEl = $('#dash-bio');
    const avatarImg = $('#avatar-img');
    const avatarBtn = $('#avatar-btn');
    const avatarInput = $('#avatar-input');

    const photosGrid = $('#dash-grid');
    const photosEmpty = $('#dash-empty');
    const photoCount = $('#photo-count');
    const addPhotosBtn = $('#add-photos-btn');
    const photosInput = $('#photos-input');

    const editBtn = $('#edit-btn');
    const panel = $('#edit-panel');
    const form = $('#edit-form');
    const cancelBtn = $('#cancel-btn');
    const fullname = $('#fullname');
    const category = $('#category');
    const phone = $('#phone');
    const bio = $('#bio');
    const charCount = $('#char-count');

    /** Salva alterações. Só atualiza a tela se o salvamento der certo. */
    function commit(changes, successMessage) {
      const next = { ...owner, ...changes };
      if (!saveOwner(next)) {
        showToast('Armazenamento do navegador cheio. Remova algumas fotos e tente de novo.');
        return false;
      }
      owner = next;
      if (successMessage) showToast(successMessage);
      return true;
    }

    // ----- Cabeçalho do perfil -----
    function renderHeader() {
      nameEl.textContent = owner.name;
      roleEl.textContent = (CATEGORIES[owner.category] || {}).role || '';
      bioEl.textContent = owner.bio;
      avatarImg.src = owner.avatar;
    }

    // ----- Grade de fotos -----
    function renderPhotos() {
      photosGrid.replaceChildren(
        ...owner.photos.map((src, index) =>
          el('div', { class: 'dash-photo-item' }, [
            el('img', { src, alt: `Foto ${index + 1} do portfólio`, loading: 'lazy' }),
            el('button', {
              type: 'button',
              class: 'btn-delete-photo',
              title: 'Excluir foto',
              'aria-label': `Excluir foto ${index + 1}`,
              dataset: { index }
            }, ['🗑️'])
          ])
        )
      );
      photosEmpty.hidden = owner.photos.length > 0;
      photoCount.textContent = owner.photos.length ? `(${owner.photos.length})` : '';
    }

    // Excluir foto (delegação de eventos: funciona também para fotos novas)
    photosGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete-photo');
      if (!btn) return;
      if (!confirm('Tem certeza que deseja excluir esta foto do portfólio?')) return;

      const index = Number(btn.dataset.index);
      const photos = owner.photos.filter((_, i) => i !== index);
      if (commit({ photos }, 'Foto excluída.')) renderPhotos();
    });

    // Adicionar fotos
    addPhotosBtn.addEventListener('click', () => photosInput.click());

    photosInput.addEventListener('change', async () => {
      const files = [...photosInput.files].filter((f) => f.type.startsWith('image/'));
      photosInput.value = '';
      if (files.length === 0) return;

      try {
        const urls = await Promise.all(files.map((f) => fileToDataURL(f, 1400)));
        const label = urls.length === 1 ? '1 foto adicionada!' : `${urls.length} fotos adicionadas!`;
        if (commit({ photos: [...urls, ...owner.photos] }, label)) renderPhotos();
      } catch (err) {
        console.warn(err);
        showToast('Não foi possível ler uma das imagens.');
      }
    });

    // Alterar foto de perfil
    avatarBtn.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', async () => {
      const file = avatarInput.files[0];
      avatarInput.value = '';
      if (!file || !file.type.startsWith('image/')) return;

      try {
        const dataUrl = await fileToDataURL(file, 500);
        if (commit({ avatar: dataUrl }, 'Foto de perfil atualizada!')) renderHeader();
      } catch (err) {
        console.warn(err);
        showToast('Não foi possível ler a imagem.');
      }
    });

    // ----- Painel de edição -----
    function updateCharCount() {
      charCount.textContent = `${bio.value.length}/500`;
    }

    function fillForm() {
      fullname.value = owner.name;
      category.value = owner.category;
      phone.value = owner.phone;
      bio.value = owner.bio;
      updateCharCount();
    }

    function openPanel() {
      fillForm();
      panel.hidden = false;
      fullname.focus();
    }

    function closePanel() {
      panel.hidden = true;
      editBtn.focus();
    }

    editBtn.addEventListener('click', openPanel);
    cancelBtn.addEventListener('click', closePanel);
    bio.addEventListener('input', updateCharCount);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    // O navegador valida required / pattern / maxlength antes do submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const changes = {
        name: fullname.value.trim(),
        category: category.value,
        phone: phone.value.trim(),
        bio: bio.value.trim()
      };
      if (commit(changes, 'Perfil salvo! As mudanças já aparecem no seu portfólio público.')) {
        renderHeader();
        closePanel();
      }
    });

    renderHeader();
    renderPhotos();
  }

  // =========================================================
  // 7. INICIALIZAÇÃO (escolhe o código pela página)
  // =========================================================
  const pages = {
    explorar: initExplorar,
    perfil: initPerfil,
    galeria: initGaleria,
    dashboard: initDashboard
  };

  const init = pages[document.body.dataset.page];
  if (init) init();
})();
