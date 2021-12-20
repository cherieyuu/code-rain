let cvs, ctx, cw, ch;
let fontSize = 16, offsetY, cols;
const textList = [];
const color = {
  gradientCount: 3,
  headColor: "rgb(255, 255, 255)",
  bodyColor: "rgb(0, 255, 0)",
  gradientColorList: ["rgb(170, 255, 170)", "rgb(85, 255, 85)"],
  saturRange: [0, 100],
  lightRange: [0, 50],
  hslList : [],
};

let codeList = [];
const pinMap = {};
const pinStack = [];
let pinId = 0;

class Code { // 字符类，成员包括绘制坐标、要绘制的文本、样式
  x = 0;
  y = 0;
  text = "";
  style = {};

  constructor(data) {
    this.x = data.x;
    this.y = data.y;
  }

  setCoordinate(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setText(text) {
    this.text = text;
    return this;
  }

  setStyle(style) {
    this.style = Object.assign(this.style, style);
    return this;
  }
}

function initTextAndColor() {
  for (let i = 0x30A0; i < 0x30FF; i++) {
    textList.push(String.fromCharCode(i));
  }

  for (let i = color.saturRange[0]; i <= color.saturRange[1]; i++) {
    for (let j = color.lightRange[0]; j <= color.lightRange[1]; j++) {
      color.hslList.push(`hsl(120, ${i}%, ${j}%)`);
    }
  }
}

function getRandomX() {
  const maxColNum = Math.ceil(cw / fontSize);
  while (true) {
    const x = Math.ceil(Math.random() * maxColNum) * fontSize;
    if (codeList.every((item) => item.x !== x )) { return x; }
  }
}

function getInitY() {
  return -Math.ceil(Math.random() * cw / 2);
}

function fill(text) {
  if (text.style.alpha) {
    ctx.fillStyle = `${text.style.fillStyle.slice(0, -1)}, ${text.style.alpha})`;
  } else {
    ctx.fillStyle = text.style.fillStyle;
  }
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText(text.text, text.x, text.y)
}

function setCodeConf(targetObj, sourceObj) {
  targetObj.setCoordinate(sourceObj.x, sourceObj.y).setText(sourceObj.text);
}

function getRandomText() {
  return textList[Math.floor(Math.random() * textList.length)];
}

function resize() {
  cw = cvs.width = document.body.clientWidth;
  ch = cvs.height = document.body.clientHeight;

  // 根据页宽重新计算代码条数，增减绘制的CodeList数据
  cols = Math.ceil(cw / fontSize / 3);
  while (codeList.length < cols) {
    const x = getRandomX();
    const y = getInitY();
    // 初始化一条Code
    const code = new Code({ x, y });
    code.timespan = Math.ceil(Math.random() * 100) + 50; // 每次更新的间隔，“速度”
    code.timestamp = 0;
    code.setStyle({ fillStyle: color.headColor })
    // 初始化每条Code首字符后的字符信息
    code.body = new Array(Math.ceil(Math.random() * 30) + 30 );
    for (let i = 0; i < code.body.length; i++) {
      code.body[i] = new Code({ x, y });
      if (i < color.gradientCount ) {
        code.body[i].setStyle({ fillStyle: color.gradientColorList[i - 1] });
      } else {
        code.body[i].setStyle({ fillStyle: color.bodyColor })
      }
    }
    codeList.push(code);
  }
  codeList = codeList.slice(0, cols);
}

function draw(timestamp) {
  codeList.forEach((code) => {
    // 更新
    if (timestamp > code.timestamp) {
      code.timestamp += code.timespan; // 下一次更新的时间

      const body = code.body;
      const last = body[body.length - 1];

      // 拖尾数据添加
      if (last.y > 0) {
        let pin;
        if (pinStack.length) {
          pin = pinStack.pop();
        } else {
          pin = new Code({ x: -1, y: -1 });
          pin.id = pinId++;
        }
        pin.setCoordinate(last.x, last.y).setText(last.text).setStyle(last.style);
        pin.alpha = 255;
        pinMap[pin.id] = pin;
      }
      
      setCodeConf(body[0], code); // 将代码头的信息给后一个（身子第一个）
      code.setText(getRandomText()); // 代码头获得一个新的字符并下坠一个身位
      code.setCoordinate(code.x, code.y + fontSize);
      for(let i = body.length - 1; i > 0; i--) { // 每个身子字符获得前一个字符的所有信息，字符小几率更改
        const next = body[i], pre = body[i - 1];
        next.setCoordinate(pre.x, pre.y).setText(Math.random() < 0.05 ? getRandomText() : pre.text);
        if (i > color.gradientCount) {
          next.setStyle(pre.style);
        }
      }
      const hslRange = (color.lightRange[1] - color.lightRange[0] + 1) * (color.saturRange[1] - color.saturRange[0] + 1);
      code.body[color.gradientCount].setStyle({ fillStyle: color.hslList[Math.floor(Math.random() * hslRange)] });
  
      if (code.y > ch) { // 当头坠出页面
        code.setCoordinate(getRandomX(), getInitY());
      }
    }
  })

  // 绘制
  ctx.clearRect(0, 0, cw, ch);
  codeList.forEach((code) => {
    fill(code);
    for (let i = 0; i < code.body.length; i++) {
      if (code.body[i].y < 0) continue;
      fill(code.body[i]);
    }
  })

  // 拖尾绘制
  for (let id in pinMap) {
    pin = pinMap[id];
    if (pin.alpha > 8) {
      pin.alpha -= 5;
      pin.setStyle({ alpha: pin.alpha / 255 });
      fill(pin);
    } else {
      delete pinMap[id];
      pinStack.push(pin);
    }
  }
  window.requestAnimationFrame(draw);
}

function init() {
  cvs = document.getElementById("cvs");
  if (!cvs || !cvs.getContext) return;

  ctx = cvs.getContext("2d");
  if (!ctx) return;

  initTextAndColor();
  resize();
  window.addEventListener('resize', resize, false);

  window.requestAnimationFrame(draw);
}
