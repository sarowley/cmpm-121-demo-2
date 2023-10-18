import "./style.css";

const gameName = "Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

//got a lot of this from the prof's "shoddy-paint" code

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
document.body.append(canvas);

const firstIndex = 0;

const thinLine = 4;
const thickLine = 15;

let currentThickness: number = thinLine;

const ctx = canvas.getContext("2d")!;

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }
  execute(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
    ctx?.beginPath();
    const { x, y } = this.points[firstIndex];
    ctx?.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];

let currentLineCommand: LineCommand | null = null;

let cursor = false;

const event = new Event("drawing-changed");

canvas.addEventListener("mousedown", (e) => {
  cursor = true;
  currentLineCommand = new LineCommand(e.offsetX, e.offsetY, currentThickness);
  commands.push(currentLineCommand);
  redoCommands.splice(firstIndex, redoCommands.length);
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor) {
    currentLineCommand!.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(event);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(firstIndex, firstIndex, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute(ctx));
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(firstIndex, commands.length);
  canvas.dispatchEvent(event);
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length) {
    redoCommands.push(commands.pop()!);
    canvas.dispatchEvent(event);
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length) {
    commands.push(redoCommands.pop()!);
    canvas.dispatchEvent(event);
  }
});

const thinButton = document.createElement("button");
thinButton.innerHTML = "thin";
document.body.append(thinButton);

thinButton.addEventListener("click", () => {
  currentThickness = thinLine;
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  currentThickness = thickLine;
});
