import React, { useEffect, useRef } from 'react';

// Dynamically import PIXI to avoid static bundle-time API mismatch and to allow
// safe progressive enhancement. We won't import here to keep SSR/build safe.

interface ReelPixiProps {
  spinning: boolean;
  reels?: string[];
}

const SYMBOL_SIZE = 64;

export const ReelPixi: React.FC<ReelPixiProps> = ({ spinning, reels = ['⭐','🪐','🌠'] }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;
    const init = async () => {
      try {
        const PIXI = await import('pixi.js');
        if (!mounted || !containerRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 80;
        containerRef.current.appendChild(canvas);

        // Create the application using the provided canvas as view
        // @ts-ignore - dynamic PIXI types
        const app = new (PIXI as any).Application();
        await app.init({ view: canvas, width: 240, height: 80, background: { alpha: 0 } });
        appRef.current = app;

        // @ts-ignore
        const style = new (PIXI as any).TextStyle({ fontSize: 36, fill: 0xffffff });

        const texts: any[] = [];
        for (let i = 0; i < 3; i++) {
          // @ts-ignore
          const t = new (PIXI as any).Text({ text: reels[i] || ' ', style });
          t.x = i * 80 + 20;
          t.y = 10;
          // @ts-ignore
          app.stage.addChild(t);
          texts.push(t);
        }
      } catch (err) {
        // If PIXI fails to load or APIs mismatch, leave the container empty and do not crash.
        console.warn('ReelPixi initialization failed', err);
        appRef.current = null;
      }
    };
    init();

    return () => {
      mounted = false;
      try {
        if (appRef.current) appRef.current.destroy(true, { children: true });
      } catch (e) {
        // ignore
      }
      appRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [reels]);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    // 간단한 애니메이션: spinning이면 텍스트를 빠르게 위아래로 이동
    let ticker = 0;
    const handle = () => {
      ticker++;
      // @ts-ignore
      app.stage.children.forEach((child: any, idx: any) => {
        const t: any = child;
        if (!t) return;
        if (spinning) {
          t.y = 10 + Math.sin((ticker + idx * 10) / 4) * 10;
        } else {
          t.y += (10 - t.y) * 0.2; // smooth return
        }
      });
    };

    // @ts-ignore
    if (app && app.ticker && app.ticker.add) {
      // @ts-ignore
      app.ticker.add(handle);
      return () => {
        try {
          // @ts-ignore
          app.ticker.remove(handle);
        } catch (e) {}
      };
    }
    return () => {};
  }, [spinning]);

  return <div ref={containerRef} />;
};

export default ReelPixi;
