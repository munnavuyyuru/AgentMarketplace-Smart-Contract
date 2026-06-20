type Props = {
  review: any;
};

export default function ReviewCard({ review }: Props) {
  const reviewer =
    review.reviewer || review.reviewer_address || review.wallet || "Anonymous";

  const displayName =
    reviewer.length > 12
      ? `${reviewer.slice(0, 6)}...${reviewer.slice(-4)}`
      : reviewer;

  return (
    <div
      className="
        border-2 border-black
        bg-white
        p-5
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      "
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase">Reviewer</div>

          <div className="font-mono text-sm">{displayName}</div>
        </div>

        <div
          className="
            border-2 border-black
            bg-yellow-300
            px-3 py-1
            font-bold
          "
        >
          ⭐ {review.score || review.rating || 0}
        </div>
      </div>

      <p className="text-gray-700">{review.comment || "No comment"}</p>
    </div>
  );
}
