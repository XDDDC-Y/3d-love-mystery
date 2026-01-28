class UIManager {
    constructor(game) {
        this.game = game;
        this.uiElements = new Map();
        this.currentScreen = 'title';
        this.notifications = [];
        this.tooltips = [];
        
        // UI状态
        this.uiState = {
            isPaused: false,
            showHUD: true,
            showCrosshair: true,
            showSubtitles: true,
            showTutorial: true,
            uiScale: 1.0,
            colorTheme: 'dark',
            fontStyle: 'default'
        };
        
        this.init();
    }

    init() {
        // 创建UI容器
        this.createUIContainer();
        
        // 创建HUD元素
        this.createHUD();
        
        // 创建菜单系统
        this.createMenus();
        
        // 创建对话框系统
        this.createDialogs();
        
        // 创建通知系统
        this.createNotificationSystem();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        console.log('UI管理器初始化完成');
    }

    // ========== UI容器创建 ==========

    createUIContainer() {
        // 创建主UI容器
        const uiContainer = document.createElement('div');
        uiContainer.id = 'ui-container';
        uiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Cinzel', 'Cormorant Garamond', serif;
        `;
        document.body.appendChild(uiContainer);
        
        this.uiContainer = uiContainer;
    }

    // ========== HUD创建 ==========

    createHUD() {
        const hud = document.createElement('div');
        hud.id = 'game-hud';
        hud.className = 'hud-screen';
        hud.innerHTML = `
            <!-- 左上角：状态信息 -->
            <div class="hud-section hud-status">
                <div class="status-bar sanity-bar">
                    <div class="status-label">理智</div>
                    <div class="status-meter">
                        <div class="meter-fill" id="sanityMeter"></div>
                        <div class="meter-text" id="sanityText">100%</div>
                    </div>
                </div>
                <div class="status-bar memory-bar">
                    <div class="status-label">记忆</div>
                    <div class="status-meter">
                        <div class="meter-fill" id="memoryMeter"></div>
                        <div class="meter-text" id="memoryText">0/7</div>
                    </div>
                </div>
                <div class="status-bar progress-bar">
                    <div class="status-label">进度</div>
                    <div class="status-meter">
                        <div class="meter-fill" id="progressMeter"></div>
                        <div class="meter-text" id="progressText">0%</div>
                    </div>
                </div>
            </div>
            
            <!-- 中央：准星和交互提示 -->
            <div class="hud-section hud-center">
                <div class="crosshair" id="crosshair">
                    <div class="crosshair-dot"></div>
                    <div class="crosshair-line top"></div>
                    <div class="crosshair-line bottom"></div>
                    <div class="crosshair-line left"></div>
                    <div class="crosshair-line right"></div>
                </div>
                <div class="interaction-hint" id="interactionHint">
                    <div class="hint-key">[E]</div>
                    <div class="hint-text" id="hintText">与物体交互</div>
                </div>
                <div class="location-display" id="locationDisplay">
                    <i class="fas fa-map-marker-alt"></i>
                    <span id="locationText">初始迷宫</span>
                </div>
            </div>
            
            <!-- 右下角：快捷提示 -->
            <div class="hud-section hud-hints">
                <div class="hint-item" id="hintInventory">
                    <span class="hint-key">[I]</span>
                    <span class="hint-action">物品栏</span>
                </div>
                <div class="hint-item" id="hintNotes">
                    <span class="hint-key">[N]</span>
                    <span class="hint-action">笔记</span>
                </div>
                <div class="hint-item" id="hintPause">
                    <span class="hint-key">[ESC]</span>
                    <span class="hint-action">暂停</span>
                </div>
                <div class="hint-item" id="hintFullscreen">
                    <span class="hint-key">[F11]</span>
                    <span class="hint-action">全屏</span>
                </div>
            </div>
            
            <!-- 底部：对话和字幕 -->
            <div class="hud-section hud-bottom">
                <div class="dialog-box" id="dialogBox">
                    <div class="dialog-speaker" id="dialogSpeaker"></div>
                    <div class="dialog-text" id="dialogText"></div>
                    <div class="dialog-continue">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="subtitle-box" id="subtitleBox">
                    <div class="subtitle-text" id="subtitleText"></div>
                </div>
            </div>
            
            <!-- 顶部：任务提示 -->
            <div class="hud-section hud-top">
                <div class="objective-box" id="objectiveBox">
                    <div class="objective-title">当前目标</div>
                    <div class="objective-text" id="objectiveText">探索迷宫，寻找线索</div>
                </div>
                <div class="notification-ticker" id="notificationTicker"></div>
            </div>
        `;
        
        this.uiContainer.appendChild(hud);
    }

    // ========== 菜单系统 ==========

    createMenus() {
        const menus = document.createElement('div');
        menus.id = 'ui-menus';
        menus.innerHTML = `
            <!-- 暂停菜单 -->
            <div id="pauseMenu" class="screen hidden">
                <div class="menu-container">
                    <div class="menu-header">
                        <h1><i class="fas fa-pause"></i> 游戏暂停</h1>
                        <div class="menu-subtitle">记忆回廊 - 探索中</div>
                    </div>
                    
                    <div class="menu-content">
                        <button class="menu-btn" onclick="game.resumeGame()">
                            <i class="fas fa-play"></i> 继续游戏
                        </button>
                        <button class="menu-btn" onclick="game.saveGameMenu()">
                            <i class="fas fa-save"></i> 保存游戏
                        </button>
                        <button class="menu-btn" onclick="game.loadGameMenu()">
                            <i class="fas fa-folder-open"></i> 读取游戏
                        </button>
                        <button class="menu-btn" onclick="game.showSettings()">
                            <i class="fas fa-cog"></i> 设置
                        </button>
                        <button class="menu-btn" onclick="game.showHints()">
                            <i class="fas fa-question-circle"></i> 游戏提示
                        </button>
                        <button class="menu-btn" onclick="game.showArchives()">
                            <i class="fas fa-images"></i> 记忆档案
                        </button>
                        <button class="menu-btn btn-warning" onclick="game.quitToTitle()">
                            <i class="fas fa-sign-out-alt"></i> 返回标题
                        </button>
                    </div>
                    
                    <div class="menu-footer">
                        <div class="game-info">
                            <div>当前场景: <span id="currentSceneInfo">初始迷宫</span></div>
                            <div>游戏时间: <span id="playTimeInfo">00:00</span></div>
                            <div>理智值: <span id="sanityInfo">100%</span></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 保存/加载菜单 -->
            <div id="saveLoadMenu" class="screen hidden">
                <div class="menu-container">
                    <div class="menu-header">
                        <h1><i class="fas fa-save"></i> 游戏存档</h1>
                        <button class="close-btn" onclick="game.closeSaveLoadMenu()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="save-slots" id="saveSlots">
                        <!-- 动态生成保存槽位 -->
                    </div>
                    
                    <div class="menu-controls">
                        <button class="btn-secondary" onclick="game.createNewSave()">
                            <i class="fas fa-plus"></i> 新建存档
                        </button>
                        <button class="btn-secondary" onclick="game.exportSave()">
                            <i class="fas fa-download"></i> 导出存档
                        </button>
                        <button class="btn-secondary" onclick="game.importSave()">
                            <i class="fas fa-upload"></i> 导入存档
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 设置菜单 -->
            <div id="settingsMenu" class="screen hidden">
                <div class="menu-container">
                    <div class="menu-header">
                        <h1><i class="fas fa-cog"></i> 游戏设置</h1>
                        <button class="close-btn" onclick="game.closeSettings()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="audio">音频</button>
                        <button class="tab-btn" data-tab="video">视频</button>
                        <button class="tab-btn" data-tab="gameplay">游戏</button>
                        <button class="tab-btn" data-tab="controls">控制</button>
                    </div>
                    
                    <div class="settings-content">
                        <!-- 音频设置 -->
                        <div class="tab-content active" id="audioTab">
                            <div class="setting-item">
                                <label>主音量</label>
                                <input type="range" id="masterVolume" min="0" max="100" value="70">
                                <span id="volumeValue">70%</span>
                            </div>
                            <div class="setting-item">
                                <label>音乐音量</label>
                                <input type="range" id="musicVolume" min="0" max="100" value="70">
                                <span id="musicValue">70%</span>
                            </div>
                            <div class="setting-item">
                                <label>音效音量</label>
                                <input type="range" id="sfxVolume" min="0" max="100" value="70">
                                <span id="sfxValue">70%</span>
                            </div>
                            <div class="setting-item">
                                <button class="btn-toggle" id="muteBtn">
                                    <i class="fas fa-volume-up"></i> 静音
                                </button>
                            </div>
                        </div>
                        
                        <!-- 视频设置 -->
                        <div class="tab-content" id="videoTab">
                            <div class="setting-item">
                                <label>分辨率</label>
                                <select id="resolutionSelect">
                                    <option value="1920x1080">1920x1080</option>
                                    <option value="1600x900">1600x900</option>
                                    <option value="1366x768">1366x768</option>
                                    <option value="1280x720">1280x720</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label>画质预设</label>
                                <select id="qualitySelect">
                                    <option value="high">高</option>
                                    <option value="medium" selected>中</option>
                                    <option value="low">低</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="fullscreenToggle" checked>
                                    <span>全屏模式</span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="vsyncToggle" checked>
                                    <span>垂直同步</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- 游戏设置 -->
                        <div class="tab-content" id="gameplayTab">
                            <div class="setting-item">
                                <label>字幕</label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="subtitlesToggle" checked>
                                    <span>显示字幕</span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <label>UI透明度</label>
                                <input type="range" id="uiAlpha" min="20" max="100" value="80">
                                <span id="uiAlphaValue">80%</span>
                            </div>
                            <div class="setting-item">
                                <label>色盲模式</label>
                                <select id="colorblindSelect">
                                    <option value="none">无</option>
                                    <option value="protanopia">红色盲</option>
                                    <option value="deuteranopia">绿色盲</option>
                                    <option value="tritanopia">蓝色盲</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 控制设置 -->
                        <div class="tab-content" id="controlsTab">
                            <div class="setting-item">
                                <label>鼠标灵敏度</label>
                                <input type="range" id="mouseSensitivity" min="1" max="20" value="10">
                                <span id="sensitivityValue">10</span>
                            </div>
                            <div class="setting-item">
                                <label>移动速度</label>
                                <input type="range" id="moveSpeed" min="1" max="5" step="0.5" value="2">
                                <span id="speedValue">2.0</span>
                            </div>
                            <div class="setting-item">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="invertYToggle">
                                    <span>反转Y轴</span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <button class="btn-secondary" onclick="game.resetControls()">
                                    恢复默认控制
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <button class="btn-primary" onclick="game.applySettings()">
                            应用设置
                        </button>
                        <button class="btn-secondary" onclick="game.closeSettings()">
                            取消
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.uiContainer.appendChild(menus);
    }

    // ========== 对话框系统 ==========

    createDialogs() {
        const dialogs = document.createElement('div');
        dialogs.id = 'ui-dialogs';
        dialogs.innerHTML = `
            <!-- 确认对话框 -->
            <div id="confirmDialog" class="dialog hidden">
                <div class="dialog-content">
                    <div class="dialog-title" id="confirmTitle">确认</div>
                    <div class="dialog-message" id="confirmMessage"></div>
                    <div class="dialog-buttons">
                        <button class="btn-secondary" id="confirmCancel">取消</button>
                        <button class="btn-primary" id="confirmOK">确定</button>
                    </div>
                </div>
            </div>
            
            <!-- 消息对话框 -->
            <div id="messageDialog" class="dialog hidden">
                <div class="dialog-content">
                    <div class="dialog-title" id="messageTitle">消息</div>
                    <div class="dialog-message" id="messageMessage"></div>
                    <div class="dialog-buttons">
                        <button class="btn-primary" id="messageOK">确定</button>
                    </div>
                </div>
            </div>
            
            <!-- 输入对话框 -->
            <div id="inputDialog" class="dialog hidden">
                <div class="dialog-content">
                    <div class="dialog-title" id="inputTitle">输入</div>
                    <div class="dialog-message" id="inputMessage"></div>
                    <input type="text" class="dialog-input" id="inputField">
                    <div class="dialog-buttons">
                        <button class="btn-secondary" id="inputCancel">取消</button>
                        <button class="btn-primary" id="inputOK">确定</button>
                    </div>
                </div>
            </div>
            
            <!-- 选择对话框 -->
            <div id="choiceDialog" class="dialog hidden">
                <div class="dialog-content">
                    <div class="dialog-title" id="choiceTitle">选择</div>
                    <div class="dialog-message" id="choiceMessage"></div>
                    <div class="dialog-choices" id="choiceOptions">
                        <!-- 动态生成选项 -->
                    </div>
                    <div class="dialog-buttons">
                        <button class="btn-secondary" id="choiceCancel">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        this.uiContainer.appendChild(dialogs);
    }

    // ========== 通知系统 ==========

    createNotificationSystem() {
        const notifications = document.createElement('div');
        notifications.id = 'ui-notifications';
        this.uiContainer.appendChild(notifications);
    }

    // ========== 事件监听器 ==========

    setupEventListeners() {
        // 窗口调整大小
        window.addEventListener('resize', () => this.onResize());
        
        // 全屏变化
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        
        // 设置选项卡
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSettingsTab(e.target.dataset.tab));
        });
        
        // 音量控制
        const volumeSlider = document.getElementById('masterVolume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                document.getElementById('volumeValue').textContent = `${e.target.value}%`;
            });
        }
    }

    // ========== HUD更新方法 ==========

    updateHUD(gameState) {
        if (!gameState) return;
        
        // 更新理智值
        const sanity = gameState.sanity || 100;
        const sanityMeter = document.getElementById('sanityMeter');
        const sanityText = document.getElementById('sanityText');
        
        if (sanityMeter) {
            sanityMeter.style.width = `${sanity}%`;
            sanityMeter.style.backgroundColor = this.getSanityColor(sanity);
        }
        if (sanityText) {
            sanityText.textContent = `${Math.round(sanity)}%`;
        }
        
        // 更新记忆收集
        const photosFound = gameState.photosFound || 0;
        const totalPhotos = gameState.totalPhotos || 7;
        const memoryMeter = document.getElementById('memoryMeter');
        const memoryText = document.getElementById('memoryText');
        
        if (memoryMeter) {
            const percent = (photosFound / totalPhotos) * 100;
            memoryMeter.style.width = `${percent}%`;
        }
        if (memoryText) {
            memoryText.textContent = `${photosFound}/${totalPhotos}`;
        }
        
        // 更新进度
        const progress = gameState.progress || 0;
        const progressMeter = document.getElementById('progressMeter');
        const progressText = document.getElementById('progressText');
        
        if (progressMeter) {
            progressMeter.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        // 更新位置显示
        const locationText = document.getElementById('locationText');
        if (locationText && gameState.currentScene) {
            locationText.textContent = this.getSceneName(gameState.currentScene);
        }
        
        // 更新目标显示
        const objectiveText = document.getElementById('objectiveText');
        if (objectiveText) {
            objectiveText.textContent = this.getCurrentObjective(gameState);
        }
    }

    getSanityColor(sanity) {
        if (sanity >= 70) return '#8aff80'; // 绿色
        if (sanity >= 40) return '#ffd700'; // 黄色
        if (sanity >= 20) return '#ff8c00'; // 橙色
        return '#ff6b8b'; // 红色
    }

    getSceneName(sceneId) {
        const scenes = {
            scene1: '初始迷宫',
            scene2: '记忆回廊',
            scene3: '真相之间',
            nightmare: '噩梦空间',
            final: '最终房间'
        };
        return scenes[sceneId] || sceneId;
    }

    getCurrentObjective(gameState) {
        if (gameState.photosFound < gameState.totalPhotos) {
            return `收集记忆碎片 (${gameState.photosFound}/${gameState.totalPhotos})`;
        }
        if (gameState.puzzlesSolved < 5) {
            return `解决谜题 (${gameState.puzzlesSolved}/5)`;
        }
        return '探索真相';
    }

    // ========== 交互提示 ==========

    showInteractionHint(text, key = 'E') {
        const hintElement = document.getElementById('interactionHint');
        const hintText = document.getElementById('hintText');
        const hintKey = hintElement.querySelector('.hint-key');
        
        if (hintElement && hintText && hintKey) {
            hintText.textContent = text;
            hintKey.textContent = `[${key}]`;
            hintElement.classList.add('visible');
        }
    }

    hideInteractionHint() {
        const hintElement = document.getElementById('interactionHint');
        if (hintElement) {
            hintElement.classList.remove('visible');
        }
    }

    // ========== 对话系统 ==========

    showDialog(speaker, text, options = {}) {
        const dialogBox = document.getElementById('dialogBox');
        const speakerEl = document.getElementById('dialogSpeaker');
        const textEl = document.getElementById('dialogText');
        
        if (!dialogBox || !speakerEl || !textEl) return;
        
        // 设置对话内容
        speakerEl.textContent = speaker ? `${speaker}:` : '';
        textEl.textContent = text;
        
        // 显示对话框
        dialogBox.classList.add('active');
        
        // 设置回调函数
        if (options.onComplete) {
            dialogBox.onclick = () => {
                this.hideDialog();
                options.onComplete();
            };
        }
        
        // 自动隐藏（如果设置了持续时间）
        if (options.duration) {
            setTimeout(() => this.hideDialog(), options.duration);
        }
    }

    hideDialog() {
        const dialogBox = document.getElementById('dialogBox');
        if (dialogBox) {
            dialogBox.classList.remove('active');
        }
    }

    // ========== 字幕系统 ==========

    showSubtitle(text, duration = 3000) {
        const subtitleBox = document.getElementById('subtitleBox');
        const subtitleText = document.getElementById('subtitleText');
        
        if (!subtitleBox || !subtitleText) return;
        
        subtitleText.textContent = text;
        subtitleBox.classList.add('active');
        
        // 自动隐藏
        setTimeout(() => {
            subtitleBox.classList.remove('active');
        }, duration);
    }

    // ========== 通知系统 ==========

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.getElementById('ui-notifications').appendChild(notification);
        
        // 添加显示动画
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 自动移除（如果设置了持续时间）
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
        
        // 添加到通知列表
        this.notifications.push({
            element: notification,
            timestamp: Date.now(),
            type: type,
            message: message
        });
        
        // 限制通知数量
        if (this.notifications.length > 5) {
            const oldNotification = this.notifications.shift();
            if (oldNotification.element.parentNode) {
                oldNotification.element.remove();
            }
        }
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle',
            hint: 'lightbulb'
        };
        return icons[type] || 'info-circle';
    }

    // ========== 工具提示 ==========

    showTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        // 添加到body并定位
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        let top, left;
        
        switch(position) {
            case 'top':
                top = rect.top - tooltip.offsetHeight - 10;
                left = rect.left + (rect.width - tooltip.offsetWidth) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width - tooltip.offsetWidth) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltip.offsetHeight) / 2;
                left = rect.left - tooltip.offsetWidth - 10;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltip.offsetHeight) / 2;
                left = rect.right + 10;
                break;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        // 添加到工具提示列表
        this.tooltips.push({
            element: tooltip,
            target: element
        });
        
        return tooltip;
    }

    hideAllTooltips() {
        this.tooltips.forEach(tooltip => {
            if (tooltip.element.parentNode) {
                tooltip.element.remove();
            }
        });
        this.tooltips = [];
    }

    // ========== 菜单控制 ==========

    showScreen(screenId) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // 显示指定屏幕
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }

    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('hidden');
        }
    }

    toggleScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            if (screen.classList.contains('hidden')) {
                this.showScreen(screenId);
            } else {
                this.hideScreen(screenId);
            }
        }
    }

    // ========== 设置控制 ==========

    switchSettingsTab(tabId) {
        // 更新选项卡按钮
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // 更新选项卡内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }

    // ========== 对话框控制 ==========

    showConfirm(message, title = '确认', options = {}) {
        return new Promise((resolve) => {
            const dialog = document.getElementById('confirmDialog');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOK');
            const cancelBtn = document.getElementById('confirmCancel');
            
            if (!dialog || !titleEl || !messageEl || !okBtn || !cancelBtn) {
                resolve(false);
                return;
            }
            
            // 设置内容
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 设置按钮文本
            if (options.okText) okBtn.textContent = options.okText;
            if (options.cancelText) cancelBtn.textContent = options.cancelText;
            
            // 设置按钮回调
            const handleResult = (result) => {
                dialog.classList.add('hidden');
                resolve(result);
                
                // 清理事件监听器
                okBtn.onclick = null;
                cancelBtn.onclick = null;
            };
            
            okBtn.onclick = () => handleResult(true);
            cancelBtn.onclick = () => handleResult(false);
            
            // 显示对话框
            dialog.classList.remove('hidden');
        });
    }

    showMessage(message, title = '消息') {
        return new Promise((resolve) => {
            const dialog = document.getElementById('messageDialog');
            const titleEl = document.getElementById('messageTitle');
            const messageEl = document.getElementById('messageMessage');
            const okBtn = document.getElementById('messageOK');
            
            if (!dialog || !titleEl || !messageEl || !okBtn) {
                resolve();
                return;
            }
            
            // 设置内容
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 设置按钮回调
            const handleClose = () => {
                dialog.classList.add('hidden');
                resolve();
                okBtn.onclick = null;
            };
            
            okBtn.onclick = handleClose;
            
            // 显示对话框
            dialog.classList.remove('hidden');
        });
    }

    showInput(message, title = '输入', defaultValue = '') {
        return new Promise((resolve) => {
            const dialog = document.getElementById('inputDialog');
            const titleEl = document.getElementById('inputTitle');
            const messageEl = document.getElementById('inputMessage');
            const inputField = document.getElementById('inputField');
            const okBtn = document.getElementById('inputOK');
            const cancelBtn = document.getElementById('inputCancel');
            
            if (!dialog || !titleEl || !messageEl || !inputField || !okBtn || !cancelBtn) {
                resolve(null);
                return;
            }
            
            // 设置内容
            titleEl.textContent = title;
            messageEl.textContent = message;
            inputField.value = defaultValue;
            
            // 设置按钮回调
            const handleResult = (result) => {
                dialog.classList.add('hidden');
                resolve(result);
                
                // 清理事件监听器
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                inputField.onkeydown = null;
            };
            
            const handleOK = () => handleResult(inputField.value);
            const handleCancel = () => handleResult(null);
            
            okBtn.onclick = handleOK;
            cancelBtn.onclick = handleCancel;
            
            inputField.onkeydown = (e) => {
                if (e.key === 'Enter') handleOK();
                if (e.key === 'Escape') handleCancel();
            };
            
            // 显示对话框并聚焦输入框
            dialog.classList.remove('hidden');
            inputField.focus();
            inputField.select();
        });
    }

    showChoices(message, choices, title = '选择') {
        return new Promise((resolve) => {
            const dialog = document.getElementById('choiceDialog');
            const titleEl = document.getElementById('choiceTitle');
            const messageEl = document.getElementById('choiceMessage');
            const optionsEl = document.getElementById('choiceOptions');
            const cancelBtn = document.getElementById('choiceCancel');
            
            if (!dialog || !titleEl || !messageEl || !optionsEl || !cancelBtn) {
                resolve(null);
                return;
            }
            
            // 设置内容
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 生成选项按钮
            optionsEl.innerHTML = '';
            choices.forEach((choice, index) => {
                const button = document.createElement('button');
                button.className = 'choice-btn';
                button.textContent = choice.text || `选项 ${index + 1}`;
                button.onclick = () => {
                    dialog.classList.add('hidden');
                    resolve(choice.value || index);
                };
                optionsEl.appendChild(button);
            });
            
            // 设置取消按钮回调
            const handleCancel = () => {
                dialog.classList.add('hidden');
                resolve(null);
                cancelBtn.onclick = null;
            };
            
            cancelBtn.onclick = handleCancel;
            
            // 显示对话框
            dialog.classList.remove('hidden');
        });
    }

    // ========== 事件处理 ==========

    onResize() {
        // 更新UI布局
        this.updateUILayout();
    }

    onFullscreenChange() {
        const isFullscreen = !!document.fullscreenElement;
        this.uiState.isFullscreen = isFullscreen;
        
        // 更新全屏按钮状态
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        if (fullscreenBtn) {
            fullscreenBtn.checked = isFullscreen;
        }
    }

    updateUILayout() {
        // 根据窗口大小调整UI布局
        const width = window.innerWidth;
        const isMobile = width < 768;
        
        // 调整UI比例
        const scale = isMobile ? 0.8 : 1.0;
        this.uiContainer.style.fontSize = `${scale * 100}%`;
        
        // 调整HUD布局
        this.adjustHUDLayout(isMobile);
    }

    adjustHUDLayout(isMobile) {
        const hud = document.getElementById('game-hud');
        if (!hud) return;
        
        if (isMobile) {
            hud.classList.add('mobile');
            // 隐藏一些非必要的HUD元素
            document.querySelectorAll('.hint-item').forEach(item => {
                if (!item.id.includes('hintInventory') && !item.id.includes('hintPause')) {
                    item.style.display = 'none';
                }
            });
        } else {
            hud.classList.remove('mobile');
            document.querySelectorAll('.hint-item').forEach(item => {
                item.style.display = '';
            });
        }
    }

    // ========== 清理 ==========

    cleanup() {
        // 清理所有UI元素
        if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
        }
        
        // 清理通知和工具提示
        this.hideAllTooltips();
        this.notifications.forEach(notification => {
            if (notification.element.parentNode) {
                notification.element.remove();
            }
        });
        
        this.notifications = [];
        this.tooltips = [];
    }
}

if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}

export { UIManager };