class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.emitters = new Map();
        this.particleGroups = new THREE.Group();
        this.scene.add(this.particleGroups);
        
        // 粒子类型预设
        this.presets = {
            dust: {
                count: 100,
                size: 0.02,
                color: 0x8a8aff,
                velocity: 0.01,
                lifespan: 3000,
                spread: 1.0
            },
            fog: {
                count: 200,
                size: 0.05,
                color: 0x1a1a2e,
                velocity: 0.002,
                lifespan: 5000,
                spread: 2.0,
                opacity: 0.3
            },
            spark: {
                count: 50,
                size: 0.01,
                color: 0xff6b8b,
                velocity: 0.05,
                lifespan: 1000,
                spread: 0.5
            },
            whisper: {
                count: 30,
                size: 0.03,
                color: 0x9d8aff,
                velocity: 0.01,
                lifespan: 2000,
                spread: 0.8,
                opacity: 0.6
            },
            blood: {
                count: 20,
                size: 0.03,
                color: 0x8a0000,
                velocity: 0.02,
                lifespan: 1500,
                spread: 0.3
            }
        };

        // 性能监控
        this.frameTimes = [];
        this.lastFrameTime = performance.now();
        this.maxParticles = 1000; // 最大粒子数限制
    }

    // ... [之前的代码保持不变，从createParticleEmitter到createBloodSplatter] ...

    adjustForPerformance() {
        // 根据性能调整粒子数量
        const targetFPS = 60;
        const currentFPS = this.getEstimatedFPS();
        
        if (currentFPS < 45) {
            // FPS低于45，减少粒子数量
            this.reduceParticleCount(0.5);
            console.log(`性能调整: 减少粒子数量 (FPS: ${Math.round(currentFPS)})`);
        } else if (currentFPS > 55 && this.maxParticles < 2000) {
            // FPS良好，可以增加粒子数量
            this.maxParticles = Math.min(2000, this.maxParticles + 100);
        }
    }

    getEstimatedFPS() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // 记录最近10帧的时间
        this.frameTimes.push(delta);
        if (this.frameTimes.length > 10) {
            this.frameTimes.shift();
        }
        
        // 计算平均帧时间
        const avgDelta = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
        return 1000 / avgDelta;
    }

    reduceParticleCount(factor = 0.7) {
        // 减少活跃粒子数量
        const targetCount = Math.floor(this.particles.length * factor);
        
        while (this.particles.length > targetCount) {
            // 移除最老的粒子
            let oldestIndex = 0;
            let oldestAge = 0;
            
            for (let i = 0; i < this.particles.length; i++) {
                const age = Date.now() - this.particles[i].userData.bornAt;
                if (age > oldestAge) {
                    oldestAge = age;
                    oldestIndex = i;
                }
            }
            
            this.removeParticle(this.particles[oldestIndex], oldestIndex);
        }
        
        // 减少发射器粒子数量
        for (const emitter of this.emitters.values()) {
            emitter.config.count = Math.floor(emitter.config.count * factor);
        }
    }

    createMemoryParticles(position, memoryType) {
        // 根据记忆类型创建特殊粒子效果
        const effects = {
            meeting: {
                color: 0x8a8aff, // 紫色
                shape: 'heart',
                sound: 'whisper'
            },
            dating: {
                color: 0xff6b8b, // 粉色
                shape: 'sparkle',
                sound: 'collect'
            },
            anniversary: {
                color: 0xffd700, // 金色
                shape: 'ring',
                sound: 'puzzle_solved'
            },
            travel: {
                color: 0x00bfff, // 蓝色
                shape: 'cloud',
                sound: 'whisper'
            },
            surprise: {
                color: 0xff4500, // 橙色
                shape: 'burst',
                sound: 'collect'
            }
        };

        const effect = effects[memoryType] || effects.meeting;
        
        // 创建粒子爆发效果
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5;
            
            this.createSingleParticle(
                new THREE.Vector3(
                    position.x + Math.cos(angle) * radius,
                    position.y + Math.random() * 2,
                    position.z + Math.sin(angle) * radius
                ),
                {
                    size: 0.02 + Math.random() * 0.03,
                    color: effect.color,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.05,
                        Math.random() * 0.03,
                        (Math.random() - 0.5) * 0.05
                    ),
                    lifespan: 1500 + Math.random() * 1000,
                    opacity: 0.7,
                    fade: true,
                    shrink: true
                }
            );
        }
    }

    createTextParticles(text, position, color = 0x9d8aff) {
        // 创建文字粒子效果（用于显示线索）
        const chars = text.split('');
        const particlePositions = this.generateTextPositions(chars, position);
        
        particlePositions.forEach((pos, index) => {
            setTimeout(() => {
                this.createSingleParticle(pos, {
                    size: 0.05,
                    color: color,
                    velocity: new THREE.Vector3(0, 0.02, 0),
                    lifespan: 3000,
                    opacity: 0.8,
                    fade: true
                });
            }, index * 50);
        });
    }

    generateTextPositions(chars, startPos) {
        // 简单的文字位置生成
        const positions = [];
        const charSpacing = 0.3;
        
        chars.forEach((char, index) => {
            if (char !== ' ') {
                positions.push(new THREE.Vector3(
                    startPos.x + index * charSpacing,
                    startPos.y,
                    startPos.z
                ));
            }
        });
        
        return positions;
    }

    createSanityEffect(sanityLevel) {
        // 根据理智值创建视觉效果
        const intensity = (100 - sanityLevel) / 100;
        
        if (intensity > 0.3) {
            // 创建扭曲的粒子效果
            const count = Math.floor(intensity * 100);
            
            for (let i = 0; i < count; i++) {
                this.createSingleParticle(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 10,
                        Math.random() * 3,
                        (Math.random() - 0.5) * 10
                    ),
                    {
                        size: 0.01 + Math.random() * 0.02,
                        color: intensity > 0.7 ? 0x8a0000 : 0x9d8aff,
                        velocity: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.02 * intensity,
                            (Math.random() - 0.5) * 0.01 * intensity,
                            (Math.random() - 0.5) * 0.02 * intensity
                        ),
                        lifespan: 1000 * (1 + intensity),
                        opacity: 0.4 * intensity,
                        fade: true,
                        flicker: intensity > 0.5
                    }
                );
            }
        }
    }

    // 工具方法
    getParticleCount() {
        return this.particles.length;
    }

    getEmitterCount() {
        return this.emitters.size;
    }

    setMaxParticles(max) {
        this.maxParticles = max;
        if (this.particles.length > max) {
            this.reduceParticleCount(max / this.particles.length);
        }
    }

    // 清理和重置
    cleanup() {
        this.clearAll();
        this.particleGroups.clear();
        this.scene.remove(this.particleGroups);
    }

    // 保存和加载状态
    saveState() {
        const state = {
            emitters: Array.from(this.emitters.entries()).map(([id, emitter]) => ({
                id,
                position: [emitter.position.x, emitter.position.y, emitter.position.z],
                config: emitter.config,
                active: emitter.active,
                duration: emitter.duration,
                startTime: emitter.startTime
            })),
            particleCount: this.particles.length,
            version: '1.0'
        };
        return state;
    }

    loadState(state) {
        if (!state || state.version !== '1.0') return;
        
        this.clearAll();
        
        state.emitters.forEach(emitterData => {
            const position = new THREE.Vector3(...emitterData.position);
            this.createParticleEmitter(position, 'custom', {
                ...emitterData.config,
                duration: emitterData.duration
            });
        });
    }
}

if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
}

export { ParticleSystem };