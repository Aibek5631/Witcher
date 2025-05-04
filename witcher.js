document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.back-btn').addEventListener('click', showMainMenu);
    document.querySelector('.back-btn').addEventListener('mouseenter', () => playSound('hover'));

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) showSection(section);
        });

        item.addEventListener('mouseenter', () => playSound('hover'));
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
        character: 'Персонаж'
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
    } else {
        const data = await loadData(section);
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            let html = `<h3>${item.name}</h3>`;
            if (item.effect) html += `<p><strong>Эффект:</strong> ${item.effect}</p>`;
            if (item.ingredients) html += `<p><strong>Ингредиенты:</strong> ${item.ingredients.join(', ')}</p>`;
            if (item.price) html += `<p><strong>Цена:</strong> ${item.price} крон</p>`;
            if (item.location) html += `<p><strong>Локация:</strong> ${item.location}</p>`;
            if (item.weakness) html += `<p><strong>Слабости:</strong> ${item.weakness.join(', ')}</p>`;
            card.innerHTML = html;
            itemsList.appendChild(card);
        });
    }

    document.querySelector('.main-menu').style.display = 'none';
    document.querySelector('.content').style.display = 'block';
    playSound('open');
}

async function loadData(section) {
    const response = await fetch(`data/${section}.json`);
    if (!response.ok) throw new Error('Не удалось загрузить данные');
    return await response.json();
}

function playSound(type) {
    const sounds = {
        hover: 'assets/sounds/hover.mp3',
        open: 'assets/sounds/open.mp3',
        click: 'assets/sounds/click.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play();
}

function renderMap() {
    const map = L.map('mini-map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 1
    });

    const bounds = [[0, 0], [2048, 2048]];
    L.imageOverlay('img/witcher-map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);

    const icon = L.icon({
        iconUrl: 'icons/place_of_power.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    L.marker([1600, 1100], { icon }).addTo(map).bindPopup("Место силы: Игни");
}
