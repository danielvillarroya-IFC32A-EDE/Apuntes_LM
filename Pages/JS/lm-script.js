const grid = document.getElementById('book-grid');
const book_template = document.getElementById('tiny-book-template').content;
const page_template = document.getElementById('page-template').content;

let currentIndex = 0;
const book = document.getElementById("book");
const book_list = [
    {element_id: 0, front_page_img: '../Images/Book/Portraits/basic_HTML_portrait.svg', page_links: ['Basic_HTML/introduccio_a_html.html', 'Basic_HTML/estructura_basica_html.html', 'Basic_HTML/etiquetes_basiques.html', 'Basic_HTML/elements_html_i_anidament.html', 'Basic_HTML/atributs_html.html', 'Basic_HTML/text_formatat.html', 'Basic_HTML/comentaris_en_html.html', "Basic_HTML/insercio_d'imatges.html", 'Basic_HTML/enllaços.html', 'Basic_HTML/llistes.html', 'Basic_HTML/taules.html']},
    {element_id: 1, front_page_img: '../Images/Book/Portraits/advanced_HTML_portrait.svg', page_links: ['efoinse', 'iefbsif']},
    {element_id: 2, front_page_img: '../Images/Book/Portraits/introduction_to_css.svg', page_links: []}
];


book_list.forEach(book_element => {
    const bookClone = document.importNode(book_template, true);
    
    const bookElement = bookClone.querySelector(".book-element");
    const tinyPage = bookElement.querySelector(".tiny-page");
    
    tinyPage.style.backgroundImage = `url("${book_element.front_page_img}")`;
    
    bookElement.addEventListener('click', (event) => {
        grid.classList.add('hidden');
        book.classList.add('active');
        book.querySelector('#front-page').style.backgroundImage = `url("${book_element.front_page_img}")`;
        currentIndex = 0;
        addPages(book_element);
        orderPages();
    });

    // Lo inyectamos en la cuadrícula
    grid.appendChild(bookClone);
});

//=============================================//
//============OPEN AND PAGE LOGIC==============//
//=============================================//
const frontPage = book.querySelector('#front-page');
let bookPages = [frontPage];
let stepQuantity = 2;

function addPages(book_element){
    bookPages.forEach((page, index) => {
        if (index > 0 && page) {
            page.remove(); 
        }
    });
    bookPages = [frontPage]; 

    const links = book_element.page_links;
    for(let i = 0; i < links.length; i += stepQuantity){
        const pageClone = document.importNode(page_template, true);

        if(pageClone.querySelector('.front .page-iframe') && links[i]) pageClone.querySelector('.front .page-iframe').src = links[i];
        if(pageClone.querySelector('.back .page-iframe') && links[i + 1]) pageClone.querySelector('.back .page-iframe').src = links[i + 1];

        const pageElement = pageClone.firstElementChild;

        book.appendChild(pageClone);
        bookPages.push(pageElement); 
    }
}

function orderPages(){
    bookPages.forEach((page, index) => {
        page.style.zIndex = bookPages.length - index;

        page.style.transform = 'rotateY(0deg)';
    });
}
orderPages();

function getElementPositionInViewportUnits(el) {
    const rect = el.getBoundingClientRect();
    return {
        x: (rect.left / window.innerWidth) * 100,
        y: (rect.top / window.innerHeight) * 100
    };
}

let activeGesture = null;

function handleBookInteraction(e) {
    const startX = e.clientX;
    const startY = e.clientY;
    const maxDistance = window.innerWidth || 500;
    
    let targetPage = null;
    let isMovingForward = true;
    let baseAngle = 0;
    const rectBook = book.getBoundingClientRect();
    const relativeClickX = startX - rectBook.left;

    if (relativeClickX > rectBook.width / 2){
        if (currentIndex >= bookPages.length) return;
        targetPage = bookPages[currentIndex];
        isMovingForward = true;
        baseAngle = 0;
    } else {
        if (currentIndex <= 0) return;
        targetPage = bookPages[currentIndex - 1];
        isMovingForward = false;
        baseAngle = 180;
    }

    let angleDeg = baseAngle;
    let hasMovedPage = false;

    const initialPos = getElementPositionInViewportUnits(book);

    function mouseMoveHandler(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (!activeGesture) {
            const threshold = 8;
            if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    activeGesture = 'rotate';
                    if (targetPage) {
                        targetPage.style.transition = 'none';
                        targetPage.style.zIndex = '100';
                    }
                } else {
                    activeGesture = 'moveDown';
                    book.style.transition = 'none';
                }
            } else {
                return;
            }
        }

        if (activeGesture === 'rotate' && targetPage) {
            hasMovedPage = true;
            let deltaAngle = (deltaX / maxDistance) * 200 * 1.6;
            angleDeg = isMovingForward ? (0 - deltaAngle) : (180 - deltaAngle);
            angleDeg = angleDeg;

            if (angleDeg < 0) angleDeg = 0;
            if (angleDeg > 180) angleDeg = 180;

            targetPage.style.transform = `rotateY(${-angleDeg}deg)`;
        } 
        else if (activeGesture === 'moveDown') {
            const deltaVh = (deltaY / window.innerHeight) * 100;
            const newYVh = initialPos.y + deltaVh;
            
            if(currentIndex > 0){
                book.style.transform = `translate(0%, ${newYVh - 55}%) rotateZ(${newYVh/1.5}deg)`;
            }else{
                book.style.transform = `translate(-50%, ${newYVh - 55}%) rotateZ(${newYVh/1.5}deg)`;
            }
        }
    }

    function mouseUpHandler() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);

        if (activeGesture === 'rotate' && targetPage) {
            targetPage.style.transition = 'transform 0.4s ease';

            if (!hasMovedPage) {
                if (isMovingForward) {
                    targetPage.style.transform = 'rotateY(0deg)';
                    targetPage.style.zIndex = bookPages.length - bookPages.indexOf(targetPage);
                } else {
                    targetPage.style.transform = 'rotateY(-180deg)';
                    targetPage.style.zIndex = currentIndex;
                }
            } else {
                if (angleDeg > 90) {
                    targetPage.style.transform = 'rotateY(-180deg)';
                    if (isMovingForward) currentIndex++;
                    targetPage.style.zIndex = currentIndex;
                } else {
                    targetPage.style.transform = 'rotateY(0deg)';
                    if (!isMovingForward) currentIndex--;
                    targetPage.style.zIndex = bookPages.length - bookPages.indexOf(targetPage);
                }
            }

            book.style.transition = 'transform 0.5s ease';
            if (currentIndex > 0) {
                book.style.transform = 'translate(0%, -50%)';
            } else {
                book.style.transform = 'translate(-50%, -50%)';
            }
        }
        else if (activeGesture === 'moveDown') {
            book.style.transition = 'transform 0.5s ease';

            if (getElementPositionInViewportUnits(book).y > 30) {
                book.style.transform = '';
                grid.classList.remove('hidden');
                book.classList.remove('active');
            } else {
                if (currentIndex > 0) {
                    book.style.transform = 'translate(0%, -50%)';
                } else {
                    book.style.transform = 'translate(-50%, -50%)';
                }
            }
        }

        activeGesture = null;
    }

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

book.addEventListener("dragstart", (e) => e.preventDefault());


book.addEventListener('mousedown', (e) => {
    handleBookInteraction(e);
});

book.addEventListener('pointerdown', (e) => {
    handleBookInteraction(e);
});
