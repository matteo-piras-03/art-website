window.addEventListener('DOMContentLoaded', () => {
    setupMenuToggles();
    setupCardCarousel();
    applyFilters();
    sortCards();
    getCollectionList();
});

//Filter Buttons

function setupMenuToggles(){
    const section = document.querySelector('#section-0');
    if (!section) {
        return;
    }

    const menus = section.querySelectorAll('.menu');
    const buttons = section.querySelectorAll('button[id$="-select"]');

    function renderMenuButton(menu, menuButton) {
        if (!menuButton) return;
        const isOpen = menu.classList.contains('open');
        const chevron = `<img class="${isOpen ? 'flipped' : ''}" src="assets/svg/chevron-down-svgrepo-com.svg">`;
        const menuType = menu.parentElement && menu.parentElement.id === 'sort' ? 'radio' : 'checkbox';

        if (menuType === 'radio') {
            const selected = menu.querySelector('button.selected');
            const label = selected ? selected.textContent.trim() : 'Sort';
            menuButton.innerHTML = `<span>${label}</span>${chevron}`;
            return;
        }

        const selectedCount = menu.querySelectorAll('button.selected').length;
        const label = menu.parentElement.id === 'medium' ? 'All mediums' : 'All tags';
        const text = selectedCount > 0 ? `${selectedCount} selected` : label;
        menuButton.innerHTML = `<span>${text}</span>${chevron}`;

        const clearButton = menu.querySelector('button.last');
        if (clearButton) {
            clearButton.classList.toggle('disabled', selectedCount === 0);
        }
    }

    function closeAllMenus(){
        menus.forEach(menu => {
            menu.classList.remove('open');
            const parent = menu.parentElement;
            const menuButton = parent && parent.querySelector('button[id$="-select"]');
            renderMenuButton(menu, menuButton);
        });
    }

    buttons.forEach(button => {
        const menu = button.nextElementSibling;
        if (!menu || !menu.classList.contains('menu')) {
            return;
        }

        button.addEventListener('click', event => {
            event.stopPropagation();
            const isOpen = menu.classList.contains('open');
            closeAllMenus();
            if (!isOpen) {
                menu.classList.add('open');
            }
            renderMenuButton(menu, button);
        });
    });

    menus.forEach(menu => {
        const parent = menu.parentElement;
        const menuButton = parent && parent.querySelector('button[id$="-select"]');

        menu.addEventListener('click', event => {
            event.stopPropagation();
            const button = event.target.closest('button');
            if (!button || !menu.contains(button)) {
                return;
            }

            const isClearAll = button.classList.contains('last') && button.textContent.trim().toLowerCase() === 'clear all';
            if (isClearAll) {
                if (button.classList.contains('disabled')) {
                    return;
                }
                menu.querySelectorAll('button.selected').forEach(item => item.classList.remove('selected'));
                renderMenuButton(menu, menuButton);
                applyFilters();
                return;
            }

            const menuType = parent && parent.id === 'sort' ? 'radio' : 'checkbox';
            if (menuType === 'radio') {
                menu.querySelectorAll('button.selected').forEach(item => item.classList.remove('selected'));
                button.classList.add('selected');
            } else {
                button.classList.toggle('selected');
            }

            renderMenuButton(menu, menuButton);
            applyFilters();
            sortCards();
        });

        renderMenuButton(menu, menuButton);
    });

    document.addEventListener('click', closeAllMenus);
}

//Behaviour of filter buttons

function applyFilters(){
    const gallery = document.querySelector('#section-1');
    if (!gallery) {
        return;
    }

    const cards = Array.from(gallery.querySelectorAll('.card'));
    const mediumFilters = getSelectedFilterValues('medium');
    const tagFilters = getSelectedFilterValues('tag');

    cards.forEach(card => {
        const cardText = [
            card.querySelector('.tags')?.textContent || ''
        ].join(' ').toLowerCase();

        const matchesMedium = mediumFilters.length === 0 || mediumFilters.some(filter => cardText.includes(filter));
        const matchesTag = tagFilters.length === 0 || tagFilters.some(filter => cardText.includes(filter));

        card.classList.toggle('hidden', !(matchesMedium && matchesTag));
    });
}

