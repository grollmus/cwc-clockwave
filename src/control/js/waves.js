function anyColor() {
  const h = Math.floor(Math.random() * 360);        
  const s = Math.floor(Math.random() * 40 + 30);    
  const l = Math.floor(Math.random() * 60 + 20);    
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function rgbToHue(rgb) {
  let r, g, b
  if (rgb.startsWith("#")) {
    rgb = rgb.replace(/^#/, '');
    // Parse RGB components
    r = parseInt(rgb.slice(0, 2), 16) / 255;
    g = parseInt(rgb.slice(2, 4), 16) / 255;
    b = parseInt(rgb.slice(4, 6), 16) / 255;
  } else {
    [r, g, b] = rgb.match(/\d+/g).map(Number).map(v => v / 255);
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta === 0) {
    hue = 0;
  } else if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

function createWave(t, width, height, lightness, wavesSVG) {
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("fill", `hsl(${hue}, 30%, ${lightness}%)`);
  const xrev = 1 - t 
  const pathStr = [];
  for (let i = -5; i <= 5; i++) {
    const x = width * (xrev + .25*i);
    let y = 60;
    if (i === -5) {
      pathStr.push(`M`);
      pathStr.push(`${x.toFixed(1)},100 `);
      pathStr.push(`L`);
    } if (i%2 === 0) {
      pathStr.push(`Q`);
      y = 60 + height;
    } if (i%4 === 0) {
      y = 60 - height;
    }
    pathStr.push(`${x.toFixed(1)},${y.toFixed(1)} `);
    if (i === 5) {
      pathStr.push(`L`);
      pathStr.push(`${x.toFixed(1)},100 `);
      pathStr.push(`Z`);
    }
  }
  path.setAttribute("d", pathStr.join(" "));
  wavesSVG.appendChild(path);
}

function updateWaves(wavesSVG) {
  while (wavesSVG.firstChild) {
    wavesSVG.removeChild(wavesSVG.firstChild);
  }
  const width = 100;
  getTime();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  for (let i = 0; i <= 4; i++) {
    const lightness = prefersDark ? (20 + i*10) : (100 - 20 - i*10);
    createWave(    timeFracs[i]%1, width, 110-i*15, lightness, wavesSVG);
  }
  requestAnimationFrame(() => updateWaves(wavesSVG));
}

function getTime() {
  now = new Date();
  timeZoneName = Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).format(now).split(' ').pop();
  year = now.getFullYear();
  monthStr = now.toLocaleString('en-US', { month: 'short'}); // Jul
  month = now.getMonth(); //Jan=0, Feb=1...
  date = now.getDate();

  //get the week number this month
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const firstDay = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const week = Math.floor((firstDay + date - 1) / 7);
  const totalDays = lastOfMonth.getDate();
  weeksInMonth = Math.ceil((firstDay + totalDays) / 7);
  sides = [9, 9, 11, weeksInMonth-1, 6, 23, 6, 9, 6, 9]
  weekday = now.toLocaleString('en-US', { weekday: 'short'}); // Thu
  wkday = (now.getDay()+6)%7; //Sun=6, Mon=0...
  hour = now.getHours();
  minute = now.getMinutes();
  second = now.getSeconds();
  millisecond = now.getMilliseconds();
  time= [Math.floor(year/10)%10, year%10, month, week, wkday, hour, Math.floor(minute/10), minute%10, Math.floor(second/10), second%10];
  const secFrac = millisecond/1000;
  const minFrac = (second + secFrac)/60;
  const hrFrac  = (minute + minFrac)/60;
  const dayFrac = (hour + hrFrac)/24;

  //get the day number this year
  const start = new Date(year, 0, 0); // Jan 1 
  const oneDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((now - start) / oneDay);

  const yrFrac = (days + dayFrac)/365.25;
  const milFrac = (year + yrFrac)/1000;
  timeFracs = [milFrac, yrFrac, dayFrac, hrFrac, minFrac, secFrac];
  
  const unixTime = Math.floor(now.getTime() / 1000);
  binary = unixTime.toString(2).padStart(32, '0');
}

const svgNS = "http://www.w3.org/2000/svg";

let col = anyColor()
let hue = parseInt(col.match(/hsl\((\d+),/)[1], 10);
let rgb = toColor("#FF0000");
hue = rgbToHue(rgb);
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const lightness = prefersDark ? 70 : 30;
col = `hsl(${hue}, 30%, ${lightness}%)`;

document.querySelectorAll("svg.waves").forEach(svg => {
  updateWaves(svg);
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
});

setInterval(() => {
  getTime();
  document.querySelectorAll("span[data-level]").forEach(span => {
    const level = parseInt(span.dataset.level, 10);
    span.textContent = " ("+time[level]+")";
  });
}, 1000);

function setProperty(data) {
  console.log('onPropertyChanged ' + data.key);  // uncomment this line to check whether data is incoming in the browser console from WinCC Unified
  switch (data.key) {
    case 'WaveColor':
      rgb = toColor(data.value);
      break;
  }
}

function toColor(num) {
  num >>>= 0;
  var b = num & 0xFF,
    g = (num & 0xFF00) >>> 8,
    r = (num & 0xFF0000) >>> 16,
    a = ((num & 0xFF000000) >>> 24) / 255;

  return 'rgba(' + [r, g, b, a].join(',') + ')';
}

WebCC.start(
  // callback function; occurs when the connection is done or failed. 
  // "result" is a boolean defining if the connection was successfull or not.
  function (result) {
    if (result) {
      console.log('connected successfully');
      // Set current values
      setProperty({ key: 'WaveColor', value: WebCC.Properties.WaveColor });
      // Subscribe for value changes
      WebCC.onPropertyChanged.subscribe(setProperty);
    }
    else {
      console.log('connection failed');
    }
  },
  // contract (see also manifest.json)
  {
    // Methods
    methods: [],
    // Events
    events: [],
    // Properties
    properties: {
      WaveColor: 4294967295,
    }
  },
  // placeholder to include additional Unified dependencies (not used in this example)
  [],
  // connection timeout
  10000
);