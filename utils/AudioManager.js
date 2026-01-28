class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.currentAmbient = null;
        this.activeSounds = new Set();
        this.volume = 0.7;
        this.muted = false;
        this.globalGain = null;
        
        // 音频文件配置
        this.audioConfig = {
            ambient: {
                title: { 
                    file: 'assets/audio/ambient/title.mp3', 
                    loop: true, 
                    volume: 0.4 
                },
                scene1: { 
                    file: 'assets/audio/ambient/scene1.mp3', 
                    loop: true, 
                    volume: 0.3 
                },
                scene2: { 
                    file: 'assets/audio/ambient/scene2.mp3', 
                    loop: true, 
                    volume: 0.3 
                },
                scene3: { 
                    file: 'assets/audio/ambient/scene3.mp3', 
                    loop: true, 
                    volume: 0.3 
                },
                nightmare: { 
                    file: 'assets/audio/ambient/nightmare.mp3', 
                    loop: true, 
                    volume: 0.5 
                }
            },
            sfx: {
                whisper: { 
                    file: 'assets/audio/sfx/whisper.mp3', 
                    volume: 0.6 
                },
                collect: { 
                    file: 'assets/audio/sfx/collect.mp3', 
                    volume: 0.8 
                },
                step: { 
                    file: 'assets/audio/sfx/step.mp3', 
                    volume: 0.3 
                },
                heartbeat: { 
                    file: 'assets/audio/sfx/heartbeat.mp3', 
                    volume: 0.4 
                },
                puzzle_solved: { 
                    file: 'assets/audio/sfx/puzzle_solved.mp3', 
                    volume: 0.7 
                },
                error: { 
                    file: 'assets/audio/sfx/error.mp3', 
                    volume: 0.5 
                },
                mirror: { 
                    file: 'assets/audio/sfx/mirror.mp3', 
                    volume: 0.6 
                },
                sanity_low: { 
                    file: 'assets/audio/sfx/sanity_low.mp3', 
                    volume: 0.4 
                }
            }
        };
    }

    async init() {
        try {
            // 初始化Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.globalGain = this.audioContext.createGain();
            this.globalGain.connect(this.audioContext.destination);
            this.globalGain.gain.value = this.volume;

            // 预加载核心音频
            await this.preloadEssentialAudio();
            
            console.log('音频管理器初始化完成');
            return true;
        } catch (error) {
            console.warn('Web Audio API初始化失败，使用备用方案:', error);
            return this.initFallback();
        }
    }

    async preloadEssentialAudio() {
        const essential = [
            this.audioConfig.sfx.collect.file,
            this.audioConfig.sfx.whisper.file,
            this.audioConfig.ambient.title.file
        ];

        for (const file of essential) {
            await this.loadAudio(file);
        }
    }

    async loadAudio(url) {
        if (this.audioBuffers.has(url)) {
            return this.audioBuffers.get(url);
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(url, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`加载音频失败: ${url}`, error);
            return null;
        }
    }

    playAmbient(name) {
        if (this.muted) return;

        const config = this.audioConfig.ambient[name];
        if (!config) {
            console.warn(`环境音效不存在: ${name}`);
            return;
        }

        // 停止当前环境音
        this.stopAmbient();

        this.loadAudio(config.file).then(buffer => {
            if (!buffer) return;

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            source.loop = config.loop;
            
            source.connect(gainNode);
            gainNode.connect(this.globalGain);
            
            gainNode.gain.value = config.volume * this.volume;
            
            source.start(0);
            this.currentAmbient = { source, gainNode, config };
            
            console.log(`播放环境音: ${name}`);
        });
    }

    stopAmbient() {
        if (this.currentAmbient) {
            this.currentAmbient.source.stop();
            this.currentAmbient = null;
        }
    }

    playSound(name, options = {}) {
        if (this.muted) return null;

        const config = this.audioConfig.sfx[name];
        if (!config) {
            console.warn(`音效不存在: ${name}`);
            return null;
        }

        const { volume = 1.0, loop = false, onEnded } = options;

        return this.loadAudio(config.file).then(buffer => {
            if (!buffer) return null;

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            source.loop = loop;
            
            source.connect(gainNode);
            gainNode.connect(this.globalGain);
            
            gainNode.gain.value = config.volume * this.volume * volume;
            
            source.start(0);
            
            if (onEnded) {
                source.onended = onEnded;
            }

            // 添加到活跃音效集合
            const soundId = Date.now() + Math.random();
            this.activeSounds.add(soundId);
            source.onended = () => this.activeSounds.delete(soundId);

            return { source, gainNode, id: soundId };
        });
    }

    playPositionalSound(name, position, listenerPosition) {
        // 3D空间音效
        if (!this.audioContext || this.muted) return;

        const distance = position.distanceTo(listenerPosition);
        const maxDistance = 20;
        const volume = Math.max(0, 1 - distance / maxDistance);

        if (volume > 0.1) {
            this.playSound(name, { volume });
        }
    }

    playFootstep() {
        if (Math.random() > 0.3) return; // 随机播放脚步声
        this.playSound('step', { volume: 0.3 });
    }

    playHeartbeat(intensity = 1.0) {
        const volume = 0.2 + intensity * 0.3;
        this.playSound('heartbeat', { volume, loop: true });
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.globalGain) {
            this.globalGain.gain.value = this.volume;
        }
        
        // 更新UI
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        if (volumeSlider) volumeSlider.value = this.volume * 100;
        if (volumeValue) volumeValue.textContent = Math.round(this.volume * 100);
    }

    toggleMute() {
        this.muted = !this.muted;
        
        if (this.globalGain) {
            this.globalGain.gain.value = this.muted ? 0 : this.volume;
        }
        
        // 更新UI
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.innerHTML = this.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
            muteBtn.classList.toggle('muted', this.muted);
        }
        
        return this.muted;
    }

    pauseAll() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    resumeAll() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    update(listenerPosition) {
        // 更新空间音频位置
        // 这里可以添加3D音频处理逻辑
    }

    initFallback() {
        console.log('使用HTML5 Audio作为备用方案');
        // 备用方案：使用HTML5 Audio元素
        this.html5Audios = new Map();
        return true;
    }

    cleanup() {
        this.stopAmbient();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 导出给全局使用
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}

export { AudioManager };