






const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const TOTAL_LEVELS = 250;


const LEVEL_DESIGNS = [
  
  {
    name: "Neon Grid",
    bricks: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  
  {
    name: "Criss-Cross",
    bricks: [
      [3, 0, 3, 0, 3, 0, 3, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 2, 0, 2, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [3, 0, 3, 0, 3, 0, 3, 0]
    ]
  },
  
  {
    name: "The Fortress",
    bricks: [
      [3, 3, 3, 3, 3, 3, 3, 3],
      [3, 1, 1, 1, 1, 1, 1, 3],
      [3, 1, 2, 0, 0, 2, 1, 3],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 3, 3, 0, 0, 0]
    ]
  },
  
  {
    name: "Nuclear Core",
    bricks: [
      [3, 0, 0, 0, 0, 0, 0, 3],
      [0, 1, 3, 1, 1, 3, 1, 0],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 1, 3, 1, 1, 3, 1, 0],
      [3, 0, 0, 0, 0, 0, 0, 3]
    ]
  },
  
  {
    name: "Grand Master",
    bricks: [
      [3, 0, 0, 3, 3, 0, 0, 3],
      [0, 1, 2, 1, 1, 2, 1, 0],
      [1, 2, 3, 1, 1, 3, 2, 1],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [3, 0, 1, 3, 3, 1, 0, 3],
      [0, 0, 0, 1, 1, 0, 0, 0]
    ]
  }
];



const BRICK_TYPES = {
  STANDARD: 0,
  ARMORED: 1,
  EXPLOSIVE: 2,
  INDESTRUCTIBLE: 3
};


const POWERUP_TYPES = {
  WIDE_PADDLE: 'grow',
  MULTIBALL: 'multiball',
  STICKY: 'sticky',
  LASER: 'laser',
  FIREBALL: 'fireball',
  SHIELD: 'shield'
};


const THEME_COLORS = {
  cyan: '#00f2fe',
  pink: '#ff007f',
  blue: '#4f46e5',
  green: '#39ff14',
  yellow: '#fffb00',
  orange: '#ff6c00',
  purple: '#9d4edd',
  grey: '#475569',
  white: '#ffffff'
};







