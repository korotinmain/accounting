import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StyledButton from "../StyledButton";

describe("StyledButton", () => {
  it("should render button with children", () => {
    render(<StyledButton>Click me</StyledButton>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<StyledButton onClick={handleClick}>Click me</StyledButton>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<StyledButton disabled>Click me</StyledButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should apply primary variant class", () => {
    render(<StyledButton variant="primary">Button</StyledButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-primary");
  });

  it("should apply secondary variant class", () => {
    render(<StyledButton variant="secondary">Button</StyledButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-secondary");
  });

  it("should apply danger variant class", () => {
    render(<StyledButton variant="danger">Button</StyledButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-danger");
  });

  it("should apply size classes correctly", () => {
    const { rerender } = render(
      <StyledButton size="small">Button</StyledButton>,
    );
    let button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-small");

    rerender(<StyledButton size="medium">Button</StyledButton>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-medium");

    rerender(<StyledButton size="large">Button</StyledButton>);
    button = screen.getByRole("button");
    expect(button).toHaveClass("styled-button-large");
  });

  it("should apply custom className", () => {
    render(<StyledButton className="custom-class">Button</StyledButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render as full width when fullWidth is true", () => {
    render(<StyledButton fullWidth>Button</StyledButton>);
    const button = screen.getByRole("button");
    // MUI додає клас до батьківського елемента або безпосередньо до кнопки
    const hasFullWidth =
      button.className.includes("fullWidth") ||
      (button.parentElement &&
        button.parentElement.className.includes("fullWidth"));
    expect(hasFullWidth || button.style.width === "100%").toBeTruthy();
  });

  it("should render icon-only button", () => {
    const icon = <span data-testid="icon">Icon</span>;
    render(<StyledButton iconOnly>{icon}</StyledButton>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <StyledButton onClick={handleClick} disabled>
        Click me
      </StyledButton>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
