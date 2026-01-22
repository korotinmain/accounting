import React, { useMemo } from "react";
import PersonIcon from "@mui/icons-material/Person";
import { formatCurrency } from "../utils/formatters";

/**
 * Компонент статистики за особами
 * @param {Array} days - Масив днів
 */
const Statistics = ({ days }) => {
  const statistics = useMemo(() => {
    const personTotals = {};

    days.forEach((day) => {
      day.entries?.forEach((entry) => {
        if (!personTotals[entry.name]) {
          personTotals[entry.name] = 0;
        }
        personTotals[entry.name] += entry.amount;
      });
    });

    return Object.entries(personTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [days]);

  if (statistics.length === 0) {
    return null;
  }

  const maxTotal = statistics[0]?.total || 1;

  const getRankClass = (index) => {
    if (index === 0) return "rank-1";
    if (index === 1) return "rank-2";
    if (index === 2) return "rank-3";
    return "";
  };

  const getRankLabel = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  return (
    <div className="statistics-section">
      <h3 className="section-title">
        <PersonIcon style={{ fontSize: "1em" }} />
        Статистика по співробітниках
      </h3>
      <div className="statistics-grid">
        {statistics.map((stat, index) => (
          <div key={stat.name} className={`stat-card ${getRankClass(index)}`}>
            <div className="stat-rank">{getRankLabel(index)}</div>
            <div className="stat-name">{stat.name}</div>
            <div className="stat-amount">{formatCurrency(stat.total)} грн</div>
            <div className="stat-progress">
              <div
                className="stat-progress-bar"
                style={{ width: `${(stat.total / maxTotal) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
