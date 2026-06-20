type Props = {
  score?: number;
  ratings?: number;
};

export default function ReputationCard({ score = 0, ratings = 0 }: Props) {
  return (
    <div
      className="
        border-2 border-black
        bg-green-200
        p-6
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      "
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-widest">
        Reputation
      </div>

      <div className="text-5xl font-black">{score}</div>

      <div className="mt-2 text-sm">{ratings} Ratings</div>
    </div>
  );
}