function getSelectedFilterValues(groupId){
    const group = document.querySelector(`#${groupId} .menu`);
    if (!group) {
        return [];
    }

    return Array.from(group.querySelectorAll('button.selected'))
        .map(button => button.textContent.trim().toLowerCase());
}

//Behaviour of date sort

function sortCards(){
    const gallery = document.querySelector('#section-1');
    if (!gallery) {
        return;
    }

    const cards = Array.from(gallery.querySelectorAll('.card'));
    const sortOrder = getSortOrder();

    const visibleCards = cards.filter(card => !card.classList.contains('hidden'));
    const hiddenCards = cards.filter(card => card.classList.contains('hidden'));

    visibleCards.sort((firstCard, secondCard) => {
        const firstDate = getCardDate(firstCard);
        const secondDate = getCardDate(secondCard);

        return sortOrder === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
    });

    const orderedCards = [...visibleCards, ...hiddenCards];
    const fragment = document.createDocumentFragment();
    orderedCards.forEach(card => fragment.appendChild(card));
    gallery.replaceChildren(fragment);
}

function getSortOrder(){
    const sortMenu = document.querySelector('#sort .menu');
    if (!sortMenu) {
        return 'newest';
    }

    const selected = sortMenu.querySelector('button.selected');
    if (!selected) {
        return 'newest';
    }

    return selected.textContent.trim().toLowerCase().includes('oldest') ? 'oldest' : 'newest';
}

function getCardDate(card){
    const dateElement = card.querySelector('.title-date .date');
    if (!dateElement) {
        return 0;
    }

    const datetime = dateElement.getAttribute('datetime');
    const rawDate = datetime || dateElement.textContent.trim();
    const parsed = new Date(rawDate);

    return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

//Card Carousel

function setupCardCarousel(card = document.querySelector('#card2')){
    const targetCard = card;
    if (!targetCard || targetCard.dataset.carouselBound === 'true') {
        return;
    }

    const images = Array.from(targetCard.querySelectorAll('.img-carousel > img'));
    const leftButton = targetCard.querySelector('.left');
    const rightButton = targetCard.querySelector('.right');

    if (!images.length || !leftButton || !rightButton) {
        return;
    }

    leftButton.type = 'button';
    rightButton.type = 'button';

    const parsedIndex = Number.parseInt(targetCard.dataset.carouselIndex || '0', 10);
    const initialIndex = Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < images.length
        ? parsedIndex
        : 0;

    let currentIndex = initialIndex;
    targetCard.dataset.carouselIndex = String(initialIndex);
    targetCard.dataset.carouselLength = String(images.length);

    function showImage(index){
        images.forEach((img, imgIndex) => {
            const shouldHide = imgIndex !== index;
            img.classList.toggle('hidden', shouldHide);
            img.style.display = shouldHide ? 'none' : 'block';
        });
        currentIndex = index;
        targetCard.dataset.carouselIndex = String(index);
        targetCard.dispatchEvent(new CustomEvent('carouselChange', { detail: { index } }));
    }

    function nextImage(){
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function previousImage(){
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    leftButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        previousImage();
    });

    rightButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        nextImage();
    });

    targetCard.dataset.carouselBound = 'true';
    showImage(initialIndex);
}

function getStartingCarouselIndex(drawings, thumbnailId){
    if (!Array.isArray(drawings) || !drawings.length) {
        return 0;
    }

    if (thumbnailId === undefined || thumbnailId === null || thumbnailId === '') {
        return 0;
    }

    const matchingIndex = drawings.findIndex(drawing => String(drawing.id) === String(thumbnailId));
    return matchingIndex >= 0 ? matchingIndex : 0;
}

//Data gathering

async function getCollectionList(){
    console.log("Gathering drawings...");
    fetch("assets/json/collection_list.json").then(onGetCLResponse).then(onGetCLJson);
}

function onGetCLResponse(response){
    return response.json();
}

