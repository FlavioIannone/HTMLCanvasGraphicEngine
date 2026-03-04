import {
  ButtonBinding,
  CompositeBinding,
  VectorBinding,
} from "./lib/utils/InputManager/InputAction/Bindings.js";
import {
  ActionType,
  InputAction,
} from "./lib/utils/InputManager/InputAction/InputAction.js";
import { InputMapType } from "./lib/utils/InputManager/InputManager.js";
import KeyCode from "./lib/utils/InputManager/KeyCode.js";

const InputMap: InputMapType = [
  new InputAction("Movement", ActionType.Value, false),
  new InputAction("Jump", ActionType.Button),
  new InputAction("Look", ActionType.Value, true),
];

InputMap[0].attachBindings([
  new CompositeBinding({
    up: KeyCode.W,
    right: KeyCode.D,
    down: KeyCode.S,
    left: KeyCode.A,
  }),
]);
InputMap[1].attachBindings([new ButtonBinding(KeyCode.Space)]);
InputMap[2].attachBindings([new VectorBinding(KeyCode.MouseDelta)]);

export default InputMap;
