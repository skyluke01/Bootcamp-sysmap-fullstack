import App from "../src/App";
import { render, screen } from "@testing-library/react";

test("renders app component", () => {
  render(<App />);
  const linkElement = screen.getByText(/count is 0/i);
  expect(linkElement).toBeInTheDocument();
});
