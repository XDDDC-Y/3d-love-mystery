// JS/game-entry.js
// 游戏入口文件 - 初始化所有模块

console.log('🎮 游戏入口开始加载...');

// ========== 第一部分：加载Three.js库 ==========

// 1. 导入Three.js核心库
import * as THREE from '../libs/three.module.js';

// 2. 导入必要的Three.js模块
import { GLTFLoader } from '../libs/GLTFLoader.js';
import { FirstPersonControls } from '../libs/FirstPersonControls.js';
import { OrbitControls } from '../libs/OrbitControls.js';

// 3. 检查是否加载成功
if (!THREE) {
    console.error('❌ Three.js库加载失败！');
    throw new Error('Three.js库加载失败');
}

console.log('✅ Three.js核心库加载成功');

// 4. 将THREE暴露到全局window对象
window.THREE = THREE;

// 5. 将其他模块也暴露到全局
window.GLTFLoader = GLTFLoader;
window.FirstPersonControls = FirstPersonControls;
window.OrbitControls = OrbitControls;

// ========== 第二部分：加载游戏模块 ==========

// 注意：这里我们动态导入，避免循环依赖
console.log('🔄 开始加载游戏模块...');

async function loadGameModules() {
    try {
        // 1. 导入工具类
        const { AudioManager } = await import('./AudioManager.js');
        const { SceneManager } = await import('./SceneManager.js');
        const { InteractionSystem } = await import('./InteractionSystem.js');
        const { InventorySystem } = await import('./InventorySystem.js');
        const { ParticleSystem } = await import('./ParticleSystem.js');
        const { PhotoManager } = await import('./PhotoManager.js');
        const { PuzzleSystem } = await import('./PuzzleSystem.js');
        const { SaveSystem } = await import('./SaveSystem.js');
        const { ShaderEffects } = await import('./ShaderEffects.js');
        const { UIManager } = await import('./UIManager.js');
        const { GameUtils } = await import('./utils.js');

        // 2. 暴露工具类到全局
        window.AudioManager = AudioManager;
        window.SceneManager = SceneManager;
        window.InteractionSystem = InteractionSystem;
        window.InventorySystem = InventorySystem;
        window.ParticleSystem = ParticleSystem;
        window.PhotoManager = PhotoManager;
        window.PuzzleSystem = PuzzleSystem;
        window.SaveSystem = SaveSystem;
        window.ShaderEffects = ShaderEffects;
        window.UIManager = UIManager;
        window.GameUtils = GameUtils;
        window.utils = GameUtils; // 别名

        console.log('✅ 所有游戏模块加载成功');

        // 3. 导入主游戏类
        const { LoveMysteryGame } = await import('./main.js');
        
        // 4. 创建游戏实例
        const game = new LoveMysteryGame();
        window.game = game;
        
        console.log('🎯 游戏实例创建成功');

        // 5. 设置全局函数
        setupGlobalFunctions(game);

        // 6. 显示加载完成
        showLoadingComplete();

    } catch (error) {
        console.error('❌ 加载游戏模块失败:', error);
        showError(error);
    }
}

// ========== 第三部分：全局函数设置 ==========

