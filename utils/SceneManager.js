// SceneManager.js
class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.scenes = {};
        this.loaded = false;
    }

    async loadScene(sceneName) {
        try {
            // 加载场景配置
            const response = await fetch(`scenes/${sceneName}.json`);
            const sceneData = await response.json();
            
            // 保存场景数据
            this.scenes[sceneName] = sceneData;
            this.currentScene = sceneName;
            
            // 构建3D场景
            await this.buildScene(sceneData);
            
            // 设置环境
            this.setupSceneEnvironment(sceneData);
            
            // 加载场景特定资源
            await this.loadSceneResources(sceneData);
            
            console.log(`场景加载完成: ${sceneName}`);
            return true;
        } catch (error) {
            console.error(`加载场景失败: ${sceneName}`, error);
            return false;
        }
    }

    async buildScene(sceneData) {
        // 清空当前场景
        this.clearScene();
        
        // 设置环境光
        const ambientLight = new THREE.AmbientLight(
            sceneData.ambientLight.color,
            sceneData.ambientLight.intensity
        );
        this.game.scene.add(ambientLight);
        
        // 设置雾
        const fogColor = new THREE.Color(sceneData.fog.color);
        this.game.scene.fog = new THREE.Fog(
            fogColor,
            sceneData.fog.near,
            sceneData.fog.far
        );
        
        // 创建地面
        this.createGround(sceneData);
        
        // 创建墙壁和静态物体
        await this.createObjects(sceneData.objects);
        
        // 设置玩家起始位置
        this.setPlayerStart(sceneData.playerStart);
    }

    async createObjects(objects) {
        for (const obj of objects) {
            await this.createObject(obj);
        }
    }

    async createObject(objData) {
        let mesh;
        
        switch(objData.type) {
            case 'wall':
                mesh = await this.createWall(objData);
                break;
            case 'interactive':
                mesh = await this.createInteractiveObject(objData);
                break;
            case 'puzzle':
                mesh = await this.createPuzzleObject(objData);
                break;
            case 'collectible':
                mesh = await this.createCollectible(objData);
                break;
            // 更多类型...
        }
        
        if (mesh) {
            this.game.scene.add(mesh);
            return mesh;
        }
    }

    async createWall(wallData) {
        const geometry = new THREE.BoxGeometry(
            wallData.scale[0],
            wallData.scale[1],
            wallData.scale[2]
        );
        
        // 加载纹理
        const texture = await this.loadTexture(`assets/textures/${wallData.texture}.jpg`);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(...wallData.position);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        if (wallData.collision) {
            wall.userData.collision = true;
        }
        
        return wall;
    }

    async createInteractiveObject(objData) {
        // 加载模型或创建基础几何体
        let mesh;
        
        if (objData.model) {
            mesh = await this.loadModel(`assets/models/gltf/${objData.model}.glb`);
        } else {
            // 使用基础几何体作为占位符
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            mesh = new THREE.Mesh(geometry, material);
        }
        
        mesh.position.set(...objData.position);
        mesh.userData = {
            type: 'interactive',
            interaction: objData.interaction,
            hint: objData.hint,
            data: objData.data,
            radius: objData.radius || 2.0
        };
        
        return mesh;
    }

    async loadTexture(path) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                path,
                resolve,
                undefined,
                reject
            );
        });
    }

    async loadModel(path) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    resolve(model);
                },
                undefined,
                reject
            );
        });
    }

    clearScene() {
        // 移除所有非必要的物体
        while(this.game.scene.children.length > 0) {
            const obj = this.game.scene.children[0];
            if (obj.type !== 'PerspectiveCamera') {
                this.game.scene.remove(obj);
            }
        }
        
        // 重置交互对象列表
        this.game.interactiveObjects = [];
    }

    setupSceneEnvironment(sceneData) {
        // 设置音频
        if (sceneData.audio && this.game.audioManager) {
            this.game.audioManager.playAmbient(sceneData.audio.ambient);
            this.game.audioManager.setVolume(sceneData.audio.volume || 0.5);
        }
    }

    setPlayerStart(startData) {
        if (this.game.camera) {
            this.game.camera.position.set(...startData.position);
            this.game.camera.rotation.set(...startData.rotation);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneManager;
}

export { SceneManager };