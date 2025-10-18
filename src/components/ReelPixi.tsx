import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface ReelPixiProps {
  spinning: boolean;
  reels?: string[];
}

const SYMBOL_SIZE = 64;

export const ReelPixi: React.FC<ReelPixiProps> = ({ spinning, reels = ['⭐','🪐','🌠'] }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // create canvas manually and initialize Pixi Application using the v8 recommended API
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 80;
    containerRef.current.appendChild(canvas);
  // Use the canvas as the view when creating the Application to ensure ticker/renderer are initialized
  const app = new PIXI.Application({ view: canvas, width: 240, height: 80, backgroundAlpha: 0 });
    appRef.current = app;

    const style = new PIXI.TextStyle({ fontSize: 36 });

    const texts: PIXI.Text[] = [];
    for (let i = 0; i < 3; i++) {
      // v8 Text API: prefer object form to avoid deprecation issues
      const t = new (PIXI as any).Text({ text: reels[i] || ' ', style });
      t.x = i * 80 + 20;
      t.y = 10;
      app.stage.addChild(t);
      texts.push(t);
    }

    return () => {
      try {
        app.destroy(true, { children: true });
      } catch (e) {
        // ignore
      }
      appRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    // 간단한 애니메이션: spinning이면 텍스트를 빠르게 위아래로 이동
    let ticker = 0;
    const handle = () => {
      ticker++;
      app.stage.children.forEach((child, idx) => {
        const t = child as PIXI.Text;
        if (!t) return;
        if (spinning) {
          t.y = 10 + Math.sin((ticker + idx * 10) / 4) * 10;
        } else {
          t.y += (10 - t.y) * 0.2; // 부드럽게 원위치
        }
      });
    };

    app.ticker.add(handle);
    return () => {
      app.ticker.remove(handle);
    };
  }, [spinning]);

  return <div ref={containerRef} />;
};

export default ReelPixi;
