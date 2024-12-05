const button = document.getElementById('toggle');
        const backgroundContainer = document.getElementById('background-container');
        const helloText = document.getElementById('hello');

        let isLightMode = true;

        button.addEventListener('click', () => {
            if (isLightMode) {
                backgroundContainer.style.backgroundImage = "url('../image/whiteversion.gif')"; 
                button.textContent = "Dark Mode";
                helloText.style.color = "black";
                helloText.style.textShadow = "1px 1px 10px black";

            } else {
                backgroundContainer.style.backgroundImage = "url('https://cdn.mos.cms.futurecdn.net/nT6eb3GNFQJ6AerZkWVqBo-320-80.gif')"; 
                button.textContent = "Light Mode";
                helloText.style.color = "whitesmoke"
                helloText.style.textShadow = "1px 1px 10px #fff, 1px 1px 10px #ccc";
            }
            isLightMode = !isLightMode;
        });