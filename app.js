/* 1. MOUSE REPELLING CANVAS PARTICLES & CURSOR GLOW */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const cursorGlow = document.getElementById('cursorGlow');

let width, height;
let particles = [];
const mouse = { x: -1000, y: -1000, radius: 140 };

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.size = Math.random() * 2 + 1.2;
        this.density = (Math.random() * 25) + 8;
        this.alpha = Math.random() * 0.6 + 0.3;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dxBase = this.x - this.baseX;
                this.x -= dxBase / 10;
            }
            if (this.y !== this.baseY) {
                let dyBase = this.y - this.baseY;
                this.y -= dyBase / 10;
            }
        }
    }
}

function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 9000);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    cursorGlow.style.setProperty('--mouse-x', `${e.clientX}px`);
    cursorGlow.style.setProperty('--mouse-y', `${e.clientY}px`);
});

window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

window.addEventListener('resize', resizeCanvas);


/* 2. DYNAMIC SITE CONTENT DATA MANAGEMENT */
const DEFAULT_CONTENT = {
    heroBadge: "BukalDev Portfolio Showcase",
    heroSubheading: "Explore custom architectural projects, high-detail 3D visual assets, and game titles crafted by BukalDev. Move your cursor to interact with avoiding particles and dynamic lighting.",
    aboutTitle: "Specialized in Virtual Architecture, 3D Assets & Game Projects",
    aboutBio1: "Hello! I'm BukalDev. I build immersive structural building layouts, detailed 3D digital assets, and contribute to interactive game projects.",
    aboutBio2: "Whether working on complex architectural builds, modeling hard-surface props, or designing game environments, every project emphasizes high fidelity visual presentation and clean performance.",
    cardRole: "Architect, 3D Modeler & Game Dev",
    gamesTitle: "Games I Worked On",
    showcaseTitle: "Showcase Works",
    contactSub: "Get directly in touch with me on Discord for inquiries, custom builds, 3D models, or game developments.",
    discordHandle: "myteaaaaa"
};

let siteContent = {};

/* SERVER SYNC - content is stored on the server so every visitor sees it */
let adminToken = sessionStorage.getItem('bukaldev_admin_token');

async function fetchSiteData() {
    try {
        const res = await fetch('/api/site', { cache: 'no-store' });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error('Failed to load site data', e);
    }
    return null;
}

async function saveSiteData() {
    if (!adminToken) {
        alert('Please log in again to save changes.');
        lockAdmin();
        return false;
    }
    try {
        const res = await fetch('/api/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ content: siteContent, items: portfolioItems, games: gamesItems })
        });
        if (res.status === 401) {
            alert('Your admin session expired. Please log in again.');
            lockAdmin();
            return false;
        }
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Failed to save changes.');
            return false;
        }
        return true;
    } catch (e) {
        alert('Network error: changes were not saved.');
        return false;
    }
}

function loadSiteContent(data) {
    siteContent = (data && data.content) || DEFAULT_CONTENT;
    applySiteContentToUI();
}

function applySiteContentToUI() {
    document.getElementById('displayHeroBadge').innerText = siteContent.heroBadge || DEFAULT_CONTENT.heroBadge;
    document.getElementById('displayHeroSubheading').innerText = siteContent.heroSubheading || DEFAULT_CONTENT.heroSubheading;
    document.getElementById('displayAboutTitle').innerText = siteContent.aboutTitle || DEFAULT_CONTENT.aboutTitle;
    document.getElementById('displayAboutBio1').innerText = siteContent.aboutBio1 || DEFAULT_CONTENT.aboutBio1;
    document.getElementById('displayAboutBio2').innerText = siteContent.aboutBio2 || DEFAULT_CONTENT.aboutBio2;
    document.getElementById('displayCardRole').innerText = siteContent.cardRole || DEFAULT_CONTENT.cardRole;
    document.getElementById('displayGamesTitle').innerText = siteContent.gamesTitle || DEFAULT_CONTENT.gamesTitle;
    document.getElementById('displayShowcaseTitle').innerText = siteContent.showcaseTitle || DEFAULT_CONTENT.showcaseTitle;
    document.getElementById('displayContactSub').innerText = siteContent.contactSub || DEFAULT_CONTENT.contactSub;
    
    const handle = siteContent.discordHandle || DEFAULT_CONTENT.discordHandle;
    document.getElementById('discordHandleText').innerText = handle;
    document.getElementById('displayDiscordFootHandle').innerText = handle;

    // Populate Form inputs
    document.getElementById('editHeroBadge').value = siteContent.heroBadge || DEFAULT_CONTENT.heroBadge;
    document.getElementById('editHeroSubheading').value = siteContent.heroSubheading || DEFAULT_CONTENT.heroSubheading;
    document.getElementById('editAboutTitle').value = siteContent.aboutTitle || DEFAULT_CONTENT.aboutTitle;
    document.getElementById('editAboutBio1').value = siteContent.aboutBio1 || DEFAULT_CONTENT.aboutBio1;
    document.getElementById('editAboutBio2').value = siteContent.aboutBio2 || DEFAULT_CONTENT.aboutBio2;
    document.getElementById('editCardRole').value = siteContent.cardRole || DEFAULT_CONTENT.cardRole;
    document.getElementById('editGamesTitle').value = siteContent.gamesTitle || DEFAULT_CONTENT.gamesTitle;
    document.getElementById('editShowcaseTitle').value = siteContent.showcaseTitle || DEFAULT_CONTENT.showcaseTitle;
    document.getElementById('editContactSub').value = siteContent.contactSub || DEFAULT_CONTENT.contactSub;
    document.getElementById('editDiscordHandle').value = handle;
}

