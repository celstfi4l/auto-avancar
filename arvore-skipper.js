(function () {
    if (document.getElementById("autoMenu")) {
        return;
    }

    // ======= ESTILO DO MENU =======
    const style = document.createElement("style");
    style.textContent = `
    #autoMenu {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0d0d0d;
        color: #00ff88;
        border: 1px solid #00ff88;
        padding: 12px;
        z-index: 99999999;
        font-family: monospace;
        width: 190px;
        box-shadow: 0 0 10px #00ff8844;
        border-radius: 6px;
    }

    #autoMenu input {
        width: 100%;
        background: black;
        color: #00ff88;
        border: 1px solid #00ff88;
        text-align: center;
        font-size: 14px;
        padding: 4px;
    }

    #autoMenu button {
        margin-top: 10px;
        width: 100%;
        background: black;
        color: #00ff88;
        border: 1px solid #00ff88;
        padding: 6px;
        cursor: pointer;
        transition: 0.2s;
    }

    #autoMenu button:hover {
        background: #00ff88;
        color: black;
    }

    #countdown {
        margin-top: 10px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 1px;
    }

    .label {
        font-size: 12px;
        opacity: 0.7;
        text-align: center;
        margin-top: 4px;
    }
    `;
    document.head.appendChild(style);

    const menu = document.createElement("div");
    menu.id = "autoMenu";
    menu.innerHTML = `
        <div style="text-align:center; margin-bottom:6px;">Auto Avançar</div>
        <div class="label">Intervalo (min.seg)</div>
        <input id="delayInput" type="text" value="1">
        <div id="countdown">00:00</div>
        <div class="label">Próximo clique</div>
        <button id="toggleBtn">Iniciar</button>
    `;
    document.body.appendChild(menu);

    let countdownInterval = null;
    let running = false;
    let remainingSeconds = 0;
    let totalSeconds = 0;

    function formatTime(seconds) {
        const min = String(Math.floor(seconds / 60)).padStart(2, "0");
        const sec = String(seconds % 60).padStart(2, "0");
        return `${min}:${sec}`;
    }

    function clickNextButton() {
        const spanIcon = document.querySelector('span[data-testid="bonsai-icon-caret-right"]');
        if (spanIcon) {
            const nextBtn = spanIcon.closest("button");
            if (nextBtn) nextBtn.click();
        }
    }

    function convertInputToSeconds(value) {
        const parts = value.split(".");
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parts[1] ? parseInt(parts[1].padEnd(2, "0")) : 0;
        return (minutes * 60) + seconds;
    }

    // ======= CICLO COM JITTER =======
    function startCycle() {
        const jitter = Math.floor(Math.random() * 21) - 10;
        remainingSeconds = Math.max(5, totalSeconds + jitter);
        console.debug('%c[AA] ⏱ próximo clique em ' + remainingSeconds + 's (jitter: ' + (jitter >= 0 ? '+' : '') + jitter + 's)', 'color:#00ff88;font-family:monospace');
        document.getElementById("countdown").textContent = formatTime(remainingSeconds);

        countdownInterval = setInterval(() => {
            remainingSeconds--;
            if (remainingSeconds <= 0) {
                clickNextButton();
                const nextJitter = Math.floor(Math.random() * 21) - 10;
                remainingSeconds = Math.max(5, totalSeconds + nextJitter);
                console.debug('%c[AA] ⏱ próximo clique em ' + remainingSeconds + 's (jitter: ' + (nextJitter >= 0 ? '+' : '') + nextJitter + 's)', 'color:#00ff88;font-family:monospace');
            }
            document.getElementById("countdown").textContent = formatTime(remainingSeconds);
        }, 1000);
    }

    // ======= MOVIMENTO FALSO DE MOUSE =======
    let mouseX = Math.floor(Math.random() * window.innerWidth);
    let mouseY = Math.floor(Math.random() * window.innerHeight);
    let mouseTarget = { x: mouseX, y: mouseY };
    let mouseMoveTimeout = null;

    function easeToTarget() {
        mouseX += (mouseTarget.x - mouseX) * (0.04 + Math.random() * 0.06);
        mouseY += (mouseTarget.y - mouseY) * (0.04 + Math.random() * 0.06);

        document.dispatchEvent(new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            clientX: Math.round(mouseX),
            clientY: Math.round(mouseY),
            movementX: Math.round(mouseTarget.x - mouseX),
            movementY: Math.round(mouseTarget.y - mouseY)
        }));

        const distX = Math.abs(mouseTarget.x - mouseX);
        const distY = Math.abs(mouseTarget.y - mouseY);

        if (distX > 2 || distY > 2) {
            const moveDelay = 12 + Math.random() * 33;
            mouseMoveTimeout = setTimeout(easeToTarget, moveDelay);
        } else {
            const pause = 2000 + Math.random() * 7000;
            mouseMoveTimeout = setTimeout(pickNewTarget, pause);
        }
    }

    function pickNewTarget() {
        const maxStep = 80 + Math.floor(Math.random() * 420);
        const angleJitter = Math.random() * Math.PI * 2;
        const dist = maxStep * (0.4 + Math.random() * 0.6);
        mouseTarget.x = Math.max(0, Math.min(window.innerWidth,
            mouseX + Math.cos(angleJitter) * dist));
        mouseTarget.y = Math.max(0, Math.min(window.innerHeight,
            mouseY + Math.sin(angleJitter) * dist));
        console.debug('%c[AA] 🖱 mouse → (' + Math.round(mouseTarget.x) + ', ' + Math.round(mouseTarget.y) + ')', 'color:#00ff88;font-family:monospace');
        easeToTarget();
    }

    // Inicia o movimento falso
    pickNewTarget();

    document.getElementById("toggleBtn").onclick = function () {
        if (!running) {
            totalSeconds = convertInputToSeconds(document.getElementById("delayInput").value);
            if (!totalSeconds || totalSeconds <= 0) return;
            this.textContent = "Parar";
            running = true;
            startCycle();
        } else {
            this.textContent = "Iniciar";
            clearInterval(countdownInterval);
            document.getElementById("countdown").textContent = "00:00";
            running = false;
        }
    };

})();
