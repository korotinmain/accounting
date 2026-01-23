import React from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import StyledButton from "./StyledButton";
import "../assets/components/TabSwitcher.css";

/**
 * Компонент перемикача між вкладками Personnel та Operational
 * @param {string} activeTab - Активна вкладка
 * @param {function} onTabChange - Callback для зміни вкладки
 */
const TabSwitcher = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <StyledButton
        variant={activeTab === "personnel" ? "primary" : "outlined"}
        size="large"
        fullWidth
        startIcon={<GroupsIcon />}
        onClick={() => onTabChange("personnel")}
        className="tab-button-styled"
      >
        Персонал
      </StyledButton>
      <StyledButton
        variant={activeTab === "operational" ? "primary" : "outlined"}
        size="large"
        fullWidth
        startIcon={<BusinessCenterIcon />}
        onClick={() => onTabChange("operational")}
        className="tab-button-styled"
      >
        Операційна
      </StyledButton>
    </div>
  );
};

export default TabSwitcher;
