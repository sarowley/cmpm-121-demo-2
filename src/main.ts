import "./style.css";

const gameName = "Sticker Sketchpad";

document.title = gameName;

let stamping = false;

const header = document.createElement("h1");
header.innerHTML = gameName;

//got a lot of this from the prof's "shoddy-paint" code

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.cursor = "none";
document.body.append(canvas);

const firstIndex = 0;

const thinLine = 4;
const thickLine = 15;

const thinIcon = "o";
const thickIcon = "O";

let currentThickness: number = thinLine;
let currentIcon: string = thinIcon;

const ctx = canvas.getContext("2d")!;

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  icon: string;
  stamp: boolean;
  constructor(
    x: number,
    y: number,
    thickness: number,
    icon: string,
    stamp: boolean
  ) {
    this.points = [{ x, y }];
    this.thickness = thickness;
    this.icon = icon;
    this.stamp = stamp;
  }
  execute(ctx: CanvasRenderingContext2D) {
    if (this.stamp) {
      ctx.fillText(
        this.icon,
        this.points[firstIndex].x - magic8,
        this.points[firstIndex].y + magic16
      );
    } else {
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
  }
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
}
const magic8 = 8;
const magic16 = 16;
const magic1 = 1;

class CursorCommand {
  x: number;
  y: number;
  icon: string;
  constructor(x: number, y: number, icon: string) {
    this.x = x;
    this.y = y;
    this.icon = icon;
  }
  execute() {
    ctx.font = "32px monospace";
    ctx.fillText(this.icon, this.x - magic8, this.y + magic16);
  }
}

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];

let cursorCommand: CursorCommand | null = null;

let currentLineCommand: LineCommand | null = null;

const event = new Event("drawing-changed");
const cursorEvent = new Event("cursor-changed");

canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  canvas.dispatchEvent(cursorEvent);
});

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentIcon);
  canvas.dispatchEvent(cursorEvent);
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(
    e.offsetX,
    e.offsetY,
    currentThickness,
    currentIcon,
    stamping
  );
  commands.push(currentLineCommand);
  redoCommands.splice(firstIndex, redoCommands.length);
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, currentIcon);
  canvas.dispatchEvent(cursorEvent);
  if (e.buttons == magic1) {
    currentLineCommand!.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(event);
  }
});

canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  canvas.dispatchEvent(event);
  canvas.dispatchEvent(cursorEvent);
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(firstIndex, firstIndex, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute(ctx));
});

canvas.addEventListener("cursor-changed", () => {
  ctx.clearRect(firstIndex, firstIndex, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.execute(ctx));
  if (CursorCommand) {
    cursorCommand?.execute();
  }
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
  stamping = false;
  currentThickness = thinLine;
  currentIcon = thinIcon;
});

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick";
document.body.append(thickButton);

thickButton.addEventListener("click", () => {
  stamping = false;
  currentThickness = thickLine;
  currentIcon = thickIcon;
});

const antButton = document.createElement("button");
const fileButton = document.createElement("button");
const popButton = document.createElement("button");
const stampList: { buttonName: HTMLElement; icon: string }[] = [
  { buttonName: antButton, icon: "🐜" },
  { buttonName: fileButton, icon: "📁" },
  { buttonName: popButton, icon: "🍿" },
];

function addButtons(stampList: { buttonName: HTMLElement; icon: string }[]) {
  stampList.forEach((element) => {
    document.body.append(element.buttonName);
    element.buttonName.innerHTML = element.icon;
    element.buttonName.addEventListener("click", () => {
      currentIcon = element.icon;
      stamping = true;
      stampList.pop();
    });
  });
}
addButtons(stampList);

const customButton = document.createElement("button");
document.body.append(customButton);
customButton.innerHTML = "Custom Sticker";
customButton.addEventListener("click", () => {
  let lastIcon = "test";
  let text = prompt("Custom sticker", `${lastIcon}`);
  if (text == null || text == "") {
    text = lastIcon;
  }
  lastIcon = text;
  currentIcon = text!;
  stamping = true;
  const customStamp = document.createElement("button") as HTMLElement;
  // const buttons: HTMLDivElement = document.querySelector("#buttons")!;
  customStamp.innerHTML = text;
  document.body.append(customStamp);
  stampList.push({ buttonName: customStamp, icon: text });
  addButtons(stampList);
});
