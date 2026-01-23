import React from "react";
import StyledButton from "./StyledButton";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import "../assets/components/ButtonShowcase.css";

/**
 * Демонстраційна сторінка для всіх варіантів StyledButton
 * Використовується для тестування та документації
 */
const ButtonShowcase = () => {
  return (
    <div className="showcase-container">
      <h1>🎨 StyledButton Showcase</h1>
      <p className="showcase-description">
        Демонстрація всіх варіантів та розмірів кнопок
      </p>

      {/* Варіанти кнопок */}
      <section className="showcase-section">
        <h2>Варіанти кнопок</h2>
        <div className="buttons-grid">
          <div className="button-demo">
            <StyledButton variant="primary" onClick={() => alert("Primary!")}>
              Primary
            </StyledButton>
            <span className="button-label">Primary (Основна)</span>
          </div>

          <div className="button-demo">
            <StyledButton
              variant="secondary"
              onClick={() => alert("Secondary!")}
            >
              Secondary
            </StyledButton>
            <span className="button-label">Secondary (Другорядна)</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="success" onClick={() => alert("Success!")}>
              Success
            </StyledButton>
            <span className="button-label">Success (Успіх)</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="danger" onClick={() => alert("Danger!")}>
              Danger
            </StyledButton>
            <span className="button-label">Danger (Небезпека)</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="outlined" onClick={() => alert("Outlined!")}>
              Outlined
            </StyledButton>
            <span className="button-label">Outlined (Обведена)</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="text" onClick={() => alert("Text!")}>
              Text
            </StyledButton>
            <span className="button-label">Text (Текстова)</span>
          </div>
        </div>
      </section>

      {/* Розміри */}
      <section className="showcase-section">
        <h2>Розміри кнопок</h2>
        <div className="buttons-row">
          <div className="button-demo">
            <StyledButton variant="primary" size="small">
              Small
            </StyledButton>
            <span className="button-label">Small</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="primary" size="medium">
              Medium
            </StyledButton>
            <span className="button-label">Medium (за замовч.)</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="primary" size="large">
              Large
            </StyledButton>
            <span className="button-label">Large</span>
          </div>
        </div>
      </section>

      {/* З іконками */}
      <section className="showcase-section">
        <h2>Кнопки з іконками</h2>
        <div className="buttons-row">
          <div className="button-demo">
            <StyledButton variant="primary" startIcon={<AddIcon />}>
              Додати
            </StyledButton>
            <span className="button-label">startIcon</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="success" startIcon={<SaveIcon />}>
              Зберегти
            </StyledButton>
            <span className="button-label">startIcon Save</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="danger" startIcon={<DeleteIcon />}>
              Видалити
            </StyledButton>
            <span className="button-label">startIcon Delete</span>
          </div>
        </div>
      </section>

      {/* IconOnly кнопки */}
      <section className="showcase-section">
        <h2>Кнопки тільки з іконками</h2>
        <div className="buttons-row">
          <div className="button-demo">
            <StyledButton iconOnly variant="primary">
              <SettingsIcon />
            </StyledButton>
            <span className="button-label">Primary Icon</span>
          </div>

          <div className="button-demo">
            <StyledButton iconOnly variant="secondary">
              <EditIcon />
            </StyledButton>
            <span className="button-label">Secondary Icon</span>
          </div>

          <div className="button-demo">
            <StyledButton iconOnly variant="danger">
              <DeleteIcon />
            </StyledButton>
            <span className="button-label">Danger Icon</span>
          </div>

          <div className="button-demo">
            <StyledButton iconOnly variant="text">
              <CloseIcon />
            </StyledButton>
            <span className="button-label">Text Icon</span>
          </div>
        </div>
      </section>

      {/* Стани */}
      <section className="showcase-section">
        <h2>Стани кнопок</h2>
        <div className="buttons-row">
          <div className="button-demo">
            <StyledButton variant="primary">Нормальна</StyledButton>
            <span className="button-label">Normal</span>
          </div>

          <div className="button-demo">
            <StyledButton variant="primary" disabled>
              Вимкнена
            </StyledButton>
            <span className="button-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* Full Width */}
      <section className="showcase-section">
        <h2>Кнопка на всю ширину</h2>
        <div className="button-demo full-width-demo">
          <StyledButton
            variant="primary"
            fullWidth
            startIcon={<SaveIcon />}
            size="large"
          >
            Зберегти на всю ширину
          </StyledButton>
        </div>
      </section>

      {/* Приклади використання */}
      <section className="showcase-section">
        <h2>Приклади композицій</h2>

        <div className="example-box">
          <h3>Форма з діями</h3>
          <div className="form-actions-demo">
            <StyledButton variant="outlined" startIcon={<CloseIcon />}>
              Скасувати
            </StyledButton>
            <StyledButton variant="success" startIcon={<SaveIcon />}>
              Зберегти
            </StyledButton>
          </div>
        </div>

        <div className="example-box">
          <h3>Панель інструментів</h3>
          <div className="toolbar-demo">
            <StyledButton
              variant="primary"
              size="medium"
              startIcon={<AddIcon />}
            >
              Додати
            </StyledButton>
            <StyledButton iconOnly variant="text" size="small">
              <EditIcon />
            </StyledButton>
            <StyledButton iconOnly variant="danger" size="small">
              <DeleteIcon />
            </StyledButton>
            <StyledButton iconOnly variant="text" size="small">
              <SettingsIcon />
            </StyledButton>
          </div>
        </div>

        <div className="example-box">
          <h3>Модальне вікно Header</h3>
          <div className="modal-header-demo">
            <h4>Заголовок модального вікна</h4>
            <StyledButton iconOnly variant="text">
              <CloseIcon />
            </StyledButton>
          </div>
        </div>
      </section>

      {/* Код прикладу */}
      <section className="showcase-section">
        <h2>Приклад коду</h2>
        <pre className="code-example">
          {`import StyledButton from "./components/StyledButton";
import SaveIcon from "@mui/icons-material/Save";

<StyledButton
  variant="success"
  size="large"
  startIcon={<SaveIcon />}
  onClick={handleSave}
>
  Зберегти
</StyledButton>`}
        </pre>
      </section>
    </div>
  );
};

export default ButtonShowcase;
