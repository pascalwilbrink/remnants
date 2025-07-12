import { Game } from "./app";
import { Village } from "./scene/village";

const game: Game = new Game();

const village: Village = new Village(game);

game
  .dev()
  .setScene(village)
  .init();
