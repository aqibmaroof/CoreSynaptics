export default function CircularProgress({
  value = 60,        // 0–100
  size = 30,        // px
  strokeWidth = 3,
  color = "#22c55e", // green by default
  trackColor = "#ffffff",
  textColor = "#ffffff",
  label = null,      // optional label below percentage
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        {/* SVG Ring */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>

       
      </div>

       {/* Center Label */}
        <div
          className=" flex items-center justify-center text-center"
          style={{ color: textColor }}
        >
          <span
            className="font-[500px] tabular-nums text-[14px] m-auto text-center"
            
          >
            {value}%
          </span>
        </div>
    </div>
  );
}
