interface MetricTileProps {
  value: string;
  label: string;
}

export function MetricTile({ value, label }: MetricTileProps) {
  return (
    <div className="neo bg-white p-4 text-center">
      <div className="text-2xl font-bold text-black">{value}</div>
      <div className="text-sm font-medium text-black">{label}</div>
    </div>
  );
}
