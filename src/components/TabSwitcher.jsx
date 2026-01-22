import React from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import "./TabSwitcher.css";

/**
 * Компонент перемикача між вкладками Personnel та Operational
 * @param {string} activeTab - Активна вкладка
 * @param {function} onTabChange - Callback для зміни вкладки
 */
const TabSwitcher = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === "personnel" ? "active" : ""}`}
        onClick={() => onTabChange("personnel")}
      >
        <GroupsIcon style={{ fontSize: "1.2em", marginRight: "8px" }} />
        <span>Персонал</span>
      </button>
      <button
        className={`tab-button ${activeTab === "operational" ? "active" : ""}`}
        onClick={() => onTabChange("operational")}
      >
        <BusinessCenterIcon style={{ fontSize: "1.2em", marginRight: "8px" }} />
        <span>Операційна</span>
      </button>
    </div>
  );
};

export default TabSwitcher;