class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 8;
    this.speed = 7;
    this.attached = true; 
    this.isFireball = false;
    this.trail = [];
    this.maxTrail = 10;
  }

  update(dt, paddle) {
    if (this.attached) {
      this.x = paddle.x + paddle.width / 2;
      this.y = paddle.y - this.radius;
      this.vx = 0;
      this.vy = 0;
      this.trail = [];
      return;
    }

    
    this.x += this.vx * (dt / 16.666);
    this.y += this.vy * (dt / 16.666);

    
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (Math.abs(currentSpeed - this.speed) > 0.05 && currentSpeed > 0) {
      this.vx = (this.vx / currentSpeed) * this.speed;
      this.vy = (this.vy / currentSpeed) * this.speed;
    }

    
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }
  }

  draw(ctx, colors) {
    
    for (let i = 0; i < this.trail.length; i++) {
      const pos = this.trail[i];
      const alpha = (i + 1) / this.trail.length * 0.3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius - 1, 0, Math.PI * 2);
      ctx.fillStyle = this.isFireball ? `rgba(255, 108, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isFireball ? colors.orange : colors.white;
    ctx.shadowBlur = this.isFireball ? 12 : 5;
    ctx.shadowColor = this.isFireball ? colors.orange : colors.cyan;
    ctx.fill();
    ctx.shadowBlur = 0; 
  }

  launch(angle = -Math.PI / 4) {
    this.attached = false;
    this.vx = this.speed * Math.sin(angle);
    this.vy = this.speed * Math.cos(angle);
  }
}

class Paddle {
  constructor() {
    this.width = 110;
    this.baseWidth = 110;
    this.height = 15;
    this.x = (GAME_WIDTH - this.width) / 2;
    this.y = GAME_HEIGHT - 60;
    this.targetX = this.x; 
    this.color = THEME_COLORS.cyan;
    this.laserActive = false;
    this.stickyActive = false;
  }

  update(dt) {
    
    const ease = 0.35;
    this.x += (this.targetX - this.x) * ease * (dt / 16.666);

    
    if (this.x < 0) {
      this.x = 0;
      this.targetX = 0;
    }
    if (this.x + this.width > GAME_WIDTH) {
      this.x = GAME_WIDTH - this.width;
      this.targetX = GAME_WIDTH - this.width;
    }
  }

  draw(ctx, colors) {
    
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.fill();

    
    if (this.laserActive) {
      ctx.fillStyle = colors.green;
      ctx.shadowColor = colors.green;
      ctx.fillRect(this.x, this.y - 4, 6, 4);
      ctx.fillRect(this.x + this.width - 6, this.y - 4, 6, 4);
    }

    
    if (this.stickyActive) {
      ctx.fillStyle = colors.yellow;
      ctx.shadowColor = colors.yellow;
      ctx.fillRect(this.x + 10, this.y, this.width - 20, 3);
    }

    ctx.restore();
  }
}

class Brick {
  constructor(x, y, width, height, type, colIndex, rowIndex) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.col = colIndex;
    this.row = rowIndex;
    this.alive = true;
    
    
    this.maxHits = 1;
    if (type === BRICK_TYPES.ARMORED) this.maxHits = 3;
    if (type === BRICK_TYPES.INDESTRUCTIBLE) this.maxHits = Infinity;
    this.hitsLeft = this.maxHits;
    
    this.points = (type + 1) * 10;
    if (type === BRICK_TYPES.INDESTRUCTIBLE) this.points = 0;
  }

  hit() {
    if (this.type === BRICK_TYPES.INDESTRUCTIBLE) return false;
    this.hitsLeft--;
    if (this.hitsLeft <= 0) {
      this.alive = false;
      return true; 
    }
    return false; 
  }

  draw(ctx, colors) {
    if (!this.alive) return;

    let fillStyle = colors.pink;
    let strokeStyle = 'rgba(255,255,255,0.15)';
    let glow = 0;

    switch (this.type) {
      case BRICK_TYPES.STANDARD:
        fillStyle = colors.pink;
        glow = 4;
        break;
      case BRICK_TYPES.ARMORED:
        
        if (this.hitsLeft === 3) fillStyle = colors.cyan;
        else if (this.hitsLeft === 2) fillStyle = colors.blue;
        else fillStyle = '#3b82f6';
        glow = 6;
        break;
      case BRICK_TYPES.EXPLOSIVE:
        fillStyle = colors.orange;
        glow = 8;
        break;
      case BRICK_TYPES.INDESTRUCTIBLE:
        fillStyle = colors.grey;
        strokeStyle = colors.white;
        glow = 0;
        break;
    }

    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;

    if (glow > 0) {
      ctx.shadowBlur = glow;
      ctx.shadowColor = fillStyle;
    }

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 4);
    ctx.fill();
    ctx.stroke();

    
    if (this.type === BRICK_TYPES.ARMORED && this.hitsLeft < this.maxHits) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (this.hitsLeft === 2) {
        
        ctx.moveTo(this.x + this.width / 3, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 3, this.y + this.height);
      } else {
        
        ctx.moveTo(this.x + this.width / 3, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 3, this.y + this.height);
        
        ctx.moveTo(this.x + this.width * 0.7, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.6, this.y + this.height * 0.4);
        ctx.lineTo(this.x + this.width * 0.8, this.y);
      }
      ctx.stroke();
    }

    
    if (this.type === BRICK_TYPES.INDESTRUCTIBLE) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 5, this.y + this.height);
      ctx.lineTo(this.x + this.width - 5, this.y);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 24;
    this.height = 24;
    this.speed = 2.5;
    this.color = THEME_COLORS.yellow;
    this.label = 'P';

    switch (type) {
      case POWERUP_TYPES.WIDE_PADDLE:
        this.color = THEME_COLORS.cyan;
        this.label = 'W';
        break;
      case POWERUP_TYPES.MULTIBALL:
        this.color = THEME_COLORS.pink;
        this.label = 'M';
        break;
      case POWERUP_TYPES.STICKY:
        this.color = THEME_COLORS.yellow;
        this.label = 'S';
        break;
      case POWERUP_TYPES.LASER:
        this.color = THEME_COLORS.green;
        this.label = 'L';
        break;
      case POWERUP_TYPES.FIREBALL:
        this.color = THEME_COLORS.orange;
        this.label = 'F';
        break;
      case POWERUP_TYPES.SHIELD:
        this.color = THEME_COLORS.purple;
        this.label = 'U';
        break;
    }
  }

  update(dt) {
    this.y += this.speed * (dt / 16.666);
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    
    
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 11px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x + this.width/2, this.y + this.height/2 + 1);
    ctx.restore();
  }
}

class LaserBeam {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 3;
    this.height = 12;
    this.speed = 10;
    this.alive = true;
  }

  update(dt) {
    this.y -= this.speed * (dt / 16.666);
    if (this.y < -20) {
      this.alive = false;
    }
  }

  draw(ctx, colors) {
    ctx.save();
    ctx.fillStyle = colors.green;
    ctx.shadowBlur = 8;
    ctx.shadowColor = colors.green;
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color, text = '') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2; 
    this.size = Math.random() * 4 + 2;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
    this.gravity = 0.08;
    this.text = text;
    if (this.text) {
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -3.5;
      this.gravity = -0.01; 
      this.decay = 0.015;
    }
  }

  update(dt) {
    this.x += this.vx * (dt / 16.666);
    this.y += this.vy * (dt / 16.666);
    this.vy += this.gravity * (dt / 16.666);
    this.life -= this.decay * (dt / 16.666);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    if (this.text) {
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.font = 'bold 15px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, this.x, this.y);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}







class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    
    this.lastTime = 0;
    this.state = 'MENU'; 
    this.isEndless = false;
    this.endlessSeeds = [];
    this.score = 0;
    this.lives = 5;
    this.maxLives = 7;
    this.currentLevelIndex = 0;
    this.scoreMultiplier = 1;
    this.autoLaunchTimer = null;

    
    this.paddle = new Paddle();
    this.balls = [];
    this.bricks = [];
    this.powerups = [];
    this.lasers = [];
    this.particles = [];
    
    
    this.options = {
      volume: 0.7,
      theme: 'cyber-neon',
      particlesEnabled: true
    };
    
    
    this.activePowerups = {
      grow: 0,       
      laser: 0,
      sticky: 0,
      fireball: 0
    };
    
    this.shieldActive = false;
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;

    
    this.currentUser = null;

    
    this.stats = {
      highScore: 0,
      endlessHighScore: 0,
      endlessMaxLevel: 0,
      bricksBroken: 0,
      powerupsCollected: 0,
      gamesPlayed: 0
    };

    
    this.scaleFactor = 1;

    this.init();
  }

  init() {
    this.bindEvents();
    this.resizeCanvas();
    this.renderThemeClass();

    this.loadStats();
    this.buildLevelGrid();
    this.showScreen('screen-main-menu');
    this.updateWelcomeBanner();

    
    requestAnimationFrame((t) => this.loop(t));
  }

  updateWelcomeBanner() {
    const banner = document.getElementById('welcome-banner');
    if (!banner) return;
    if (this.currentUser) {
      banner.innerText = `PLAYER: ${this.currentUser.toUpperCase()}`;
    } else {
      banner.innerText = 'PLAYING AS GUEST';
    }
  }

  getUserUnlockedLevel() {
    if (this.currentUser) {
      const key = this.getUserKey(this.currentUser);
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data.unlockedLevel || 0;
    }
    return parseInt(localStorage.getItem('cyberbreak_unlocked_level') || '0');
  }

  setUserUnlockedLevel(level) {
    if (this.currentUser) {
      const key = this.getUserKey(this.currentUser);
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      data.unlockedLevel = level;
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem('cyberbreak_unlocked_level', String(level));
    }
  }

  


  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const clientWidth = parent.clientWidth;
    const clientHeight = parent.clientHeight;

    
    let w = clientWidth;
    let h = (clientWidth * GAME_HEIGHT) / GAME_WIDTH;

    
    if (h > clientHeight) {
      h = clientHeight;
      w = (clientHeight * GAME_WIDTH) / GAME_HEIGHT;
    }

    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = GAME_WIDTH * dpr;
    this.canvas.height = GAME_HEIGHT * dpr;

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    
    this.scaleFactor = w / GAME_WIDTH;
  }

  


  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== 'PLAYING') return;
      const rect = this.canvas.getBoundingClientRect();
      const canvasClientX = e.clientX - rect.left;
      this.paddle.targetX = (canvasClientX / rect.width) * GAME_WIDTH - this.paddle.width / 2;
    });

    
    this.canvas.addEventListener('click', (e) => {
      this.handleActionTrigger();
    });

    
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.state !== 'PLAYING') return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const canvasClientX = touch.clientX - rect.left;
      this.paddle.targetX = (canvasClientX / rect.width) * GAME_WIDTH - this.paddle.width / 2;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state !== 'PLAYING') return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const canvasClientX = touch.clientX - rect.left;
      this.paddle.targetX = (canvasClientX / rect.width) * GAME_WIDTH - this.paddle.width / 2;
    });

    this.canvas.addEventListener('touchend', (e) => {
      this.handleActionTrigger();
    });

    
    const keys = {};
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      
      if (e.key === ' ' || e.key === 'ArrowUp') {
        this.handleActionTrigger();
      }
      
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    
    this.keyboardUpdate = () => {
      if (this.state !== 'PLAYING') return;
      const step = 9;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        this.paddle.targetX -= step;
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        this.paddle.targetX += step;
      }
    };

    
    
    
    document.getElementById('btn-start-game').addEventListener('click', () => {
      window.gameAudio.resume();
      
      const savedLevel = this.getUserUnlockedLevel();
      this.startGame(savedLevel, false);
    });

    document.getElementById('btn-start-endless').addEventListener('click', () => {
      window.gameAudio.resume();
      this.startGame(0, true);
    });

    document.getElementById('btn-select-level').addEventListener('click', () => {
      window.gameAudio.resume();
      this.showScreen('screen-level-select');
    });

    document.getElementById('btn-open-stats').addEventListener('click', () => {
      this.updateStatsUI();
      this.showScreen('screen-stats');
    });

    document.getElementById('btn-open-settings').addEventListener('click', () => {
      this.showScreen('screen-settings');
    });

    document.getElementById('btn-open-help').addEventListener('click', () => {
      this.showScreen('screen-help');
    });

    
    document.getElementById('btn-close-level-select').addEventListener('click', () => this.showScreen('screen-main-menu'));
    document.getElementById('btn-close-settings').addEventListener('click', () => this.showScreen('screen-main-menu'));
    document.getElementById('btn-close-stats').addEventListener('click', () => this.showScreen('screen-main-menu'));
    document.getElementById('btn-close-help').addEventListener('click', () => this.showScreen('screen-main-menu'));

    
    document.getElementById('btn-pause-toggle').addEventListener('click', () => this.pauseGame());

    
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart-paused').addEventListener('click', () => {
      this.hideOverlay('overlay-pause');
      this.startGame(this.currentLevelIndex, this.isEndless);
    });
    document.getElementById('btn-exit-paused').addEventListener('click', () => {
      this.hideOverlay('overlay-pause');
      this.exitToMenu();
    });

    
    document.getElementById('btn-use-life').addEventListener('click', () => {
      this.hideOverlay('overlay-balllost');
      this.consumeLife();
    });
    document.getElementById('btn-restart-lost').addEventListener('click', () => {
      this.hideOverlay('overlay-balllost');
      this.startGame(this.currentLevelIndex, this.isEndless);
    });
    document.getElementById('btn-exit-lost').addEventListener('click', () => {
      this.hideOverlay('overlay-balllost');
      this.exitToMenu();
    });

    
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.hideOverlay('overlay-gameover');
      this.startGame(this.currentLevelIndex, this.isEndless);
    });
    document.getElementById('btn-exit-over').addEventListener('click', () => {
      this.hideOverlay('overlay-gameover');
      this.exitToMenu();
    });

    
    document.getElementById('btn-win-continue-endless').addEventListener('click', () => {
      this.continueIntoEndless();
    });
    document.getElementById('btn-win-replay').addEventListener('click', () => {
      this.hideOverlay('overlay-gamewin');
      this.startGame(0, false);
    });
    document.getElementById('btn-exit-win').addEventListener('click', () => {
      this.hideOverlay('overlay-gamewin');
      this.exitToMenu();
    });

    
    document.getElementById('btn-reset-stats').addEventListener('click', () => {
      if(confirm("Are you sure you want to clear your highscore and statistics?")) {
        this.resetStats();
      }
    });

    
    const volSlider = document.getElementById('slider-volume');
    volSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value) / 100;
      document.getElementById('volume-val').innerText = `${e.target.value}%`;
      this.options.volume = vol;
      window.gameAudio.setVolume(vol);
    });

    const themeSelect = document.getElementById('select-theme');
    themeSelect.addEventListener('change', (e) => {
      this.options.theme = e.target.value;
      this.renderThemeClass();
    });

    const particleToggle = document.getElementById('toggle-particles');
    particleToggle.addEventListener('change', (e) => {
      this.options.particlesEnabled = e.target.checked;
    });
  }

  


  handleActionTrigger() {
    if (this.state !== 'PLAYING') return;

    
    let launchedAny = false;
    this.balls.forEach(ball => {
      if (ball.attached) {
        ball.launch();
        launchedAny = true;
      }
    });

    if (launchedAny) {
      if (this.autoLaunchTimer) { clearTimeout(this.autoLaunchTimer); this.autoLaunchTimer = null; }
      window.gameAudio.playPaddleBounce();
      return;
    }

    
    if (this.paddle.laserActive && this.activePowerups.laser > 0) {
      
      this.lasers.push(new LaserBeam(this.paddle.x, this.paddle.y));
      this.lasers.push(new LaserBeam(this.paddle.x + this.paddle.width, this.paddle.y));
      window.gameAudio.playLaser();
    }
  }

  


  renderThemeClass() {
    document.body.className = '';
    document.body.classList.add(`theme-${this.options.theme}`);
  }

  


  showScreen(screenId) {
    const screens = ['screen-main-menu', 'screen-level-select', 'screen-settings', 'screen-stats', 'screen-help'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (id === screenId) {
        el.classList.remove('hidden');
        el.classList.add('active');
      } else {
        el.classList.add('hidden');
        el.classList.remove('active');
      }
    });
  }

  showOverlay(overlayId) {
    document.getElementById(overlayId).classList.remove('hidden');
  }

  hideOverlay(overlayId) {
    document.getElementById(overlayId).classList.add('hidden');
  }

  


  getLevelTheme(levelIndex) {
    if (levelIndex < 50) {
      return { name: "Neon Grid", class: "theme-neon-grid", range: "1-50", header: "Neon Grid (Levels 1-50)" };
    } else if (levelIndex < 100) {
      return { name: "Criss-Cross", class: "theme-criss-cross", range: "51-100", header: "Criss-Cross (Levels 51-100)" };
    } else if (levelIndex < 150) {
      return { name: "The Fortress", class: "theme-the-fortress", range: "101-150", header: "The Fortress (Levels 101-150)" };
    } else if (levelIndex < 200) {
      return { name: "Nuclear Core", class: "theme-nuclear-core", range: "151-200", header: "Nuclear Core (Levels 151-200)" };
    } else {
      return { name: "Grand Master", class: "theme-grand-master", range: "201-250", header: "Grand Master (Levels 201-250)" };
    }
  }

  


  buildLevelGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    
    const unlockedLevel = this.getUserUnlockedLevel();
    let currentThemeName = "";

    for (let index = 0; index < TOTAL_LEVELS; index++) {
      const theme = this.getLevelTheme(index);
      
      
      if (theme.name !== currentThemeName) {
        currentThemeName = theme.name;
        const header = document.createElement('div');
        header.className = `level-group-header ${theme.class}`;
        header.innerText = theme.header;
        grid.appendChild(header);
      }

      const card = document.createElement('div');
      card.className = `level-card ${theme.class}`;
      
      const isLocked = index > unlockedLevel;
      if (isLocked) {
        card.classList.add('locked');
      }

      const num = document.createElement('span');
      num.className = 'level-num';
      num.innerText = index + 1;
      card.appendChild(num);

      const status = document.createElement('span');
      status.className = 'level-status';
      status.innerText = isLocked ? "LOCKED" : (index === unlockedLevel ? "ACTIVE" : "CLEARED");
      if (index < unlockedLevel) {
        card.classList.add('completed');
      }
      card.appendChild(status);

      if (!isLocked) {
        card.addEventListener('click', () => {
          this.showScreen('screen-main-menu');
          this.startGame(index, false); 
        });
      }

      grid.appendChild(card);
    }
  }

  


  triggerScreenShake(intensity = 6, duration = 200) {
    this.screenShakeTime = duration;
    this.screenShakeIntensity = intensity;
  }

  


  spawnParticles(x, y, color, count = 12) {
    if (!this.options.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  





  startGame(levelIndex, isEndless = false) {
    this.state = 'PLAYING';
    this.isEndless = isEndless;
    this.currentLevelIndex = levelIndex;
    this.score = 0;
    this.lives = 5;
    this.balls = [];
    this.powerups = [];
    this.lasers = [];
    this.particles = [];
    
    if (isEndless && levelIndex === 0) {
      this.endlessSeeds = [];
    }

    
    Object.keys(this.activePowerups).forEach(key => this.activePowerups[key] = 0);
    this.shieldActive = false;
    
    
    this.paddle = new Paddle();
    this.paddle.baseWidth = Math.max(80, 110 - levelIndex * 0.15);
    this.paddle.width = this.paddle.baseWidth;

    
    const baseSpeed = 7 + Math.min(6, levelIndex * 0.03);
    const newBall = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - 80);
    newBall.speed = baseSpeed;
    this.balls.push(newBall);

    this.loadLevel(levelIndex);
    this.updateHUD();
    this.showScreen('none'); 
    document.getElementById('game-hud').classList.remove('hidden');

    this.stats.gamesPlayed++;
    this.saveStats();

    window.gameAudio.resume();

    
    this.scheduleAutoLaunch();
  }

  scheduleAutoLaunch() {
    if (this.autoLaunchTimer) clearTimeout(this.autoLaunchTimer);
    this.autoLaunchTimer = setTimeout(() => {
      if (this.state !== 'PLAYING') return;
      this.balls.forEach(ball => {
        if (ball.attached) ball.launch();
      });
      this.autoLaunchTimer = null;
    }, 2000);
  }

  continueIntoEndless() {
    this.hideOverlay('overlay-gamewin');
    
    const carryScore = this.score;
    const carryLives = this.lives;

    this.startGame(TOTAL_LEVELS, true); 
    
    this.score = carryScore;
    
    this.lives = Math.min(this.maxLives, carryLives + 1);
    this.updateHUD();

    const baseSpeed = 7 + Math.min(6, this.currentLevelIndex * 0.03);
    this.balls = [new Ball(GAME_WIDTH / 2, GAME_HEIGHT - 80)];
    this.balls[0].speed = baseSpeed;

    this.spawnTextParticle(GAME_WIDTH / 2, GAME_HEIGHT - 120, "+1 LIFE!", THEME_COLORS.green);
    window.gameAudio.playPowerupCollect();
  }

  spawnTextParticle(x, y, text, color = THEME_COLORS.green) {
    this.particles.push(new Particle(x, y, color, text));
  }

  loadLevel(levelIndex) {
    this.bricks = [];
    
    let grid;
    
    if (!this.isEndless) {
      if (levelIndex === 0) {
        grid = LEVEL_DESIGNS[0].bricks;
      } else if (levelIndex === 50) {
        grid = LEVEL_DESIGNS[1].bricks;
      } else if (levelIndex === 100) {
        grid = LEVEL_DESIGNS[2].bricks;
      } else if (levelIndex === 150) {
        grid = LEVEL_DESIGNS[3].bricks;
      } else if (levelIndex === 200) {
        grid = LEVEL_DESIGNS[4].bricks;
      }
    }

    if (!grid) {
      grid = this.generateDeterministicLevelGrid(levelIndex);
    }

    const rowsCount = grid.length;
    const colsCount = grid[0].length;

    const padTop = 100;
    const brickHeight = 22;
    const brickSpacing = 6;
    
    
    const marginHorizontal = 30;
    const totalSpacing = brickSpacing * (colsCount - 1);
    const brickWidth = (GAME_WIDTH - (marginHorizontal * 2) - totalSpacing) / colsCount;

    for (let row = 0; row < rowsCount; row++) {
      for (let col = 0; col < colsCount; col++) {
        const type = grid[row][col];
        if (type !== 0) { 
          let actualType = BRICK_TYPES.STANDARD;
          if (type === 1) actualType = BRICK_TYPES.STANDARD;
          else if (type === 2) actualType = BRICK_TYPES.ARMORED;
          else if (type === 3) actualType = BRICK_TYPES.EXPLOSIVE;
          else if (type === 4) actualType = BRICK_TYPES.INDESTRUCTIBLE;

          const bx = marginHorizontal + col * (brickWidth + brickSpacing);
          const by = padTop + row * (brickHeight + brickSpacing);
          
          this.bricks.push(new Brick(bx, by, brickWidth, brickHeight, actualType, col, row));
        }
      }
    }
  }

  generateDeterministicLevelGrid(levelIndex) {
    let seed;
    if (this.isEndless) {
      if (this.endlessSeeds[levelIndex] === undefined) {
        this.endlessSeeds[levelIndex] = Math.floor(Math.random() * 1000000);
      }
      seed = this.endlessSeeds[levelIndex];
    } else {
      seed = levelIndex + 12345;
    }

    const rand = this.createSeededRandom(seed);
    const theme = this.getLevelTheme(levelIndex);

    
    let rowsCount = 5;
    if (theme.name === "Neon Grid") {
      rowsCount = levelIndex < 25 ? 4 : 5;
    } else if (theme.name === "Criss-Cross") {
      rowsCount = 5;
    } else if (theme.name === "The Fortress") {
      rowsCount = levelIndex < 125 ? 5 : 6;
    } else if (theme.name === "Nuclear Core") {
      rowsCount = 6;
    } else { 
      rowsCount = levelIndex < 225 ? 6 : 7;
    }

    const colsCount = 8;
    const grid = [];
    for (let r = 0; r < rowsCount; r++) {
      grid.push(new Array(colsCount).fill(0));
    }

    let breakablesSpawned = 0;

    
    const progress = Math.min(1.0, levelIndex / 250);

    if (theme.name === "Neon Grid") {
      
      const spawnProb = 0.70 + progress * 0.15; 
      const armoredProb = 0.05 + progress * 0.20; 
      const explosiveProb = 0.05 + progress * 0.05; 

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < Math.ceil(colsCount / 2); c++) {
          if (rand() < spawnProb) {
            const typeRoll = rand();
            let cellValue = 1; 
            if (typeRoll < armoredProb) {
              cellValue = 2; 
              breakablesSpawned++;
            } else if (typeRoll < armoredProb + explosiveProb) {
              cellValue = 3; 
              breakablesSpawned++;
            } else {
              breakablesSpawned++;
            }
            grid[r][c] = cellValue;
            grid[r][colsCount - 1 - c] = cellValue;
          }
        }
      }
    } 
    else if (theme.name === "Criss-Cross") {
      
      const checkerPattern = rand() < 0.6;
      const spawnProb = 0.80 + progress * 0.10;
      const armoredProb = 0.20 + progress * 0.20; 
      const explosiveProb = 0.08 + progress * 0.07;
      const indestructibleProb = 0.02 + progress * 0.06;

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < Math.ceil(colsCount / 2); c++) {
          const fill = checkerPattern ? ((r + c) % 2 === 0) : (c % 2 === 0);
          if (fill && rand() < spawnProb) {
            const typeRoll = rand();
            let cellValue = 1;
            if (typeRoll < indestructibleProb && r < 4) {
              cellValue = 4; 
            } else if (typeRoll < indestructibleProb + explosiveProb) {
              cellValue = 3; 
              breakablesSpawned++;
            } else if (typeRoll < indestructibleProb + explosiveProb + armoredProb) {
              cellValue = 2; 
              breakablesSpawned++;
            } else {
              breakablesSpawned++;
            }
            grid[r][c] = cellValue;
            grid[r][colsCount - 1 - c] = cellValue;
          }
        }
      }
    } 
    else if (theme.name === "The Fortress") {
      
      const armoredProb = 0.25 + progress * 0.20;
      const explosiveProb = 0.10 + progress * 0.05;
      const indestructibleProb = 0.10 + progress * 0.08;

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < Math.ceil(colsCount / 2); c++) {
          const isOuter = (r === 0 || c === 0);
          if (isOuter) {
            
            const shieldRoll = rand();
            const cellValue = shieldRoll < indestructibleProb ? 4 : 2;
            if (cellValue !== 4) breakablesSpawned++;
            grid[r][c] = cellValue;
            grid[r][colsCount - 1 - c] = cellValue;
          } else {
            
            if (rand() < 0.65) {
              const innerRoll = rand();
              let cellValue = 1;
              if (innerRoll < explosiveProb) {
                cellValue = 3; 
                breakablesSpawned++;
              } else if (innerRoll < explosiveProb + armoredProb) {
                cellValue = 2; 
                breakablesSpawned++;
              } else {
                breakablesSpawned++;
              }
              grid[r][c] = cellValue;
              grid[r][colsCount - 1 - c] = cellValue;
            }
          }
        }
      }
    } 
    else if (theme.name === "Nuclear Core") {
      
      const armoredProb = 0.30 + progress * 0.15;
      const explosiveProb = 0.15 + progress * 0.10;
      const indestructibleProb = 0.12 + progress * 0.08;

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < Math.ceil(colsCount / 2); c++) {
          const isCenter = (c >= 2);
          if (isCenter) {
            
            if (rand() < 0.85) {
              const coreRoll = rand();
              let cellValue = 1;
              if (coreRoll < explosiveProb * 1.5) {
                cellValue = 3; 
                breakablesSpawned++;
              } else if (coreRoll < (explosiveProb * 1.5) + armoredProb) {
                cellValue = 2; 
                breakablesSpawned++;
              } else {
                breakablesSpawned++;
              }
              grid[r][c] = cellValue;
              grid[r][colsCount - 1 - c] = cellValue;
            }
          } else {
            
            const shieldRoll = rand();
            if (shieldRoll < indestructibleProb) {
              grid[r][c] = 4; 
              grid[r][colsCount - 1 - c] = 4;
            } else if (shieldRoll < indestructibleProb + armoredProb) {
              grid[r][c] = 2; 
              breakablesSpawned++;
              grid[r][colsCount - 1 - c] = 2;
            }
          }
        }
      }
    } 
    else { 
      
      const shapeIndex = Math.floor(rand() * 4);
      const armoredProb = 0.35 + progress * 0.15;
      const explosiveProb = 0.10 + progress * 0.05;
      const indestructibleProb = 0.15 + progress * 0.05;

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < Math.ceil(colsCount / 2); c++) {
          let spawn = false;
          if (shapeIndex === 0) { 
            spawn = (c >= r - 1);
          } else if (shapeIndex === 1) { 
            spawn = (c < r || c === 0);
          } else if (shapeIndex === 2) { 
            spawn = (r + c >= 2 && r + c <= rowsCount + 1);
          } else { 
            spawn = (r % 2 === 0 || c % 2 === 0);
          }

          if (spawn && rand() < 0.90) {
            const typeRoll = rand();
            let cellValue = 1;
            if (typeRoll < indestructibleProb && r < rowsCount - 1) {
              grid[r][c] = 4; 
              grid[r][colsCount - 1 - c] = 4;
            } else {
              if (typeRoll < indestructibleProb + explosiveProb) {
                cellValue = 3; 
                breakablesSpawned++;
              } else if (typeRoll < indestructibleProb + explosiveProb + armoredProb) {
                cellValue = 2; 
                breakablesSpawned++;
              } else {
                breakablesSpawned++;
              }
              grid[r][c] = cellValue;
              grid[r][colsCount - 1 - c] = cellValue;
            }
          }
        }
      }
    }

    
    if (breakablesSpawned < 3) {
      grid[0][1] = 3; 
      grid[0][colsCount - 2] = 3;
      grid[1][2] = 1; 
      grid[1][colsCount - 3] = 1;
    }

    return grid;
  }

  createSeededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.showOverlay('overlay-pause');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.hideOverlay('overlay-pause');
    this.lastTime = performance.now(); 
  }

  exitToMenu() {
    this.state = 'MENU';
    if (this.autoLaunchTimer) { clearTimeout(this.autoLaunchTimer); this.autoLaunchTimer = null; }
    document.getElementById('game-hud').classList.add('hidden');
    this.showScreen('screen-main-menu');
    this.buildLevelGrid();
    this.updateWelcomeBanner();
  }

  


  loop(time) {
    const dt = time - this.lastTime;
    this.lastTime = time;

    
    const clampedDt = Math.min(dt, 100);

    if (this.state === 'PLAYING') {
      this.keyboardUpdate();
      this.update(clampedDt);
    }
    
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  





  update(dt) {
    
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    
    Object.keys(this.activePowerups).forEach(key => {
      if (this.activePowerups[key] > 0) {
        this.activePowerups[key] -= dt;
        
        
        if (this.activePowerups[key] <= 0) {
          this.deactivatePowerUp(key);
        }
      }
    });

    
    this.paddle.update(dt);

    
    this.balls.forEach((ball, index) => {
      ball.update(dt, this.paddle);
      this.checkBallWallCollisions(ball);
      this.checkBallPaddleCollision(ball);
      this.checkBallBrickCollisions(ball);
    });

    
    const originalBallCount = this.balls.length;
    this.balls = this.balls.filter(ball => ball.y < GAME_HEIGHT + ball.radius);

    
    if (this.balls.length === 0) {
      
      if (this.shieldActive) {
        this.shieldActive = false;
        
        const replacement = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - 100);
        replacement.attached = false;
        replacement.vx = 0;
        replacement.vy = -replacement.speed;
        this.balls.push(replacement);
        window.gameAudio.playPaddleBounce();
        this.triggerScreenShake(4, 150);
      } else {
        this.showBallLostPopup();
      }
    }

    
    this.lasers.forEach(laser => {
      laser.update(dt);
      this.checkLaserBrickCollisions(laser);
    });
    this.lasers = this.lasers.filter(laser => laser.alive);

    
    this.powerups.forEach(pwr => {
      pwr.update(dt);
      this.checkPowerupPaddleCollision(pwr);
    });
    this.powerups = this.powerups.filter(pwr => pwr.y < GAME_HEIGHT + 20);

    
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    
    this.checkLevelVictoryCondition();

    
    this.updatePowerupMetersUI();
  }

  


  checkBallWallCollisions(ball) {
    
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
      window.gameAudio.playWallBounce();
      this.spawnParticles(ball.x, ball.y, THEME_COLORS.cyan, 3);
    }
    
    if (ball.x + ball.radius > GAME_WIDTH) {
      ball.x = GAME_WIDTH - ball.radius;
      ball.vx = -ball.vx;
      window.gameAudio.playWallBounce();
      this.spawnParticles(ball.x, ball.y, THEME_COLORS.cyan, 3);
    }
    
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      window.gameAudio.playWallBounce();
      this.spawnParticles(ball.x, ball.y, THEME_COLORS.cyan, 3);
    }
  }

  


  checkBallPaddleCollision(ball) {
    if (ball.attached) return;

    
    if (ball.y + ball.radius >= this.paddle.y && 
        ball.y - ball.radius <= this.paddle.y + this.paddle.height &&
        ball.x + ball.radius >= this.paddle.x && 
        ball.x - ball.radius <= this.paddle.x + this.paddle.width) {
      
      
      if (ball.vy > 0) {
        if (this.paddle.stickyActive && this.activePowerups.sticky > 0) {
          
          ball.attached = true;
          document.getElementById('launch-hint').classList.remove('hidden');
          window.gameAudio.playPowerupCollect();
          return;
        }

        
        const hitPosition = (ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
        
        
        const maxAngle = (70 * Math.PI) / 180; 
        const angle = hitPosition * maxAngle;

        ball.vx = ball.speed * Math.sin(angle);
        ball.vy = -ball.speed * Math.cos(angle);
        
        
        ball.y = this.paddle.y - ball.radius;

        window.gameAudio.playPaddleBounce();
        this.spawnParticles(ball.x, ball.y, this.paddle.color, 5);
      }
    }
  }

  


  checkBallBrickCollisions(ball) {
    if (ball.attached) return;

    for (let brick of this.bricks) {
      if (!brick.alive) continue;

      
      const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
      const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

      
      const distanceX = ball.x - closestX;
      const distanceY = ball.y - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

      if (distanceSquared < (ball.radius * ball.radius)) {
        
        this.handleBrickImpact(brick, ball.isFireball);

        
        if (ball.isFireball && brick.type !== BRICK_TYPES.INDESTRUCTIBLE) {
          
          continue;
        }

        
        
        const overlapX = ball.radius - Math.abs(distanceX);
        const overlapY = ball.radius - Math.abs(distanceY);

        if (closestX === brick.x || closestX === brick.x + brick.width) {
          
          if (overlapX < overlapY || distanceY === 0) {
            ball.vx = distanceX > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
            ball.x += ball.vx > 0 ? overlapX : -overlapX; 
          } else {
            ball.vy = distanceY > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
            ball.y += ball.vy > 0 ? overlapY : -overlapY; 
          }
        } else {
          
          ball.vy = distanceY > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
          ball.y += ball.vy > 0 ? overlapY : -overlapY; 
        }
        
        break; 
      }
    }
  }

  


  checkLaserBrickCollisions(laser) {
    for (let brick of this.bricks) {
      if (!brick.alive) continue;

      
      if (laser.x >= brick.x && laser.x <= brick.x + brick.width &&
          laser.y >= brick.y && laser.y <= brick.y + brick.height) {
        
        laser.alive = false;
        this.handleBrickImpact(brick, true); 
        break;
      }
    }
  }

  


  handleBrickImpact(brick, bypassHits = false) {
    if (!brick.alive) return;

    if (brick.type === BRICK_TYPES.INDESTRUCTIBLE) {
      window.gameAudio.playArmoredHit();
      this.spawnParticles(brick.x + brick.width/2, brick.y + brick.height/2, THEME_COLORS.grey, 4);
      return;
    }

    const wasDestroyed = bypassHits ? (brick.alive = false, true) : brick.hit();
    
    
    if (wasDestroyed) {
      const themeColorsArray = Object.values(THEME_COLORS);
      const randomColor = themeColorsArray[Math.floor(Math.random() * themeColorsArray.length)];
      const addedPoints = brick.points * this.scoreMultiplier;
      this.score += addedPoints;
      this.updateHUD();
      this.stats.bricksBroken++;
      this.spawnTextParticle(brick.x + brick.width / 2, brick.y + brick.height / 2, `+${addedPoints}`, randomColor);

      if (brick.type === BRICK_TYPES.EXPLOSIVE) {
        window.gameAudio.playExplosion();
        this.triggerScreenShake(8, 250);
        this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, THEME_COLORS.orange, 25);
        this.triggerExplosiveChain(brick);
      } else {
        window.gameAudio.playBrickBreak();
        this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, randomColor, 10);
      }

      
      if (Math.random() < 0.18) {
        this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height);
      }
    } else {
      
      window.gameAudio.playArmoredHit();
      this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, THEME_COLORS.cyan, 4);
    }

    this.saveStats();
  }

  


  triggerExplosiveChain(sourceBrick) {
    
    const splashRadius = 90;
    const sourceCenterX = sourceBrick.x + sourceBrick.width / 2;
    const sourceCenterY = sourceBrick.y + sourceBrick.height / 2;

    this.bricks.forEach(brick => {
      if (!brick.alive || brick === sourceBrick) return;

      const brickCenterX = brick.x + brick.width / 2;
      const brickCenterY = brick.y + brick.height / 2;
      const dist = Math.hypot(brickCenterX - sourceCenterX, brickCenterY - sourceCenterY);

      if (dist < splashRadius) {
        
        this.handleBrickImpact(brick, true);
      }
    });
  }

  


  spawnPowerUp(x, y) {
    const list = Object.values(POWERUP_TYPES);
    const chosen = list[Math.floor(Math.random() * list.length)];
    this.powerups.push(new PowerUp(x, y, chosen));
    window.gameAudio.playPowerupSpawn();
  }

  


  checkPowerupPaddleCollision(pwr) {
    if (pwr.x + pwr.width >= this.paddle.x && 
        pwr.x <= this.paddle.x + this.paddle.width &&
        pwr.y + pwr.height >= this.paddle.y && 
        pwr.y <= this.paddle.y + this.paddle.height) {
      
      pwr.y = GAME_HEIGHT + 100; 
      this.activatePowerUp(pwr.type);
      
      this.stats.powerupsCollected++;
      this.saveStats();
    }
  }

  


  activatePowerUp(type) {
    window.gameAudio.playPowerupCollect();
    this.spawnParticles(this.paddle.x + this.paddle.width / 2, this.paddle.y, THEME_COLORS.yellow, 12);

    const duration = 8000; 

    switch (type) {
      case POWERUP_TYPES.WIDE_PADDLE:
        this.activePowerups.grow = duration;
        this.paddle.width = this.paddle.baseWidth * 1.5;
        this.paddle.color = THEME_COLORS.green;
        break;
      case POWERUP_TYPES.LASER:
        this.activePowerups.laser = duration;
        this.paddle.laserActive = true;
        this.paddle.color = THEME_COLORS.green;
        break;
      case POWERUP_TYPES.STICKY:
        this.activePowerups.sticky = duration;
        this.paddle.stickyActive = true;
        this.paddle.color = THEME_COLORS.yellow;
        break;
      case POWERUP_TYPES.FIREBALL:
        this.activePowerups.fireball = duration;
        this.balls.forEach(b => b.isFireball = true);
        break;
      case POWERUP_TYPES.MULTIBALL:
        
        const baseBall = this.balls[0] || { x: GAME_WIDTH/2, y: GAME_HEIGHT-100, speed: 7 };
        for (let i = 0; i < 2; i++) {
          const extra = new Ball(baseBall.x, baseBall.y);
          extra.attached = false;
          extra.isFireball = this.activePowerups.fireball > 0;
          
          const angle = -Math.PI / 4 + (Math.random() * Math.PI / 2);
          extra.vx = extra.speed * Math.sin(angle);
          extra.vy = -Math.abs(extra.speed * Math.cos(angle));
          this.balls.push(extra);
        }
        break;
      case POWERUP_TYPES.SHIELD:
        
        this.shieldActive = true;
        break;
    }
  }

  


  deactivatePowerUp(type) {
    if (type === 'grow') {
      this.paddle.width = this.paddle.baseWidth;
    } else if (type === 'laser') {
      this.paddle.laserActive = false;
    } else if (type === 'sticky') {
      this.paddle.stickyActive = false;
    } else if (type === 'fireball') {
      this.balls.forEach(b => b.isFireball = false);
    }
    
    
    if (this.activePowerups.grow <= 0 && this.activePowerups.laser <= 0 && this.activePowerups.sticky <= 0) {
      this.paddle.color = THEME_COLORS.cyan;
    }
  }

  


  showBallLostPopup() {
    this.state = 'BALLLOST';
    window.gameAudio.playLifeLost();
    this.triggerScreenShake(12, 350);
    const livesLeft = this.lives - 1; 
    document.getElementById('balllost-lives-count').innerText = livesLeft;
    const lifeBtn = document.getElementById('btn-use-life');
    if (livesLeft <= 0) {
      lifeBtn.disabled = true;
      lifeBtn.style.opacity = '0.4';
    } else {
      lifeBtn.disabled = false;
      lifeBtn.style.opacity = '1';
    }
    this.showOverlay('overlay-balllost');
  }

  


  consumeLife() {
    this.lives--;
    this.updateHUD();
    this.triggerScreenShake(8, 250);

    
    this.deactivatePowerUp('grow');
    this.deactivatePowerUp('laser');
    this.deactivatePowerUp('sticky');
    this.deactivatePowerUp('fireball');
    Object.keys(this.activePowerups).forEach(k => this.activePowerups[k] = 0);

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      
      const baseSpeed = 7 + Math.min(6, this.currentLevelIndex * 0.03);
      const replacementBall = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - 80);
      replacementBall.speed = baseSpeed;
      this.balls = [replacementBall];
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      this.scheduleAutoLaunch();
    }
  }

  checkLevelVictoryCondition() {
    
    const breakablesRemaining = this.bricks.some(b => b.alive && b.type !== BRICK_TYPES.INDESTRUCTIBLE);
    
    if (!breakablesRemaining && this.bricks.length > 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.state = 'PAUSED';
    window.gameAudio.playLevelComplete();
    this.triggerScreenShake(6, 400);

    const clearedLevelNum = this.currentLevelIndex + 1;
    
    
    if (clearedLevelNum % 5 === 0) {
      if (this.lives < this.maxLives) {
        this.lives++;
        this.updateHUD();
        this.spawnTextParticle(GAME_WIDTH / 2, GAME_HEIGHT - 120, "+1 LIFE!", THEME_COLORS.green);
      }
    }

    
    if (this.isEndless) {
      if (this.score > this.stats.endlessHighScore) {
        this.stats.endlessHighScore = this.score;
      }
      if (clearedLevelNum > this.stats.endlessMaxLevel) {
        this.stats.endlessMaxLevel = clearedLevelNum;
      }
    } else {
      if (this.score > this.stats.highScore) {
        this.stats.highScore = this.score;
      }
    }
    this.saveStats();

    
    const unlockedLevel = this.getUserUnlockedLevel();
    if (!this.isEndless && this.currentLevelIndex === unlockedLevel && unlockedLevel < TOTAL_LEVELS - 1) {
      this.setUserUnlockedLevel(unlockedLevel + 1);
    }

    setTimeout(() => {
      if (this.isEndless || this.currentLevelIndex < TOTAL_LEVELS - 1) {
        
        this.currentLevelIndex++;
        this.loadLevel(this.currentLevelIndex);
        this.updateHUD();
        
        
        this.paddle.baseWidth = Math.max(80, 110 - this.currentLevelIndex * 0.15);
        this.paddle.width = this.paddle.baseWidth;
        
        
        const baseSpeed = 7 + Math.min(6, this.currentLevelIndex * 0.03);
        const ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - 80);
        ball.speed = baseSpeed;
        this.balls = [ball];
        
        this.powerups = [];
        this.lasers = [];
        
        this.state = 'PLAYING';
        this.lastTime = performance.now();
        this.scheduleAutoLaunch();
      } else {
        
        this.gameWin();
      }
    }, 1800);
  }

  gameOver() {
    this.state = 'GAMEOVER';
    window.gameAudio.playGameOver();
    
    document.getElementById('summary-score-over').innerText = this.score;
    document.getElementById('summary-bricks-over').innerText = this.stats.bricksBroken;
    
    document.getElementById('game-hud').classList.add('hidden');
    this.showOverlay('overlay-gameover');
  }

  gameWin() {
    this.state = 'GAMEWIN';
    
    const lifeBonus = this.lives * 500;
    const finalScore = this.score + lifeBonus;

    document.getElementById('summary-score-win').innerText = finalScore;
    document.getElementById('summary-lives-win').innerText = `${this.lives} x 500 = +${lifeBonus}`;
    
    
    if (finalScore > this.stats.highScore) {
      this.stats.highScore = finalScore;
      this.saveStats();
    }

    document.getElementById('game-hud').classList.add('hidden');
    this.showOverlay('overlay-gamewin');
  }

  





  updateHUD() {
    document.getElementById('hud-score').innerText = String(this.score).padStart(5, '0');
    const theme = this.getLevelTheme(this.currentLevelIndex);
    document.getElementById('hud-level').innerText = `${this.currentLevelIndex + 1}${this.isEndless ? ' E' : ''} (${theme.name})`;

    
    const livesDiv = document.getElementById('hud-lives');
    livesDiv.innerHTML = '';
    
    for (let i = 0; i < this.maxLives; i++) {
      const heart = document.createElement('span');
      heart.classList.add('hud-heart');
      if (i < this.lives) {
        heart.innerText = '\u2764'; 
        heart.style.color = '#ff007f';
        heart.style.textShadow = '0 0 6px rgba(255,0,127,0.7)';
      } else {
        heart.innerText = '\u2661'; 
        heart.style.color = 'rgba(255,255,255,0.15)';
        heart.style.textShadow = 'none';
      }
      heart.style.fontSize = '16px';
      heart.style.lineHeight = '1';
      livesDiv.appendChild(heart);
    }
  }

  updatePowerupMetersUI() {
    const parent = document.getElementById('powerup-indicators');
    parent.innerHTML = '';

    
    const keys = [
      { key: 'grow', label: 'WIDE', color: THEME_COLORS.cyan },
      { key: 'laser', label: 'LASER', color: THEME_COLORS.green },
      { key: 'sticky', label: 'STICKY', color: THEME_COLORS.yellow },
      { key: 'fireball', label: 'FIRE', color: THEME_COLORS.orange }
    ];

    keys.forEach(p => {
      const remaining = this.activePowerups[p.key];
      if (remaining > 0) {
        const pct = (remaining / 8000) * 100;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'pwr-indicator-bar';
        
        const icon = document.createElement('span');
        icon.className = 'pwr-indicator-icon';
        icon.style.backgroundColor = p.color;
        wrapper.appendChild(icon);

        const name = document.createElement('span');
        name.innerText = p.label;
        wrapper.appendChild(name);

        const fill = document.createElement('div');
        fill.className = 'pwr-indicator-fill';
        
        const bar = document.createElement('div');
        bar.className = 'pwr-indicator-progress';
        bar.style.backgroundColor = p.color;
        bar.style.width = `${pct}%`;
        fill.appendChild(bar);
        
        wrapper.appendChild(fill);
        parent.appendChild(wrapper);
      }
    });
  }

  updateStatsUI() {
    document.getElementById('stat-high-score').innerText = this.stats.highScore;
    document.getElementById('stat-endless-high').innerText = this.stats.endlessHighScore || 0;
    document.getElementById('stat-endless-level').innerText = this.stats.endlessMaxLevel || 0;
    document.getElementById('stat-bricks-broken').innerText = this.stats.bricksBroken;
    document.getElementById('stat-powerups-collected').innerText = this.stats.powerupsCollected;
    document.getElementById('stat-games-played').innerText = this.stats.gamesPlayed;
  }

  





  loadStats() {
    let key = 'cyberbreak_stats';
    if (this.currentUser) {
      const ukey = this.getUserKey(this.currentUser);
      const ud = JSON.parse(localStorage.getItem(ukey) || '{}');
      if (ud.stats) { this.stats = { ...this.stats, ...ud.stats }; return; }
    }
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.stats = { ...this.stats, ...parsed };
      } catch(e) {
        console.error(e);
      }
    }
  }

  saveStats() {
    if (this.isEndless) {
      if (this.score > this.stats.endlessHighScore) {
        this.stats.endlessHighScore = this.score;
      }
      const lvlNum = this.currentLevelIndex + 1;
      if (lvlNum > this.stats.endlessMaxLevel) {
        this.stats.endlessMaxLevel = lvlNum;
      }
    } else {
      if (this.score > this.stats.highScore) {
        this.stats.highScore = this.score;
      }
    }
    localStorage.setItem('cyberbreak_stats', JSON.stringify(this.stats));
  }

  resetStats() {
    this.stats = {
      highScore: 0,
      endlessHighScore: 0,
      endlessMaxLevel: 0,
      bricksBroken: 0,
      powerupsCollected: 0,
      gamesPlayed: 0
    };
    this.setUserUnlockedLevel(0);
    this.saveStats();
    this.updateStatsUI();
    this.buildLevelGrid();
  }

  





  draw() {
    
    this.ctx.fillStyle = '#080710';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    
    this.ctx.save();
    if (this.screenShakeTime > 0) {
      const dx = (Math.random() - 0.5) * this.screenShakeIntensity;
      const dy = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.ctx.translate(dx, dy);
    }

    
    if (this.shieldActive && this.state === 'PLAYING') {
      this.ctx.save();
      this.ctx.strokeStyle = THEME_COLORS.purple;
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = THEME_COLORS.purple;
      this.ctx.beginPath();
      
      this.ctx.moveTo(0, GAME_HEIGHT - 10);
      this.ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 10);
      this.ctx.stroke();
      this.ctx.restore();
    }

    
    this.bricks.forEach(brick => brick.draw(this.ctx, THEME_COLORS));

    
    this.lasers.forEach(laser => laser.draw(this.ctx, THEME_COLORS));

    
    this.powerups.forEach(pwr => pwr.draw(this.ctx));

    
    this.paddle.draw(this.ctx, THEME_COLORS);

    
    this.balls.forEach(ball => ball.draw(this.ctx, THEME_COLORS));

    
    this.particles.forEach(p => p.draw(this.ctx));

    this.ctx.restore(); 
  }
}


window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
