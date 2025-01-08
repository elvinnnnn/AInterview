import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Welcome from "../app/welcome/page";
import Home from "../app/page";
import Interview from "../app/interview/page";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("jwt-decode");
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe("Welcome page", () => {
  const push = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: push,
    });
  });

  it("redirects to welcome page from /", () => {
    render(<Home />);
    expect(push).toHaveBeenCalledWith("/welcome");
  });

  it("redirects to welcome page if no token is found from /interview", () => {
    localStorage.clear();
    render(<Interview />);
    expect(push).toHaveBeenCalledWith("/welcome");
  });

  it("renders the welcome page", () => {
    render(<Welcome />);
    expect(screen.getByText("AInterview")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Mock it till you rock it – every practice makes perfect!",
      ),
    ).toBeInTheDocument();
  });

  it("displays personalised message for logged in user", async () => {
    const decodedToken = {
      id: "1",
      unique_name: "testuser",
      nbf: 0,
      exp: 0,
      iat: 0,
    };
    mockedJwtDecode.mockReturnValue(decodedToken);
    localStorage.setItem("token", "fake-jwt-token");
    render(<Welcome />);
    await waitFor(() =>
      expect(mockedJwtDecode).toHaveBeenCalledWith("fake-jwt-token"),
    );
  });

  it("does not set welcome message if no token is present", () => {
    render(<Welcome />);
    expect(
      screen.queryByText("Welcome back, testuser!"),
    ).not.toBeInTheDocument();
  });
});
