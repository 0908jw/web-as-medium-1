const DAMPING = 50;  // Number of steps to gradually restore text
const DELAY = 100;   // Delay between each shuffle/restoration step

// Function to shuffle some letters within a word progressively
function partialShuffle(word, progress) {
    const letters = word.split('');
    const swapCount = Math.ceil(letters.length * (1 - progress));  // Gradual decrease in shuffling

    for (let i = 0; i < swapCount; i++) {
        const index1 = Math.floor(Math.random() * letters.length);
        const index2 = Math.floor(Math.random() * letters.length);
        [letters[index1], letters[index2]] = [letters[index2], letters[index1]];
    }

    return letters.join('');
}

// Animation delay function
async function delay(n) {
    return new Promise(resolve => setTimeout(resolve, n));
}

// Gradually restore the original word from shuffled version
async function graduallyRestoreWord(el, originalWords) {
    const currentWords = el.textContent.split(' ');

    for (let step = 0; step <= DAMPING; step++) {
        const progress = step / DAMPING;  // Increase progress over time

        for (let i = 0; i < originalWords.length; i++) {
            currentWords[i] = partialShuffle(originalWords[i], progress);
        }

        el.textContent = currentWords.join(' '); // Update the text content gradually
        await delay(DELAY);
    }

    el.textContent = originalWords.join(' ');  // Ensure full reset at the end
}

// Animate function for text shuffling
async function animate(el) {
    if (el.dataset.animating === "true") return; // Prevent multiple animations
    el.dataset.animating = "true";

    const words = el.textContent.split(' ');  // Split text into words
    const originalWords = [...words];  // Store original words for restoring
    let animationActive = true;

    // Shuffle animation loop
    const shuffleLoop = async () => {
        let step = 0;

        while (animationActive) {
            const progress = Math.sin((step / DAMPING) * Math.PI); // Smooth easing effect

            for (let i = 0; i < words.length; i++) {
                words[i] = partialShuffle(words[i], progress);
            }

            el.textContent = words.join(' '); // Update the text content
            step++;
            await delay(DELAY);
        }
    };

    shuffleLoop();

    // Stop shuffling and restore text when mouse leaves
    el.addEventListener('mouseleave', async () => {
        animationActive = false;  // Stop the shuffling loop
        await graduallyRestoreWord(el, originalWords);  // Restore original text
        el.dataset.animating = "false";  // Allow animation to restart on hover
    });
}

// Attach animation to headings
window.onload = function() {
    document.querySelectorAll('h2').forEach(a => {
        a.addEventListener('mouseenter', () => animate(a));
    });
};