async function handleSiteContentSubmit(e) {
    e.preventDefault();
    siteContent = {
        heroBadge: document.getElementById('editHeroBadge').value,
        heroSubheading: document.getElementById('editHeroSubheading').value,
        aboutTitle: document.getElementById('editAboutTitle').value,
        aboutBio1: document.getElementById('editAboutBio1').value,
        aboutBio2: document.getElementById('editAboutBio2').value,
        cardRole: document.getElementById('editCardRole').value,
        gamesTitle: document.getElementById('editGamesTitle').value,
        showcaseTitle: document.getElementById('editShowcaseTitle').value,
        contactSub: document.getElementById('editContactSub').value,
        discordHandle: document.getElementById('editDiscordHandle').value
    };
    applySiteContentToUI();
    if (await saveSiteData()) closeAdminModal();
}


/* 3. SHOWCASE & GAMES DATA STORAGE */
const DEFAULT_ITEMS = [
    {
        id: '1',
        title: 'Glass Skylight Structure',
        category: 'building',
        description: 'Contemporary architectural construction with parametric steel framework and tinted solar glass.',
        tags: ['Architecture', 'Revit'],
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '2',
        title: 'Cyberpunk Drone Asset',
        category: 'model',
        description: 'Hard-surface game asset featuring high-poly details and metallic PBR textures.',
        tags: ['3D Model', 'Blender'],
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '3',
        title: 'Cantilever Forest Villa',
        category: 'building',
        description: 'Modern residential villa with glass walls integrated into natural cliffside terrain.',
        tags: ['Residential', 'Build'],
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '4',
        title: 'Sci-Fi Mech Unit',
        category: 'model',
        description: '3D robot asset rigged with custom skeletal joints and realistic surface scratches.',
        tags: ['Character Asset', 'ZBrush'],
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'
    }
];

const DEFAULT_GAMES = [
    {
        id: 'g1',
        title: 'Neon Odyssey',
        role: 'Lead Environment Builder',
        description: 'Open-world cyberpunk adventure. I built the futuristic cityscape layouts, skyscrapers, and custom hard-surface 3D street assets.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        linkUrl: 'https://roblox.com'
    },
    {
        id: 'g2',
        title: 'Shadow Fortress Protocol',
        role: 'Architectural & 3D Asset Designer',
        description: 'Tactical survival game. Designed modular fortress structures, interior props, and decorative industrial assets.',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
        linkUrl: 'https://store.steampowered.com'
    }
];

let portfolioItems = [];
let gamesItems = [];
let currentFilter = 'all';
let isAdminAuthenticated = false;

function loadPortfolioData(data) {
    portfolioItems = (data && Array.isArray(data.items)) ? data.items : DEFAULT_ITEMS;
    gamesItems = (data && Array.isArray(data.games)) ? data.games : DEFAULT_GAMES;

    updateStatsAndBadges();
    renderShowcase();
    renderGames();
}

function savePortfolioData() {
    updateStatsAndBadges();
    return saveSiteData();
}

function saveGamesData() {
    updateStatsAndBadges();
    return saveSiteData();
}

function updateStatsAndBadges() {
    const bCount = portfolioItems.filter(i => i.category === 'building').length;
    const mCount = portfolioItems.filter(i => i.category === 'model').length;
    const gCount = gamesItems.length;

    document.getElementById('statBuildings').innerText = bCount;
    document.getElementById('statModels').innerText = mCount;
    document.getElementById('statGames').innerText = gCount;

    document.getElementById('badge-all').innerText = portfolioItems.length;
    document.getElementById('badge-building').innerText = bCount;
    document.getElementById('badge-model').innerText = mCount;
}

/* 4. RENDER SHOWCASE (WITH 3D TILT & LIGHTBOX) */
function filterShowcase(category) {
    currentFilter = category;
    document.querySelectorAll('.showcase-tab').forEach(tab => {
        tab.classList.remove('bg-blue-600', 'text-white');
        tab.classList.add('text-slate-300');
    });

    const activeTab = document.getElementById(`tab-${category}`);
    if (activeTab) {
        activeTab.classList.remove('text-slate-300');
        activeTab.classList.add('bg-blue-600', 'text-white');
    }
    renderShowcase();
}

