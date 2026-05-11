import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LocationPicker } from "./LocationPicker.jsx";

describe("LocationPicker", () => {
  it("renders locations and calls onSelect with the clicked location", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const location = {
      id: 1,
      name: "Warszawa",
      admin1: "Województwo mazowieckie",
      country: "Polska",
      latitude: 52.2,
      longitude: 21
    };

    render(<LocationPicker locations={[location]} onSelect={onSelect} />);

    await user.click(
      screen.getByRole("button", { name: "Warszawa, Województwo mazowieckie, Polska" })
    );

    expect(onSelect).toHaveBeenCalledWith(location);
  });
});
