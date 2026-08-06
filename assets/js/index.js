const img_list = [
    "https://media.piras03.com/image/af2026/09.jpg",
    "https://media.piras03.com/image/af2026/07.jpg",
    "https://media.piras03.com/image/af2026/06.jpg",
    "https://media.piras03.com/image/af2026/05.jpg",
    "https://media.piras03.com/image/af2026/03.jpg",
    "https://media.piras03.com/image/af2026/04.jpg",
    "https://media.piras03.com/image/af2026/01.jpg",
    "https://media.piras03.com/image/dabcelebration/03.jpg",
    "https://media.piras03.com/image/digitalvol2/05.jpg",
    "https://media.piras03.com/image/digitalvol2/02.jpg",
    "https://media.piras03.com/image/digitalvol2/03.jpg"
];

function onModalClick(event){
    document.body.classList.remove('body-noscroll');
    modalView.classList.remove("visible");
}

const modalView = document.querySelector("#modal-view")
modalView.addEventListener('click',onModalClick);

function onThumbnailClick(event){
    event.preventDefault();
    modalView.innerHTML = '';
    const img_src = event.currentTarget.href;
    const image = document.createElement("img");
    image.src = img_src;
    modalView.appendChild(image);
    document.body.classList.add('body-noscroll');
    modalView.classList.add("visible");
}

function createLi(src){
    const image = document.createElement("img");
    image.src = src;
    const a = document.createElement("a");
    a.href = src;
    a.appendChild(image);
    a.addEventListener("click", onThumbnailClick);
    const li = document.createElement("li");
    li.appendChild(a)
    return li;
}

const gallery = document.querySelector(".gallery");

for(let i = 0; i < img_list.length; i++){
    const img_src = img_list[i];
    const li = createLi(img_src);
    gallery.append(li);
    console.log(`Created ${img_src}`);
}