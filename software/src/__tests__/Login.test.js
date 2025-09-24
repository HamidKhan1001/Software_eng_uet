import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { api } from "../api";

jest.mock("../api");

describe("Login Page", () => {
  it("renders login form", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("submits and logs in user", async () => {
    api.login.mockResolvedValue({
      token: "fake-jwt",
      user: { id: "1", name: "Test User", email: "test@example.com" },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(api.login).toHaveBeenCalledWith("test@example.com", "password123")
    );
  });
});
