import Phaser from 'phaser';

export class TextBox {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private text: Phaser.GameObjects.Text;
    private autoHideTimer?: Phaser.Time.TimerEvent;
    private isVisible: boolean = false;
    private currentInteractable: any = null;
    private spaceKey: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene, x: number = 400, y: number = 570, width: number = 780, height: number = 50) {
        this.scene = scene;
        this.isVisible = false;

        // Create container to hold all UI elements
        this.container = scene.add.container(x, y);

        // Create background
        this.background = scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        this.background.setStrokeStyle(2, 0xffffff);

        // Create text
        this.text = scene.add.text(0, 0, '', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 20 } // Leave some padding
        });
        this.text.setOrigin(0.5, 0.5);

        // Add elements to container
        this.container.add([this.background, this.text]);

        this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Start hidden
        this.hide();
    }

    public displayMessage(message: string, duration: number = 3000): void {
        this.text.setText(message);
        this.show();

        // Clear any existing auto-hide timer
        if (this.autoHideTimer) {
            this.autoHideTimer.remove();
        }

        // Set new auto-hide timer if duration is provided
        if (duration > 0) {
            this.autoHideTimer = this.scene.time.delayedCall(duration, () => {
                this.hide();
            });
        }
    }

    public showInteractionPrompt(interactable: any, promptText: string = "Press SPACE to interact"): void {
        this.currentInteractable = interactable;

        if (this.currentInteractable && this.currentInteractable.pauseMovement) {
            this.currentInteractable.pauseMovement();
        }

        this.displayMessage(promptText, 0); // Show indefinitely until interaction or moved away
    }

    public hideInteractionPrompt(): void {
        if (this.currentInteractable && this.currentInteractable.resumeMovement) {
            this.currentInteractable.resumeMovement();
        }

        this.currentInteractable = null;
        this.hide();
    }

    public handleInteraction(): void {
        if (this.currentInteractable && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            // Check if the interactable has an onInteract method
            if (this.currentInteractable.onInteract) {
                this.currentInteractable.onInteract();
            }

            // Check if the interactable has a message to display
            if (this.currentInteractable.getInteractionMessage) {
                const message = this.currentInteractable.getInteractionMessage();
                this.displayMessage(message, 3000);
            }

            // Keep the NPC paused during the interaction message display
            // It will resume when the player walks away or after the message timer
        }
    }

    public update(): void {
        // Handle interactions if there's a current interactable
        if (this.currentInteractable) {
            this.handleInteraction();
        }
    }

    public show(): void {
        this.container.setVisible(true);
        this.isVisible = true;
    }

    public hide(): void {
        this.container.setVisible(false);
        this.isVisible = false;
        
        // Resume NPC movement when hiding
        if (this.currentInteractable && this.currentInteractable.resumeMovement) {
            this.currentInteractable.resumeMovement();
        }
        
        // Clear any existing timer
        if (this.autoHideTimer) {
            this.autoHideTimer.remove();
            this.autoHideTimer = undefined;
        }
    }

    public clear(): void {
        this.text.setText('');
        this.hide();

        this.currentInteractable = null;
    }

    public setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    public setSize(width: number, height: number): void {
        this.background.setSize(width, height);
        this.text.setWordWrapWidth(width - 20);
    }

    public setStyle(style: Phaser.Types.GameObjects.Text.TextStyle): void {
        this.text.setStyle(style);
    }

    public setBackgroundColor(color: number, alpha: number = 0.8): void {
        this.background.setFillStyle(color, alpha);
    }

    public setBorderColor(color: number, width: number = 2): void {
        this.background.setStrokeStyle(width, color);
    }

    public getCurrentInteractable(): any {
        return this.currentInteractable;
    }

    public getIsVisible(): boolean {
        return this.isVisible;
    }

    public destroy(): void {
        if (this.autoHideTimer) {
            this.autoHideTimer.remove();
        }
        this.container.destroy();
    }
}