function onGetCLJson(json){
    //console.log(json);
    //console.log(json.collections[0]);
    const collections = json.collections;
    for(let i = 0; i < collections.length; i++){
        getCollectionDrawings(collections[i]);
    }

}

async function getCollectionDrawings(handle){
    fetch("assets/json/collection_list/" + handle + ".json").then(onGetCDResponse).then(onGetCDJson);
}

function onGetCDResponse(response){
    return response.json();
}

function onGetCDJson(json){
    const gallery = document.querySelector('#section-1');
    if (!gallery) {
        return;
    }

    const drawings = json.drawings || [];

    const card = document.createElement('a');
    card.className = 'card';
    card.href = '#';
    const initialCarouselIndex = getStartingCarouselIndex(drawings, json['thumbnail-id']);
    card.dataset.carouselIndex = String(initialCarouselIndex);
    card.addEventListener('click', event => {
        event.preventDefault();
        openCollectionModal(json, Number(card.dataset.carouselIndex) || 0, card);
    });

    const imgCarousel = document.createElement('div');
    imgCarousel.className = 'img-carousel';

    const baseUrl = `https://media.piras03.com/image/${json.handle}/`;

    drawings.forEach((drawing, index) => {
        const img = document.createElement('img');
        img.src = `${baseUrl}${drawing.id}.jpg`;
        img.alt = drawing.title;
        if (index > 0) {
            img.classList.add('hidden');
        }
        imgCarousel.appendChild(img);
    });

    const leftButton = document.createElement('button');
    leftButton.type = 'button';
    leftButton.className = 'left';
    leftButton.ariaLabel = 'Previous image';
    leftButton.innerHTML = '<img src="assets/svg/chevron-left-svgrepo-com.svg" alt="Previous image">';
    imgCarousel.appendChild(leftButton);

    const rightButton = document.createElement('button');
    rightButton.type = 'button';
    rightButton.className = 'right';
    rightButton.ariaLabel = 'Next image';
    rightButton.innerHTML = '<img src="assets/svg/chevron-right-svgrepo-com.svg" alt="Next image">';
    imgCarousel.appendChild(rightButton);

    const latestDrawing = [...drawings].sort((first, second) => new Date(second.date) - new Date(first.date))[0] || drawings[0];

    const titleDate = document.createElement('div');
    titleDate.className = 'title-date';

    const title = document.createElement('h1');
    title.textContent = json.title;

    const date = document.createElement('time');
    date.className = 'date';
    date.dateTime = latestDrawing?.date || '';
    date.textContent = latestDrawing ? formatDate(latestDrawing.date) : '';

    titleDate.appendChild(title);
    titleDate.appendChild(date);

    const tags = document.createElement('div');
    tags.className = 'tags';

    const mediumTags = json.mediums || [];
    const collectionTags = json.tags || [];
    [...mediumTags, ...collectionTags].forEach(tagText => {
        const tag = document.createElement('span');
        tag.textContent = tagText;
        tags.appendChild(tag);
    });

    card.appendChild(imgCarousel);
    card.appendChild(titleDate);
    card.appendChild(tags);

    gallery.appendChild(card);
    setupCardCarousel(card);
    applyFilters();
    sortCards();
}

function syncCardCarousel(card, index){
    if (!card) {
        return;
    }

    const images = Array.from(card.querySelectorAll('.img-carousel > img'));
    if (!images.length) {
        return;
    }

    images.forEach((img, imgIndex) => {
        const shouldHide = imgIndex !== index;
        img.classList.toggle('hidden', shouldHide);
        img.style.display = shouldHide ? 'none' : 'block';
    });
    card.dataset.carouselIndex = String(index);
}

