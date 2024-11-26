var limit = 1001;
space = document.getElementById("space");

stars = {
  rand: function () {
    return Math.random();
  },

  createStar: function () {
    let star = document.createElement("div");
    star.className = "star";

    return star;
  },

  create: function () {
    for (let i = 0; i <= limit; i++) {
      let star = this.createStar();
      star.style.top = `${this.rand() * 100}%`;
      star.style.left = `${this.rand() * 100}%`;
      star.style.animationDelay = `${this.rand() * 8}s`;
      space.appendChild(star);
    }
  }
};

stars.create();

//------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const text = document.querySelector(".text");
  const button = document.querySelector(".reveal-button"); // Select the button

  setTimeout(() => {
    text.classList.add("show");
  }, 500);

  // Remove the text after 3 seconds, then show the button
  setTimeout(() => {
    text.classList.remove("show");

    setTimeout(() => {
      button.classList.add("show");
    }, 500);
  }, 3000);
});