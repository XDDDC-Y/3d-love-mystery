// ========== 通用工具函数 ==========

class GameUtils {
    constructor() {
        // 工具类，不需要构造函数
    }

    // ========== 数学工具 ==========

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randomWeightedChoice(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            if (random < item.weight) return item.value;
            random -= item.weight;
        }
        
        return items[items.length - 1].value;
    }

    static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    static radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // ========== 字符串工具 ==========

    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static camelToSpaced(str) {
        return str.replace(/([A-Z])/g, ' $1').trim();
    }

    static parseQueryString(query) {
        const params = {};
        query = query.replace(/^\?/, '');
        
        if (!query) return params;
        
        query.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        
        return params;
    }

    static toQueryString(params) {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    // ========== 数组工具 ==========

    static shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static flattenArray(arrays) {
        return arrays.reduce((flat, arr) => flat.concat(arr), []);
    }

    static removeDuplicates(array) {
        return [...new Set(array)];
    }

    static sortByKey(array, key, descending = false) {
        return [...array].sort((a, b) => {
            if (a[key] < b[key]) return descending ? 1 : -1;
            if (a[key] > b[key]) return descending ? -1 : 1;
            return 0;
        });
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }

    // ========== 对象工具 ==========

    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    static mergeObjects(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (this.isObject(target[key]) && this.isObject(source[key])) {
                    this.mergeObjects(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    static pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    static omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }

    // ========== 颜色工具 ==========

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    }

    static lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const lighten = (value) => Math.min(255, Math.floor(value + (255 - value) * percent));
        
        return this.rgbToHex(
            lighten(rgb.r),
            lighten(rgb.g),
            lighten(rgb.b)
        );
    }

    static darkenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const darken = (value) => Math.max(0, Math.floor(value * (1 - percent)));
        
        return this.rgbToHex(
            darken(rgb.r),
            darken(rgb.g),
            darken(rgb.b)
        );
    }

    static colorToThreeColor(color) {
        if (color instanceof THREE.Color) return color;
        if (typeof color === 'string') return new THREE.Color(color);
        if (Array.isArray(color) && color.length >= 3) {
            return new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255);
        }
        return new THREE.Color(0xffffff);
    }

    // ========== Three.js 工具 ==========

    static createBox(position, size, color, materialType = 'standard') {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        let material;
        
        switch (materialType) {
            case 'basic':
                material = new THREE.MeshBasicMaterial({ color: color });
                break;
            case 'lambert':
                material = new THREE.MeshLambertMaterial({ color: color });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({ color: color });
                break;
            default:
                material = new THREE.MeshStandardMaterial({ color: color });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        return mesh;
    }

    static createSphere(position, radius, color, segments = 16) {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        return mesh;
    }

    static createPlane(position, size, color, rotation = new THREE.Vector3(-Math.PI / 2, 0, 0)) {
        const geometry = new THREE.PlaneGeometry(size.x, size.y);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        return mesh;
    }

    static createLight(position, color, intensity, type = 'point') {
        let light;
        
        switch (type) {
            case 'directional':
                light = new THREE.DirectionalLight(color, intensity);
                light.position.copy(position);
                light.castShadow = true;
                break;
            case 'spot':
                light = new THREE.SpotLight(color, intensity);
                light.position.copy(position);
                light.castShadow = true;
                break;
            case 'ambient':
                light = new THREE.AmbientLight(color, intensity);
                break;
            default:
                light = new THREE.PointLight(color, intensity, 50);
                light.position.copy(position);
                light.castShadow = true;
        }
        
        return light;
    }

    static createTextSprite(text, options = {}) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const fontSize = options.fontSize || 64;
        const fontFamily = options.fontFamily || 'Arial';
        const color = options.color || '#ffffff';
        const backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.5)';
        const padding = options.padding || 10;
        
        context.font = `bold ${fontSize}px ${fontFamily}`;
        const textWidth = context.measureText(text).width;
        
        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;
        
        // 绘制背景
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制文字
        context.font = `bold ${fontSize}px ${fontFamily}`;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);
        
        return sprite;
    }

    // ========== 动画工具 ==========

    static animateValue(start, end, duration, easing = 'linear', onUpdate) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = this.easingFunctions[easing](progress);
                
                const currentValue = start + (end - start) * easedProgress;
                
                if (onUpdate) onUpdate(currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    static easingFunctions = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
        easeOutSine: t => Math.sin(t * Math.PI / 2),
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2
    };

    // ========== 声音工具 ==========

    static preloadAudio(urls) {
        return Promise.all(
            urls.map(url => new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.oncanplaythrough = () => resolve(audio);
                audio.onerror = reject;
                audio.src = url;
            }))
        );
    }

    static createAudioBuffer(context, arrayBuffer) {
        return new Promise((resolve, reject) => {
            context.decodeAudioData(arrayBuffer, resolve, reject);
        });
    }

    // ========== 文件工具 ==========

    static loadJSON(url) {
        return fetch(url).then(response => response.json());
    }

    static loadText(url) {
        return fetch(url).then(response => response.text());
    }

    static loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    static saveToFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            
            if (file.type.startsWith('text/') || file.type === 'application/json') {
                reader.readAsText(file);
            } else if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    // ========== 性能工具 ==========

    static createFPSMeter() {
        let fps = 0;
        let frameCount = 0;
        let lastTime = performance.now();
        
        return {
            update: () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime >= 1000) {
                    fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                    frameCount = 0;
                    lastTime = currentTime;
                }
                
                return fps;
            },
            getFPS: () => fps
        };
    }

    static measurePerformance(fn, iterations = 1000) {
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        
        const end = performance.now();
        const totalTime = end - start;
        const avgTime = totalTime / iterations;
        
        return {
            totalTime,
            avgTime,
            iterations
        };
    }

    // ========== 游戏特定工具 ==========

    static generateMaze(width, height) {
        const maze = Array(height).fill().map(() => Array(width).fill(1));
        
        // 简单的迷宫生成算法
        const carve = (x, y) => {
            maze[y][x] = 0;
            
            const directions = [
                [0, -2], [0, 2], [-2, 0], [2, 0]
            ];
            
            GameUtils.shuffleArray(directions).forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
                    maze[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            });
        };
        
        carve(1, 1);
        maze[1][0] = 0; // 入口
        maze[height - 2][width - 1] = 0; // 出口
        
        return maze;
    }

    static createMazeWalls(scene, maze, cellSize = 3, wallHeight = 4) {
        const walls = [];
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x252545,
            roughness: 0.9,
            metalness: 0.1
        });
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) {
                    const wall = new THREE.Mesh(
                        new THREE.BoxGeometry(cellSize, wallHeight, cellSize),
                        wallMaterial
                    );
                    wall.position.set(
                        (x - maze[y].length / 2) * cellSize,
                        wallHeight / 2,
                        (y - maze.length / 2) * cellSize
                    );
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    
                    scene.add(wall);
                    walls.push(wall);
                }
            }
        }
        
        return walls;
    }

    static createInteractiveObject(type, position, interaction) {
        let geometry, material;
        
        switch(type) {
            case 'book':
                geometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
                material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                break;
            case 'photo':
                geometry = new THREE.BoxGeometry(0.5, 0.4, 0.02);
                material = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
                break;
            case 'device':
                geometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
                material = new THREE.MeshStandardMaterial({ color: 0x444444 });
                break;
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshStandardMaterial({ color: 0x9d8aff });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        
        mesh.userData = {
            type: type,
            interaction: interaction,
            interactive: true
        };
        
        return mesh;
    }

    static checkCollision(object1, object2, threshold = 1) {
        const distance = object1.position.distanceTo(object2.position);
        return distance < threshold;
    }

    static getRandomPositionInRadius(center, radius) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        return new THREE.Vector3(
            center.x + Math.cos(angle) * distance,
            center.y,
            center.z + Math.sin(angle) * distance
        );
    }

    // ========== 调试工具 ==========

    static enableDebugMode() {
        return {
            log: (...args) => console.log('[DEBUG]', ...args),
            warn: (...args) => console.warn('[DEBUG]', ...args),
            error: (...args) => console.error('[DEBUG]', ...args),
            time: (label) => console.time(`[DEBUG] ${label}`),
            timeEnd: (label) => console.timeEnd(`[DEBUG] ${label}`),
            assert: (condition, message) => {
                if (!condition) {
                    console.error(`[DEBUG ASSERT] ${message}`);
                }
            }
        };
    }

    static createStatsPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 5px;
            min-width: 200px;
        `;
        
        return panel;
    }

    static updateStatsPanel(panel, stats) {
        let html = '<div style="margin-bottom: 5px;"><strong>游戏状态</strong></div>';
        
        for (const [key, value] of Object.entries(stats)) {
            html += `<div>${key}: ${value}</div>`;
        }
        
        panel.innerHTML = html;
    }
}

// ========== 全局导出 ==========

if (typeof window !== 'undefined') {
    window.GameUtils = GameUtils;
    window.utils = GameUtils; // 兼容性别名
}

// ========== 立即执行函数 ==========

(function() {
    // 防止重复加载
    if (window._UTILS_LOADED) return;
    window._UTILS_LOADED = true;
    
    console.log('游戏工具库已加载');
})();

export { utils };