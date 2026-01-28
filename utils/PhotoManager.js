class PhotoManager {
    constructor(game) {
        this.game = game;
        this.photos = new Map();
        this.loadedPhotos = new Map();
        this.currentViewer = null;
        
        // 照片配置
        this.photoConfig = {
            meeting: {
                id: 'meeting',
                name: '初遇',
                date: '4.20',
                description: '咖啡厅窗边的阳光，在她发梢跳舞的那天',
                path: 'assets/photos/meeting.jpg',
                unlocked: false,
                clue: '第一次对话的紧张',
                location: '记忆回廊 - 起始点'
            },
            dating: {
                id: 'dating',
                name: '约会',
                date: '5.15',
                description: '第一次正式约会，紧张到说不出完整句子',
                path: 'assets/photos/dating.jpg',
                unlocked: false,
                clue: '共享的冰淇淋味道',
                location: '记忆回廊 - 东侧走廊'
            },
            anniversary: {
                id: 'anniversary',
                name: '纪念',
                date: '6.20',
                description: '在一起的那天，雨中的伞和我们',
                path: 'assets/photos/anniversary.jpg',
                unlocked: false,
                clue: '雨滴落在肩头的触感',
                location: '记忆回廊 - 中央大厅'
            },
            travel: {
                id: 'travel',
                name: '旅行',
                date: '8.10',
                description: '第一次一起旅行，迷路反而成了美好回忆',
                path: 'assets/photos/travel.jpg',
                unlocked: false,
                clue: '地图上画错的路标',
                location: '真相之间 - 西侧'
            },
            surprise: {
                id: 'surprise',
                name: '惊喜',
                date: '9.25',
                description: '你准备的生日惊喜，她惊讶的表情',
                path: 'assets/photos/surprise.jpg',
                unlocked: false,
                clue: '蛋糕上的蜡烛数量',
                location: '真相之间 - 东侧'
            },
            ordinary: {
                id: 'ordinary',
                name: '日常',
                date: '11.3',
                description: '最普通的一天，却是最珍贵的记忆',
                path: 'assets/photos/ordinary.jpg',
                unlocked: false,
                clue: '晨光中她的睡颜',
                location: '初始迷宫 - 隐藏角落'
            },
            future: {
                id: 'future',
                name: '未来',
                date: '？',
                description: '尚未发生，但已在你心中无数次描绘',
                path: 'assets/photos/future.jpg',
                unlocked: false,
                clue: '共同的梦想清单',
                location: '最终房间 - 核心'
            }
        };

        this.initUI();
    }

    async init() {
        // 初始化照片查看器
        this.createPhotoViewer();
        
        // 预加载照片（可选）
        // await this.preloadPhotos();
        
        console.log('照片管理器初始化完成');
    }

    createPhotoViewer() {
        // 创建照片查看器HTML
        const viewerHTML = `
            <div id="photoViewer" class="screen hidden">
                <div class="photo-viewer-container">
                    <div class="photo-viewer-header">
                        <h2 id="photoTitle">记忆碎片</h2>
                        <button class="close-btn" onclick="game.photoManager.closeViewer()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="photo-display-area">
                        <div class="photo-frame">
                            <img id="viewedPhoto" src="" alt="记忆照片">
                            <div class="photo-overlay">
                                <div class="photo-date" id="photoDate">日期: ?</div>
                                <div class="photo-location" id="photoLocation">位置: ?</div>
                            </div>
                        </div>
                        
                        <div class="photo-info">
                            <h3 id="photoName">未知记忆</h3>
                            <p id="photoDescription">描述加载中...</p>
                            <div class="photo-clue">
                                <h4><i class="fas fa-clue"></i> 关联线索</h4>
                                <p id="photoClue">线索尚未发现</p>
                            </div>
                            <div class="photo-metadata">
                                <div class="metadata-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>发现时间: <span id="photoFoundTime">-</span></span>
                                </div>
                                <div class="metadata-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>发现位置: <span id="photoFoundLocation">-</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="photo-controls">
                        <button class="btn-secondary" onclick="game.photoManager.previousPhoto()">
                            <i class="fas fa-chevron-left"></i> 上一张
                        </button>
                        <button class="btn-primary" onclick="game.photoManager.savePhotoNote()">
                            <i class="fas fa-save"></i> 添加笔记
                        </button>
                        <button class="btn-secondary" onclick="game.photoManager.nextPhoto()">
                            下一张 <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div class="photo-notes">
                        <h4><i class="fas fa-sticky-note"></i> 记忆笔记</h4>
                        <textarea id="photoNoteText" placeholder="记录下看到这张照片时的感受或回忆..."></textarea>
                        <div class="note-tags" id="photoTags">
                            <span class="tag" onclick="this.classList.toggle('active')">温馨</span>
                            <span class="tag" onclick="this.classList.toggle('active')">感动</span>
                            <span class="tag" onclick="this.classList.toggle('active')">怀念</span>
                            <span class="tag" onclick="this.classList.toggle('active')">期待</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        const container = document.createElement('div');
        container.innerHTML = viewerHTML;
        document.body.appendChild(container.firstElementChild);
        
        // 设置键盘控制
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isViewerOpen()) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.previousPhoto();
                    break;
                case 'ArrowRight':
                    this.nextPhoto();
                    break;
                case 'Escape':
                    this.closeViewer();
                    break;
            }
        });
    }

    async preloadPhotos() {
        // 预加载已解锁的照片
        const unlockedPhotos = Array.from(this.photos.values())
            .filter(photo => photo.unlocked);
        
        for (const photo of unlockedPhotos) {
            await this.loadPhotoImage(photo.id);
        }
    }

    async loadPhotoImage(photoId) {
        if (this.loadedPhotos.has(photoId)) {
            return this.loadedPhotos.get(photoId);
        }

        const photo = this.photos.get(photoId);
        if (!photo) return null;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedPhotos.set(photoId, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`照片加载失败: ${photo.path}`);
                // 使用占位图
                img.src = this.createPlaceholderImage(photo.name);
                this.loadedPhotos.set(photoId, img);
                resolve(img);
            };
            img.src = photo.path;
        });
    }

    createPlaceholderImage(name) {
        // 创建SVG占位图
        const svg = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#1a1a2e"/>
                <text x="400" y="300" font-family="Arial" font-size="24" fill="#9d8aff" 
                      text-anchor="middle" dominant-baseline="middle">
                    ${name} 的记忆
                </text>
                <text x="400" y="340" font-family="Arial" font-size="16" fill="#8a8aff" 
                      text-anchor="middle" dominant-baseline="middle">
                    等待载入真实的瞬间
                </text>
                <rect x="350" y="250" width="100" height="100" fill="none" 
                      stroke="#ff6b8b" stroke-width="2" stroke-dasharray="5,5"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    unlockPhoto(photoId, location = '未知位置') {
        const photo = this.photoConfig[photoId];
        if (!photo) {
            console.warn(`未知的照片ID: ${photoId}`);
            return false;
        }

        if (this.photos.has(photoId) && this.photos.get(photoId).unlocked) {
            return false; // 已经解锁
        }

        // 解锁照片
        photo.unlocked = true;
        photo.foundTime = new Date().toISOString();
        photo.foundLocation = location;
        
        this.photos.set(photoId, { ...photo });
        
        console.log(`照片解锁: ${photo.name} (${photoId})`);
        
        // 触发解锁事件
        this.onPhotoUnlocked(photoId);
        
        return true;
    }

    onPhotoUnlocked(photoId) {
        const photo = this.photos.get(photoId);
        
        // 显示解锁提示
        if (this.game.showMessage) {
            this.game.showMessage(`记忆解锁: ${photo.name}`, 'success');
        }
        
        // 播放音效
        if (this.game.audioManager) {
            this.game.audioManager.playSound('collect');
        }
        
        // 触发粒子效果
        if (this.game.particleSystem) {
            const playerPos = this.game.camera?.position || new THREE.Vector3(0, 1.6, 0);
            this.game.particleSystem.createMemoryParticles(playerPos, photoId);
        }
        
        // 更新游戏状态
        if (this.game.gameState) {
            this.game.gameState.photosFound = this.getUnlockedCount();
        }
        
        // 保存游戏
        this.game.saveGame?.();
    }

    showPhoto(photoId) {
        const photo = this.photos.get(photoId);
        if (!photo || !photo.unlocked) {
            console.warn(`照片未解锁或不存在: ${photoId}`);
            
            // 显示锁定状态
            this.showLockedPhoto(photoId);
            return;
        }

        this.currentViewer = photoId;
        const viewer = document.getElementById('photoViewer');
        
        // 更新UI
        document.getElementById('photoTitle').textContent = '记忆碎片';
        document.getElementById('photoName').textContent = photo.name;
        document.getElementById('photoDate').textContent = `日期: ${photo.date}`;
        document.getElementById('photoDescription').textContent = photo.description;
        document.getElementById('photoClue').textContent = photo.clue;
        document.getElementById('photoLocation').textContent = `位置: ${photo.location}`;
        document.getElementById('photoFoundTime').textContent = 
            new Date(photo.foundTime).toLocaleString();
        document.getElementById('photoFoundLocation').textContent = photo.foundLocation;
        
        // 加载图片
        this.loadPhotoImage(photoId).then(img => {
            document.getElementById('viewedPhoto').src = img.src;
        }).catch(() => {
            document.getElementById('viewedPhoto').src = this.createPlaceholderImage(photo.name);
        });
        
        // 显示查看器
        viewer.classList.remove('hidden');
        
        // 暂停游戏控制
        if (this.game.controls) {
            this.game.controls.enabled = false;
        }
        
        // 降低理智值（查看记忆）
        if (this.game.reduceSanity) {
            this.game.reduceSanity(2);
        }
    }

    showLockedPhoto(photoId) {
        const photo = this.photoConfig[photoId];
        if (!photo) return;

        this.currentViewer = photoId;
        const viewer = document.getElementById('photoViewer');
        
        // 更新UI显示锁定状态
        document.getElementById('photoTitle').textContent = '未解锁的记忆';
        document.getElementById('photoName').textContent = '???';
        document.getElementById('photoDate').textContent = '日期: ?';
        document.getElementById('photoDescription').textContent = '这段记忆尚未被发现...';
        document.getElementById('photoClue').textContent = '需要找到对应的记忆碎片';
        document.getElementById('photoLocation').textContent = '位置: 未知';
        
        // 显示锁定的图片
        document.getElementById('viewedPhoto').src = this.createLockedImage();
        
        // 显示查看器
        viewer.classList.remove('hidden');
        
        // 暂停游戏控制
        if (this.game.controls) {
            this.game.controls.enabled = false;
        }
    }

    createLockedImage() {
        const svg = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#0a0a14"/>
                <rect x="300" y="200" width="200" height="200" rx="10" ry="10" 
                      fill="#2a2a4a" stroke="#9d8aff" stroke-width="2"/>
                <path d="M 350 300 L 450 300 M 400 250 L 400 350" 
                      stroke="#ff6b8b" stroke-width="3" stroke-linecap="round"/>
                <circle cx="400" cy="250" r="25" fill="none" stroke="#9d8aff" stroke-width="3"/>
                <text x="400" y="450" font-family="Arial" font-size="20" fill="#8a8aff" 
                      text-anchor="middle">记忆尚未解锁</text>
                <text x="400" y="480" font-family="Arial" font-size="16" fill="#666" 
                      text-anchor="middle">继续探索以发现更多记忆</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    closeViewer() {
        document.getElementById('photoViewer').classList.add('hidden');
        this.currentViewer = null;
        
        // 恢复游戏控制
        if (this.game.controls) {
            this.game.controls.enabled = true;
        }
    }

    previousPhoto() {
        if (!this.currentViewer) return;
        
        const unlockedIds = this.getUnlockedPhotoIds();
        const currentIndex = unlockedIds.indexOf(this.currentViewer);
        
        if (currentIndex > 0) {
            this.showPhoto(unlockedIds[currentIndex - 1]);
        } else if (unlockedIds.length > 0) {
            // 循环到最后一个
            this.showPhoto(unlockedIds[unlockedIds.length - 1]);
        }
    }

    nextPhoto() {
        if (!this.currentViewer) return;
        
        const unlockedIds = this.getUnlockedPhotoIds();
        const currentIndex = unlockedIds.indexOf(this.currentViewer);
        
        if (currentIndex < unlockedIds.length - 1) {
            this.showPhoto(unlockedIds[currentIndex + 1]);
        } else if (unlockedIds.length > 0) {
            // 循环到第一个
            this.showPhoto(unlockedIds[0]);
        }
    }

    getUnlockedPhotoIds() {
        return Array.from(this.photos.values())
            .filter(photo => photo.unlocked)
            .map(photo => photo.id)
            .sort((a, b) => {
                // 按配置顺序排序
                const order = Object.keys(this.photoConfig);
                return order.indexOf(a) - order.indexOf(b);
            });
    }

    getUnlockedCount() {
        return Array.from(this.photos.values())
            .filter(photo => photo.unlocked).length;
    }

    getTotalCount() {
        return Object.keys(this.photoConfig).length;
    }

    savePhotoNote() {
        if (!this.currentViewer) return;
        
        const noteText = document.getElementById('photoNoteText').value;
        if (!noteText.trim()) return;
        
        const photo = this.photos.get(this.currentViewer);
        if (!photo) return;
        
        // 保存笔记到照片数据
        if (!photo.notes) {
            photo.notes = [];
        }
        
        const note = {
            text: noteText,
            timestamp: new Date().toISOString(),
            tags: this.getSelectedTags()
        };
        
        photo.notes.push(note);
        
        // 清空输入框
        document.getElementById('photoNoteText').value = '';
        
        // 显示保存成功
        if (this.game.showMessage) {
            this.game.showMessage('笔记已保存', 'success');
        }
        
        // 保存游戏
        this.game.saveGame?.();
    }

    getSelectedTags() {
        const tags = [];
        document.querySelectorAll('.tag.active').forEach(tag => {
            tags.push(tag.textContent);
        });
        return tags;
    }

    isViewerOpen() {
        const viewer = document.getElementById('photoViewer');
        return viewer && !viewer.classList.contains('hidden');
    }

    // 存档相关
    saveState() {
        const state = {
            photos: Array.from(this.photos.entries()),
            version: '1.0'
        };
        return state;
    }

    loadState(state) {
        if (!state || state.version !== '1.0') return;
        
        this.photos.clear();
        state.photos.forEach(([id, photoData]) => {
            this.photos.set(id, photoData);
        });
        
        console.log(`照片状态已加载: ${this.getUnlockedCount()}/${this.getTotalCount()} 已解锁`);
    }

    getPhotoGalleryHTML() {
        const unlocked = this.getUnlockedPhotoIds();
        const total = this.getTotalCount();
        
        let html = `
            <div class="gallery-header">
                <h3><i class="fas fa-images"></i> 记忆画廊</h3>
                <div class="gallery-stats">${unlocked.length}/${total} 已解锁</div>
            </div>
            <div class="gallery-grid">
        `;
        
        Object.keys(this.photoConfig).forEach(photoId => {
            const photo = this.photos.get(photoId) || this.photoConfig[photoId];
            const isUnlocked = photo.unlocked || false;
            
            html += `
                <div class="gallery-item ${isUnlocked ? 'unlocked' : 'locked'}" 
                     onclick="game.photoManager.showPhoto('${photoId}')">
                    <div class="gallery-thumbnail">
                        ${isUnlocked ? 
                            `<img src="${photo.path}" alt="${photo.name}" onerror="this.src='${this.createPlaceholderImage(photo.name)}'">` :
                            `<div class="locked-thumbnail">
                                <i class="fas fa-lock"></i>
                            </div>`
                        }
                    </div>
                    <div class="gallery-info">
                        <h4>${isUnlocked ? photo.name : '???'}</h4>
                        <p>${isUnlocked ? photo.date : '日期未知'}</p>
                        ${isUnlocked && photo.foundLocation ? 
                            `<p class="location">📍 ${photo.foundLocation}</p>` : ''
                        }
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
}

if (typeof window !== 'undefined') {
    window.PhotoManager = PhotoManager;
}

export { PhotoManager };