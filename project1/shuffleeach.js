const DAMPING = 30;
const DELAY = 50;  

function shuffleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]]; 
    }
    return letters.join('');
}

async function delay(n) {
    return new Promise(resolve => setTimeout(resolve, n));
}

async function animate(el) {
    const words = el.textContent.split(' ');
    const originalWords = [...words]; 

    let animationActive = true;

    const resetText = async () => {
        animationActive = false;

        for (let i = 0; i < words.length; i++) {
            const originalWord = originalWords[i];
            for (let j = 0; j < DAMPING; j++) {
                words[i] = shuffleWord(originalWord); 
                el.textContent = words.join(' '); 
                await delay(DELAY);
            }
        }

        for (let k = 0; k < originalWords.length; k++) {
            el.textContent = originalWords.join(' ');
            await delay(DELAY); 
        }
    };

    el.addEventListener('mouseleave', resetText);

    while (animationActive) {
        for (let i = 0; i < words.length; i++) {
            words[i] = shuffleWord(words[i]); 
        }
        el.textContent = words.join(' '); 
        await delay(DELAY);
    }
}

window.onload = function() {
    const headline = document.querySelector('.headline');
    
    headline.addEventListener('mouseenter', () => animate(headline));
    bodyText.addEventListener('mouseenter', () => animate(bodyText));
};

$(document).ready(function () {
    setTimeout(function(){
        $('.popup').fadeIn(500);
    }, 5000);
  
  $('#close').on('click', function() {
    $('.popup').remove();
  });
});

const popups = document.querySelectorAll(".popup");

function onMouseDrag(event, container) {
    const { movementX, movementY } = event;

    const containerStyle = window.getComputedStyle(container);
    const leftValue = parseInt(containerStyle.left) || 0;
    const topValue = parseInt(containerStyle.top) || 0;  

    container.style.left = `${leftValue + movementX}px`;
    container.style.top = `${topValue + movementY}px`;
}

popups.forEach(popup => {
    popup.addEventListener("mousedown", (event) => {
        event.preventDefault();

        const handleMouseMove = (e) => onMouseDrag(e, popup);
        popup.addEventListener("mousemove", handleMouseMove);

        document.addEventListener("mouseup", () => {
            popup.removeEventListener("mousemove", handleMouseMove);
        }, { once: true })
    });
});
