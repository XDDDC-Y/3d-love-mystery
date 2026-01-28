// 游戏主逻辑 - 异界信标
class LoveMysteryGame {
    constructor() {
        // 游戏状态
        this.gameState = {
            currentScene: 'loading',
            collectedItems: [],
            sanity: 100,
            photosFound: 0,
            totalPhotos: 7,
            puzzlesSolved: 0,
            playerName: '洵',
            girlfriendName: '豫',
            meetingDate: '4/20',
            togetherDate: '6/20',
            gameStarted: false,
            currentNote: ''
        };
        
        // Three.js相关
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        // 游戏对象
        this.interactiveObjects = [];
        this.currentInteraction = null;
        
        // 恐怖效果
        this.sanityEffects = {
            glitchIntensity: 0,
            distortion: 0,
            noise: 0
        };
        
        // 音频
        this.audioManager = null;
        
        // 初始化
        this.init();
    }
    
    async init() {
        // 加载必要资源
        await this.loadResources();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 检查本地保存
        this.checkSavedGame();
        
        // 显示标题屏幕
        this.showTitleScreen();
    }
    
    async loadResources() {
        // 显示加载进度
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        const updateProgress = (progress) => {
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        };
        
        // 模拟加载过程
        for (let i = 0; i <= 100; i += 10) {
            updateProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 加载Three.js库
        if (!THREE) {
            console.error('Three.js库加载失败');
            return;
        }
        
        // 初始化音频管理器
        this.audioManager = new AudioManager();
        await this.audioManager.init();
        
        // 加载照片管理器
        this.photoManager = new PhotoManager();
        
        // 加载解密系统
        this.puzzleSystem = new PuzzleSystem();
        
        console.log('资源加载完成');
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标控制
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 窗口调整
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 全屏切换
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
        });
    }
    
    checkSavedGame() {
        const saved = localStorage.getItem('loveMysterySave');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                if (saveData.gameStarted) {
                    document.getElementById('continueBtn').disabled = false;
                    this.gameState = { ...this.gameState, ...saveData };
                }
            } catch (e) {
                console.error('加载存档失败:', e);
            }
        }
    }
    
    showTitleScreen() {
        // 隐藏其他屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示标题屏幕
        document.getElementById('titleScreen').classList.add('active');
        
        // 播放标题音乐
        this.audioManager.playAmbient('title');
    }
    
    startNewGame() {
        // 重置游戏状态
        this.gameState = {
            ...this.gameState,
            collectedItems: [],
            sanity: 100,
            photosFound: 0,
            puzzlesSolved: 0,
            gameStarted: true,
            currentNote: ''
        };
        
        // 保存新游戏状态
        this.saveGame();
        
        // 开始游戏
        this.startGame();
    }
    
    loadGame() {
        // 直接从保存的状态继续
        this.startGame();
    }
    
    async startGame() {
        // 切换到游戏容器
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('gameContainer').classList.add('active');
        
        // 初始化Three.js场景
        await this.initThreeJS();
        
        // 加载第一幕场景
        await this.loadScene('scene1');
        
        // 开始游戏循环
        this.gameLoop();
        
        // 播放游戏音乐
        this.audioManager.playAmbient('scene1');
    }
    
    async initThreeJS() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a14, 10, 50);
        
        // 创建相机（第一人称）
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 1.6, 0);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 添加后期处理效果（恐怖风格）
        this.setupPostProcessing();
        
        // 添加光源
        this.setupLighting();
        
        // 添加第一人称控制器
        this.setupControls();
        
        // 添加初始几何体（测试用）
        this.createTestEnvironment();
    }
    
    setupPostProcessing() {
        // 这里可以添加各种恐怖风格的后期效果
        // 如：噪点、色差、暗角、扫描线等
        
        // 暂时使用基础渲染，后续可以扩展
        this.composer = null;
    }
    
    setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x202030, 0.5);
        this.scene.add(ambientLight);
        
        // 方向光（模拟月光）
        const directionalLight = new THREE.DirectionalLight(0x8a8aff, 0.3);
        directionalLight.position.set(0, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 添加一些点光源（诡异的灯光效果）
        this.createEerieLights();
    }
    
    createEerieLights() {
        // 创建几个诡异的点光源
        const lightPositions = [
            { x: 5, y: 2, z: 3, color: 0xff6b8b, intensity: 0.8 },
            { x: -5, y: 1, z: -3, color: 0x8aff80, intensity: 0.5 },
            { x: 0, y: 3, z: 8, color: 0x9d8aff, intensity: 0.7 }
        ];
        
        lightPositions.forEach(pos => {
            const light = new THREE.PointLight(pos.color, pos.intensity, 15);
            light.position.set(pos.x, pos.y, pos.z);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            
            // 添加脉动效果
            this.addLightPulsation(light);
            
            this.scene.add(light);
        });
    }
    
    addLightPulsation(light) {
        // 创建脉动动画
        const pulse = () => {
            const time = Date.now() * 0.001;
            const intensity = 0.3 + Math.sin(time * 2) * 0.2;
            light.intensity = light.userData.baseIntensity * intensity;
            requestAnimationFrame(pulse);
        };
        
        light.userData.baseIntensity = light.intensity;
        pulse();
    }
    
    setupControls() {
        // 第一人称控制器
        this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = 2.0;
        this.controls.lookSpeed = 0.1;
        this.controls.lookVertical = true;
        this.controls.constrainVertical = true;
        this.controls.verticalMin = 1.0;
        this.controls.verticalMax = 2.0;
        
        // 锁定鼠标指针
        this.lockPointer();
    }
    
    lockPointer() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock = canvas.requestPointerLock ||
                                        canvas.mozRequestPointerLock;
            canvas.requestPointerLock();
        });
    }
    
    createTestEnvironment() {
        // 创建地面
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // 创建墙壁（简单的迷宫）
        this.createMazeWalls();
        
        // 创建一些互动物品
        this.createInteractiveObjects();
    }
    
    createMazeWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x101020,
            emissiveIntensity: 0.1
        });
        
        // 创建一些墙壁
        const wallPositions = [
            { x: 0, z: -10, width: 20, height: 5, depth: 1 },
            { x: 10, z: 0, width: 1, height: 5, depth: 20 },
            { x: -10, z: 0, width: 1, height: 5, depth: 20 },
            { x: 5, z: 5, width: 10, height: 5, depth: 1 },
            { x: -5, z: -5, width: 10, height: 5, depth: 1 }
        ];
        
        wallPositions.forEach(pos => {
            const wallGeometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(pos.x, pos.height / 2, pos.z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
    }
    
    createInteractiveObjects() {
        // 创建日记本
        const diary = this.createObject({
            type: 'book',
            position: { x: 3, y: 1, z: -3 },
            interaction: () => this.showDiary(),
            hint: '一本泛黄的日记本'
        });
        this.scene.add(diary.mesh);
        this.interactiveObjects.push(diary);
        
        // 创建照片相框
        const photoFrame = this.createObject({
            type: 'photo',
            position: { x: -3, y: 1.5, z: 2 },
            interaction: () => this.showPhoto('meeting'),
            hint: '一个空相框，似乎在等待什么'
        });
        this.scene.add(photoFrame.mesh);
        this.interactiveObjects.push(photoFrame);
        
        // 创建谜题装置
        const puzzleDevice = this.createObject({
            type: 'device',
            position: { x: 0, y: 1, z: 5 },
            interaction: () => this.startPuzzle(),
            hint: '一个奇怪的装置，上面有数字键盘'
        });
        this.scene.add(puzzleDevice.mesh);
        this.interactiveObjects.push(puzzleDevice);
    }
    
    createObject(config) {
        let geometry, material, mesh;
        
        switch(config.type) {
            case 'book':
                geometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
                material = new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.8
                });
                break;
            case 'photo':
                geometry = new THREE.BoxGeometry(0.5, 0.4, 0.02);
                material = new THREE.MeshStandardMaterial({
                    color: 0x2a2a2a,
                    emissive: 0x111111,
                    emissiveIntensity: 0.2
                });
                break;
            case 'device':
                geometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
                material = new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    metalness: 0.8,
                    roughness: 0.2
                });
                break;
        }
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        mesh.castShadow = true;
        
        // 添加交互区域
        const interactionRadius = 1.5;
        
        return {
            mesh,
            interaction: config.interaction,
            hint: config.hint,
            position: config.position,
            radius: interactionRadius,
            type: config.type
        };
    }
    
    async loadScene(sceneName) {
        // 这里应该从JSON文件加载场景配置
        // 暂时使用硬编码的场景
        
        console.log(`加载场景: ${sceneName}`);
        
        // 清除之前的交互对象
        this.interactiveObjects.forEach(obj => {
            this.scene.remove(obj.mesh);
        });
        this.interactiveObjects = [];
        
        // 根据场景名称加载不同的内容
        switch(sceneName) {
            case 'scene1':
                this.loadScene1();
                break;
            case 'scene2':
                this.loadScene2();
                break;
            case 'scene3':
                this.loadScene3();
                break;
        }
        
        this.gameState.currentScene = sceneName;
    }
    
    loadScene1() {
        // 第一幕：初始迷宫
        this.createMazeEnvironment();
        
        // 添加场景特定的物品
        this.addScene1Objects();
        
        // 更新环境音效
        this.audioManager.playAmbient('scene1');
    }
    
    createMazeEnvironment() {
        // 创建更复杂的迷宫环境
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x252545,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // 迷宫布局数据
        const mazeLayout = [
            "###################",
            "#........#........#",
            "#.####.#.#.#.####.#",
            "#.#......#......#.#",
            "#.#.#### # ####.#.#",
            "#.#.#      #.#.#.#",
            "#...# ## ## #...#.#",
            "###.# #    # #.###",
            "#   .# #### #.   #",
            "# # #........# # #",
            "# # ########### # #",
            "#.................#",
            "###################"
        ];
        
        const cellSize = 3;
        const wallHeight = 4;
        
        for (let z = 0; z < mazeLayout.length; z++) {
            for (let x = 0; x < mazeLayout[z].length; x++) {
                if (mazeLayout[z][x] === '#') {
                    const wall = new THREE.Mesh(
                        new THREE.BoxGeometry(cellSize, wallHeight, cellSize),
                        wallMaterial
                    );
                    wall.position.set(
                        (x - mazeLayout[z].length/2) * cellSize,
                        wallHeight/2,
                        (z - mazeLayout.length/2) * cellSize
                    );
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
            }
        }
    }
    
    addScene1Objects() {
        // 添加日记本 - 包含第一条线索
        const diary = this.createObject({
            type: 'book',
            position: { x: 0, y: 1, z: -10 },
            interaction: () => this.openDiary(),
            hint: '潦草的字迹记录着某些日期'
        });
        this.scene.add(diary.mesh);
        this.interactiveObjects.push(diary);
        
        // 添加破碎的镜子
        const mirror = this.createObject({
            type: 'mirror',
            position: { x: -15, y: 2, z: 0 },
            interaction: () => this.interactWithMirror(),
            hint: '破碎的镜子，映出扭曲的影像'
        });
        this.scene.add(mirror.mesh);
        this.interactiveObjects.push(mirror);
        
        // 添加第一个照片碎片
        const photoFragment = this.createObject({
            type: 'fragment',
            position: { x: 12, y: 1, z: 5 },
            interaction: () => this.collectPhotoFragment('meeting'),
            hint: '照片的碎片，隐约能看到两个人影'
        });
        this.scene.add(photoFragment.mesh);
        this.interactiveObjects.push(photoFragment);
    }
    
    gameLoop() {
        // 更新时间
        const delta = this.clock.getDelta();
        
        // 更新控制器
        if (this.controls) {
            this.controls.update(delta);
        }
        
        // 检查交互
        this.checkInteractions();
        
        // 更新恐怖效果
        this.updateSanityEffects();
        
        // 渲染场景
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    checkInteractions() {
        if (!this.camera || this.interactiveObjects.length === 0) return;
        
        let closestObject = null;
        let closestDistance = Infinity;
        
        // 查找最近的交互对象
        this.interactiveObjects.forEach(obj => {
            const distance = this.camera.position.distanceTo(obj.mesh.position);
            if (distance < obj.radius && distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        });
        
        // 更新交互提示
        if (closestObject && closestDistance < 2) {
            this.showInteractionHint(closestObject.hint);
            this.currentInteraction = closestObject;
        } else {
            this.hideInteractionHint();
            this.currentInteraction = null;
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
    
    updateSanityEffects() {
        // 根据理智值更新视觉效果
        const sanity = this.gameState.sanity;
        
        // 更新UI显示
        document.getElementById('sanityFill').style.width = `${sanity}%`;
        document.getElementById('sanityValue').textContent = `${Math.round(sanity)}%`;
        
        // 低理智值效果
        if (sanity < 30) {
            this.applyLowSanityEffects();
        }
        
        // 缓慢恢复理智
        if (sanity < 100) {
            this.gameState.sanity = Math.min(100, sanity + 0.01);
        }
    }
    
    applyLowSanityEffects() {
        // 添加屏幕扭曲、噪点等效果
        // 这里可以扩展为更复杂的后期处理
        const intensity = (30 - this.gameState.sanity) / 30;
        
        // 简单实现：随机抖动
        if (Math.random() < intensity * 0.1) {
            this.camera.position.x += (Math.random() - 0.5) * 0.1 * intensity;
            this.camera.position.y += (Math.random() - 0.5) * 0.05 * intensity;
        }
        
        // 播放恐怖音效
        if (Math.random() < 0.01) {
            this.audioManager.playSound('whisper');
        }
    }
    
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'e':
                if (this.currentInteraction) {
                    this.currentInteraction.interaction();
                    e.preventDefault();
                }
                break;
            case 'escape':
                this.togglePauseMenu();
                e.preventDefault();
                break;
            case 'i':
                this.toggleInventory();
                e.preventDefault();
                break;
            case 'n':
                this.toggleNoteSystem();
                e.preventDefault();
                break;
        }
    }
    
    handleKeyUp(e) {
        // 处理按键释放
    }
    
    handleMouseDown(e) {
        // 处理鼠标点击
        if (e.button === 0 && this.currentInteraction) { // 左键点击
            this.currentInteraction.interaction();
        }
    }
    
    handleMouseUp(e) {
        // 处理鼠标释放
    }
    
    handleMouseMove(e) {
        // 处理鼠标移动
    }
    
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`全屏模式错误: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    // 交互功能实现
    openDiary() {
        const diaryContent = `
            <div class="note-entry">
                <div class="note-date">[日期异常] 4.20 - 时空锚点1</div>
                <p>今天在咖啡厅遇到了一个特别的她。</p>
                <p>她坐在窗边，阳光透过玻璃在她的发梢跳舞。</p>
                <p>我鼓足勇气走过去，说了第一句话...</p>
                <p class="clue">线索：记住这个数字 - <strong>420</strong></p>
            </div>
            <div class="note-entry">
                <div class="note-date">[日期异常] 6.20 - 时空锚点2</div>
                <p>两个月后的今天，我们在一起了。</p>
                <p>她笑着说早就知道我会表白。</p>
                <p>天空下着小雨，我们在伞下接吻。</p>
                <p class="clue">线索：另一个重要数字 - <strong>620</strong></p>
            </div>
        `;
        
        this.showNoteSystem(diaryContent, '洵的日记');
    }
    
    collectPhotoFragment(fragmentId) {
        if (!this.gameState.collectedItems.includes(fragmentId)) {
            this.gameState.collectedItems.push(fragmentId);
            this.gameState.photosFound++;
            
            // 显示收集提示
            this.showMessage(`收集到记忆碎片: ${this.getFragmentName(fragmentId)}`);
            
            // 播放收集音效
            this.audioManager.playSound('collect');
            
            // 更新物品栏
            this.updateInventory();
            
            // 移除场景中的物体
            const objectIndex = this.interactiveObjects.findIndex(
                obj => obj.type === 'fragment' && obj.interaction.toString().includes(fragmentId)
            );
            if (objectIndex !== -1) {
                this.scene.remove(this.interactiveObjects[objectIndex].mesh);
                this.interactiveObjects.splice(objectIndex, 1);
            }
            
            // 如果收集完所有碎片，触发事件
            if (this.gameState.photosFound >= this.gameState.totalPhotos) {
                this.allPhotosCollected();
            }
            
            // 保存游戏
            this.saveGame();
        }
    }
    
    getFragmentName(fragmentId) {
        const names = {
            'meeting': '初次相遇',
            'dating': '第一次约会',
            'anniversary': '周年纪念',
            'travel': '一起旅行',
            'surprise': '惊喜时刻',
            'ordinary': '平凡日常',
            'future': '未来憧憬'
        };
        return names[fragmentId] || '未知记忆';
    }
    
    showPhoto(photoId) {
        // 这里应该显示真实的照片
        // 暂时使用占位符
        
        const photoInfo = {
            'meeting': {
                url: 'assets/photos/meeting.jpg',
                caption: '4.20 - 咖啡厅的初遇，阳光正好'
            },
            'dating': {
                url: 'assets/photos/dating.jpg',
                caption: '第一次正式约会，紧张到说不出话'
            }
        };
        
        const info = photoInfo[photoId] || {
            url: 'assets/photos/placeholder.jpg',
            caption: '记忆尚未解锁...'
        };
        
        // 显示照片查看器
        const viewer = document.getElementById('photoViewer');
        const img = document.getElementById('viewedPhoto');
        const caption = document.getElementById('photoCaption');
        
        img.src = info.url;
        img.onerror = () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5ZDhhZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lsI/lvLrlgZrniYc8L3RleHQ+PC9zdmc+';
        };
        caption.textContent = info.caption;
        
        viewer.classList.remove('hidden');
        
        // 降低理智值（看照片会触发记忆冲击）
        this.reduceSanity(5);
    }
    
    startPuzzle() {
        // 数字谜题：输入纪念日
        const answer = prompt(`输入一个日期数字（提示：两个重要的日子）\n格式：三位或四位数字`);
        
        if (answer === '420' || answer === '620') {
            // 谜题解对
            this.showMessage('记忆碎片重新组合...时空异常缓解');
            this.gameState.puzzlesSolved++;
            this.audioManager.playSound('puzzle_solved');
            
            // 奖励：恢复理智
            this.gameState.sanity = Math.min(100, this.gameState.sanity + 20);
            
            // 如果解开了所有谜题...
            if (this.gameState.puzzlesSolved >= 3) {
                this.allPuzzlesSolved();
            }
        } else {
            // 谜题解错
            this.showMessage('记忆混乱...理智受到冲击');
            this.reduceSanity(15);
            this.audioManager.playSound('error');
        }
    }
    
    reduceSanity(amount) {
        this.gameState.sanity = Math.max(0, this.gameState.sanity - amount);
        
        // 如果理智归零...
        if (this.gameState.sanity <= 0) {
            this.sanityBroken();
        }
    }
    
    sanityBroken() {
        // 理智破碎的效果
        this.showMessage('认知崩坏...现实开始扭曲');
        
        // 播放恐怖的音效
        this.audioManager.playSound('sanity_broken');
        
        // 触发特殊事件
        setTimeout(() => {
            // 强制切换到特殊场景
            this.loadScene('nightmare');
            
            // 显示隐藏的信息
            this.showHiddenMessage();
        }, 2000);
    }
    
    showHiddenMessage() {
        // 在屏幕上显示隐藏的信息
        const message = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                       background: rgba(0,0,0,0.9); padding: 40px; border: 3px solid #ff6b8b;
                       border-radius: 15px; text-align: center; z-index: 10000; max-width: 600px;">
                <h2 style="color: #ff6b8b; margin-bottom: 20px;">致 豫：</h2>
                <p style="font-size: 1.2em; line-height: 1.6; margin-bottom: 20px;">
                    这些混乱的谜题背后，是我们真实的点点滴滴。<br>
                    每个数字、每个碎片，都是我们一起走过的证明。
                </p>
                <p style="color: #9d8aff; font-style: italic;">
                    4.20 初见，6.20 相恋<br>
                    往后每一个日子，都想和你一起度过
                </p>
                <p style="margin-top: 30px; color: #8aff80;">
                    —— 洵
                </p>
                <button onclick="this.parentElement.remove();" 
                       style="margin-top: 30px; padding: 10px 30px; background: #ff6b8b; 
                              border: none; border-radius: 5px; color: white; cursor: pointer;">
                    继续探索
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', message);
    }
    
    allPhotosCollected() {
        this.showMessage('所有记忆碎片已收集！时空裂缝正在关闭...');
        
        // 播放特殊音效
        this.audioManager.playSound('achievement');
        
        // 解锁最终场景
        setTimeout(() => {
            this.loadScene('final');
        }, 3000);
    }
    
    allPuzzlesSolved() {
        this.showMessage('所有谜题已解开！隐藏的真相即将显现...');
        
        // 显示最终的告白
        this.showFinalConfession();
    }
    
    showFinalConfession() {
        const confession = `
            <div class="note-entry" style="border-color: #ff6b8b;">
                <div class="note-date">[最终记录] 时空坐标已稳定</div>
                <p>豫，如果你能看到这里，说明你已经解开了我设下的所有谜题。</p>
                <p>这个看似诡异恐怖的空间，其实是我为你准备的特别礼物。</p>
                <p>每个谜题背后，都是我们共同经历的真实瞬间：</p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>4.20 - 我们在咖啡厅的初次相遇</li>
                    <li>6.20 - 雨中伞下的第一次牵手</li>
                    <li>那些照片，记录着我们笑容的每个角度</li>
                </ul>
                <p>我选择这种方式，因为我们的爱情就像一场奇妙的冒险——</p>
                <p>有谜题等待解开，有惊喜突然出现，有困难需要克服。</p>
                <p style="color: #ff6b8b; font-weight: bold; margin-top: 20px;">
                    而最重要的是，无论过程多么曲折，<br>
                    我们最终都会找到彼此，确认彼此的心意。
                </p>
                <p style="text-align: right; margin-top: 30px; color: #9d8aff;">
                    永远爱你的 洵<br>
                    <span style="font-size: 0.9em;">于构建这个异界信标之时</span>
                </p>
            </div>
        `;
        
        this.showNoteSystem(confession, '时空真相');
        
        // 解锁成就
        this.unlockAchievement('时空解密者');
    }
    
    unlockAchievement(name) {
        this.showMessage(`成就解锁: ${name}`);
        // 这里可以添加成就系统
    }
    
    // UI控制方法
    showMessage(text, type = 'info') {
        // 创建临时消息显示
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(20, 20, 40, 0.9);
            color: #e0e0e0;
            padding: 15px 25px;
            border-radius: 10px;
            border: 1px solid #9d8aff;
            z-index: 10000;
            font-size: 1.1em;
            text-align: center;
            max-width: 80%;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        `;
        
        if (type === 'error') {
            message.style.borderColor = '#ff6b8b';
            message.style.color = '#ff6b8b';
        } else if (type === 'success') {
            message.style.borderColor = '#8aff80';
            message.style.color = '#8aff80';
        }
        
        document.body.appendChild(message);
        
        // 3秒后自动消失
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }
    
    showNoteSystem(content, title = '观测记录') {
        const noteContent = document.getElementById('noteContent');
        const noteHeader = document.querySelector('.note-header h3');
        
        noteHeader.textContent = title;
        noteContent.innerHTML = content;
        
        document.getElementById('noteSystem').classList.remove('hidden');
    }
    
    closeNoteSystem() {
        document.getElementById('noteSystem').classList.add('hidden');
    }
    
    toggleNoteSystem() {
        const noteSystem = document.getElementById('noteSystem');
        if (noteSystem.classList.contains('hidden')) {
            // 显示当前的笔记
            this.showNoteSystem(this.getCurrentNotes());
        } else {
            this.closeNoteSystem();
        }
    }
    
    getCurrentNotes() {
        if (this.gameState.currentNote) {
            return `
                <div class="note-entry">
                    <div class="note-date">玩家记录</div>
                    <p>${this.gameState.currentNote}</p>
                </div>
            `;
        } else {
            return '<p style="text-align: center; color: #666;">暂无记录</p>';
        }
    }
    
    savePlayerNote() {
        const textarea = document.getElementById('playerNote');
        this.gameState.currentNote = textarea.value;
        textarea.value = '';
        
        this.showMessage('记录已保存', 'success');
        this.saveGame();
    }
    
    toggleInventory() {
        const inventory = document.getElementById('inventory');
        inventory.classList.toggle('hidden');
        
        if (!inventory.classList.contains('hidden')) {
            this.updateInventory();
        }
    }
    
    updateInventory() {
        const itemsContainer = document.querySelector('.inventory-items');
        itemsContainer.innerHTML = '';
        
        this.gameState.collectedItems.forEach(itemId => {
            const item = document.createElement('div');
            item.className = 'inventory-item';
            item.innerHTML = `
                <div style="font-size: 2em;">📸</div>
                <div class="item-name">${this.getFragmentName(itemId)}</div>
            `;
            item.onclick = () => this.showPhoto(itemId);
            itemsContainer.appendChild(item);
        });
    }
    
    closePhotoViewer() {
        document.getElementById('photoViewer').classList.add('hidden');
    }
    
    togglePauseMenu() {
        const pauseMenu = document.getElementById('pauseMenu');
        const isPaused = !pauseMenu.classList.contains('hidden');
        
        if (isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    pauseGame() {
        document.getElementById('pauseMenu').classList.remove('hidden');
        if (this.controls) this.controls.enabled = false;
        this.audioManager.pauseAll();
    }
    
    resumeGame() {
        document.getElementById('pauseMenu').classList.add('hidden');
        if (this.controls) this.controls.enabled = true;
        this.audioManager.resumeAll();
    }
    
    showSettings() {
        this.showMessage('设置功能开发中...');
        // 这里可以添加图形设置、音频设置等
    }
    
    showHints() {
        const hints = [
            '提示：注意场景中的异常物体，它们可能隐藏着线索',
            '提示：数字420和620对洵和豫有特殊意义',
            '提示：保持理智，某些真相只有清醒时才能看清',
            '提示：收集所有照片碎片可以解锁最终结局',
            '提示：按E键与可交互物体互动，按I键查看物品栏'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        this.showMessage(randomHint, 'success');
    }
    
    quitToTitle() {
        if (confirm('确定要返回标题吗？未保存的进度可能会丢失。')) {
            this.resumeGame();
            this.showTitleScreen();
        }
    }
    
    showArchives() {
        // 显示记忆档案（收集的照片和成就）
        let archiveContent = '<h3 style="color: #9d8aff; margin-bottom: 20px;">记忆档案</h3>';
        
        if (this.gameState.photosFound > 0) {
            archiveContent += `
                <div style="margin-bottom: 30px;">
                    <h4>已收集照片 (${this.gameState.photosFound}/${this.gameState.totalPhotos})</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
            `;
            
            const allPhotos = ['meeting', 'dating', 'anniversary', 'travel', 'surprise', 'ordinary', 'future'];
            allPhotos.forEach(photoId => {
                const collected = this.gameState.collectedItems.includes(photoId);
                archiveContent += `
                    <div style="background: ${collected ? 'rgba(157, 138, 255, 0.2)' : 'rgba(100, 100, 100, 0.2)'}; 
                                padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 2em;">${collected ? '📸' : '❓'}</div>
                        <div style="margin-top: 5px; font-size: 0.9em;">${this.getFragmentName(photoId)}</div>
                    </div>
                `;
            });
            
            archiveContent += '</div></div>';
        } else {
            archiveContent += '<p style="text-align: center; color: #666;">尚未收集任何记忆碎片</p>';
        }
        
        this.showNoteSystem(archiveContent, '记忆档案');
    }
    
    // 游戏状态保存
    saveGame() {
        const saveData = {
            ...this.gameState,
            saveTime: new Date().toISOString()
        };
        
        localStorage.setItem('loveMysterySave', JSON.stringify(saveData));
    }
    
    // 其他场景加载方法（简化版）
    loadScene2() {
        console.log('加载第二幕场景...');
        // 第二幕场景实现
    }
    
    loadScene3() {
        console.log('加载第三幕场景...');
        // 第三幕场景实现
    }
    
    loadScene(sceneName) {
        console.log(`加载场景: ${sceneName}`);
        // 场景加载逻辑
    }
    
    interactWithMirror() {
        this.showMessage('镜中的影像开始扭曲...那不是你自己的脸');
        this.reduceSanity(10);
        this.audioManager.playSound('mirror');
    }
}

// 音频管理器类
class AudioManager {
    constructor() {
        this.sounds = {};
        this.currentAmbient = null;
        this.muted = false;
        this.volume = 0.7;
        
        // 音频文件映射
        this.audioFiles = {
            ambient: {
                'title': 'assets/audio/ambient_title.mp3',
                'scene1': 'assets/audio/ambient_scene1.mp3',
                'scene2': 'assets/audio/ambient_scene2.mp3'
            },
            sfx: {
                'collect': 'assets/audio/sfx_collect.mp3',
                'puzzle_solved': 'assets/audio/sfx_puzzle.mp3',
                'error': 'assets/audio/sfx_error.mp3',
                'whisper': 'assets/audio/sfx_whisper.mp3',
                'mirror': 'assets/audio/sfx_mirror.mp3',
                'sanity_broken': 'assets/audio/sfx_sanity.mp3',
                'achievement': 'assets/audio/sfx_achievement.mp3'
            }
        };
    }
    
    async init() {
        // 初始化音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 预加载音频（简化版，实际应该加载真实文件）
        console.log('音频系统初始化完成（使用Web Audio API）');
        
        // 设置音量控制
        this.setupVolumeControl();
        
        return Promise.resolve();
    }
    
    setupVolumeControl() {
        const volumeSlider = document.getElementById('volumeSlider');
        const muteBtn = document.getElementById('muteBtn');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                this.updateVolume();
            });
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }
    }
    
    playAmbient(name) {
        // 停止当前环境音
        if (this.currentAmbient) {
            this.stopAmbient();
        }
        
        console.log(`播放环境音: ${name}`);
        
        // 这里应该加载并播放真实音频文件
        // 暂时使用控制台日志代替
        
        this.currentAmbient = name;
    }
    
    stopAmbient() {
        console.log('停止环境音');
        this.currentAmbient = null;
    }
    
    playSound(name) {
        if (this.muted) return;
        
        console.log(`播放音效: ${name}`);
        
        // 这里应该播放真实音效
        // 可以使用Web Audio API创建简单音效
        
        this.createTone(name);
    }
    
    createTone(type) {
        // 创建简单的合成音效
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 根据类型设置不同音效
        switch(type) {
            case 'collect':
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(1046.50, this.audioContext.currentTime + 0.2); // C6
                gainNode.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
                
            case 'error':
                oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
                oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.3); // A2
                gainNode.gain.setValueAtTime(0.4 * this.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;
        }
    }
    
    pauseAll() {
        // 暂停所有音频
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }
    
    resumeAll() {
        // 恢复音频
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.innerHTML = this.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        }
        
        if (this.muted) {
            this.pauseAll();
        } else {
            this.resumeAll();
        }
    }
    
    updateVolume() {
        // 更新所有音频音量
        console.log(`音量更新: ${this.volume}`);
    }
}