function openCollectionModal(json, initialIndex = 0, sourceCard = null){
    const modal = document.querySelector('#modal-view');
    if (!modal) {
        return;
    }

    const drawings = json.drawings || [];
    const baseUrl = `https://media.piras03.com/image/${json.handle}/`;
    const latestDrawing = [...drawings].sort((first, second) => new Date(second.date) - new Date(first.date))[0] || drawings[0];

    modal.innerHTML = '';
    modal.classList.add('visible');
    document.body.classList.add('body-noscroll');

    const modalContent = document.createElement('div');
    modalContent.id = 'modal-view-sub';

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeCollectionModal();
        }
    });

    const titleDate = document.createElement('div');
    titleDate.className = 'title-date';

    const title = document.createElement('h1');
    title.textContent = json.title;

    const date = document.createElement('time');
    date.className = 'date';
    date.dateTime = latestDrawing?.date || '';
    date.textContent = latestDrawing ? formatDate(latestDrawing.date) : '';

    titleDate.appendChild(title);
    titleDate.appendChild(date);

    const tags = document.createElement('div');
    tags.className = 'tags';

    const mediumTags = json.mediums || [];
    const collectionTags = json.tags || [];
    [...mediumTags, ...collectionTags].forEach(tagText => {
        const tag = document.createElement('span');
        tag.textContent = tagText;
        tags.appendChild(tag);
    });

    const imgCarousel = document.createElement('div');
    imgCarousel.className = 'img-carousel';

    const imageElements = [];
    drawings.forEach((drawing, index) => {
        const img = document.createElement('img');
        img.src = `${baseUrl}${drawing.id}.jpg`;
        img.alt = drawing.title;
        if (index > 0) {
            img.classList.add('hidden');
        }
        imageElements.push(img);
        imgCarousel.appendChild(img);
    });

    const leftButton = document.createElement('button');
    leftButton.type = 'button';
    leftButton.className = 'left';
    leftButton.ariaLabel = 'Previous image';
    leftButton.innerHTML = '<img src="assets/svg/chevron-left-svgrepo-com.svg" alt="Previous image">';

    const rightButton = document.createElement('button');
    rightButton.type = 'button';
    rightButton.className = 'right';
    rightButton.ariaLabel = 'Next image';
    rightButton.innerHTML = '<img src="assets/svg/chevron-right-svgrepo-com.svg" alt="Next image">';

    imgCarousel.appendChild(leftButton);
    imgCarousel.appendChild(rightButton);

    let currentIndex = Number(initialIndex) || 0;

    const drawingInfo = document.createElement('div');
    drawingInfo.className = 'drawing-info';

    const drawingTitleDate = document.createElement('div');
    drawingTitleDate.className = 'title-date';

    const drawingTitle = document.createElement('h1');
    const drawingDate = document.createElement('time');
    drawingDate.className = 'date';

    drawingTitleDate.appendChild(drawingTitle);
    drawingTitleDate.appendChild(drawingDate);

    const drawingCaption = document.createElement('p');
    drawingInfo.appendChild(drawingTitleDate);
    drawingInfo.appendChild(drawingCaption);

    function updateDrawingDetails(index){
        const drawing = drawings[index] || {};
        drawingTitle.textContent = drawing.title || '';
        drawingDate.dateTime = drawing.date || '';
        drawingDate.textContent = drawing.date ? formatDate(drawing.date) : '';
        drawingCaption.textContent = drawing.caption || '';
    }

    function showImage(index){
        imageElements.forEach((img, imgIndex) => {
            const shouldHide = imgIndex !== index;
            img.classList.toggle('hidden', shouldHide);
            img.style.display = shouldHide ? 'none' : 'block';
        });
        updateDrawingDetails(index);
        if (sourceCard) {
            syncCardCarousel(sourceCard, index);
        }
    }

    leftButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        currentIndex = (currentIndex - 1 + imageElements.length) % imageElements.length;
        showImage(currentIndex);
    });

    rightButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        currentIndex = (currentIndex + 1) % imageElements.length;
        showImage(currentIndex);
    });

    modalContent.appendChild(titleDate);
    modalContent.appendChild(tags);
    modalContent.appendChild(imgCarousel);
    modalContent.appendChild(drawingInfo);
    modal.appendChild(modalContent);

    showImage(currentIndex);
}

function closeCollectionModal(){
    const modal = document.querySelector('#modal-view');
    if (!modal) {
        return;
    }

    modal.classList.remove('visible');
    document.body.classList.remove('body-noscroll');
    modal.innerHTML = '';
}

function formatDate(value){
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}