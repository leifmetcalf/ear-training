const white_height = 3.3;
const black_width = 0.6;
const black_spacing = 1.1;
const stroke_width = 0.08;

type Group = "White" | "Black1" | "Black2";

class Note {
  pitch: number;
  octave: number;
  tone: number;
  group: Group;
  order: number;

  constructor(pitch: number) {
    this.pitch = pitch;
    this.octave = Math.floor(pitch / 12);
    this.tone = pitch % 12;
    const groups: [Group, number][] = [
      ["White", 0],
      ["Black1", 0],
      ["White", 1],
      ["Black1", 1],
      ["White", 2],
      ["White", 3],
      ["Black2", 0],
      ["White", 4],
      ["Black2", 1],
      ["White", 5],
      ["Black2", 2],
      ["White", 6],
    ];
    const [group, order] = groups[this.tone];
    this.group = group;
    this.order = order;
  }
}

const audioContext = new AudioContext();
const oscillators: [OscillatorNode, boolean][] = [];
const button = document.getElementById("start");
if (button !== null) {
  button.onclick = () => {
    for (let i = 0; i < oscillators.length; i++) {
      const [osc, started] = oscillators[i];
      if (!started) {
        osc.start();
        oscillators[i][1] = true;
      }
    }
  };
}

function make_key(note: Note) {
  const { pitch, octave, group, order } = note;
  const gain = new GainNode(audioContext);
  gain.connect(audioContext.destination);
  gain.gain.value = 0;
  const osc = new OscillatorNode(audioContext);
  osc.type = "triangle";
  osc.frequency.value = 440 * 2 ** ((pitch - 57) / 12);
  osc.connect(gain);
  oscillators.push([osc, false]);
  const key = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  key.onmousedown = () => {
    const now = audioContext.currentTime;
    gain.gain.setTargetAtTime(1, now, 0.01);
    gain.gain.setTargetAtTime(0, now + 0.4, 0.01);
  };
  key.setAttribute("stroke-width", `${stroke_width}`);
  if (group === "White") {
    key.setAttribute("x", `${7 * octave + order}`);
    key.setAttribute("width", "1");
    key.setAttribute("height", `${white_height}`);
    key.setAttribute("class", "white key");
  } else {
    if (group === "Black1") {
      key.setAttribute(
        "x",
        `${7 * octave + 1.5 - black_width / 2 + black_spacing * (order - 0.5)}`
      );
    } else if (group === "Black2") {
      key.setAttribute(
        "x",
        `${7 * octave + 5 - black_width / 2 + black_spacing * (order - 1)}`
      );
    }
    key.setAttribute("width", `${black_width}`);
    key.setAttribute("height", "2");
    key.setAttribute("class", "black key");
  }
  return key;
}

function make_keyboard(n: number) {
  const keyboard = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  const white_keys = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  keyboard.append(white_keys);
  const black_keys = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  keyboard.append(black_keys);
  for (let i = 48; i < 48 + n; i++) {
    const note = new Note(i);
    const key = make_key(note);
    (note.group === "White" ? white_keys : black_keys).append(key);
  }
  const left = Math.min(
    +white_keys.firstElementChild?.getAttribute("x")!,
    +black_keys.firstElementChild?.getAttribute("x")!
  );
  const right = Math.max(
    +white_keys.lastElementChild?.getAttribute("x")! + 1,
    +black_keys.lastElementChild?.getAttribute("x")! + black_width
  );
  keyboard.setAttribute(
    "viewBox",
    `${left - stroke_width / 2} ${0 - stroke_width / 2} ${
      right - left + stroke_width
    } ${white_height + stroke_width}`
  );
  return keyboard;
}

function play_melody() {}

document.getElementById("keyboard")?.append(make_keyboard(24));
