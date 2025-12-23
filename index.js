const inputTemp = document.getElementById("inputTemp");
const fromTemp = document.getElementById("fromTemp");
const left_temp = document.getElementsByName("left_temp");
const right_temp = document.getElementsByName("right_temp");
const submit = document.getElementById("submit");
const convertedTemp = document.getElementById("convertedTemp");
const reverse = document.getElementById("reverse");
const formula = document.getElementById("formula");
const theme = document.querySelectorAll(".theme_option");

let left_option = "0";
let right_option = "1";
let result = 0;
const tempChar = ["℉", "℃", "°De", "K", "°N", "°R", "°Ré", "°Rø"];
const fromToIcon = "&#8680;" //⇨

submit.onclick = convertTemp;
[...left_temp, ...right_temp].forEach(e => e.addEventListener("change", () => {lefOrRightSide(e), convertTemp()}));
inputTemp.addEventListener("change", convertTemp);
inputTemp.addEventListener("keyup", convertTemp);
reverse.addEventListener("change", () => {drawLine(), convertTemp()});

// link: https://en.wikipedia.org/wiki/Conversion_of_scales_of_temperature
const toKelvin = {
    0: f => (f + 459.67) * (5/9),           // Fahrenheit -> K  x °F ≘ (x + 459.67) * (5/9) K
    1: c => c + 273.15,                     // Celsius -> K     x °C ≘ (x + 273.15) K
    2: d => 373.15 - d * (2/3),             // Delisle -> K     x °De ≘ (373.15 - x * (2/3)) K
    3: k => k,                              // Kelvin -> K
    4: n => n * (100/33) + 273.15,          // Newton -> K      x °N ≘ (x * (100/33) + 273.15) K
    5: r => r * (5/9),                      // Rankine -> K     x °R ≘ x * (5/9) K
    6: re => re * (5/4) + 273.15,           // Réaumur -> K     x °Ré ≘ (x * (5/4) + 273.15) K
    7: ro => (ro - 7.5) * (40/21) + 273.15  // Rømer -> K       x °Rø ≘ ((x - 7.5) * (40/21) + 273.15) K
};

const fromKelvin = {
    0: k => k * (9/5) - 459.67,           // K -> Fahrenheit   x K ≘ (x * (9/5) - 459.67) °F
    1: k => k - 273.15,                   // K -> Celsius      x K ≘ (x - 273.15) °C
    2: k => (373.15 - k) * (3/2),         // K -> Delisle      x K ≘ (373.15 - x) * (3/2) °De
    3: k => k,                            // K -> Kelvin
    4: k => (k - 273.15) * (33/100),      // K -> Newton       x K ≘ (x - 273.15) * (33/100) °N
    5: k => k * (9/5),                    // K -> Rankine      x K ≘ x * (9/5) °R
    6: k => (k - 273.15) * (4/5),         // K -> Réaumur      x K ≘ (x - 273.15) * (4/5) °Ré
    7: k => (k - 273.15) * (21/40) + 7.5  // K -> Rømer        x K ≘ ((x - 273.15) * (21/40) + 7.5 °Rø
};

function convertTemp() {
    if(isNaN(inputTemp.value)) return;

    let value = Number(inputTemp.value);
    let from = Number(left_option);
    let to = Number(right_option);

    if(reverse.checked) [from, to] = [to, from];

    const k = toKelvin[from](value);     // 1. any to -> Kelvin
    result = fromKelvin[to](k);          // 2. Kelvin to -> any
    fromTemp.textContent = `${tempChar[from]}`;
    convertedTemp.textContent = `${result.toFixed(6)} ${tempChar[to]}`;
    getformulas(from, to);
}

function lefOrRightSide(e) {
    if(!e.name || !e.value) return;

    if(e.name == "left_temp") left_option = e.value;
    else if(e.name == "right_temp") right_option = e.value;
}

convertTemp();

// chatgpt: canvas draw line.
const canvas = document.getElementById("connectCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = document.querySelector(".wrapper").offsetWidth;
    canvas.height = document.querySelector(".wrapper").offsetHeight;
}

window.addEventListener("resize", () => {
    resizeCanvas();
    drawLine();
});

document.querySelectorAll("input[type=radio]").forEach(r =>
    r.addEventListener("change", drawLine)
);

function drawLine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const left = document.querySelector("input[name=left_temp]:checked");
    const right = document.querySelector("input[name=right_temp]:checked");

    if (!left || !right) return;

    const leftPos = getPos(left);
    const rightPos = getPos(right);
    drawHandLine(leftPos.x, leftPos.y, rightPos.x, rightPos.y);
}