function renderShowcase() {
    const grid = document.getElementById('portfolioGrid');
    const emptyState = document.getElementById('emptyShowcaseState');
    grid.innerHTML = '';

    const filtered = portfolioItems.filter(item => {
        if (currentFilter === 'all') return true;
        return item.category === currentFilter;
    });

    if (filtered.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    filtered.forEach(item => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'tilt-card-container';

        const isBuilding = item.category === 'building';
        const badge = isBuilding 
            ? `<span class="bg-blue-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full"><i class="fa-solid fa-building mr-1"></i> Building</span>`
            : `<span class="bg-purple-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full"><i class="fa-solid fa-cube mr-1"></i> 3D Model</span>`;

        cardWrapper.innerHTML = `
            <div class="tilt-card glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div>
                    <div class="relative w-full h-52 bg-slate-900 overflow-hidden group cursor-pointer" onclick="openLightbox('${item.imageUrl.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}', '${item.description.replace(/'/g, "\\\'")}')">
                        <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/800x600/1e293b/ffffff?text=BukalDev+Project'">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span class="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                <i class="fa-solid fa-expand"></i> Click to Enlarge
                            </span>
                        </div>
                        <div class="absolute top-3 left-3">${badge}</div>
                    </div>
                    <div class="p-5 space-y-2">
                        <h3 class="text-lg font-bold text-white">${item.title}</h3>
                        <p class="text-slate-300 text-sm leading-relaxed">${item.description}</p>
                        <div class="flex flex-wrap gap-1.5 pt-2">
                            ${item.tags.map(t => `<span class="text-[11px] bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-md">${t}</span>`).join('')}
                        </div>
                    </div>
                </div>
                ${isAdminAuthenticated ? `
                    <div class="p-4 pt-0 border-t border-white/5 mt-3 flex justify-end">
                        <button onclick="deleteItem('${item.id}')" class="text-xs text-red-400 hover:text-red-300 active:scale-95">Delete</button>
                    </div>
                ` : ''}
            </div>
        `;

        grid.appendChild(cardWrapper);
        applyTiltEffect(cardWrapper.querySelector('.tilt-card'));
    });
}

/* 3D TILT EFFECT FUNCTION */
function applyTiltEffect(card) {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
}

