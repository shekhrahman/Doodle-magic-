import React from 'react';
import { LoadingSpinner } from './icons';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  resultImage: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, resultImage }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-yellow-600">
          <LoadingSpinner className="w-16 h-16 mb-4" />
          <p className="text-xl font-semibold">Our AI is working its magic...</p>
          <p className="text-md text-yellow-500">This can take a moment!</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600">
          <p className="text-5xl mb-4">😿</p>
          <p className="text-xl font-semibold">{error}</p>
        </div>
      );
    }

    if (resultImage) {
      return (
        <div className="w-full">
            <h3 className="text-2xl font-bold text-yellow-700 mb-3 text-center">Voilà! Your doodle is now a cartoon!</h3>
            <img 
                src={`data:image/png;base64,${resultImage}`}
                alt="AI generated cartoon" 
                className="rounded-2xl shadow-lg w-full aspect-square object-contain" 
            />
        </div>
      );
    }

    return (
      <div className="text-center text-yellow-600">
        <p className="text-5xl mb-4">🎨</p>
        <h3 className="text-2xl font-bold">Your cartoon masterpiece awaits!</h3>
        <p className="mt-2 text-lg">Draw something amazing and click the magic button!</p>
      </div>
    );
  };
  
  return (
    <div className="bg-yellow-50 p-6 rounded-2xl shadow-lg border border-yellow-200 min-h-[300px] flex items-center justify-center w-full">
      {renderContent()}
    </div>
  );
};

export default ResultDisplay;