// radio-nun ekrandakı real koordinatını tapır
function getPos(input) {
    const rect = input.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    if(input.name == "left_temp") {
        return {
            x: rect.left - canvasRect.left + rect.width - 10,
            y: rect.top - canvasRect.top + rect.height / 2
        };
    }

    return {
            x: rect.left - canvasRect.left + rect.width - 4,
            y: rect.top - canvasRect.top + rect.height / 2
    };
}

// Əl ilə çəkilmiş xətt
function drawHandLine(x1, y1, x2, y2) {
    const segments = 8;  // xəttin qırılma hissələri
    const intensity = 2; // titrəmə səviyyəsi

    ctx.lineWidth = 2;
    ctx.strokeStyle = getArrowColor();
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for (let i = 1; i < segments; i++) {
        let t = i / segments;

        // xətt boyunca nöqtə
        let x = x1 + (x2 - x1) * t;
        let y = y1 + (y2 - y1) * t;

        // əl titrəməsi effekti
        x += (Math.random() - 0.5) * intensity;
        y += (Math.random() - 0.5) * intensity;

        ctx.lineTo(x, y);
    }

    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrow(x1, y1, x2, y2); // oxlar
}

// Ox çəkən funksiya (hər iki uca)
function drawArrow(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 10;

    if (!reverse.checked) {
        // Sağ ucun oxu
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6),
                   y2 - size * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6),
                   y2 - size * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = getArrowColor();
        ctx.fill();
    }
    else {
        // Sol ucun oxu (tərs bucaq)
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + size * Math.cos(angle - Math.PI / 6),
                   y1 + size * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x1 + size * Math.cos(angle + Math.PI / 6),
                   y1 + size * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = getArrowColor();
        ctx.fill();
    }
}

// düsturların göstərilməsi
function getformulas(from, to) {
    
    let xn = (x, n) => `<span><span class="tion"><span class="num">${x}</span><span class="sr-only">/</span><span class="den">${n}</span></span></span>`

    const formulas = {
        "01": `x °F ≘ (x − 32) × ${xn(5,9)} °C`,
        "02": `x °F ≘ (212 − x) × ${xn(5,6)} °De`,
        "03": `x °F ≘ (x + 459.67) × ${xn(5,9)} K`,
        "04": `x °F ≘ (x − 32) × ${xn(11,60)} °N`,
        "05": `x °F ≘ (x + 459.67) °R`,
        "06": `x °F ≘ (x − 32) × ${xn(4,9)} °Ré`,
        "07": `x °F ≘ ((x − 32) × ${xn(7,24)} + 7.5) °Rø`,
        "10": `x °C ≘ (x × ${xn(9,5)} + 32) °F`,
        "12": `x °C ≘ (100 − x) × ${xn(3,2)} °De`,
        "13": `x °C ≘ (x + 273.15) K`,
        "14": `x °C ≘ x × ${xn(33,100)} °N`,
        "15": `x °C ≘ (x + 273.15) × ${xn(9,5)} °R`,
        "16": `x °C ≘ x × ${xn(4,5)} °Ré`,
        "17": `x °C ≘ (x × ${xn(21,40)} + 7.5) °Rø`,
        "20": `x °De ≘ (212 − x × ${xn(6,5)}) °F`,
        "21": `x °De ≘ (100 − x × ${xn(2,3)}) °C`,
        "23": `x °De ≘ (373.15 − x × ${xn(2,3)}) K`,
        "25": `x °De ≘ (671.67 − x × ${xn(6,5)}) °R`,
        "30": `x K ≘ (x × ${xn(9,5)} − 459.67) °F`,
        "31": `x K ≘ (x − 273.15) °C`,
        "32": `x K ≘ (373.15 − x) × ${xn(3,2)} °De`,
        "34": `x K ≘ (x − 273.15) × ${xn(33,100)} °N`,
        "35": `x K ≘ x × ${xn(9,5)} °R`,
        "36": `x K ≘ (x − 273.15) × ${xn(4,5)} °Ré`,
        "37": `x K ≘ ((x − 273.15) × ${xn(21,40)} + 7.5) °Rø`,
        "40": `x °N ≘ (x × ${xn(60,11)} + 32) °F`,
        "41": `x °N ≘ x × ${xn(100,33)} °C`,
        "43": `x °N ≘ (x × ${xn(100,33)} + 273.15) K`,
        "45": `x °N ≘ (${xn(60,11)} x + 491.67) °R`,
        "50": `x °R ≘ (x − 459.67) °F`,
        "51": `x °R ≘ (x − 491.67) × ${xn(5,9)} °C`,
        "52": `x °R ≘ (671.67 − x) × ${xn(5,6)} °De`,
        "53": `x °R ≘ x × ${xn(5,9)} K`,
        "54": `x °R ≘ (x − 491.67) × ${xn(11,60)} °N`,
        "56": `x °R ≘ (x − 491.67) × ${xn(4,9)} °Ré`,
        "57": `x °R ≘ ((x − 491.67) × ${xn(7,24)} + 7.5) °Rø`,
        "60": `x °Ré ≘ (x × ${xn(9,4)} + 32) °F`,
        "61": `x °Ré ≘ x × ${xn(5,4)} °C`,
        "63": `x °Ré ≘ (x × ${xn(5,4)} + 273.15) K`,
        "65": `x °Ré ≘ (x × ${xn(9,4)} + 491.67) °R`,
        "70": `x °Rø ≘ ((x − 7.5) × ${xn(24,7)} + 32) °F`,
        "71": `x °Rø ≘ (x − 7.5) × ${xn(40,21)} °C`,
        "73": `x °Rø ≘ ((x − 7.5) × ${xn(40,21)} + 273.15) K`,
        "75": `x °Rø ≘ ((x − 7.5) × ${xn(24,7)} + 491.67) °R`,
    };

    formula.innerHTML = ''
    let _to = [from, to].join('');

    if(formulas[_to]) formula.innerHTML = formulas[_to];
    else if(from == to) formula.innerHTML = `${tempChar[from]} ${fromToIcon} ${tempChar[to]}`
    else formula.innerHTML = `${tempChar[from]} ${fromToIcon} Kelvin ${fromToIcon} ${tempChar[to]}`
}

