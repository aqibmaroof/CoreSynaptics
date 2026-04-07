import React from "react";

const PriorityTasksCard = ({ data }) => {
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-red-900/20";
      case "medium":
        return "bg-yellow-900/20";
      case "low":
        return "bg-green-900/20";
      default:
        return "bg-gray-900/20";
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-lg font-semibold">{data.title}</h3>
        <button className="text-cyan-400 text-sm font-semibold hover:text-cyan-300">
          View All
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.tasks.map((task, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 ${getPriorityBg(task.priority)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-gray-200 font-medium text-sm">
                    {task.title}
                  </p>
                  <span
                    className={`text-xs font-semibold ${getPriorityColor(
                      task.priority,
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{task.description}</p>
              </div>
              <input type="checkbox" className="mt-1 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityTasksCard;
