import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "../Card";

describe("Card", () => {
  it("should render children correctly", () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should apply default variant class", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("card");
    expect(card).toHaveClass("card-default");
  });

  it("should apply elevated variant class", () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("card-elevated");
  });

  it("should apply outlined variant class", () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("card-outlined");
  });

  it("should apply custom className", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("custom-class");
  });

  it("should apply clickable class when onClick is provided", () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("card-clickable");
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild;
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should pass additional props to the div", () => {
    const { container } = render(<Card data-testid="test-card">Content</Card>);
    expect(screen.getByTestId("test-card")).toBeInTheDocument();
  });
});
