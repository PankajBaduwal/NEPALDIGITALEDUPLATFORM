/**
 * Base Numerical Methods Visual Canvas Controller
 * Course Code: U25MA402 — Numerical Methods and Partial Differential Equations
 */

export abstract class BaseNumericalSimulation {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected animId: number | null = null;
  protected lastTimestamp = 0;
  protected timeSec = 0;
  protected isPlaying = true;
  protected width = 800;
  protected height = 500;
  protected dpr = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * PORT NOTE: the original base constructor called render() itself, but a subclass's field initialisers run only
   * after the base constructor returns, so render() read fields that were still undefined and the scene never
   * started. The factory now calls boot() once the whole object is built.
   */
  public boot(): void {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.startLoop();
  }

  public handleResize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect() || {
      width: 800,
      height: 500,
    };
    this.width = Math.max(320, Math.floor(rect.width));
    this.height = Math.max(260, Math.floor(rect.height));
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
    this.render();
  }

  public setPlaying(play: boolean) {
    this.isPlaying = play;
    if (play && !this.animId) {
      this.startLoop();
    }
  }

  public resetTime() {
    this.timeSec = 0;
    this.render();
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      if (this.isPlaying) {
        this.timeSec += Math.min(dt, 0.1);
        this.update(dt);
      }
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }

  // Draw modern dark engineering grid background
  protected drawBackground(title?: string) {
    const { ctx, width, height } = this;
    ctx.save();
    // Slate-950 background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillText(title, 16, 24);
    }
    ctx.restore();
  }

  public abstract update(dt: number): void;
  public abstract render(): void;
}
