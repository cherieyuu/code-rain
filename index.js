const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");
const cw = cvs.width = document.body.clientWidth;
const ch = cvs.height = document.body.clientHeight;

const codeRainArr = [];
const step = 16; // 每列内部数字之间的上下间隔
const cols = parseInt(cw / 14); // 代码雨列数
ctx.font = "bold 26px Trebuchet MS"

function colorCv() {
  ctx.fillStyle = "#242424";
  ctx.fillRect(0, 0, cw, ch);
}

let runId; // requestAnimationFrame的ID值，可以用来取消动画
let changeId = 0; // 0表示codeRain画面，1表示油画画面

// 生成代码雨数组
function createCodeRain() {
  for (let n = 0; n < cols; n++) {
    const col = [];
    const basePos = parseInt(Math.random() * 300); // 列间距的偏移量
    const speed = parseInt(Math.random() * 5); // 速度
    const colx = parseInt(Math.random() * cw); // 每列的X轴位置

    const rgbg = parseInt(Math.random() * 255); // 绿色随机

    const colNum = parseInt(parseInt(ch / step) / (parseInt(Math.random() * 4))); // 每列的字符数
    for (var i = 0; i < colNum; i++) {
      col.push({
        x: colx,
        y: -(step * i) - basePos,
        speed,
        text: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "s", "t", "u", "v", "w", "x", "y", "z"][parseInt(Math.random() * 11)],
        color: `rgb(0, ${rgbg}, 0)`,
      })
    }
    codeRainArr.push(col);
  }
}

// 画出代码雨
function codeRaining() {
  ctx.clearRect(0, 0, cw, ch);
  // debugger;
  codeRainArr.forEach((col) => { // 每一列
    col.forEach((code) => { // 每个字符
      // 如果超出下边界则重置到顶部，否则匀速下落
      code.y > ch ? code.y = 0 : code.y += code.speed;
      ctx.fillStyle = code.color;
      ctx.fillText(code.text, code.x, code.y);
    })
  })
  runId = window.requestAnimationFrame(codeRaining); // 重复调用，循环下雨
  // ctx.clearRect(0, 0, cw, ch);
}

createCodeRain();
runId = window.requestAnimationFrame(codeRaining);