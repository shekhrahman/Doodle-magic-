import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

interface DrawingCanvasProps {
  color: string;
  lineWidth: number;
}

export interface DrawingCanvasRef {
  getImageData: () => string;
  clear: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ color, lineWidth }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Use a ref to hold the latest props to avoid stale closures in callbacks.
  const propsRef = useRef({ color, lineWidth });
  propsRef.current = { color, lineWidth };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    contextRef.current = context;

    const resizeCanvas = () => {
      const currentProps = propsRef.current;
      const scale = window.devicePixelRatio || 1;
      const { offsetWidth, offsetHeight } = canvas;

      // Use Math.floor to prevent sub-pixel issues which can cause observer loops.
      const newWidth = Math.floor(offsetWidth * scale);
      const newHeight = Math.floor(offsetHeight * scale);

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        // When resizing, the canvas content is cleared by the browser.
        // We will explicitly refill it with white and reset the drawing styles.
        canvas.width = newWidth;
        canvas.height = newHeight;
        context.scale(scale, scale);
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, offsetWidth, offsetHeight);
        
        // Re-apply drawing styles as they are reset on resize
        context.lineCap = 'round';
        context.strokeStyle = currentProps.color;
        context.lineWidth = currentProps.lineWidth;
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    
    // Initial setup
    resizeCanvas();

    return () => resizeObserver.disconnect();
  }, []); // This effect runs only once to set up the observer.

  // These separate effects update the context's drawing styles when props change.
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = lineWidth;
    }
  }, [lineWidth]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const clientX = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientX : (e.nativeEvent as MouseEvent).clientX;
    const clientY = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientY : (e.nativeEvent as MouseEvent).clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    contextRef.current?.lineTo(x, y);
    contextRef.current?.stroke();
  };

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      const canvas = canvasRef.current;
      if (!canvas) return '';
      // Create a new canvas and draw the current canvas onto a white background.
      // This ensures the exported image is not transparent.
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      if (exportCtx) {
        exportCtx.fillStyle = 'white';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        exportCtx.drawImage(canvas, 0, 0);
        return exportCanvas.toDataURL('image/png').split(',')[1];
      }
      return canvas.toDataURL('image/png').split(',')[1];
    },
    clear: () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        // The drawing context is scaled, so clearing based on offsetWidth/Height
        // correctly covers the entire visible canvas area.
        const { offsetWidth, offsetHeight } = canvas;
        context.clearRect(0, 0, offsetWidth, offsetHeight);
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, offsetWidth, offsetHeight);
      }
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseLeave={finishDrawing}
      onMouseMove={draw}
      onTouchStart={startDrawing}
      onTouchEnd={finishDrawing}
      onTouchMove={draw}
      className="w-full h-full bg-white rounded-2xl shadow-inner border border-gray-200 cursor-crosshair"
      style={{ touchAction: 'none' }}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
