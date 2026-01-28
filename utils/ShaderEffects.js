// ShaderEffects.js - 恐怖视觉效果
class ShaderEffects {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.effects = {
            glitch: { enabled: false, intensity: 0 },
            noise: { enabled: false, amount: 0 },
            distortion: { enabled: false, strength: 0 },
            vignette: { enabled: true, darkness: 0.8 }
        };
        
        this.init();
    }

    init() {
        // 创建后期处理通道
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        
        // 添加各种效果通道
        this.setupEffects();
    }

    setupEffects() {
        // 故障效果
        this.glitchPass = new THREE.GlitchPass();
        this.glitchPass.enabled = false;
        this.composer.addPass(this.glitchPass);
        
        // 噪点效果
        this.noisePass = new THREE.FilmPass(0.35, 0.5, 648, false);
        this.noisePass.enabled = false;
        this.composer.addPass(this.noisePass);
        
        // 自定义着色器效果
        this.createCustomShaders();
    }

    createCustomShaders() {
        // 心跳效果着色器
        this.heartbeatShader = {
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                intensity: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float intensity;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv;
                    float pulse = sin(time * 5.0) * 0.5 + 0.5;
                    
                    // 屏幕中心向外的脉动
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(uv, center);
                    float effect = (1.0 - dist) * pulse * intensity;
                    
                    vec4 color = texture2D(tDiffuse, uv);
                    color.rgb += vec3(effect * 0.3, 0.0, 0.0); // 红色脉动
                    
                    gl_FragColor = color;
                }
            `
        };
        
        this.heartbeatPass = new THREE.ShaderPass(this.heartbeatShader);
        this.heartbeatPass.enabled = false;
        this.composer.addPass(this.heartbeatPass);
    }

    update(deltaTime, sanity) {
        // 根据理智值调整效果强度
        const sanityNormalized = sanity / 100;
        
        // 理智低时启用更多效果
        if (sanity < 30) {
            this.effects.glitch.enabled = true;
            this.effects.glitch.intensity = (30 - sanity) / 30;
            
            this.effects.distortion.enabled = true;
            this.effects.distortion.strength = (30 - sanity) / 30 * 0.1;
            
            // 心跳效果
            this.heartbeatPass.enabled = true;
            this.heartbeatPass.uniforms.intensity.value = (30 - sanity) / 30;
        } else {
            this.effects.glitch.enabled = false;
            this.effects.distortion.enabled = false;
            this.heartbeatPass.enabled = false;
        }
        
        // 更新效果参数
        if (this.glitchPass.enabled !== this.effects.glitch.enabled) {
            this.glitchPass.enabled = this.effects.glitch.enabled;
        }
        
        if (this.heartbeatPass.enabled) {
            this.heartbeatPass.uniforms.time.value += deltaTime;
        }
    }

    render() {
        this.composer.render();
    }

    resize(width, height) {
        this.composer.setSize(width, height);
    }
}

export { ShaderEffects };