import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import Auth from "../app/components/Auth";
import { jwtDecode } from "jwt-decode";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

jest.mock("jwt-decode");
const jwtDecodeMock = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe("Auth", () => {
  const setMessage = jest.fn();
  const loggedIn = false;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const testAuthFlow = async (
    endpoint: string,
    buttonName: string,
    message: string,
  ) => {
    axiosMock.post.mockResolvedValueOnce({
      data: { message: message, token: "mock-token" },
    });
    jwtDecodeMock.mockReturnValueOnce({
      id: "mock-user-id",
      unique_name: "testuser",
      nbf: 0,
      exp: 0,
      iat: 0,
    });

    render(<Auth setMessage={setMessage} loggedIn={loggedIn} />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "testpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: buttonName }));

    await waitFor(() => expect(axiosMock.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(jwtDecodeMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(axiosMock.post).toHaveBeenCalledWith(
        expect.stringContaining(`/api/user/${endpoint}`),
        { username: "testuser", password: "testpass" },
        expect.anything(),
      ),
    );
    expect(setMessage).toHaveBeenCalledWith(message);
    expect(localStorage.getItem("token")).toBe("mock-token");
    expect(localStorage.getItem("userId")).toBe("mock-user-id");
  };

  it("simply renders the Auth component without a token in local storage", () => {
    render(<Auth setMessage={setMessage} loggedIn={loggedIn} />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  // Auth flow tests
  it("calls axios with registering", async () => {
    await testAuthFlow("register", "Register", "Registration Successful.");
  });
  it("calls axios when logging in", async () => {
    await testAuthFlow("login", "Login", "Login Successful.");
  });

  // Logged in tests
  it("shows different content when already logged in", () => {
    render(<Auth setMessage={setMessage} loggedIn={true} />);
    // Check usual auth form isn't rendered
    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();

    // Check new buttons have appeared
    expect(
      screen.getByRole("button", { name: "Interview" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("clears the token from local storage when logging out", () => {
    localStorage.setItem("token", "mock-token");
    render(<Auth setMessage={setMessage} loggedIn={true} />);

    // Check logout clears token
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(localStorage.getItem("token")).toBeNull();
  });
});
