// InteractionSystem.js
class InteractionSystem {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.interactionDistance = 5;
    }

    update() {
        if (!this.game.camera || !this.game.scene) return;
        
        // 更新射线起点为相机位置
        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        
        // 检查与交互物体的碰撞
        const intersects = this.raycaster.intersectObjects(
            this.game.scene.children.filter(obj => obj.userData.type === 'interactive')
        );
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const distance = intersects[0].distance;
            
            if (distance < this.interactionDistance) {
                this.showInteractionHint(object.userData.hint);
                this.game.currentInteraction = object;
            } else {
                this.hideInteractionHint();
                this.game.currentInteraction = null;
            }
        } else {
            this.hideInteractionHint();
            this.game.currentInteraction = null;
        }
    }

    showInteractionHint(text) {
        const hintElement = document.getElementById('interactionHint');
        const hintText = document.getElementById('hintText');
        
        hintText.textContent = text;
        hintElement.classList.remove('hidden');
    }

    hideInteractionHint() {
        document.getElementById('interactionHint').classList.add('hidden');
    }

    interact() {
        if (this.game.currentInteraction) {
            const data = this.game.currentInteraction.userData;
            const action = data.interaction;
            
            // 调用对应的交互函数
            if (typeof this.game[action] === 'function') {
                this.game[action](data.data);
            }
            
            // 播放交互音效
            if (this.game.audioManager) {
                this.game.audioManager.playSound('interact');
            }
        }
    }

    setMousePosition(x, y) {
        this.mouse.x = (x / window.innerWidth) * 2 - 1;
        this.mouse.y = -(y / window.innerHeight) * 2 + 1;
    }
}

export { InteractionSystem };