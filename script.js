document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================
  // 1. PÁGINA EXPLORAR (explorar.html) - FILTRO, BUSCA E CARREGAR MAIS
  // =========================================================
  const filterPillsContainer = document.querySelector('.filter-pills');
  const filterButtons = document.querySelectorAll('.filter-pills .pill');
  const photographersGrid = document.querySelector('.photographers-grid');
  const loadMoreBtn = document.querySelector('.load-more .btn-outline');

  if (filterButtons.length > 0 && photographersGrid) {
    let activeCategory = 'todos';
    let searchTerm = '';

    // Cria barra de busca dinamicamente
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Buscar fotógrafo...';
    searchInput.setAttribute('aria-label', 'Buscar fotógrafo por nome');
    searchInput.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #dddddd;
      border-radius: 20px;
      font-size: 0.9rem;
      outline: none;
      width: 220px;
      font-family: inherit;
    `;

    if (filterPillsContainer) {
      filterPillsContainer.style.alignItems = 'center';
      filterPillsContainer.style.flexWrap = 'wrap';
      filterPillsContainer.prepend(searchInput);
    }

    // Função unificada (busca sempre todos os cards atuais, inclusive os carregados depois)
    function filterPhotographers() {
      const allCards = document.querySelectorAll('.photographers-grid .card');
      allCards.forEach(card => {
        const cardName = card.querySelector('h3')?.textContent.trim().toLowerCase() || '';
        const cardCategory = card.querySelector('.category')?.textContent.trim().toLowerCase() || '';

        const matchesCategory =
          activeCategory === 'todos' ||
          cardCategory.includes(activeCategory) ||
          (activeCategory === 'paisagem' && cardCategory.includes('natureza'));

        const matchesSearch = cardName.includes(searchTerm);

        card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
      });
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        activeCategory = button.textContent.trim().toLowerCase();
        filterPhotographers();
      });
    });

    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      filterPhotographers();
    });

    // [NOVO] Botão CARREGAR MAIS funcional
    if (loadMoreBtn) {
      const extraPhotographers = [
        { name: 'Mariana Souza', category: 'Retrato', img: 'images/fotopaulo2.png' },
        { name: 'Rafael Mendes', category: 'Paisagem', img: 'images/paisagem2.png' },
        { name: 'Camila Torres', category: 'Arquitetura', img: 'images/saopaulo3.png' }
      ];

      loadMoreBtn.addEventListener('click', () => {
        extraPhotographers.forEach(item => {
          const card = document.createElement('div');
          card.classList.add('card');
          card.innerHTML = `
            <img src="${item.img}" alt="Fotografia por ${item.name}">
            <h3>${item.name}</h3>
            <p class="category">${item.category}</p>
            <a href="perfil.html" class="link-portfolio">Ver Portfólio</a>
          `;
          photographersGrid.appendChild(card);
        });

        filterPhotographers();
        loadMoreBtn.style.display = 'none'; // Esconde o botão após carregar todos
      });
    }
  }

  // =========================================================
  // 2. GALERIA / LIGHTBOX (galeria.html) - NAVEGAÇÃO E URL DIRETA
  // =========================================================
  const mainImage = document.querySelector('.main-image-view img');
  const thumbnails = document.querySelectorAll('.thumbs img');
  const prevBtn = document.querySelector('.nav-arrow.left');
  const nextBtn = document.querySelector('.nav-arrow.right');
  const counterText = document.querySelector('.thumbnails-bar .counter');

  if (mainImage && thumbnails.length > 0) {
    let currentIndex = 0;

    function updateLightbox(index) {
      currentIndex = index;
      mainImage.src = thumbnails[currentIndex].src;
      mainImage.alt = thumbnails[currentIndex].alt || 'Imagem Expandida';

      thumbnails.forEach(thumb => thumb.classList.remove('active-thumb'));
      thumbnails[currentIndex].classList.add('active-thumb');

      if (counterText) {
        const currentFormatted = String(currentIndex + 1).padStart(2, '0');
        const totalFormatted = String(thumbnails.length).padStart(2, '0');
        counterText.textContent = `${currentFormatted}/${totalFormatted}`;
      }
    }

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => updateLightbox(index));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        updateLightbox(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % thumbnails.length;
        updateLightbox(newIndex);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        const newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        updateLightbox(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = (currentIndex + 1) % thumbnails.length;
        updateLightbox(newIndex);
      } else if (e.key === 'Escape') {
        window.location.href = 'perfil.html';
      }
    });

    // [NOVO] Abre exatamente na foto clicada no perfil.html (?foto=0, 1, 2, 3)
    const params = new URLSearchParams(window.location.search);
    const startPhoto = parseInt(params.get('foto'), 10);
    const initialIndex = (!isNaN(startPhoto) && startPhoto >= 0 && startPhoto < thumbnails.length) ? startPhoto : 0;

    updateLightbox(initialIndex);
  }

  // =========================================================
  // 3. DASHBOARD (dashboard.html) - MODAL, EDIÇÃO E UPLOAD REAL
  // =========================================================
  const editModal = document.querySelector('.edit-profile-modal');
  const openEditBtn = document.querySelector('.btn-edit-profile');
  const cancelEditBtn = document.querySelector('.btn-cancel');
  const editForm = document.querySelector('.edit-form');
  const bioTextarea = document.querySelector('#bio');
  const charCount = document.querySelector('.char-count');
  const deleteButtons = document.querySelectorAll('.btn-delete-photo');
  const addPhotoBtn = document.querySelector('.btn-add-photos');
  const photoGrid = document.querySelector('.dashboard-photo-grid');

  // [NOVO] Controle de abrir e fechar o painel lateral de edição
  if (editModal && openEditBtn) {
    editModal.style.display = 'none'; // Inicia recolhido para dar destaque ao portfólio

    openEditBtn.addEventListener('click', () => {
      editModal.style.display = 'block';
      document.querySelector('#fullname')?.focus();
    });

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
      });
    }
  }

  // 3.1 Contador de caracteres em tempo real
  if (bioTextarea && charCount) {
    charCount.textContent = `${bioTextarea.value.length}/500`;
    bioTextarea.addEventListener('input', () => {
      charCount.textContent = `${bioTextarea.value.length}/500`;
    });
  }

  // 3.2 [CORRIGIDO] Carregar e Salvar perfil completo (incluindo categoria)
  const savedProfile = JSON.parse(localStorage.getItem('photoframe_profile'));
  const savedAvatar = localStorage.getItem('photoframe_avatar');

  if (savedProfile) {
    const displayTitle = document.querySelector('.profile-header-info h2');
    const displayRole = document.querySelector('.profile-header-info .role');
    const displayBio = document.querySelector('.profile-header-info .bio-summary');

    if (displayTitle) displayTitle.textContent = savedProfile.name;
    if (displayRole) displayRole.textContent = savedProfile.category;
    if (displayBio) displayBio.textContent = savedProfile.bio;

    if (editForm) {
      document.querySelector('#fullname').value = savedProfile.name;
      if (savedProfile.categoryValue) {
        document.querySelector('#category').value = savedProfile.categoryValue;
      }
      document.querySelector('#phone').value = savedProfile.phone;
      if (bioTextarea) {
        bioTextarea.value = savedProfile.bio;
        if (charCount) charCount.textContent = `${savedProfile.bio.length}/500`;
      }
    }
  }

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newName = document.querySelector('#fullname').value;
      const categorySelect = document.querySelector('#category');
      const newCategory = categorySelect.options[categorySelect.selectedIndex].text;
      const newCategoryValue = categorySelect.value;
      const newPhone = document.querySelector('#phone').value;
      const newBio = bioTextarea.value;

      const profileData = {
        name: newName,
        category: newCategory,
        categoryValue: newCategoryValue,
        phone: newPhone,
        bio: newBio
      };
      localStorage.setItem('photoframe_profile', JSON.stringify(profileData));

      const displayTitle = document.querySelector('.profile-header-info h2');
      const displayRole = document.querySelector('.profile-header-info .role');
      const displayBio = document.querySelector('.profile-header-info .bio-summary');

      if (displayTitle) displayTitle.textContent = newName;
      if (displayRole) displayRole.textContent = newCategory;
      if (displayBio) displayBio.textContent = newBio;

      if (editModal) editModal.style.display = 'none';
      alert('Perfil salvo e sincronizado com a página de Perfil!');
    });
  }

  // 3.3 Excluir foto do portfólio
  function attachDeleteEvent(button) {
    button.addEventListener('click', () => {
      const photoItem = button.closest('.dash-photo-item');
      if (photoItem && confirm('Tem certeza que deseja excluir esta foto do portfólio?')) {
        photoItem.remove();
      }
    });
  }
  deleteButtons.forEach(btn => attachDeleteEvent(btn));

  // 3.4 Upload REAL de fotos do portfólio
  if (addPhotoBtn && photoGrid) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    addPhotoBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newItem = document.createElement('div');
          newItem.classList.add('dash-photo-item');
          newItem.innerHTML = `
            <img src="${event.target.result}" alt="${file.name}">
            <button type="button" class="btn-delete-photo" title="Excluir foto" aria-label="Excluir foto">🗑️</button>
          `;
          photoGrid.prepend(newItem);
          attachDeleteEvent(newItem.querySelector('.btn-delete-photo'));
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = '';
    });
  }

  // 3.5 [CORRIGIDO] Upload REAL do Avatar com salvamento no localStorage
  const avatarOverlay = document.querySelector('.avatar-overlay');
  const avatarImg = document.querySelector('.avatar-img');

  if (avatarImg && savedAvatar) {
    avatarImg.src = savedAvatar;
  }

  if (avatarOverlay && avatarImg) {
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.style.display = 'none';
    document.body.appendChild(avatarInput);

    avatarOverlay.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarImg.src = event.target.result;
          try {
            localStorage.setItem('photoframe_avatar', event.target.result);
          } catch (err) {
            console.warn('Imagem muito grande para salvar no cache local, mas exibida na sessão.');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // =========================================================
  // 4. PÁGINA DE PERFIL (perfil.html) - SINCRONIZAÇÃO E LINKS DE GALERIA
  // =========================================================
  const profileSection = document.querySelector('.profile-hero');
  const portfolioLinks = document.querySelectorAll('.portfolio-grid a');

  // [NOVO] Faz cada foto da grade abrir a galeria exatamente no seu índice
  portfolioLinks.forEach((link, index) => {
    link.href = `galeria.html?foto=${index}`;
  });

  if (profileSection) {
    if (savedAvatar) {
      const publicAvatar = profileSection.querySelector('.profile-avatar img');
      if (publicAvatar) publicAvatar.src = savedAvatar;
    }

    if (savedProfile) {
      const publicName = profileSection.querySelector('.profile-info h2');
      const publicCategory = profileSection.querySelector('.profile-info .subtitle');
      const publicBio = profileSection.querySelector('.profile-info .bio');
      const whatsappBtn = profileSection.querySelector('.btn-whatsapp');

      if (publicName) publicName.textContent = savedProfile.name;
      if (publicCategory) publicCategory.textContent = savedProfile.category;
      if (publicBio) publicBio.textContent = savedProfile.bio;

      if (whatsappBtn && savedProfile.phone) {
        const cleanPhone = savedProfile.phone.replace(/\D/g, '');
        const message = encodeURIComponent(`Olá ${savedProfile.name}, vi seu portfólio no Photoframe e gostaria de solicitar um orçamento!`);
        whatsappBtn.href = `https://wa.me/55${cleanPhone}?text=${message}`;
        whatsappBtn.target = '_blank';
      }
    }
  }

});