function generateStars() {
  for (let i = 0; i < 1500; i++) {
    let star = document.createElement('div');
    star.classList.add("star");

    let size = Math.random() * 2.6 + 1;

    star.style.top = Math.random() * document.body.scrollHeight + "px";
    star.style.left = Math.random() * document.body.scrollWidth + "px";
    star.style.width = size + "px";
    star.style.height = size + "px";

    let delayValue = Math.random() * 4;
    star.style.animationDelay = delayValue + "s";

    document.body.appendChild(star);
  }
}

generateStars();

window.addEventListener("resize", () => {
  document.body.innerHTML = '';
  generateStars();
});

window.onload = () => {
  window.scrollTo(0, document.body.scrollHeight);
};

//Intersection observer API
document.addEventListener("DOMContentLoaded", () => {
  const text = document.querySelector('.hidden');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        text.classList.add('show');
      } else {
        text.classList.remove('show'); 
      }
    });
  });
  observer.observe(text);
});


