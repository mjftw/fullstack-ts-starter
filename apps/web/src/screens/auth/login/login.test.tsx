import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginScreen from "./login";

describe("Login", () => {
  it("renders login form", () => {
    render(<LoginScreen />);
    // Your test assertions...
  });
});