/* 5. RENDER GAMES SECTION */
function renderGames() {
    const grid = document.getElementById('gamesGrid');
    const emptyState = document.getElementById('emptyGamesState');
    grid.innerHTML = '';

    if (gamesItems.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    gamesItems.forEach(game => {
        const card = document.createElement('div');
        card.className = 'glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300';
        
        card.innerHTML = `
            <div>
                <div class="relative w-full h-60 bg-slate-900 overflow-hidden group cursor-pointer" onclick="openLightbox('${game.imageUrl.replace(/'/g, "\\'")}', '${game.title.replace(/'/g, "\\'")}', '${game.description.replace(/'/g, "\\\'")}')">
                    <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/800x600/064e3b/ffffff?text=Game+Project'">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span class="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                            <i class="fa-solid fa-expand"></i> Preview Cover
                        </span>
                    </div>
                    <div class="absolute top-3 left-3">
                        <span class="bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            <i class="fa-solid fa-gamepad"></i> Game Title
                        </span>
                    </div>
                </div>
                <div class="p-6 space-y-3">
                    <h3 class="text-xl font-bold text-white">${game.title}</h3>
                    <div class="inline-block px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                        Role: ${game.role}
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed">${game.description}</p>
                </div>
            </div>

            <div class="p-6 pt-0 flex items-center justify-between gap-4 border-t border-white/5 mt-4">
                ${game.linkUrl ? `
                    <a href="${game.linkUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all duration-150 flex items-center gap-2">
                        <span>Play / View Game</span>
                        <i class="fa-solid fa-up-right-from-square text-[10px]"></i>
                    </a>
                ` : `<span></span>`}

                ${isAdminAuthenticated ? `
                    <button onclick="deleteGame('${game.id}')" class="text-xs text-red-400 hover:text-red-300 active:scale-95">Delete Game</button>
                ` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

async function deleteItem(id) {
    if (!isAdminAuthenticated) return;
    portfolioItems = portfolioItems.filter(i => i.id !== id);
    savePortfolioData();
    renderShowcase();
}

async function deleteGame(id) {
    if (!isAdminAuthenticated) return;
    gamesItems = gamesItems.filter(g => g.id !== id);
    saveGamesData();
    renderGames();
}

/* 6. LIGHTBOX MODAL */
function openLightbox(url, title, desc) {
    const modal = document.getElementById('lightboxModal');
    document.getElementById('lightboxImage').src = url;
    document.getElementById('lightboxTitle').innerText = title;
    document.getElementById('lightboxDescription').innerText = desc;

    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeLightbox() {
    document.getElementById('lightboxModal').classList.add('opacity-0', 'pointer-events-none');
}

/* 7. ADMIN CONTROLS */
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('adminModalContent').classList.remove('scale-95');
}
function closeAdminModal() {
    document.getElementById('adminModal').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('adminModalContent').classList.add('scale-95');
}
function unlockAdminUI() {
    isAdminAuthenticated = true;
    document.getElementById('adminAuthSection').classList.add('hidden');
    document.getElementById('adminPanelSection').classList.remove('hidden');
    renderShowcase();
    renderGames();
}
async function handleAdminAuth(e) {
    e.preventDefault();
    const input = document.getElementById('adminPasswordInput');
    const notice = document.getElementById('adminErrorNotice');
    notice.classList.add('hidden');
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: input.value })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.token) {
            adminToken = data.token;
            sessionStorage.setItem('bukaldev_admin_token', adminToken);
            input.value = '';
            unlockAdminUI();
            return;
        }
        notice.innerText = data.error || 'Incorrect password!';
    } catch (err) {
        notice.innerText = 'Could not reach the server.';
    }
    notice.classList.remove('hidden');
}
function lockAdmin() {
    isAdminAuthenticated = false;
    adminToken = null;
    sessionStorage.removeItem('bukaldev_admin_token');
    document.getElementById('adminAuthSection').classList.remove('hidden');
    document.getElementById('adminPanelSection').classList.add('hidden');
    renderShowcase();
    renderGames();
}
function switchAdminTab(tab) {
    const contentForm = document.getElementById('adminContentForm');
    const showcaseForm = document.getElementById('adminShowcaseForm');
    const gamesForm = document.getElementById('adminGamesForm');
    
    const btnContent = document.getElementById('adminTabBtnContent');
    const btnShowcase = document.getElementById('adminTabBtnShowcase');
    const btnGames = document.getElementById('adminTabBtnGames');

    contentForm.classList.add('hidden');
    showcaseForm.classList.add('hidden');
    gamesForm.classList.add('hidden');

    btnContent.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white";
    btnShowcase.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white";
    btnGames.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white";

    if (tab === 'content') {
        contentForm.classList.remove('hidden');
        btnContent.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white";
    } else if (tab === 'showcase') {
        showcaseForm.classList.remove('hidden');
        btnShowcase.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white";
    } else {
        gamesForm.classList.remove('hidden');
        btnGames.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white";
    }
}

async function handleNewItemSubmit(e) {
    e.preventDefault();
    const newItem = {
        id: Date.now().toString(),
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDescription').value,
        tags: document.getElementById('itemTags').value.split(',').map(t=>t.trim()).filter(Boolean),
        imageUrl: document.getElementById('itemImageUrl').value || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    };
    portfolioItems.unshift(newItem);
    renderShowcase();
    if (await savePortfolioData()) {
        e.target.reset();
        closeAdminModal();
    }
}

async function handleNewGameSubmit(e) {
    e.preventDefault();
    const newGame = {
        id: 'g_' + Date.now().toString(),
        title: document.getElementById('gameTitle').value,
        role: document.getElementById('gameRole').value,
        description: document.getElementById('gameDescription').value,
        imageUrl: document.getElementById('gameImageUrl').value || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        linkUrl: document.getElementById('gameLinkUrl').value || ''
    };
    gamesItems.unshift(newGame);
    renderGames();
    if (await saveGamesData()) {
        e.target.reset();
        closeAdminModal();
    }
}

/* 8. UTILS */
function copyDiscordHandle() {
    const handle = siteContent.discordHandle || 'myteaaaaa';
    const input = document.createElement('input');
    input.value = handle;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    const btn = document.getElementById('copyDiscordBtn');
    btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
    document.getElementById('copyText').innerText = 'Copied!';
    setTimeout(() => {
        btn.classList.replace('bg-emerald-600', 'bg-indigo-600');
        document.getElementById('copyText').innerText = 'Copy Tag';
    }, 2000);
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

window.onload = async function() {
    resizeCanvas();
    animateParticles();
    // Show defaults immediately, then replace with saved content from the server
    loadSiteContent(null);
    loadPortfolioData(null);
    const data = await fetchSiteData();
    if (data) {
        loadSiteContent(data);
        loadPortfolioData(data);
    }
    // Restore admin session after a page refresh (the server still verifies every save)
    if (adminToken && Number(adminToken.split('.')[0]) > Date.now()) {
        unlockAdminUI();
    } else if (adminToken) {
        lockAdmin();
    }
};
