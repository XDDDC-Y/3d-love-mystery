class SaveSystem {
    constructor(game) {
        this.game = game;
        this.saveSlots = 5;
        this.currentSaveSlot = 0;
        this.autoSaveInterval = 300000; // 5分钟自动保存
        this.autoSaveTimer = null;
        
        // 保存数据版本
        this.VERSION = '1.0.0';
        
        // 初始化保存系统
        this.init();
    }

    init() {
        // 创建保存数据目录结构
        this.saveData = {
            version: this.VERSION,
            game: 'LoveMystery',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            slots: Array(this.saveSlots).fill(null).map((_, i) => ({
                slot: i,
                exists: false,
                data: null,
                timestamp: null,
                playTime: 0,
                scene: 'scene1',
                preview: {}
            })),
            settings: {
                volume: 0.7,
                muted: false,
                resolution: '1920x1080',
                fullscreen: false,
                language: 'zh-CN',
                subtitles: true
            },
            statistics: {
                totalPlayTime: 0,
                deaths: 0,
                puzzlesSolved: 0,
                photosFound: 0,
                itemsCollected: 0,
                sanityLowest: 100,
                endingsUnlocked: 0
            },
            achievements: []
        };
        
        // 尝试加载现有保存数据
        this.loadFromLocalStorage();
        
        // 设置自动保存
        this.setupAutoSave();
        
        console.log('保存系统初始化完成');
    }

    setupAutoSave() {
        // 开始自动保存计时器
        this.autoSaveTimer = setInterval(() => {
            if (this.game.gameState?.gameStarted && !this.game.gameState?.isPaused) {
                this.autoSave();
            }
        }, this.autoSaveInterval);
    }

    // ========== 保存方法 ==========

    save(slotIndex = this.currentSaveSlot, description = '手动保存') {
        if (!this.game.gameState?.gameStarted) {
            console.warn('游戏未开始，无法保存');
            return false;
        }

        try {
            const saveData = this.createSaveData(slotIndex, description);
            this.saveData.slots[slotIndex] = saveData;
            this.saveData.lastModified = new Date().toISOString();
            
            // 更新统计数据
            this.updateStatistics();
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 显示保存成功消息
            this.showSaveNotification('游戏已保存', 'success');
            
            console.log(`游戏已保存到槽位 ${slotIndex + 1}`);
            return true;
        } catch (error) {
            console.error('保存游戏时出错:', error);
            this.showSaveNotification('保存失败', 'error');
            return false;
        }
    }

    autoSave() {
        if (!this.game.gameState?.gameStarted) return;
        
        try {
            const saveData = this.createSaveData(this.currentSaveSlot, '自动保存');
            this.saveData.slots[this.currentSaveSlot] = saveData;
            this.saveData.lastModified = new Date().toISOString();
            
            // 只保存到localStorage，不显示通知
            localStorage.setItem('loveMysterySaves', JSON.stringify(this.saveData));
            
            console.log('自动保存完成');
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }

    createSaveData(slotIndex, description) {
        const gameState = this.game.gameState;
        const now = new Date();
        
        // 计算游戏时间
        const playTime = gameState.totalPlayTime || 0;
        const currentSessionTime = (now - (gameState.sessionStartTime || now)) / 1000;
        const totalPlayTime = playTime + currentSessionTime;
        
        // 创建缩略图预览（使用Canvas生成）
        const preview = this.createSavePreview();
        
        return {
            slot: slotIndex,
            exists: true,
            description: description,
            timestamp: now.toISOString(),
            playTime: totalPlayTime,
            scene: gameState.currentScene || 'scene1',
            preview: preview,
            
            // 游戏状态数据
            data: {
                version: this.VERSION,
                gameState: {
                    ...gameState,
                    totalPlayTime: totalPlayTime,
                    sessionStartTime: now.getTime()
                },
                
                // 各个系统的状态
                inventory: this.game.inventorySystem?.save?.(),
                photos: this.game.photoManager?.saveState?.(),
                puzzles: this.game.puzzleSystem?.saveState?.(),
                
                // 玩家数据
                player: {
                    position: this.game.camera?.position?.toArray?.() || [0, 1.6, 0],
                    rotation: this.game.camera?.rotation?.toArray?.() || [0, 0, 0],
                    sanity: gameState.sanity || 100,
                    health: 100
                },
                
                // 世界状态
                world: {
                    currentScene: gameState.currentScene,
                    time: gameState.gameTime || 0,
                    weather: 'normal',
                    discoveredAreas: gameState.discoveredAreas || []
                },
                
                // 任务进度
                quests: {
                    main: gameState.puzzlesSolved || 0,
                    side: 0,
                    completed: []
                },
                
                // 收集品
                collectibles: {
                    photosFound: gameState.photosFound || 0,
                    totalPhotos: gameState.totalPhotos || 7,
                    itemsCollected: gameState.collectedItems?.length || 0
                },
                
                // 元数据
                metadata: {
                    saveVersion: this.VERSION,
                    gameVersion: '1.0.0',
                    platform: 'web',
                    created: now.toISOString()
                }
            }
        };
    }

    createSavePreview() {
        // 创建保存预览图像
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return null;
        
        // 绘制预览背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制场景预览
        const scene = this.game.gameState?.currentScene || 'scene1';
        ctx.fillStyle = this.getSceneColor(scene);
        ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 60);
        
        // 绘制游戏信息
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`场景: ${scene}`, 30, 40);
        
        ctx.fillStyle = '#9d8aff';
        ctx.font = '14px Arial';
        ctx.fillText(`理智: ${this.game.gameState?.sanity || 100}%`, 30, 65);
        ctx.fillText(`照片: ${this.game.gameState?.photosFound || 0}/7`, 30, 85);
        
        // 绘制日期时间
        const now = new Date();
        ctx.fillStyle = '#8a8aff';
        ctx.font = '12px Arial';
        ctx.fillText(now.toLocaleDateString(), canvas.width - 100, canvas.height - 20);
        
        // 转换为data URL
        return canvas.toDataURL('image/jpeg', 0.7);
    }

    getSceneColor(scene) {
        const colors = {
            scene1: '#2a2a4a',
            scene2: '#4a2a4a',
            scene3: '#2a4a4a',
            nightmare: '#4a2a2a',
            final: '#4a4a2a'
        };
        return colors[scene] || '#333333';
    }

    // ========== 加载方法 ==========

    load(slotIndex) {
        const slotData = this.saveData.slots[slotIndex];
        
        if (!slotData || !slotData.exists) {
            console.warn(`保存槽位 ${slotIndex} 为空`);
            this.showSaveNotification('没有找到保存文件', 'error');
            return false;
        }

        try {
            const saveData = slotData.data;
            
            // 检查版本兼容性
            if (!this.checkVersionCompatibility(saveData.version)) {
                console.warn('保存文件版本不兼容');
                this.showSaveNotification('保存文件版本过旧', 'error');
                return false;
            }
            
            // 加载游戏状态
            this.loadGameState(saveData.gameState);
            
            // 加载各个系统状态
            this.loadSystemStates(saveData);
            
            // 更新当前保存槽位
            this.currentSaveSlot = slotIndex;
            
            // 更新统计数据
            this.updateStatistics();
            
            // 显示加载成功消息
            this.showSaveNotification('游戏已加载', 'success');
            
            console.log(`从槽位 ${slotIndex + 1} 加载游戏`);
            return true;
        } catch (error) {
            console.error('加载游戏时出错:', error);
            this.showSaveNotification('加载失败', 'error');
            return false;
        }
    }

    loadGameState(gameState) {
        if (!gameState) return;
        
        // 恢复游戏状态
        Object.assign(this.game.gameState, gameState);
        
        // 确保必要的字段存在
        this.game.gameState.gameStarted = true;
        this.game.gameState.sessionStartTime = Date.now();
        
        // 更新UI显示
        this.updateGameUI();
    }

    loadSystemStates(saveData) {
        // 加载物品栏
        if (saveData.inventory && this.game.inventorySystem?.load) {
            this.game.inventorySystem.load(saveData.inventory);
        }
        
        // 加载照片
        if (saveData.photos && this.game.photoManager?.loadState) {
            this.game.photoManager.loadState(saveData.photos);
        }
        
        // 加载谜题
        if (saveData.puzzles && this.game.puzzleSystem?.loadState) {
            this.game.puzzleSystem.loadState(saveData.puzzles);
        }
        
        // 恢复玩家位置和旋转
        if (saveData.player && this.game.camera) {
            const pos = saveData.player.position;
            const rot = saveData.player.rotation;
            
            if (pos && pos.length === 3) {
                this.game.camera.position.set(pos[0], pos[1], pos[2]);
            }
            
            if (rot && rot.length === 3) {
                this.game.camera.rotation.set(rot[0], rot[1], rot[2]);
            }
        }
    }

    // ========== 删除方法 ==========

    deleteSave(slotIndex) {
        if (!this.saveData.slots[slotIndex]?.exists) {
            console.warn(`保存槽位 ${slotIndex} 为空，无法删除`);
            return false;
        }

        if (confirm('确定要删除这个保存文件吗？此操作无法撤销。')) {
            this.saveData.slots[slotIndex] = {
                slot: slotIndex,
                exists: false,
                data: null,
                timestamp: null,
                playTime: 0,
                scene: 'scene1',
                preview: null
            };
            
            this.saveToLocalStorage();
            console.log(`删除保存槽位 ${slotIndex}`);
            return true;
        }
        
        return false;
    }

    // ========== 存档管理 ==========

    getSaveSlots() {
        return this.saveData.slots.map((slot, index) => ({
            slot: index,
            exists: slot.exists,
            description: slot.description || '空槽位',
            timestamp: slot.timestamp,
            playTime: slot.playTime || 0,
            scene: slot.scene || 'scene1',
            preview: slot.preview,
            sanity: slot.data?.gameState?.sanity || 0,
            photosFound: slot.data?.gameState?.photosFound || 0
        }));
    }

    getLatestSave() {
        const saves = this.saveData.slots.filter(slot => slot.exists);
        if (saves.length === 0) return null;
        
        return saves.reduce((latest, current) => {
            const latestTime = new Date(latest.timestamp).getTime();
            const currentTime = new Date(current.timestamp).getTime();
            return currentTime > latestTime ? current : latest;
        });
    }

    // ========== 设置管理 ==========

    saveSettings(settings) {
        Object.assign(this.saveData.settings, settings);
        this.saveToLocalStorage();
        
        // 应用设置到游戏
        this.applySettings(settings);
        
        console.log('设置已保存');
    }

    loadSettings() {
        return { ...this.saveData.settings };
    }

    applySettings(settings) {
        // 应用音量设置
        if (settings.volume !== undefined && this.game.audioManager) {
            this.game.audioManager.setVolume(settings.volume);
        }
        
        if (settings.muted !== undefined && this.game.audioManager) {
            if (settings.muted !== this.game.audioManager.muted) {
                this.game.audioManager.toggleMute();
            }
        }
        
        // 应用分辨率设置
        if (settings.resolution && this.game.renderer) {
            const [width, height] = settings.resolution.split('x').map(Number);
            if (width && height) {
                this.game.renderer.setSize(width, height);
                this.game.camera.aspect = width / height;
                this.game.camera.updateProjectionMatrix();
            }
        }
        
        // 应用全屏设置
        if (settings.fullscreen !== undefined) {
            if (settings.fullscreen && !document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (!settings.fullscreen && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }

    // ========== 统计和成就 ==========

    updateStatistics() {
        const stats = this.saveData.statistics;
        const gameState = this.game.gameState;
        
        if (!gameState) return;
        
        // 更新游戏时间
        if (gameState.totalPlayTime) {
            stats.totalPlayTime = Math.max(stats.totalPlayTime, gameState.totalPlayTime);
        }
        
        // 更新谜题解决数
        if (gameState.puzzlesSolved > stats.puzzlesSolved) {
            stats.puzzlesSolved = gameState.puzzlesSolved;
        }
        
        // 更新照片收集数
        if (gameState.photosFound > stats.photosFound) {
            stats.photosFound = gameState.photosFound;
        }
        
        // 更新最低理智值
        if (gameState.sanity < stats.sanityLowest) {
            stats.sanityLowest = gameState.sanity;
        }
        
        // 更新物品收集数
        if (this.game.inventorySystem) {
            stats.itemsCollected = this.game.inventorySystem.items.size;
        }
        
        // 检查成就
        this.checkAchievements();
    }

    checkAchievements() {
        const stats = this.saveData.statistics;
        const gameState = this.game.gameState;
        const achievements = [];
        
        // 成就1: 初次游戏
        if (stats.totalPlayTime > 0 && !this.hasAchievement('first_game')) {
            achievements.push({
                id: 'first_game',
                name: '旅程开始',
                description: '开始你的第一次游戏',
                icon: '🎮',
                unlockedAt: new Date().toISOString()
            });
        }
        
        // 成就2: 收集所有照片
        if (stats.photosFound >= 7 && !this.hasAchievement('photo_collector')) {
            achievements.push({
                id: 'photo_collector',
                name: '记忆收集者',
                description: '收集所有记忆碎片',
                icon: '📸',
                unlockedAt: new Date().toISOString()
            });
        }
        
        // 成就3: 解决所有谜题
        if (stats.puzzlesSolved >= 5 && !this.hasAchievement('puzzle_master')) {
            achievements.push({
                id: 'puzzle_master',
                name: '解谜大师',
                description: '解决所有谜题',
                icon: '🧩',
                unlockedAt: new Date().toISOString()
            });
        }
        
        // 成就4: 保持理智
        if (stats.sanityLowest > 70 && !this.hasAchievement('sanity_keeper')) {
            achievements.push({
                id: 'sanity_keeper',
                name: '理智守护者',
                description: '全程保持理智值高于70%',
                icon: '🧠',
                unlockedAt: new Date().toISOString()
            });
        }
        
        // 添加新成就
        achievements.forEach(achievement => {
            if (!this.hasAchievement(achievement.id)) {
                this.saveData.achievements.push(achievement);
                this.unlockAchievement(achievement);
            }
        });
    }

    hasAchievement(achievementId) {
        return this.saveData.achievements.some(a => a.id === achievementId);
    }

    unlockAchievement(achievement) {
        console.log(`成就解锁: ${achievement.name}`);
        
        // 显示成就通知
        this.showAchievementNotification(achievement);
        
        // 播放音效
        if (this.game.audioManager) {
            this.game.audioManager.playSound('achievement');
        }
        
        // 保存到本地存储
        this.saveToLocalStorage();
    }

    // ========== 本地存储操作 ==========

    saveToLocalStorage() {
        try {
            const dataStr = JSON.stringify(this.saveData);
            localStorage.setItem('loveMysterySaves', dataStr);
            return true;
        } catch (error) {
            console.error('保存到本地存储失败:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const dataStr = localStorage.getItem('loveMysterySaves');
            if (!dataStr) return false;
            
            const loadedData = JSON.parse(dataStr);
            
            // 检查版本并迁移数据
            if (this.checkVersionCompatibility(loadedData.version)) {
                Object.assign(this.saveData, loadedData);
                console.log('保存数据已从本地存储加载');
                return true;
            } else {
                console.warn('保存数据版本不兼容，使用默认数据');
                return false;
            }
        } catch (error) {
            console.error('从本地存储加载失败:', error);
            return false;
        }
    }

    clearAllSaves() {
        if (confirm('确定要删除所有保存文件吗？此操作无法撤销。')) {
            localStorage.removeItem('loveMysterySaves');
            this.init(); // 重新初始化
            console.log('所有保存文件已清除');
            return true;
        }
        return false;
    }

    // ========== 工具方法 ==========

    checkVersionCompatibility(version) {
        if (!version) return false;
        
        const [major] = version.split('.').map(Number);
        const [currentMajor] = this.VERSION.split('.').map(Number);
        
        return major === currentMajor;
    }

    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}小时 ${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    // ========== UI 方法 ==========

    showSaveNotification(message, type = 'info') {
        if (this.game.showMessage) {
            this.game.showMessage(message, type);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">成就解锁!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 5秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    updateGameUI() {
        // 更新UI显示的游戏状态
        if (this.game.updateSanityEffects) {
            this.game.updateSanityEffects();
        }
        
        if (this.game.inventorySystem?.updateStats) {
            this.game.inventorySystem.updateStats();
        }
    }

    // ========== 导出/导入 ==========

    exportSave(slotIndex) {
        const slotData = this.saveData.slots[slotIndex];
        if (!slotData || !slotData.exists) return null;
        
        const exportData = {
            ...slotData.data,
            exportVersion: this.VERSION,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return url;
    }

    importSave(data, slotIndex) {
        try {
            const importData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // 检查导入数据有效性
            if (!importData.gameState || !importData.version) {
                throw new Error('无效的保存文件');
            }
            
            // 检查版本兼容性
            if (!this.checkVersionCompatibility(importData.version)) {
                throw new Error('保存文件版本不兼容');
            }
            
            // 保存到指定槽位
            this.saveData.slots[slotIndex] = {
                slot: slotIndex,
                exists: true,
                description: '导入的存档',
                timestamp: new Date().toISOString(),
                playTime: importData.gameState.totalPlayTime || 0,
                scene: importData.gameState.currentScene || 'scene1',
                preview: this.createSavePreview(),
                data: importData
            };
            
            this.saveToLocalStorage();
            console.log(`保存文件已导入到槽位 ${slotIndex}`);
            return true;
        } catch (error) {
            console.error('导入保存文件失败:', error);
            return false;
        }
    }

    // ========== 清理 ==========

    cleanup() {
        // 清理自动保存计时器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.SaveSystem = SaveSystem;
}

export { SaveSystem };