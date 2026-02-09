import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Online Chess title', () => {
  render(<App />);
  const title = screen.getByText(/online chess/i);
  expect(title).toBeInTheDocument();
});
