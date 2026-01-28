class InventorySystem {
    constructor(game) {
        this.game = game;
        this.items = new Map(); // id -> item data
        this.maxSlots = 12;
        this.selectedSlot = 0;
        
        this.itemTypes = {
            photo_fragment: {
                name: '照片碎片',
                description: '记忆的碎片',
                use: 'view',
                icon: '📸'
            },
            key_item: {
                name: '关键物品',
                description: '解谜的关键',
                use: 'activate',
                icon: '🗝️'
            },
            note: {
                name: '笔记',
                description: '记录线索',
                use: 'read',
                icon: '📝'
            },
            tool: {
                name: '工具',
                description: '用于交互',
                use: 'use',
                icon: '🔧'
            }
        };
        
        this.initUI();
    }

    initUI() {
        // 创建物品栏UI
        const inventoryHTML = `
            <div id="inventory" class="screen hidden">
                <div class="inventory-container">
                    <div class="inventory-header">
                        <h2><i class="fas fa-backpack"></i> 记忆收集</h2>
                        <button class="close-btn" onclick="game.inventorySystem.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="inventory-stats">
                        <div class="stat">
                            <span>收集进度:</span>
                            <span id="collectionProgress">0/7</span>
                        </div>
                        <div class="stat">
                            <span>理智值:</span>
                            <span id="inventorySanity">100%</span>
                        </div>
                    </div>
                    
                    <div class="inventory-grid">
                        ${Array.from({length: this.maxSlots}, (_, i) => `
                            <div class="inventory-slot" data-slot="${i}">
                                <div class="slot-content"></div>
                                <div class="slot-number">${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="inventory-info">
                        <div class="item-preview" id="itemPreview">
                            <div class="preview-icon">?</div>
                            <div class="preview-details">
                                <h3 id="itemName">选择物品查看详情</h3>
                                <p id="itemDescription">点击格子查看物品信息</p>
                                <div class="item-actions" id="itemActions"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="inventory-controls">
                        <button class="btn-secondary" onclick="game.showArchives()">
                            <i class="fas fa-images"></i> 查看照片
                        </button>
                        <button class="btn-secondary" onclick="game.toggleNoteSystem()">
                            <i class="fas fa-book"></i> 查看笔记
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        const container = document.createElement('div');
        container.innerHTML = inventoryHTML;
        document.body.appendChild(container.firstElementChild);
        
        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        // 数字键选择物品栏格子
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('inventory').classList.contains('hidden')) {
                return; // 物品栏打开时不响应数字键
            }
            
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= this.maxSlots) {
                this.selectSlot(num - 1);
                this.useSelectedItem();
            }
        });
        
        // 点击格子
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotIndex = parseInt(slot.dataset.slot);
                this.selectSlot(slotIndex);
                this.updateItemPreview();
            });
        });
    }

    addItem(itemData) {
        // 查找空槽位
        let slotIndex = -1;
        for (let i = 0; i < this.maxSlots; i++) {
            if (!this.items.has(i)) {
                slotIndex = i;
                break;
            }
        }
        
        if (slotIndex === -1) {
            console.warn('物品栏已满');
            return false;
        }
        
        // 创建物品实例
        const item = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: itemData.type,
            name: itemData.name || this.itemTypes[itemData.type]?.name || '未知物品',
            description: itemData.description || this.itemTypes[itemData.type]?.description || '',
            icon: itemData.icon || this.itemTypes[itemData.type]?.icon || '❓',
            data: itemData.data || {},
            quantity: itemData.quantity || 1,
            stackable: itemData.stackable || false,
            usable: itemData.usable !== false,
            collectedAt: new Date().toISOString()
        };
        
        // 检查是否可堆叠
        if (item.stackable) {
            const existing = this.findItemByType(item.type);
            if (existing) {
                existing.quantity += item.quantity;
                this.updateSlotUI(existing.slot);
                return true;
            }
        }
        
        // 存入物品栏
        item.slot = slotIndex;
        this.items.set(slotIndex, item);
        
        // 更新UI
        this.updateSlotUI(slotIndex);
        this.updateStats();
        
        // 播放音效
        if (this.game.audioManager) {
            this.game.audioManager.playSound('collect');
        }
        
        console.log(`物品添加: ${item.name} (槽位: ${slotIndex})`);
        return true;
    }

    removeItem(slotIndex) {
        if (!this.items.has(slotIndex)) return false;
        
        const item = this.items.get(slotIndex);
        this.items.delete(slotIndex);
        
        this.updateSlotUI(slotIndex);
        this.updateStats();
        
        console.log(`物品移除: ${item.name}`);
        return item;
    }

    findItemByType(type) {
        for (const [slot, item] of this.items) {
            if (item.type === type) return { ...item, slot };
        }
        return null;
    }

    hasItem(type) {
        return this.findItemByType(type) !== null;
    }

    selectSlot(slotIndex) {
        // 移除之前的选择
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // 设置新选择
        const slot = document.querySelector(`.inventory-slot[data-slot="${slotIndex}"]`);
        if (slot) {
            slot.classList.add('selected');
            this.selectedSlot = slotIndex;
        }
    }

    useSelectedItem() {
        const item = this.items.get(this.selectedSlot);
        if (!item || !item.usable) return;
        
        console.log(`使用物品: ${item.name}`);
        
        // 根据物品类型执行不同操作
        switch(item.type) {
            case 'photo_fragment':
                this.viewPhoto(item.data.photoId);
                break;
            case 'key_item':
                this.useKeyItem(item);
                break;
            case 'note':
                this.readNote(item);
                break;
            default:
                console.log(`物品 ${item.name} 被使用`);
        }
        
        // 消耗品处理
        if (item.consumable) {
            item.quantity--;
            if (item.quantity <= 0) {
                this.removeItem(this.selectedSlot);
            } else {
                this.updateSlotUI(this.selectedSlot);
            }
        }
    }

    viewPhoto(photoId) {
        if (this.game.photoManager) {
            this.game.photoManager.showPhoto(photoId);
        } else {
            console.log(`查看照片: ${photoId}`);
        }
    }

    useKeyItem(item) {
        // 检查当前场景是否有可用的锁
        if (this.game.interactionSystem) {
            this.game.interactionSystem.tryUseKeyItem(item);
        }
    }

    readNote(item) {
        this.game.showNoteSystem(item.data.content, item.name);
    }

    updateSlotUI(slotIndex) {
        const slot = document.querySelector(`.inventory-slot[data-slot="${slotIndex}"]`);
        const content = slot.querySelector('.slot-content');
        
        if (!this.items.has(slotIndex)) {
            content.innerHTML = '';
            content.classList.remove('has-item');
            return;
        }
        
        const item = this.items.get(slotIndex);
        content.classList.add('has-item');
        
        let displayText = item.icon;
        if (item.quantity > 1) {
            displayText += `<span class="item-quantity">${item.quantity}</span>`;
        }
        
        content.innerHTML = displayText;
        content.title = `${item.name}\n${item.description}`;
    }

    updateItemPreview() {
        const item = this.items.get(this.selectedSlot);
        const preview = document.getElementById('itemPreview');
        const itemName = document.getElementById('itemName');
        const itemDesc = document.getElementById('itemDescription');
        const itemActions = document.getElementById('itemActions');
        
        if (!item) {
            preview.querySelector('.preview-icon').textContent = '?';
            itemName.textContent = '选择物品查看详情';
            itemDesc.textContent = '点击格子查看物品信息';
            itemActions.innerHTML = '';
            return;
        }
        
        // 更新预览
        preview.querySelector('.preview-icon').textContent = item.icon;
        itemName.textContent = item.name;
        itemDesc.textContent = item.description;
        
        // 更新操作按钮
        let actionsHTML = '';
        if (item.usable) {
            actionsHTML += `<button class="btn-action" onclick="game.inventorySystem.useSelectedItem()">
                <i class="fas fa-hand-paper"></i> 使用
            </button>`;
        }
        
        if (item.type === 'photo_fragment') {
            actionsHTML += `<button class="btn-action" onclick="game.inventorySystem.viewPhoto('${item.data.photoId}')">
                <i class="fas fa-eye"></i> 查看
            </button>`;
        }
        
        actionsHTML += `<button class="btn-action" onclick="game.inventorySystem.dropItem(${this.selectedSlot})">
            <i class="fas fa-trash"></i> 丢弃
        </button>`;
        
        itemActions.innerHTML = actionsHTML;
    }

    dropItem(slotIndex) {
        const item = this.items.get(slotIndex);
        if (!item) return;
        
        if (confirm(`确定要丢弃 ${item.name} 吗？`)) {
            this.removeItem(slotIndex);
            
            // 在玩家位置创建丢弃的物品（3D物体）
            if (this.game.player && this.game.scene) {
                this.createDroppedItem(item);
            }
        }
    }

    createDroppedItem(item) {
        // 创建3D物品实体
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x9d8aff,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.game.camera.position);
        mesh.position.y -= 1;
        
        mesh.userData = {
            type: 'dropped_item',
            itemData: item
        };
        
        this.game.scene.add(mesh);
        
        // 添加拾取交互
        this.game.interactionSystem.addInteractiveObject(mesh, {
            interaction: 'pickupDroppedItem',
            hint: `拾取 ${item.name}`,
            data: { mesh, item }
        });
    }

    updateStats() {
        // 更新收集进度
        const photoFragments = Array.from(this.items.values())
            .filter(item => item.type === 'photo_fragment').length;
        
        const progress = document.getElementById('collectionProgress');
        if (progress) {
            progress.textContent = `${photoFragments}/7`;
        }
        
        // 更新理智值显示
        const sanity = document.getElementById('inventorySanity');
        if (sanity && this.game.gameState) {
            sanity.textContent = `${Math.round(this.game.gameState.sanity)}%`;
            sanity.className = '';
            if (this.game.gameState.sanity < 30) {
                sanity.classList.add('low');
            } else if (this.game.gameState.sanity < 60) {
                sanity.classList.add('medium');
            }
        }
    }

    open() {
        document.getElementById('inventory').classList.remove('hidden');
        this.updateStats();
        this.selectSlot(0);
        this.updateItemPreview();
        
        // 暂停游戏
        if (this.game.controls) {
            this.game.controls.enabled = false;
        }
    }

    close() {
        document.getElementById('inventory').classList.add('hidden');
        
        // 恢复游戏
        if (this.game.controls) {
            this.game.controls.enabled = true;
        }
    }

    toggle() {
        const inventory = document.getElementById('inventory');
        if (inventory.classList.contains('hidden')) {
            this.open();
        } else {
            this.close();
        }
    }

    getItemCount(type) {
        let count = 0;
        for (const item of this.items.values()) {
            if (item.type === type) {
                count += item.quantity;
            }
        }
        return count;
    }

    save() {
        const saveData = {
            items: Array.from(this.items.entries()),
            maxSlots: this.maxSlots,
            version: '1.0'
        };
        return saveData;
    }

    load(saveData) {
        if (!saveData || !saveData.items) return;
        
        this.items.clear();
        for (const [slot, item] of saveData.items) {
            this.items.set(slot, item);
            this.updateSlotUI(slot);
        }
        
        this.updateStats();
        console.log('物品栏加载完成');
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.InventorySystem = InventorySystem;
}

export { InventorySystem };