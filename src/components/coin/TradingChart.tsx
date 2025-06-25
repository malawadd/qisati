export default function TradingChart({ address, className = "" }) {
    return (
      <div className={`neo bg-white border-4 border-black rounded-lg p-6 flex items-center justify-center h-full w-full ${className}`}>
        <span className="text-gray-400">[Trading Chart for {address}]</span>
      </div>
    );
  }
  