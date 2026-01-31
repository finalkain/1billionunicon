class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const ball = document.createElement('div');
        ball.classList.add('ball');
        shadow.appendChild(ball);

        const style = document.createElement('style');
        style.textContent = `
            .ball {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: inherit;
                font-weight: inherit;
                color: inherit;
                background: inherit;
                box-shadow: inherit;
            }
        `;
        shadow.appendChild(style);
    }

    set number(num) {
        this.shadowRoot.querySelector('.ball').textContent = num;
    }
}

customElements.define('lotto-ball', LottoBall);

const generatorBtn = document.getElementById('generator-btn');
const lottoBalls = document.querySelectorAll('lotto-ball');
const themeSwitcher = document.querySelector('.theme-switcher');
const body = document.body;

// Theme switcher logic
themeSwitcher.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
}

generatorBtn.addEventListener('click', () => {
    const numbers = new Set();
    while(numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a,b) => a - b);

    lottoBalls.forEach((ball, i) => {
        ball.number = sortedNumbers[i];
        const hue = (360 / 45) * sortedNumbers[i];
        ball.style.setProperty('--ball-color', `hsl(${hue}, 80%, 70%)`);
    });
});
