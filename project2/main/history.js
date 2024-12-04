const yearContexts = document.querySelectorAll('.year-context');
const slider = document.getElementById('slider_input');
const counter = document.getElementById('counter');

function updateYearContext() {
  const sliderValue = parseInt(slider.value, 10);

  counter.textContent = `${sliderValue} junks`;

  yearContexts.forEach((context) => {
    context.classList.remove('active');
  });

  const matchingContext = Array.from(yearContexts).find(
    (context) => parseInt(context.getAttribute('data-year'), 10) === sliderValue
  );

  if (matchingContext) {
    matchingContext.classList.add('active');
  }
}

slider.addEventListener('input', updateYearContext);
document.addEventListener('DOMContentLoaded', updateYearContext);
