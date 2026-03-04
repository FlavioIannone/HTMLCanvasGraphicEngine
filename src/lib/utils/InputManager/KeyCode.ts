/**
 * Comprehensive list of standard hardware keys and virtual engine inputs.
 * Uses KeyboardEvent.code string values to remain layout-agnostic
 * (e.g., KeyW physically maps to the same key location on QWERTY and AZERTY).
 */
export enum KeyCode {
  // --- Virtual Engine Inputs (Non-DOM) ---
  MouseDelta = "Virtual_MouseDelta",
  MouseLeftClick = "Virtual_Mouse0",
  MouseRightClick = "Virtual_Mouse1",
  MouseMiddleClick = "Virtual_Mouse2",

  // --- Alphanumeric Keys ---
  A = "KeyA",
  B = "KeyB",
  C = "KeyC",
  D = "KeyD",
  E = "KeyE",
  F = "KeyF",
  G = "KeyG",
  H = "KeyH",
  I = "KeyI",
  J = "KeyJ",
  K = "KeyK",
  L = "KeyL",
  M = "KeyM",
  N = "KeyN",
  O = "KeyO",
  P = "KeyP",
  Q = "KeyQ",
  R = "KeyR",
  S = "KeyS",
  T = "KeyT",
  U = "KeyU",
  V = "KeyV",
  W = "KeyW",
  X = "KeyX",
  Y = "KeyY",
  Z = "KeyZ",

  // --- Numeric Row ---
  Digit1 = "Digit1",
  Digit2 = "Digit2",
  Digit3 = "Digit3",
  Digit4 = "Digit4",
  Digit5 = "Digit5",
  Digit6 = "Digit6",
  Digit7 = "Digit7",
  Digit8 = "Digit8",
  Digit9 = "Digit9",
  Digit0 = "Digit0",

  // --- Navigation & Arrows ---
  UpArrow = "ArrowUp",
  DownArrow = "ArrowDown",
  LeftArrow = "ArrowLeft",
  RightArrow = "ArrowRight",
  Insert = "Insert",
  Home = "Home",
  PageUp = "PageUp",
  Delete = "Delete",
  End = "End",
  PageDown = "PageDown",

  // --- Control & Modifiers ---
  Space = "Space",
  Enter = "Enter",
  Escape = "Escape",
  Backspace = "Backspace",
  Tab = "Tab",
  ShiftLeft = "ShiftLeft",
  ShiftRight = "ShiftRight",
  ControlLeft = "ControlLeft",
  ControlRight = "ControlRight",
  AltLeft = "AltLeft",
  AltRight = "AltRight",
  MetaLeft = "MetaLeft", // Windows/Command key
  MetaRight = "MetaRight",

  // --- Numpad ---
  Numpad0 = "Numpad0",
  Numpad1 = "Numpad1",
  Numpad2 = "Numpad2",
  Numpad3 = "Numpad3",
  Numpad4 = "Numpad4",
  Numpad5 = "Numpad5",
  Numpad6 = "Numpad6",
  Numpad7 = "Numpad7",
  Numpad8 = "Numpad8",
  Numpad9 = "Numpad9",
  NumpadAdd = "NumpadAdd",
  NumpadSubtract = "NumpadSubtract",
  NumpadMultiply = "NumpadMultiply",
  NumpadDivide = "NumpadDivide",
  NumpadEnter = "NumpadEnter",
  NumpadDecimal = "NumpadDecimal",

  // --- Function Keys ---
  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",

  // --- Symbols & Punctuation ---
  Semicolon = "Semicolon",
  Equal = "Equal",
  Comma = "Comma",
  Minus = "Minus",
  Period = "Period",
  Slash = "Slash",
  Backquote = "Backquote",
  BracketLeft = "BracketLeft",
  BracketRight = "BracketRight",
  Quote = "Quote",
  Backslash = "Backslash",
}

export default KeyCode;
