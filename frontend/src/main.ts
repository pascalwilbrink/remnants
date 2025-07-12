import Phaser from 'phaser';
import { TownScene } from './scenes/town';
import { ForestScene } from './scenes/forest';
import { PreloadScene } from './scenes/preload';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [PreloadScene, TownScene, ForestScene]
};

const game = new Phaser.Game(config);