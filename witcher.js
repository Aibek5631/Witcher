document.addEventListener('DOMContentLoaded', () => {
    // Инициализация меню
    document.querySelector('.back-btn').addEventListener('click', showMainMenu);
    document.querySelector('.back-btn').addEventListener('mouseenter', () => playSound('hover'));

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('submenu-item')) return;
            const section = item.dataset.section;
            if (section) showSection(section);
        });

        item.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Обработчики для подменю
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) showSection(section);
        });
        item.addEventListener('mouseenter', () => playSound('hover'));
    });

    // Закрытие модального окна
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('monster-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('monster-modal')) {
            closeModal();
        }
    });
});

function showMainMenu() {
    document.querySelector('.main-menu').style.display = 'flex';
    document.querySelector('.content').style.display = 'none';
    playSound('hover');
}

async function showSection(section) {
    const itemsList = document.getElementById('items-list');
    const sectionTitle = document.getElementById('section-title');

    const titles = {
        bestiary: 'Бестиарий',
        alchemy: 'Алхимия',
        map: 'Карта',
        quests: 'Задания',
        character: 'Персонаж',
        training: 'Обучение',
        books: 'Книги',
        crafting: 'Ремесло'
    };

    sectionTitle.textContent = titles[section] || section;
    itemsList.innerHTML = '';

    if (section === 'map') {
        const mapDiv = document.createElement('div');
        mapDiv.id = 'mini-map';
        mapDiv.style.width = '100%';
        mapDiv.style.height = '500px';
        itemsList.appendChild(mapDiv);

        setTimeout(renderMap, 100);
    } else if (section === 'bestiary') {
        await showBestiary();
    } else {
        const data = await loadData(section);
        data.forEach(item => {
            const card = createItemCard(item);
            itemsList.appendChild(card);
        });
    }

    document.querySelector('.main-menu').style.display = 'none';
    document.querySelector('.content').style.display = 'block';
    playSound('open');
}

async function showBestiary() {
    const bestiaryData = await loadData('bestiary');
    const itemsList = document.getElementById('items-list');
    
    // Группировка монстров по категориям
    const categories = {};
    bestiaryData.forEach(monster => {
        if (!categories[monster.category]) {
            categories[monster.category] = [];
        }
        categories[monster.category].push(monster);
    });
    
    // Создание интерфейса бестиария
    for (const [category, monsters] of Object.entries(categories)) {
        // Заголовок категории
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        itemsList.appendChild(categoryTitle);
        
        // Карточки монстров
        monsters.forEach(monster => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.dataset.monsterId = monster.id;
            
            let html = `<h3>${monster.name}</h3>`;
            html += `<p><strong>Тип:</strong> ${monster.type}</p>`;
            if (monster.location) {
                html += `<p><strong>Локация:</strong> ${monster.location}</p>`;
            }
            
            card.innerHTML = html;
            card.addEventListener('click', () => showMonsterDetails(monster.id));
            itemsList.appendChild(card);
        });
    }
}

async function showMonsterDetails(monsterId) {
    const bestiaryData = await loadData('bestiary');
    const monster = bestiaryData.find(m => m.id === monsterId);
    
    if (!monster) return;
    
    // Заполнение модального окна данными о монстре
    document.getElementById('monster-name').textContent = monster.name;
    document.getElementById('monster-description').textContent = monster.description;
    
    const weaknessesList = document.getElementById('monster-weaknesses-list');
    weaknessesList.innerHTML = '';
    
    monster.weaknesses.forEach(weakness => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${weakness.type}:</strong> ${weakness.description}`;
        weaknessesList.appendChild(li);
    });
    
    // Установка изображения
    document.getElementById('monster-image').src = `assets/images/monsters/${monster.id}.jpg`;
    document.getElementById('monster-image').alt = `Изображение ${monster.name}`;
    
    // Показ модального окна
    document.getElementById('monster-modal').style.display = 'block';
    playSound('open');
}

function closeModal() {
    document.getElementById('monster-modal').style.display = 'none';
    playSound('hover');
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    let html = `<h3>${item.name}</h3>`;
    if (item.effect) html += `<p><strong>Эффект:</strong> ${item.effect}</p>`;
    if (item.ingredients) html += `<p><strong>Ингредиенты:</strong> ${item.ingredients.join(', ')}</p>`;
    if (item.price) html += `<p><strong>Цена:</strong> ${item.price} крон</p>`;
    if (item.location) html += `<p><strong>Локация:</strong> ${item.location}</p>`;
    if (item.weakness) html += `<p><strong>Слабости:</strong> ${item.weakness.join(', ')}</p>`;
    card.innerHTML = html;
    return card;
}

async function loadData(section) {
    try {
        // В реальном приложении здесь должен быть fetch к вашему API или файлу
        // Для демонстрации используем mock-данные
        if (section === 'bestiary') {
            return mockBestiaryData();
        }
        return [];
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return [];
    }
}

function playSound(type) {
    const sounds = {
        hover: 'assets/sounds/hover.mp3',
        open: 'assets/sounds/open.mp3',
        click: 'assets/sounds/click.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Не удалось воспроизвести звук:', e));
}

function renderMap() {
    const map = L.map('mini-map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 1
    });

    const bounds = [[0, 0], [2048, 2048]];
    L.imageOverlay('https://images.steamusercontent.com/ugc/1790737355244114971/59F83767A0F389F53BE4926571B63004F3A73D4B/', bounds).addTo(map);
    map.fitBounds(bounds);

    const icon = L.icon({
        iconUrl: 'holy-grail.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    L.marker([1600, 1100], { icon }).addTo(map).bindPopup("Место силы: Игни");
}

// Mock-данные для бестиария
function mockBestiaryData() {
    return [
        {
            id: 'griffin',
            name: 'Грифон',
            category: 'Гибриды',
            type: 'Летающий гибрид',
            description: 'Грифоны - гордые и опасные существа, помесь льва и орла. Они яростно защищают свою территорию и добычу.',
            location: 'Встречаются по всему Велену, часто около скал и горных хребтов',
            weaknesses: [
                { type: 'Зелье', description: 'Зелье против гибридов' },
                { type: 'Масло', description: 'Масло против гибридов' },
                { type: 'Знак', description: 'Аард, Игни' }
            ]
        },
        {
            id: 'werewolf',
            name: 'Оборотень',
            category: 'Проклятые',
            type: 'Человек-зверь',
            description: 'Оборотни - люди, проклятые превращаться в кровожадных зверей во время полнолуния.',
            location: 'Встречаются в лесах и около деревень',
            weaknesses: [
                { type: 'Зелье', description: 'Лунная пыль' },
                { type: 'Масло', description: 'Масло против проклятых' },
                { type: 'Знак', description: 'Игни, Ирден' },
                { type: 'Серебро', description: 'Уязвим к серебряным мечам' }
            ]
        },
        {
            id: 'leshen',
            name: 'Леший',
            category: 'Древние',
            type: 'Дух леса',
            description: 'Древние духи леса, обладающие магическими способностями и контролирующие животных.',
            location: 'Глухие леса, особенно в Велене и Скеллиге',
            weaknesses: [
                { type: 'Зелье', description: 'Чертов папоротник' },
                { type: 'Масло', description: 'Масло против древних' },
                { type: 'Знак', description: 'Игни, Квен' },
                { type: 'Огонь', description: 'Уязвим к огню' }
            ]
        }
    ];
}
