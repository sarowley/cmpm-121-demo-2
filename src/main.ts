import "./style.css";

const gameName = "Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

const magic0 = 0;
const magic1 = 1;

const lines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[] = [];

const ctx = canvas.getContext("2d");

const cursor = { active: false, x: magic0, y: magic0 };

const eventCheck = new EventTarget();

function alert(_: string) {
  eventCheck.dispatchEvent(new Event(_));
}

function redraw() {
  ctx?.clearRect(magic0, magic0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > magic1) {
      ctx?.beginPath();
      const { x, y } = line[magic0];
      ctx?.moveTo(x, y);
      for (const { x, y } of line) {
        ctx?.lineTo(x, y);
      }
      ctx?.stroke();
    }
  }
}

eventCheck.addEventListener("drawing-changed", () => {
  redraw();
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  currentLine.push({ x: cursor.x, y: cursor.y });
  lines.push(currentLine);
  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx?.beginPath();
    ctx?.moveTo(cursor.x, cursor.y);
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: e.offsetX, y: e.offsetY });
  }
  alert("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  alert("drawing-changed");
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(magic0, lines.length);
  redraw();
});
