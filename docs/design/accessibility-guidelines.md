# Accessibility Guidelines

## WCAG 2.1 AA Compliance Standards

### 1. Perceivable

#### 1.1 Text Alternatives
- All images must have appropriate alt text
- Decorative images should have empty alt attributes (`alt=""`)
- Complex images (charts, diagrams) require detailed descriptions

```tsx
// Good
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2 2024" />

// Bad
<img src="chart.png" alt="chart" />

// Decorative
<img src="decoration.png" alt="" role="presentation" />
```

#### 1.2 Time-based Media
- Provide captions for video content
- Offer audio descriptions for visual content
- Ensure auto-playing media can be paused

#### 1.3 Adaptable Content
- Use semantic HTML structure
- Ensure content is readable when CSS is disabled
- Maintain logical reading order

```tsx
// Good semantic structure
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <article>
      <h3>Article Title</h3>
      <p>Content...</p>
    </article>
  </section>
</main>
```

#### 1.4 Distinguishable
- Maintain minimum contrast ratios:
  - Normal text: 4.5:1
  - Large text (18pt+ or 14pt+ bold): 3:1
  - UI components: 3:1
- Don't rely solely on color to convey information
- Ensure text can be resized up to 200% without loss of functionality

```css
/* High contrast color combinations */
.text-primary { color: #1e40af; } /* 7.1:1 contrast on white */
.text-error { color: #dc2626; } /* 5.9:1 contrast on white */
.text-success { color: #059669; } /* 4.5:1 contrast on white */
```

### 2. Operable

#### 2.1 Keyboard Accessible
- All functionality must be available via keyboard
- Provide visible focus indicators
- Implement logical tab order

```tsx
// Keyboard navigation example
const NavigationMenu = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(activeIndex);
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          className={`menu-item ${index === activeIndex ? 'focused' : ''}`}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

#### 2.2 Seizures and Physical Reactions
- Avoid content that flashes more than 3 times per second
- Provide warnings for potentially triggering content

#### 2.3 Navigable
- Provide multiple ways to locate content
- Use descriptive page titles and headings
- Implement skip links for main content

```tsx
// Skip link implementation
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
  >
    Skip to main content
  </a>
);
```

#### 2.4 Input Modalities
- Ensure all pointer functionality is available via keyboard
- Provide large enough touch targets (minimum 44x44px)

### 3. Understandable

#### 3.1 Readable
- Use clear, simple language
- Define unusual words and abbreviations
- Specify page language

```html
<html lang="en">
  <head>
    <title>AI Code Review Platform</title>
  </head>
  <body>
    <abbr title="Application Programming Interface">API</abbr>
  </body>
</html>
```

#### 3.2 Predictable
- Maintain consistent navigation and layout
- Don't change context automatically
- Provide clear labels and instructions

#### 3.3 Input Assistance
- Provide clear error messages
- Offer suggestions for error correction
- Prevent errors when possible

```tsx
// Form validation example
const FormField = ({ label, error, required, children }) => (
  <div className="form-field">
    <label className="form-label">
      {label}
      {required && <span className="required" aria-label="required">*</span>}
    </label>
    {children}
    {error && (
      <div className="error-message" role="alert" aria-live="polite">
        <AlertCircle className="error-icon" aria-hidden="true" />
        {error}
      </div>
    )}
  </div>
);
```

### 4. Robust

#### 4.1 Compatible
- Use valid, semantic HTML
- Ensure compatibility with assistive technologies
- Test with multiple screen readers

```tsx
// ARIA landmarks and roles
const Layout = ({ children }) => (
  <div className="app-layout">
    <header role="banner">
      <nav role="navigation" aria-label="Main navigation">
        {/* Navigation items */}
      </nav>
    </header>
    
    <main role="main" id="main-content">
      {children}
    </main>
    
    <aside role="complementary" aria-label="Sidebar">
      {/* Sidebar content */}
    </aside>
    
    <footer role="contentinfo">
      {/* Footer content */}
    </footer>
  </div>
);
```

## ARIA Implementation Guidelines

### 1. ARIA Labels and Descriptions

```tsx
// Button with descriptive label
<button
  aria-label="Delete user John Doe"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>
<div id="delete-help" className="sr-only">
  This action cannot be undone
</div>

// Form input with description
<input
  type="password"
  aria-label="Password"
  aria-describedby="password-help"
  aria-required="true"
/>
<div id="password-help">
  Password must be at least 8 characters long
