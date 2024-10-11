import { render } from "@testing-library/react";
import Home from "../app/page"; // Adjust the import path as necessary
import { useRouter } from "next/navigation";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Home component", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should redirect to /login if token is not present in localStorage", () => {
    render(<Home />);

    // Check if the router.push method was called with "/login"
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("should not redirect if token is present in localStorage", () => {
    // Set a token in localStorage
    localStorage.setItem("token", "dummy-token");

    render(<Home />);

    // Check if the router.push method was not called
    expect(pushMock).not.toHaveBeenCalled();
  });
});
