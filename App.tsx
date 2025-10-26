import React, { useState, useRef, useCallback } from 'react';
import { cartoonizeDrawing } from './services/geminiService';
import ResultDisplay from './components/ResultDisplay';
import DrawingCanvas, { DrawingCanvasRef } from './components/MonsterStage';

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7'];
const BRUSH_SIZES = [4, 8, 16];

const App: React.FC = () => {
  const [color, setColor] = useState<string>(COLORS[0]);
  const [brushSize, setBrushSize] = useState<number>(BRUSH_SIZES[1]);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<DrawingCanvasRef>(null);

  const handleCartoonize = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const base64Image = canvasRef.current.getImageData();
      
      const result = await cartoonizeDrawing(base64Image);
      setResultImage(result);

    } catch (err) {
      console.error(err);
      setError('Oops! Our AI artist is taking a break. Please try again!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = () => {
    canvasRef.current?.clear();
    setResultImage(null);
    setError(null);
  };
  
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${resultImage}`;
    link.download = 'doodle-magic-cartoon.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-teal-50 text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="text-center mb-8 w-full max-w-3xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-teal-600 tracking-tight">
          Doodle Magic
        </h1>
        <p className="mt-2 text-lg text-teal-500">Turn your doodles into cartoon masterpieces!</p>
      </header>

      <main className="w-full max-w-3xl">
        {isLoading || error || resultImage ? (
          <div className="w-full space-y-4">
            <ResultDisplay isLoading={isLoading} error={error} resultImage={resultImage} />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleDownload}
                disabled={!resultImage || isLoading}
                className="w-full px-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-full shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Download
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-pink-500 text-white font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out disabled:bg-pink-300 disabled:cursor-not-allowed"
              >
                Draw Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-teal-100">
            <h2 className="text-2xl font-bold text-center text-pink-500 mb-4">Your Drawing Canvas</h2>
            
            <div className="flex justify-center items-center gap-4 flex-wrap border-b pb-4 border-gray-200">
                <span className="font-bold text-teal-700">Color:</span>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${color === c ? 'ring-4 ring-pink-400 border-white' : 'border-transparent'}`}></button>
                ))}
            </div>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                  <span className="font-bold text-teal-700">Brush Size:</span>
                  {BRUSH_SIZES.map(size => (
                      <button key={size} onClick={() => setBrushSize(size)} aria-label={`Brush size ${size}`} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform transform hover:scale-110 ${brushSize === size ? 'bg-pink-400 text-white border-white ring-2 ring-pink-400' : 'bg-gray-200 border-transparent'}`}>
                          <span className="block bg-black rounded-full" style={{width: `${size}px`, height: `${size}px`}}></span>
                      </button>
                  ))}
            </div>

            <div className="aspect-square w-full">
              <DrawingCanvas ref={canvasRef} color={color} lineWidth={brushSize} />
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gray-300 text-gray-700 font-bold text-lg rounded-full shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Clear Canvas
              </button>
              <button
                onClick={handleCartoonize}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-pink-500 text-white font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out disabled:bg-pink-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Make it a Cartoon!'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;