const img_list = [
    "assets/images/art/1.JPEG",
    "assets/images/art/2.JPEG",
    "assets/images/art/3.JPEG",
    "assets/images/art/4.JPEG",
    "assets/images/art/5.JPEG",
    "assets/images/art/6.JPEG",
    "assets/images/art/7.JPEG",
    "assets/images/art/8.JPEG",
    "assets/images/art/9.JPEG",
    "assets/images/art/10.JPEG",
    "assets/images/art/11.JPEG"
];

function onModalClick(event){
    document.body.classList.remove('no-scroll');
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
    modalView.style.top = window.pageYOffset + 'px';
    document.body.classList.add('no-scroll');
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