// 照片管理器类
class PhotoManager {
    constructor() {
        this.photos = {};
    }
    
    async loadPhotos() {
        // 加载所有照片
        const photoList = [
            { id: 'meeting', path: 'assets/photos/meeting.jpg', caption: '初次相遇 - 4.20' },
            { id: 'dating', path: 'assets/photos/dating.jpg', caption: '第一次约会' },
            { id: 'anniversary', path: 'assets/photos/anniversary.jpg', caption: '周年纪念' },
            { id: 'travel', path: 'assets/photos/travel.jpg', caption: '一起旅行' },
            { id: 'surprise', path: 'assets/photos/surprise.jpg', caption: '惊喜时刻' },
            { id: 'ordinary', path: 'assets/photos/ordinary.jpg', caption: '平凡日常' },
            { id: 'future', path: 'assets/photos/future.jpg', caption: '未来憧憬' }
        ];
        
        // 这里应该异步加载图片
        // 暂时只存储路径
        
        photoList.forEach(photo => {
            this.photos[photo.id] = {
                path: photo.path,
                caption: photo.caption,
                loaded: false
            };
        });
        
        return Promise.resolve();
    }
    
    getPhoto(id) {
        return this.photos[id] || null;
    }
}

// 解密系统类
class PuzzleSystem {
    constructor() {
        this.puzzles = {
            '数字谜题': {
                description: '输入对我们有特殊意义的数字',
                hints: ['想想我们相遇的日子', '还有我们在一起的日子'],
                solution: ['420', '620'],
                solved: false
            },
            '照片排序': {
                description: '按照时间顺序排列我们的照片',
                hints: ['从相遇开始，到最近的回忆'],
                solution: ['meeting', 'dating', 'anniversary', 'travel', 'surprise', 'ordinary', 'future'],
                solved: false
            },
            '记忆迷宫': {
                description: '在迷宫中找到正确的路径',
                hints: ['注意墙上的标记', '某些路径会循环'],
                solution: '特定的路径序列',
                solved: false
            }
        };
    }
    
    checkPuzzle(puzzleId, answer) {
        const puzzle = this.puzzles[puzzleId];
        if (!puzzle) return false;
        
        if (Array.isArray(puzzle.solution)) {
            return puzzle.solution.includes(answer.toString());
        }
        
        return answer === puzzle.solution;
    }
}

// 工具函数
function toggleMute() {
    if (window.game && window.game.audioManager) {
        window.game.audioManager.toggleMute();
    }
}

// 全局访问
let game;

// 页面加载完成后启动游戏
window.addEventListener('DOMContentLoaded', () => {
    game = new LoveMysteryGame();
    window.game = game; // 全局访问
    
    // 添加全局函数供HTML按钮调用
    window.startNewGame = () => game.startNewGame();
    window.loadGame = () => game.loadGame();
    window.showArchives = () => game.showArchives();
    window.showSettings = () => game.showSettings();
    window.resumeGame = () => game.resumeGame();
    window.showHints = () => game.showHints();
    window.quitToTitle = () => game.quitToTitle();
    window.closePhotoViewer = () => game.closePhotoViewer();
    window.closeNoteSystem = () => game.closeNoteSystem();
    window.savePlayerNote = () => game.savePlayerNote();
    window.toggleMute = toggleMute;
});