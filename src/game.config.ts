import { ScreenConfig } from "./lib/utils/Types.js";

type GameConfig = {
  pointWidth: number;
  backgroundColor: string;
  foregroundColor: string;
  screenConfig: ScreenConfig;
};

const config: GameConfig = {
  pointWidth: 2,
  backgroundColor: "#164757",
  foregroundColor: "#000000",
  screenConfig: {
    width: 1200,
    height: 900,
    fov: 80,
    z_far: 10,
    z_near: 1,
  },
};

export default config;
