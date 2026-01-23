import React from "react";
import "../../assets/components/EntryForm.css";
import StyledButton from "../StyledButton";
import { FormInput } from "../common";

/**
 * Форма для додавання запису (депозит або знімання)
 * @param {string} personName - Ім'я персони
 * @param {string} amount - Сума
 * @param {function} onPersonNameChange - Зміна імені
 * @param {function} onAmountChange - Зміна суми
 * @param {function} onAddEntry - Додати запис
 * @param {array} quickAmounts - Швидкі суми
 * @param {string} entryType - Тип запису ('deposits' або 'withdrawals')
 */
const EntryForm = ({
  personName,
  amount,
  onPersonNameChange,
  onAmountChange,
  onAddEntry,
  quickAmounts = [100, 500, 1000, 5000],
  entryType = "deposits",
}) => {
  const handleQuickAmount = (quickAmount) => {
    onAmountChange({ target: { value: quickAmount.toString() } });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onAddEntry();
    }
  };

  return (
    <div className="entry-form">
      <FormInput
        label={entryType === "deposits" ? "Ім'я" : "Назва витрати"}
        id="person-name"
        type="text"
        value={personName}
        onChange={onPersonNameChange}
        placeholder={
          entryType === "deposits" ? "Введіть ім'я" : "Введіть назву"
        }
        className="entry-form-input"
        onKeyPress={handleKeyPress}
      />

      <FormInput
        label="Сума"
        id="amount"
        type="number"
        value={amount}
        onChange={onAmountChange}
        placeholder="Введіть суму"
        className="entry-form-input"
        onKeyPress={handleKeyPress}
      />

      <div className="quick-amounts">
        <span className="quick-amounts-label">Швидкі суми:</span>
        <div className="quick-amounts-buttons">
          {quickAmounts.map((qa) => (
            <StyledButton
              key={qa}
              variant="outlined"
              size="small"
              onClick={() => handleQuickAmount(qa)}
            >
              {qa}
            </StyledButton>
          ))}
        </div>
      </div>

      <StyledButton
        variant="success"
        icon={entryType === "deposits" ? "AddCircle" : "RemoveCircle"}
        onClick={onAddEntry}
        className="entry-form-submit"
      >
        {entryType === "deposits" ? "Додати депозит" : "Додати знімання"}
      </StyledButton>
    </div>
  );
};

export default EntryForm;
