import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormInput from "../FormInput";

describe("FormInput", () => {
  it("should render input with label", () => {
    render(
      <FormInput
        label="Test Label"
        id="test-input"
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render input without label", () => {
    render(
      <FormInput
        id="test-input"
        value=""
        placeholder="Enter text"
        onChange={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("should handle onChange event", () => {
    const handleChange = jest.fn();
    render(<FormInput id="test-input" value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("should display error message", () => {
    render(
      <FormInput
        id="test-input"
        value=""
        onChange={() => {}}
        error="This field is required"
      />,
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should display hint when no error", () => {
    render(
      <FormInput
        id="test-input"
        value=""
        onChange={() => {}}
        hint="This is a hint"
      />,
    );
    expect(screen.getByText("This is a hint")).toBeInTheDocument();
  });

  it("should not display hint when error exists", () => {
    render(
      <FormInput
        id="test-input"
        value=""
        onChange={() => {}}
        hint="This is a hint"
        error="Error message"
      />,
    );
    expect(screen.queryByText("This is a hint")).not.toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render suffix", () => {
    render(
      <FormInput
        id="test-input"
        value="100"
        onChange={() => {}}
        suffix="грн"
      />,
    );
    expect(screen.getByText("грн")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <FormInput
        id="test-input"
        value=""
        onChange={() => {}}
        disabled={true}
      />,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormInput
        id="test-input"
        value=""
        onChange={() => {}}
        className="custom-class"
      />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("should render different input types", () => {
    const { rerender } = render(
      <FormInput id="test-input" type="number" value="" onChange={() => {}} />,
    );
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();

    rerender(
      <FormInput id="test-input" type="email" value="" onChange={() => {}} />,
    );
    const input = document.getElementById("test-input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should render icon when provided", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(
      <FormInput id="test-input" value="" onChange={() => {}} icon={icon} />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});
