const DAMPING = 30; // Number of steps for shuffling
const DELAY = 50;   // Delay between steps

// Shuffle the letters within a word
function shuffleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]]; // Swap letters
    }
    return letters.join('');
}

// Animation delay
async function delay(n) {
    return new Promise(resolve => setTimeout(resolve, n));
}

// Animate function for text shuffling
async function animate(el) {
    const words = el.textContent.split(' '); // Split text into words
    const originalWords = [...words]; // Keep original words for reset

    let animationActive = true;

    const resetText = async () => {
        animationActive = false;

        // Gradually restore the original text
        for (let i = 0; i < words.length; i++) {
            const originalWord = originalWords[i];
            for (let j = 0; j < DAMPING; j++) {
                words[i] = shuffleWord(originalWord); // Shuffle the original word
                el.textContent = words.join(' '); // Join words back to a string
                await delay(DELAY);
            }
        }

        // Finally, restore the original text
        for (let k = 0; k < originalWords.length; k++) {
            el.textContent = originalWords.join(' ');
            await delay(DELAY); // Small delay before each reset (optional)
        }
    };

    el.addEventListener('mouseleave', resetText);

    // Shuffle animation loop
    while (animationActive) {
        for (let i = 0; i < words.length; i++) {
            words[i] = shuffleWord(words[i]); // Shuffle each word
        }
        el.textContent = words.join(' '); // Update the text content
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

const container = document.querySelector(".popup");
function onMouseDrag({ movementX, movementY }) {
    let getContainerStyle = window.getComputedStyle(container);
    let leftValue = parseInt(getContainerStyle.left);
    let topValue = parseInt(getContainerStyle.top);
    container.style.left = `${leftValue + movementX}px`;
    container.style.top = `${topValue + movementY}px`;
}
container.addEventListener("mousedown", () => {
    container.addEventListener("mousemove", onMouseDrag);
});
document.addEventListener("mouseup", () => {
    container.removeEventListener("mousemove", onMouseDrag);
});