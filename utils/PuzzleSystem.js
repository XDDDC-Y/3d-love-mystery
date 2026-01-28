class PuzzleSystem {
    constructor(game) {
        this.game = game;
        this.puzzles = new Map();
        this.activePuzzle = null;
        this.puzzleHistory = [];
        
        // 谜题类型定义
        this.puzzleTypes = {
            number: {
                name: '数字谜题',
                description: '输入有意义的数字组合',
                validation: (input, solution) => input === solution,
                maxAttempts: 3
            },
            sequence: {
                name: '序列谜题',
                description: '按照正确顺序排列物品',
                validation: (input, solution) => JSON.stringify(input) === JSON.stringify(solution),
                maxAttempts: 5
            },
            pattern: {
                name: '图案谜题',
                description: '识别并重现特定图案',
                validation: (input, solution) => this.checkPattern(input, solution),
                maxAttempts: 4
            },
            logic: {
                name: '逻辑谜题',
                description: '解决逻辑推理问题',
                validation: (input, solution) => this.checkLogic(input, solution),
                maxAttempts: 3
            },
            memory: {
                name: '记忆谜题',
                description: '回忆并匹配相关记忆',
                validation: (input, solution) => this.checkMemory(input, solution),
                maxAttempts: 2
            }
        };
        
        // 初始化默认谜题
        this.initDefaultPuzzles();
        this.initUI();
    }

    initDefaultPuzzles() {
        // 谜题1: 数字谜题 (4.20)
        this.addPuzzle({
            id: 'puzzle_01',
            name: '时空锚点1',
            type: 'number',
            description: '输入第一次相遇的日期数字',
            hint: '咖啡厅窗边的阳光',
            solution: '420',
            scene: 'scene1',
            position: [0, 1, 5],
            reward: {
                type: 'photo_fragment',
                id: 'meeting'
            },
            attempts: 0,
            solved: false,
            data: {
                customMessage: '记忆碎片: 初遇'
            }
        });
        
        // 谜题2: 数字谜题 (6.20)
        this.addPuzzle({
            id: 'puzzle_02',
            name: '时空锚点2',
            type: 'number',
            description: '输入关系开始的日期数字',
            hint: '雨中的伞和心跳',
            solution: '620',
            scene: 'scene2',
            position: [-5, 1, -10],
            reward: {
                type: 'photo_fragment',
                id: 'anniversary'
            },
            attempts: 0,
            solved: false,
            data: {
                customMessage: '记忆碎片: 纪念'
            }
        });
        
        // 谜题3: 序列谜题
        this.addPuzzle({
            id: 'puzzle_03',
            name: '记忆序列',
            type: 'sequence',
            description: '按时间顺序排列关键事件',
            hint: '相遇 → 约会 → 旅行 → ...',
            solution: ['meeting', 'dating', 'anniversary', 'travel'],
            scene: 'scene2',
            position: [5, 1, -15],
            reward: {
                type: 'photo_fragment',
                id: 'travel'
            },
            attempts: 0,
            solved: false,
            options: ['travel', 'anniversary', 'meeting', 'dating']
        });
        
        // 谜题4: 图案谜题
        this.addPuzzle({
            id: 'puzzle_04',
            name: '符号之语',
            type: 'pattern',
            description: '重现墙上的神秘符号',
            hint: '注意符号的旋转角度',
            solution: [[1,0,1],[0,1,0],[1,0,1]], // 二进制图案
            scene: 'scene3',
            position: [0, 1, 0],
            reward: {
                type: 'photo_fragment',
                id: 'surprise'
            },
            attempts: 0,
            solved: false
        });
        
        // 谜题5: 记忆谜题 (最终谜题)
        this.addPuzzle({
            id: 'puzzle_final',
            name: '最终拼图',
            type: 'memory',
            description: '将所有的记忆碎片组合',
            hint: '每个碎片都指向同一个答案',
            solution: 'love', // 或你们的名字组合
            scene: 'scene3',
            position: [0, 1.5, 0],
            reward: {
                type: 'ending',
                id: 'true_ending'
            },
            attempts: 0,
            solved: false,
            data: {
                requiredPhotos: 7,
                specialMessage: '当所有记忆重聚...'
            }
        });
    }

    initUI() {
        // 创建谜题界面HTML
        const puzzleHTML = `
            <div id="puzzleInterface" class="screen hidden">
                <div class="puzzle-container">
                    <div class="puzzle-header">
                        <h2 id="puzzleName">谜题</h2>
                        <div class="puzzle-stats">
                            <span class="attempts">尝试: <span id="puzzleAttempts">0</span></span>
                            <button class="close-btn" onclick="game.puzzleSystem.closePuzzle()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="puzzle-content">
                        <div class="puzzle-description">
                            <p id="puzzleDescription">谜题描述</p>
                            <div class="puzzle-hint">
                                <i class="fas fa-lightbulb"></i>
                                <span id="puzzleHint">提示信息</span>
                            </div>
                        </div>
                        
                        <div class="puzzle-input-area" id="puzzleInputArea">
                            <!-- 动态内容根据谜题类型加载 -->
                        </div>
                        
                        <div class="puzzle-feedback" id="puzzleFeedback">
                            <!-- 反馈信息显示 -->
                        </div>
                        
                        <div class="puzzle-controls">
                            <button class="btn-secondary" onclick="game.puzzleSystem.showHint()">
                                <i class="fas fa-question-circle"></i> 获取提示
                            </button>
                            <button class="btn-primary" onclick="game.puzzleSystem.submitAnswer()" id="submitAnswerBtn">
                                <i class="fas fa-check"></i> 提交答案
                            </button>
                            <button class="btn-secondary" onclick="game.puzzleSystem.resetPuzzle()">
                                <i class="fas fa-redo"></i> 重置
                            </button>
                        </div>
                    </div>
                    
                    <div class="puzzle-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="puzzleProgress"></div>
                        </div>
                        <div class="progress-text">
                            已解决: <span id="solvedCount">0</span>/<span id="totalPuzzles">5</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = puzzleHTML;
        document.body.appendChild(container.firstElementChild);
        
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPuzzleActive()) return;
            
            switch(e.key) {
                case 'Enter':
                    this.submitAnswer();
                    break;
                case 'Escape':
                    this.closePuzzle();
                    break;
                case 'h':
                case 'H':
                    this.showHint();
                    e.preventDefault();
                    break;
                case 'r':
                case 'R':
                    this.resetPuzzle();
                    e.preventDefault();
                    break;
            }
        });
    }

    addPuzzle(puzzleData) {
        const puzzle = {
            ...puzzleData,
            createdAt: new Date().toISOString(),
            lastAttempt: null,
            hintsUsed: 0
        };
        
        this.puzzles.set(puzzle.id, puzzle);
        return puzzle.id;
    }

    activatePuzzle(puzzleId) {
        const puzzle = this.puzzles.get(puzzleId);
        if (!puzzle) {
            console.warn(`谜题不存在: ${puzzleId}`);
            return false;
        }
        
        if (puzzle.solved) {
            console.log(`谜题已解决: ${puzzle.name}`);
            return false;
        }
        
        this.activePuzzle = puzzle;
        
        // 检查前置条件
        if (puzzle.data?.requiredPhotos) {
            const unlockedPhotos = this.game.photoManager?.getUnlockedCount() || 0;
            if (unlockedPhotos < puzzle.data.requiredPhotos) {
                this.game.showMessage?.(
                    `需要先收集 ${puzzle.data.requiredPhotos} 张记忆碎片`,
                    'error'
                );
                return false;
            }
        }
        
        // 显示谜题界面
        this.showPuzzleUI(puzzle);
        return true;
    }

    showPuzzleUI(puzzle) {
        const interfaceEl = document.getElementById('puzzleInterface');
        
        // 更新基本信息
        document.getElementById('puzzleName').textContent = puzzle.name;
        document.getElementById('puzzleDescription').textContent = puzzle.description;
        document.getElementById('puzzleHint').textContent = puzzle.hint;
        document.getElementById('puzzleAttempts').textContent = puzzle.attempts;
        
        // 更新进度
        const solvedCount = this.getSolvedCount();
        const total = this.puzzles.size;
        document.getElementById('solvedCount').textContent = solvedCount;
        document.getElementById('totalPuzzles').textContent = total;
        document.getElementById('puzzleProgress').style.width = `${(solvedCount / total) * 100}%`;
        
        // 根据谜题类型创建输入界面
        this.createInputInterface(puzzle);
        
        // 显示界面
        interfaceEl.classList.remove('hidden');
        
        // 暂停游戏控制
        if (this.game.controls) {
            this.game.controls.enabled = false;
        }
        
        console.log(`激活谜题: ${puzzle.name}`);
    }

    createInputInterface(puzzle) {
        const inputArea = document.getElementById('puzzleInputArea');
        inputArea.innerHTML = '';
        
        const puzzleType = this.puzzleTypes[puzzle.type];
        
        switch(puzzle.type) {
            case 'number':
                this.createNumberInput(inputArea, puzzle);
                break;
            case 'sequence':
                this.createSequenceInput(inputArea, puzzle);
                break;
            case 'pattern':
                this.createPatternInput(inputArea, puzzle);
                break;
            case 'logic':
                this.createLogicInput(inputArea, puzzle);
                break;
            case 'memory':
                this.createMemoryInput(inputArea, puzzle);
                break;
            default:
                inputArea.innerHTML = `
                    <div class="puzzle-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>未知的谜题类型</p>
                    </div>
                `;
        }
    }

    createNumberInput(container, puzzle) {
        container.innerHTML = `
            <div class="number-puzzle">
                <h3>输入数字</h3>
                <input type="text" id="numberInput" maxlength="10" 
                       placeholder="请输入数字..." autofocus>
                <div class="input-hint">提示: ${puzzle.hint}</div>
                ${puzzle.attempts > 0 ? 
                    `<div class="previous-attempts">
                        上次尝试: ${this.puzzleHistory
                            .filter(h => h.puzzleId === puzzle.id)
                            .slice(-3)
                            .map(h => `<span class="attempt">${h.input}</span>`)
                            .join('')}
                    </div>` : ''
                }
            </div>
        `;
    }

    createSequenceInput(container, puzzle) {
        const options = puzzle.options || ['A', 'B', 'C', 'D'];
        
        container.innerHTML = `
            <div class="sequence-puzzle">
                <h3>排列序列</h3>
                <div class="sequence-instruction">拖放选项到正确顺序:</div>
                <div class="sequence-options" id="sequenceOptions">
                    ${options.map((opt, index) => `
                        <div class="sequence-option" draggable="true" data-value="${opt}">
                            ${this.getSequenceLabel(opt, puzzle)}
                        </div>
                    `).join('')}
                </div>
                <div class="sequence-target" id="sequenceTarget">
                    <div class="target-label">放置区域</div>
                    <div class="target-slots" id="targetSlots">
                        ${options.map(() => `<div class="target-slot"></div>`).join('')}
                    </div>
                </div>
                <div class="current-sequence" id="currentSequence">
                    <span>当前序列: </span>
                    <span id="sequenceDisplay">空</span>
                </div>
            </div>
        `;
        
        this.setupDragAndDrop();
    }

    getSequenceLabel(value, puzzle) {
        // 根据值返回对应的标签
        const labels = {
            'meeting': '初次相遇',
            'dating': '第一次约会',
            'anniversary': '周年纪念',
            'travel': '一起旅行'
        };
        return labels[value] || value;
    }

    createPatternInput(container, puzzle) {
        const gridSize = puzzle.solution?.length || 3;
        
        container.innerHTML = `
            <div class="pattern-puzzle">
                <h3>重现图案</h3>
                <div class="pattern-grid" id="patternGrid" style="grid-template-columns: repeat(${gridSize}, 1fr);">
                    ${Array(gridSize * gridSize).fill().map((_, i) => `
                        <div class="pattern-cell" data-index="${i}" onclick="this.classList.toggle('active')"></div>
                    `).join('')}
                </div>
                <div class="pattern-controls">
                    <button onclick="game.puzzleSystem.clearPattern()">清除</button>
                    <button onclick="game.puzzleSystem.previewPattern()">预览</button>
                </div>
                <div class="pattern-preview" id="patternPreview"></div>
            </div>
        `;
    }

    createLogicInput(container, puzzle) {
        container.innerHTML = `
            <div class="logic-puzzle">
                <h3>逻辑推理</h3>
                <div class="logic-question">
                    <p>${puzzle.data?.question || '根据以下线索推理...'}</p>
                </div>
                <div class="logic-clues">
                    ${puzzle.data?.clues?.map(clue => `
                        <div class="logic-clue">• ${clue}</div>
                    `).join('') || ''}
                </div>
                <div class="logic-options">
                    ${puzzle.data?.options?.map(option => `
                        <label class="logic-option">
                            <input type="radio" name="logicAnswer" value="${option}">
                            ${option}
                        </label>
                    `).join('') || ''}
                </div>
            </div>
        `;
    }

    createMemoryInput(container, puzzle) {
        const unlockedPhotos = this.game.photoManager?.getUnlockedPhotoIds() || [];
        
        container.innerHTML = `
            <div class="memory-puzzle">
                <h3>记忆拼图</h3>
                <div class="memory-instruction">
                    <p>选择所有相关的记忆碎片:</p>
                </div>
                <div class="memory-grid">
                    ${unlockedPhotos.map(photoId => {
                        const photo = this.game.photoManager?.photos.get(photoId);
                        return `
                            <div class="memory-item" data-photo="${photoId}" onclick="this.classList.toggle('selected')">
                                <div class="memory-thumbnail">${photo?.name || photoId}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="memory-input">
                    <input type="text" id="memoryInput" placeholder="或输入最终答案...">
                </div>
            </div>
        `;
    }

    submitAnswer() {
        if (!this.activePuzzle) return;
        
        const puzzle = this.activePuzzle;
        const puzzleType = this.puzzleTypes[puzzle.type];
        
        // 获取用户输入
        let userInput;
        switch(puzzle.type) {
            case 'number':
                userInput = document.getElementById('numberInput').value.trim();
                break;
            case 'sequence':
                userInput = this.getCurrentSequence();
                break;
            case 'pattern':
                userInput = this.getCurrentPattern();
                break;
            case 'logic':
                userInput = document.querySelector('input[name="logicAnswer"]:checked')?.value;
                break;
            case 'memory':
                userInput = this.getMemorySelection() || 
                           document.getElementById('memoryInput').value.trim();
                break;
            default:
                userInput = '';
        }
        
        if (!userInput && puzzle.type !== 'memory') {
            this.showFeedback('请输入答案', 'error');
            return;
        }
        
        // 记录尝试
        puzzle.attempts++;
        puzzle.lastAttempt = new Date().toISOString();
        
        this.puzzleHistory.push({
            puzzleId: puzzle.id,
            input: userInput,
            timestamp: puzzle.lastAttempt,
            correct: false
        });
        
        // 验证答案
        const isValid = puzzleType.validation(userInput, puzzle.solution);
        
        if (isValid) {
            this.onPuzzleSolved(puzzle, userInput);
        } else {
            this.onPuzzleFailed(puzzle, userInput);
        }
    }

    onPuzzleSolved(puzzle, userInput) {
        puzzle.solved = true;
        puzzle.solvedAt = new Date().toISOString();
        
        // 更新历史记录
        const lastAttempt = this.puzzleHistory[this.puzzleHistory.length - 1];
        if (lastAttempt) lastAttempt.correct = true;
        
        // 显示成功反馈
        this.showFeedback(
            puzzle.data?.customMessage || '谜题解决成功！',
            'success'
        );
        
        // 播放音效
        if (this.game.audioManager) {
            this.game.audioManager.playSound('puzzle_solved');
        }
        
        // 给予奖励
        this.giveReward(puzzle.reward);
        
        // 更新UI
        document.getElementById('puzzleAttempts').textContent = puzzle.attempts;
        
        // 关闭界面（稍后自动关闭）
        setTimeout(() => {
            this.closePuzzle();
            
            // 显示额外消息
            if (puzzle.data?.specialMessage) {
                setTimeout(() => {
                    this.game.showMessage?.(puzzle.data.specialMessage, 'success');
                }, 500);
            }
        }, 2000);
        
        console.log(`谜题解决: ${puzzle.name} (尝试次数: ${puzzle.attempts})`);
    }

    onPuzzleFailed(puzzle, userInput) {
        const puzzleType = this.puzzleTypes[puzzle.type];
        const remainingAttempts = puzzleType.maxAttempts - puzzle.attempts;
        
        // 显示失败反馈
        if (remainingAttempts > 0) {
            this.showFeedback(
                `答案错误，还剩 ${remainingAttempts} 次尝试机会`,
                'error'
            );
        } else {
            this.showFeedback(
                '尝试次数用尽，谜题已锁定',
                'error'
            );
            puzzle.locked = true;
            
            // 惩罚：降低理智值
            if (this.game.reduceSanity) {
                this.game.reduceSanity(10);
            }
        }
        
        // 播放错误音效
        if (this.game.audioManager) {
            this.game.audioManager.playSound('error');
        }
        
        // 更新UI
        document.getElementById('puzzleAttempts').textContent = puzzle.attempts;
    }

    giveReward(reward) {
        if (!reward) return;
        
        switch(reward.type) {
            case 'photo_fragment':
                if (this.game.photoManager) {
                    this.game.photoManager.unlockPhoto(reward.id, '谜题奖励');
                }
                break;
            case 'item':
                if (this.game.inventorySystem) {
                    this.game.inventorySystem.addItem({
                        type: 'key_item',
                        name: reward.name || '谜题奖励',
                        description: reward.description || '解谜获得的物品'
                    });
                }
                break;
            case 'ending':
                // 触发结局
                if (this.game.triggerEnding) {
                    this.game.triggerEnding(reward.id);
                }
                break;
        }
        
        // 恢复理智值作为奖励
        if (this.game.gameState) {
            this.game.gameState.sanity = Math.min(100, this.game.gameState.sanity + 15);
        }
    }

    showHint() {
        if (!this.activePuzzle) return;
        
        const puzzle = this.activePuzzle;
        puzzle.hintsUsed++;
        
        // 显示额外提示
        const additionalHints = puzzle.data?.additionalHints || [];
        const hintIndex = Math.min(puzzle.hintsUsed - 1, additionalHints.length - 1);
        
        if (additionalHints[hintIndex]) {
            this.showFeedback(`提示: ${additionalHints[hintIndex]}`, 'hint');
        } else {
            this.showFeedback('没有更多提示了', 'info');
        }
        
        // 惩罚：使用提示会轻微降低奖励
        if (this.game.gameState) {
            this.game.gameState.sanity = Math.max(0, this.game.gameState.sanity - 2);
        }
    }

    resetPuzzle() {
        if (!this.activePuzzle) return;
        
        // 重置输入界面
        this.createInputInterface(this.activePuzzle);
        this.showFeedback('谜题已重置', 'info');
    }

    closePuzzle() {
        document.getElementById('puzzleInterface').classList.add('hidden');
        this.activePuzzle = null;
        
        // 恢复游戏控制
        if (this.game.controls) {
            this.game.controls.enabled = true;
        }
    }

    showFeedback(message, type = 'info') {
        const feedbackEl = document.getElementById('puzzleFeedback');
        feedbackEl.innerHTML = `
            <div class="feedback feedback-${type}">
                <i class="fas fa-${this.getFeedbackIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 3秒后自动清除
        setTimeout(() => {
            if (feedbackEl.innerHTML.includes(message)) {
                feedbackEl.innerHTML = '';
            }
        }, 3000);
    }

    getFeedbackIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'hint': return 'lightbulb';
            default: return 'info-circle';
        }
    }

    // 辅助方法
    getCurrentSequence() {
        const slots = document.querySelectorAll('.target-slot');
        const sequence = Array.from(slots)
            .map(slot => slot.querySelector('.sequence-option')?.dataset.value)
            .filter(value => value !== undefined);
        return sequence;
    }

    getCurrentPattern() {
        const cells = document.querySelectorAll('.pattern-cell');
        const gridSize = Math.sqrt(cells.length);
        const pattern = [];
        
        for (let i = 0; i < gridSize; i++) {
            pattern[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const index = i * gridSize + j;
                pattern[i][j] = cells[index].classList.contains('active') ? 1 : 0;
            }
        }
        
        return pattern;
    }

    getMemorySelection() {
        const selected = document.querySelectorAll('.memory-item.selected');
        if (selected.length === 0) return null;
        
        return Array.from(selected).map(item => item.dataset.photo);
    }

    getSolvedCount() {
        return Array.from(this.puzzles.values())
            .filter(puzzle => puzzle.solved).length;
    }

    isPuzzleActive() {
        const interfaceEl = document.getElementById('puzzleInterface');
        return interfaceEl && !interfaceEl.classList.contains('hidden');
    }

    // 验证方法
    checkPattern(input, solution) {
        if (!Array.isArray(input) || !Array.isArray(solution)) return false;
        if (input.length !== solution.length) return false;
        
        for (let i = 0; i < input.length; i++) {
            if (input[i].length !== solution[i].length) return false;
            for (let j = 0; j < input[i].length; j++) {
                if (input[i][j] !== solution[i][j]) return false;
            }
        }
        
        return true;
    }

    checkLogic(input, solution) {
        return input === solution;
    }

    checkMemory(input, solution) {
        if (Array.isArray(input)) {
            // 检查是否选择了所有必需的照片
            const required = Array.isArray(solution) ? solution : [solution];
            return required.every(photo => input.includes(photo));
        } else {
            // 文本答案验证
            return input.toLowerCase() === solution.toLowerCase();
        }
    }

    // 存档相关
    saveState() {
        const state = {
            puzzles: Array.from(this.puzzles.entries()),
            history: this.puzzleHistory,
            version: '1.0'
        };
        return state;
    }

    loadState(state) {
        if (!state || state.version !== '1.0') return;
        
        this.puzzles.clear();
        state.puzzles.forEach(([id, puzzleData]) => {
            this.puzzles.set(id, puzzleData);
        });
        
        this.puzzleHistory = state.history || [];
        
        console.log(`谜题状态已加载: ${this.getSolvedCount()}/${this.puzzles.size} 已解决`);
    }

    // 工具方法
    setupDragAndDrop() {
        const options = document.querySelectorAll('.sequence-option');
        const slots = document.querySelectorAll('.target-slot');
        
        options.forEach(option => {
            option.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', option.dataset.value);
            });
        });
        
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const value = e.dataTransfer.getData('text/plain');
                const draggedOption = document.querySelector(`.sequence-option[data-value="${value}"]`);
                
                if (draggedOption && slot.children.length === 0) {
                    slot.appendChild(draggedOption.cloneNode(true));
                    this.updateSequenceDisplay();
                }
            });
        });
    }

    updateSequenceDisplay() {
        const sequence = this.getCurrentSequence();
        const display = document.getElementById('sequenceDisplay');
        display.textContent = sequence.length > 0 ? 
            sequence.map(s => this.getSequenceLabel(s, this.activePuzzle)).join(' → ') : '空';
    }

    clearPattern() {
        document.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.classList.remove('active');
        });
    }

    previewPattern() {
        const pattern = this.getCurrentPattern();
        const previewEl = document.getElementById('patternPreview');
        
        let previewHTML = '<div class="pattern-preview-grid">';
        pattern.forEach(row => {
            row.forEach(cell => {
                previewHTML += `<div class="preview-cell ${cell ? 'active' : ''}"></div>`;
            });
        });
        previewHTML += '</div>';
        
        previewEl.innerHTML = previewHTML;
    }
}

if (typeof window !== 'undefined') {
    window.PuzzleSystem = PuzzleSystem;
}

export { PuzzleSystem };