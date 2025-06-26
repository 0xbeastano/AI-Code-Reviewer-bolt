import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Toggle from '../../../components/UI/Toggle';

expect.extend(toHaveNoViolations);

describe('Toggle Component', () => {
  test('should render correctly', () => {
    render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={() => {}}
        label="Test Toggle"
      />
    );
    
    expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  test('should call onChange when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={handleChange}
        label="Test Toggle"
      />
    );
    
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('should not call onChange when disabled', () => {
    const handleChange = jest.fn();
    render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={handleChange}
        label="Test Toggle"
        disabled={true}
      />
    );
    
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('should render with description', () => {
    render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={() => {}}
        label="Test Toggle"
        description="This is a test description"
      />
    );
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  test('should have no accessibility violations', async () => {
    const { container } = render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={() => {}}
        label="Test Toggle"
        description="This is a test description"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should handle keyboard interaction', () => {
    const handleChange = jest.fn();
    render(
      <Toggle
        id="test-toggle"
        checked={false}
        onChange={handleChange}
        label="Test Toggle"
      />
    );
    
    const toggle = screen.getByRole('switch');
    toggle.focus();
    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(true);
    
    handleChange.mockClear();
    fireEvent.keyDown(toggle, { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(true);
    
    handleChange.mockClear();
    fireEvent.keyDown(toggle, { key: 'Tab' });
    expect(handleChange).not.toHaveBeenCalled();
  });
});