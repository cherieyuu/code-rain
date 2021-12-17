let cvs, ctx, cw, ch;
let fontSize = 16, offsetY, cols;
const textList = [];
const color = {
  gradientCount: 3,
  headColor: "rgb(255, 255, 255)",
  bodyColor: "rgb(0, 255, 0)",
};

let codeList = [];

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
  
  ctx.font = `bold ${fontSize}ps sans-serif`;
  
  
  // todo: get the colorList
  // color.gradientColorList = new Array(color.gradientCount);
  // for (let i = 1; i < color.gradientCount; i++) {
  //   color.gradientColorList.push()
  // }
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
  ctx.fillStyle = text.style.fillStyle;
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
  cols = Math.ceil(cw / fontSize / 4);
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
      code.body[i].style.fillStyle = color.bodyColor;
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
      body = code.body;
      setCodeConf(body[0], code); // 将代码头的信息给后一个（身子第一个）
      code.setText(getRandomText()); // 代码头获得一个新的字符并下坠一个身位
      code.setCoordinate(code.x, code.y + fontSize);
  
      for(let i = body.length - 1; i > 0; i--) { // 每个身子字符获得前一个字符的所有信息，字符小几率更改
        const next = body[i], pre = body[i - 1];
        next.setCoordinate(pre.x, pre.y).setText(Math.random() < 0.05 ? getRandomText() : pre.text).setStyle(pre.style);
      }
  
      if (code.y > ch) { // 当头坠出页面
        code.setCoordinate(getRandomX(), getInitY());
      }
      
    }
  })

  ctx.clearRect(0, 0, cw, ch);
  codeList.forEach((code) => {
    // 绘制
    fill(code);
    for (let i = 0; i < code.body.length; i++) {
      fill(code.body[i]);
    }
  })
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
