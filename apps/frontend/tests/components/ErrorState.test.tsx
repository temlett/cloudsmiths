import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorState } from "../../src/components/ErrorState/ErrorState";

describe("ErrorState", () => {
  it("renders the provided message and backend hint", () => {
    render(<ErrorState message="Unable to load favorite breeds." />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load favorite breeds."),
    ).toBeInTheDocument();
    expect(screen.getByText("Is the backend running?")).toBeInTheDocument();
  });
});