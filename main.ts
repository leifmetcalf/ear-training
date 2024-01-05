type Group = "White" | "Black1" | "Black2";

type Note = { group: Group; order: number };

const white_height = 3.3;
const black_width = 0.6;
const black_spacing = 1.1;
const stroke_width = 0.08;

const notes = new Map<number, Note>([
  [0, { group: "White", order: 0 }],
  [1, { group: "Black1", order: 0 }],
  [2, { group: "White", order: 1 }],
  [3, { group: "Black1", order: 1 }],
  [4, { group: "White", order: 2 }],
  [5, { group: "White", order: 3 }],
  [6, { group: "Black2", order: 0 }],
  [7, { group: "White", order: 4 }],
  [8, { group: "Black2", order: 1 }],
  [9, { group: "White", order: 5 }],
  [10, { group: "Black2", order: 2 }],
  [11, { group: "White", order: 6 }],
]);

const audioContext = new AudioContext();

const button = document.getElementById("start");

function make_key(pitch: number, octave: number, group: Group, order: number) {
  const gain = new GainNode(audioContext);
  gain.connect(audioContext.destination);
  gain.gain.value = 0;
  const osc = new OscillatorNode(audioContext);
  osc.frequency.value = 440 * 2 ** ((pitch - 9) / 12);
  osc.connect(gain);
  let started = false;
  const key = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  key.onmousedown = () => {
    if (!started) {
      osc.start();
      started = true;
    }
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
  for (let i = 0; i < n; i++) {
    const n = i % 12;
    const note = notes.get(n);
    if (note === undefined) {
      continue;
    }
    const key = make_key(i, Math.floor(i / 12), note.group, note.order);
    (note.group === "White" ? white_keys : black_keys).append(key);
  }
  keyboard.setAttribute(
    "viewBox",
    `${0 - stroke_width / 2} ${0 - stroke_width / 2} ${
      white_keys.childElementCount + stroke_width
    } ${white_height + stroke_width}`
  );
  return keyboard;
}

function play_melody() {}

document.getElementById("keyboard")?.append(make_keyboard(24));
