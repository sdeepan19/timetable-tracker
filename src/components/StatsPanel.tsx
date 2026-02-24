import { useTimetable } from "../store/useTimetable";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";

export const StatsPanel = () => {
  const { points, streak } = useTimetable();

  const badges = [
    { label: "First 10‑pt", earned: points >= 10, icon: <FaStar className="text-yellow-400" /> },
    { label: "3‑day streak", earned: streak >= 3, icon: <FaFire className="text-red-500" /> },
    { label: "100‑pt veteran", earned: points >= 100, icon: <FaTrophy className="text-purple-500" /> },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Your Progress</h2>
      <p className="mb-2"><strong>Points:</strong> {points}</p>
      <p className="mb-4"><strong>Streak:</strong> {streak} day{streak !== 1 && "s"}</p>

      <div className="flex space-x-3">
        {badges.map((b, i) => (
          <div
            key={i}
            className={`flex items-center space-x-1 p-2 rounded ${b.earned ? "bg-green-100" : "bg-gray-200"}`}
          >
            {b.icon}
            <span className="text-sm">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