// Theme functions

theme.forEach((e) => e.addEventListener("click", (element) => changeTheme(element.target.getAttribute("data-theme").trim())));

function changeTheme(value) {
    const classList = document.documentElement.classList.value.split(' ');
    if(classList.includes(value)) return;

    setLocalThemeValue(value);
    document.documentElement.classList = '';
    document.documentElement.classList.add(value);
    drawLine();
}

function checkLocalTheme() {
    const theme = getLocalThemeValue();

    if(!theme) changeTheme("light");
    else {
        document.documentElement.classList = '';
        document.documentElement.classList.add(theme);
    }
}

function getLocalThemeValue() {
    return localStorage.getItem("temperature_conversion_theme");
}

function setLocalThemeValue(value) {
    localStorage.setItem("temperature_conversion_theme", value);
}

function getArrowColor() {
    const rootStyles = getComputedStyle(document.documentElement);
    return rootStyles.getPropertyValue("--temp-conv-arrow-color").trim();
}

// ------- font resize start -------
function enableAutoFontResize(el, minSize = 8) {
  function fit() {
    el.style.fontSize = ""; // reset
    let size = parseInt(getComputedStyle(el).fontSize);

    while (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
      size--;
      el.style.fontSize = size + "px";
      if (size <= minSize) break;
    }
  }

  // İlk dəfə
  fit();

  // Content dəyişəndə
  const mo = new MutationObserver(fit);
  mo.observe(el, { childList: true, subtree: true, characterData: true });

  // Element ölçüləri dəyişəndə
  const ro = new ResizeObserver(fit);
  ro.observe(el);

  return { fit, mo, ro };
}

enableAutoFontResize(convertedTemp);

function autoResizeInputFont(input, minSize = 13) {
  function fit() {
    input.style.fontSize = ""; // reset to default
    let size = parseFloat(getComputedStyle(input).fontSize);

    // loop until text fits
    while (input.scrollWidth > input.clientWidth) {
      size -= 1;
      input.style.fontSize = size + "px";
      if (size <= minSize) break;
    }
  }

  // İlk dəfə
  fit();

  // Input dəyəri dəyişəndə: (user type etdikcə)
  input.addEventListener("input", fit);

  // Input ölçüsü dəyişsə:
  new ResizeObserver(fit).observe(input);
}

autoResizeInputFont(inputTemp);

// ------- end -------


checkLocalTheme();

setTimeout(() => {
    resizeCanvas();
    drawLine();
}, 500)
