import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RadioGroup from '../../../components/UI/RadioGroup';

expect.extend(toHaveNoViolations);

describe('RadioGroup Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1', description: 'Description 1' },
    { value: 'option2', label: 'Option 2', description: 'Description 2' },
    { value: 'option3', label: 'Option 3', description: 'Description 3' }
  ];

  test('should render correctly', () => {
    render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={options}
        onChange={() => {}}
        label="Test Radio Group"
      />
    );
    
    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBeChecked();
    expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    expect(screen.getByLabelText('Option 3')).not.toBeChecked();
  });

  test('should call onChange when an option is selected', () => {
    const handleChange = jest.fn();
    render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={options}
        onChange={handleChange}
        label="Test Radio Group"
      />
    );
    
    fireEvent.click(screen.getByLabelText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  test('should render with descriptions', () => {
    render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={options}
        onChange={() => {}}
        label="Test Radio Group"
        description="This is a test description"
      />
    );
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
  });

  test('should handle disabled options', () => {
    const optionsWithDisabled = [
      ...options,
      { value: 'option4', label: 'Option 4', description: 'Disabled option', disabled: true }
    ];
    
    const handleChange = jest.fn();
    render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={optionsWithDisabled}
        onChange={handleChange}
        label="Test Radio Group"
      />
    );
    
    expect(screen.getByLabelText('Option 4')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Option 4'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('should have no accessibility violations', async () => {
    const { container } = render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={options}
        onChange={() => {}}
        label="Test Radio Group"
        description="This is a test description"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should handle keyboard navigation', () => {
    const handleChange = jest.fn();
    render(
      <RadioGroup
        name="test-radio"
        value="option1"
        options={options}
        onChange={handleChange}
        label="Test Radio Group"
      />
    );
    
    const firstOption = screen.getByLabelText('Option 1');
    firstOption.focus();
    
    // Arrow down should select next option
    fireEvent.keyDown(firstOption, { key: 'ArrowDown' });
    expect(handleChange).toHaveBeenCalledWith('option2');
    
    handleChange.mockClear();
    
    // Simulate option2 is now selected
    render(
      <RadioGroup
        name="test-radio"
        value="option2"
        options={options}
        onChange={handleChange}
        label="Test Radio Group"
      />
    );
    
    const secondOption = screen.getByLabelText('Option 2');
    secondOption.focus();
    
    // Arrow up should select previous option
    fireEvent.keyDown(secondOption, { key: 'ArrowUp' });
    expect(handleChange).toHaveBeenCalledWith('option1');
  });
});