function setupGlobalFunctions(game) {
    // 定义全局函数供HTML按钮调用
    window.startNewGame = () => {
        console.log('🚀 开始新游戏');
        if (game && game.startNewGame) {
            game.startNewGame();
        } else {
            console.error('游戏实例未正确初始化');
            showError(new Error('游戏实例未初始化'));
        }
    };

    window.loadGame = () => {
        console.log('📂 加载游戏');
        if (game && game.loadGame) {
            game.loadGame();
        }
    };

    window.showArchives = () => {
        console.log('📸 显示档案');
        if (game && game.showArchives) {
            game.showArchives();
        }
    };

    window.showSettings = () => {
        console.log('⚙️ 显示设置');
        if (game && game.showSettings) {
            game.showSettings();
        }
    };

    window.showHints = () => {
        console.log('💡 显示提示');
        if (game && game.showHints) {
            game.showHints();
        }
    };

    window.toggleMute = () => {
        console.log('🔇 切换静音');
        if (game && game.audioManager) {
            game.audioManager.toggleMute();
        }
    };

    // 其他可能需要全局访问的函数
    window.resumeGame = () => {
        if (game && game.resumeGame) {
            game.resumeGame();
        }
    };

    window.quitToTitle = () => {
        if (game && game.quitToTitle) {
            game.quitToTitle();
        }
    };

    window.closePhotoViewer = () => {
        if (game && game.closePhotoViewer) {
            game.closePhotoViewer();
        }
    };

    window.closeNoteSystem = () => {
        if (game && game.closeNoteSystem) {
            game.closeNoteSystem();
        }
    };

    console.log('✅ 全局函数设置完成');
}

// ========== 第四部分：UI反馈函数 ==========

function showLoadingComplete() {
    console.log('✨ 所有资源加载完成！');
    
    // 启用继续游戏按钮
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.disabled = false;
    }
    
    // 如果有加载屏幕，可以在这里隐藏
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.remove('active');
        }, 500);
    }
}

function showError(error) {
    console.error('显示错误给用户:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 50, 50, 0.95);
        color: white;
        padding: 30px;
        border-radius: 10px;
        z-index: 10000;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        border: 2px solid #ff6b8b;
    `;
    
    errorDiv.innerHTML = `
        <h2 style="color: white; margin-bottom: 20px;">
            <i class="fas fa-exclamation-triangle"></i> 游戏加载错误
        </h2>
        <p style="margin-bottom: 15px; font-size: 1.1em;">
            游戏初始化失败，请检查：
        </p>
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 20px; font-family: monospace;">
            ${error.message || '未知错误'}
        </div>
        <p style="margin-bottom: 20px; color: #ffcc00;">
            请按F12打开开发者工具查看详细错误信息
        </p>
        <div>
            <button onclick="location.reload()" style="
                padding: 10px 25px;
                background: #ff6b8b;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1.1em;
                margin-right: 10px;
            ">
                <i class="fas fa-redo"></i> 重新加载
            </button>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 10px 25px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1.1em;
            ">
                关闭
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

// ========== 第五部分：启动加载 ==========

// 设置加载进度指示器
function updateLoadingProgress(progress, message) {
    console.log(`📊 ${message} (${progress}%)`);
    
    const loadingText = document.getElementById('loadingText');
    const loadingFill = document.getElementById('loadingFill');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    if (loadingFill) {
        loadingFill.style.width = `${progress}%`;
    }
}

// 主加载流程
async function initializeGame() {
    try {
        updateLoadingProgress(10, '初始化Three.js引擎...');
        
        // 等待Three.js加载
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateLoadingProgress(30, '加载游戏模块...');
        
        // 加载游戏模块
        await loadGameModules();
        
        updateLoadingProgress(80, '初始化游戏系统...');
        
        // 等待游戏完全初始化
        await new Promise(resolve => setTimeout(resolve, 300));
        
        updateLoadingProgress(100, '准备就绪！');
        
        console.log('🎉 游戏初始化流程完成！');
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        showError(error);
    }
}

// 页面加载完成后开始初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM加载完成，开始游戏初始化');
    
    // 显示加载屏幕
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('active');
    }
    
    // 开始初始化游戏
    setTimeout(() => {
        initializeGame();
    }, 100);
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ 页面被隐藏');
        if (window.game && window.game.pauseGame) {
            window.game.pauseGame();
        }
    } else {
        console.log('▶️ 页面恢复显示');
        if (window.game && window.game.resumeGame) {
            window.game.resumeGame();
        }
    }
});

// 导出一些辅助函数（如果需要）
export { initializeGame, showError };