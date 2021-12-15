let cvs, ctx, cw, ch;
const textList = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "x", "y", "z"];
const colorList = ["#f2fff1", "#c7f2c3", "#8aec80", "#51f23f", "#28bd17"]; // 渐变绿色

const codeRainArr = [];
let step, cols; // 每列内部数字之间的上下间隔，代码雨列数

function colorCv() {
  ctx.fillStyle = "#242424";
  ctx.fillRect(0, 0, cw, ch);
}

function getInitY(colNum) {
  return -parseInt(Math.random() * 300) - colNum * step;
}

// 生成代码雨数组
function createCodeRain() {
  for (let n = 0; n < cols; n++) {
    const col = {};
    col.speed = parseInt(Math.random() * 8) + 1; // 速度
    col.colNum = parseInt(parseInt(ch / step) / (parseInt(Math.random() * 4))) + 4; // 每列的字符数
    col.x = parseInt(Math.random() * cw); // 每列的X轴位置
    col.y = getInitY(col.colNum);
    col.charList = [];
    for (let i = 0; i < col.colNum; i++) {
      col.charList.push(textList[parseInt(Math.random() * textList.length)]);
    }

    codeRainArr.push(col);
  }
  // console.log(codeRainArr);
}

// 画出代码雨
function codeRaining() {
  ctx.clearRect(0, 0, cw, ch);
  // debugger;
  codeRainArr.forEach((col) => { // 每一列
    // console.log(col);
    // 如果该条数据最上字符超出页面下方则将Y坐标重置到顶部、同时随机重置X坐标，再绘制出整条数据
    if (col.y > ch) {
      col.y = getInitY(col.colNum);
      col.x = parseInt(Math.random() * cw);
    } else {
      col.y += col.speed;
    }
    let charOffset = col.y; // 记录每个字符的位置

    for (let i = 0; i < col.colNum; i++) { // 每个字符
      charOffset += step;
      ctx.fillStyle = i >= col.colNum - 5 ? colorList[col.colNum - i - 1] : colorList[colorList.length - 1];
      // console.log(col.x, col.y);
      ctx.fillText(col.charList[i], col.x, charOffset);
    }
  })
}

// 窗口resize
function windowResize() {
  cw = cvs.width = document.body.clientWidth;
  ch = cvs.height = document.body.clientHeight;
  ctx.font = "bold 26px Trebuchet MS"
  cols = parseInt(cw / 24);
}

function init() {
  cvs = document.getElementById("cvs");
  if (!cvs || !cvs.getContext) return;

  ctx = cvs.getContext("2d");
  if (!ctx) return;

  windowResize();
  step = 16; 

  createCodeRain();
  setInterval(codeRaining, 50);
  window.addEventListener("resize", windowResize, false);
}
