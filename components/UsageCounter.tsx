type UsageCounterProps = {
  used: number;
  limit: number;
};

export function UsageCounter({ used, limit }: UsageCounterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <p className="font-medium">{used} of {limit} rewrites used this month</p>
    </div>
  );
}
