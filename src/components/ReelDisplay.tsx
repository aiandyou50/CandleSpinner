// src/components/ReelDisplay.tsx
interface ReelDisplayProps {
  symbols: string[];
}

export const ReelDisplay = ({ symbols }: ReelDisplayProps) => {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-4xl"
        >
          {symbol}
        </div>
      ))}
    </div>
  );
};