</div>
```

### 2. Live Regions

```tsx
// Status announcements
const StatusAnnouncer = ({ message, type = 'polite' }) => (
  <div
    role="status"
    aria-live={type}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// Error announcements
const ErrorAnnouncer = ({ error }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="sr-only"
  >
    {error}
  </div>
);
```

### 3. Complex Widgets

```tsx
// Accessible dropdown menu
const DropdownMenu = ({ trigger, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  return (
    <div className="dropdown">
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <ul
          id="dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          className="dropdown-menu"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onSelect(item)}
              className={index === activeIndex ? 'active' : ''}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Screen Reader Testing

### 1. Testing Checklist

#### NVDA (Windows)
- [ ] All content is announced correctly
- [ ] Navigation landmarks are identified
- [ ] Form labels are associated properly
- [ ] Interactive elements are identified with their roles

#### JAWS (Windows)
- [ ] Heading navigation works correctly
- [ ] Table navigation is functional
- [ ] Form mode transitions properly
- [ ] Virtual cursor navigation is smooth

#### VoiceOver (macOS/iOS)
- [ ] Rotor navigation functions correctly
- [ ] Gesture navigation is intuitive
- [ ] Web content is properly identified
- [ ] Custom controls are announced correctly

### 2. Testing Scripts

```tsx
// Screen reader testing utilities
const ScreenReaderTest = {
  // Announce content changes
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },
  
  // Test focus management
  testFocusManagement: () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
      console.log(`Focusable element ${index}:`, {
        tagName: element.tagName,
        role: element.getAttribute('role'),
        ariaLabel: element.getAttribute('aria-label'),
        tabIndex: element.getAttribute('tabindex')
      });
    });
  }
};
```

## Focus Management

### 1. Focus Indicators

```css
/* Custom focus styles */
.focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default focus for mouse users */
.focus:not(.focus-visible) {
  outline: none;
}

/* High contrast focus indicators */
@media (prefers-contrast: high) {
  .focus-visible {
    outline: 3px solid;
    outline-offset: 3px;
  }
}
```

### 2. Focus Trapping

```tsx
// Focus trap for modals
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return containerRef;
};
```

## Color and Contrast

### 1. Color Palette Accessibility

```css
:root {
  /* High contrast color system */
  --text-primary: #111827;     /* 16.9:1 contrast on white */
  --text-secondary: #374151;   /* 9.7:1 contrast on white */
  --text-tertiary: #6b7280;    /* 5.4:1 contrast on white */
  
  /* Interactive colors */
  --link-color: #1d4ed8;       /* 7.1:1 contrast on white */
  --link-hover: #1e40af;       /* 8.2:1 contrast on white */
  
  /* Status colors */
  --success: #059669;          /* 4.5:1 contrast on white */
  --warning: #d97706;          /* 4.5:1 contrast on white */
  --error: #dc2626;            /* 5.9:1 contrast on white */
  
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
}

/* Dark mode colors */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f9fafb;    /* 16.9:1 contrast on dark */
    --text-secondary: #e5e7eb;  /* 12.6:1 contrast on dark */
    --text-tertiary: #d1d5db;   /* 9.2:1 contrast on dark */
    
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --bg-tertiary: #374151;
  }
}
```

### 2. Color Independence

```tsx
// Don't rely solely on color
const StatusIndicator = ({ status, label }) => {
  const statusConfig = {
    success: { color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-50' },
    warning: { color: 'text-yellow-600', icon: AlertTriangle, bgColor: 'bg-yellow-50' },
    error: { color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-50' }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-center p-3 rounded-lg ${config.bgColor}`}>
      <config.icon className={`w-5 h-5 mr-2 ${config.color}`} />
      <span className={`font-medium ${config.color}`}>
        {label}
      </span>
    </div>
  );
};
```

## Testing Tools and Automation

### 1. Automated Testing

```tsx
// Jest + Testing Library accessibility tests
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Component Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should have proper ARIA attributes', () => {
    render(
      <Button 
        variant="primary" 
        aria-label="Save document"
        disabled
      >
        Save
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Save document');
    expect(button).toBeDisabled();
  });
});
```

### 2. Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab order is logical and intuitive
- [ ] All interactive elements are reachable via keyboard
- [ ] Focus indicators are clearly visible
- [ ] Escape key closes modals and dropdowns
- [ ] Arrow keys navigate within components when appropriate

#### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Headings create a logical outline
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Status changes are communicated

#### Visual Testing
- [ ] Text meets contrast requirements
- [ ] UI is usable at 200% zoom
- [ ] Color is not the only way to convey information
- [ ] Focus indicators are visible in high contrast mode

#### Motor Accessibility
- [ ] Touch targets are at least 44x44px
- [ ] Hover states don't interfere with touch interaction
- [ ] Drag and drop has keyboard alternatives
- [ ] Time limits can be extended or disabled

This comprehensive accessibility guide ensures that the AI code review platform is usable by everyone, regardless of their abilities or the assistive technologies they use.