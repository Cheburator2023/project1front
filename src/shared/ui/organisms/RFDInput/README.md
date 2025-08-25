# RFDInput Organism

## Overview

The `RFDInput` is a specialized input component designed to handle RFD (Request for Development) values with specific business rules and validation. It follows the organism pattern used throughout the application.

## Features

### 1. Input Mask Format
- **Prefix**: Automatically adds "RFD-" prefix
- **Format**: "RFD-" + N digits (e.g., "RFD-1234", "RFD-567890")

### 2. Validation Rules
- **Numeric Only**: Only allows digits (0-9) after the "RFD-" prefix
- **Prefix Protection**: Prevents deletion of the "RFD-" prefix
- **Invalid Character Filtering**: Automatically removes non-numeric characters

### 3. Default Behavior
- **Empty Field**: When no value is entered, defaults to "Нет"
- **Blur Handling**: If only "RFD-" remains when field loses focus, sets to "Нет"
- **Placeholder Behavior**: Shows "Нет" when not focused, "RFD-" when focused

### 4. User Experience
- **Auto-focus**: Shows "RFD-" prefix when field is focused
- **Cursor Management**: Maintains proper cursor position during typing
- **Visual Feedback**: Clear indication of valid input format
- **Dynamic Placeholder**: Shows "Нет" when not focused, "RFD-" when focused

## Usage

### Basic Implementation

```tsx
import { RFDInput } from '@shared/ui/organisms';

<RFDInput
  id="rfd-field"
  label="RFD"
  value={rfdValue}
  onChange={(value) => setRfdValue(value)}
  required={true}
/>
```

### Integration with InputFactory

The component is automatically used when:
1. Artifact type is `RFD` (new artifact type)
2. InputFactory detects `INPUT_TYPE.RFD`

```tsx
// This will automatically render as RFD input
{
  name: 'rfd',
  title: 'RFD',
  type: INPUT_TYPE.RFD,
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | Yes | - | Unique identifier for the input |
| `label` | `string` | Yes | - | Display label for the field |
| `value` | `string` | No | `''` | Current value of the field |
| `onChange` | `(value: string) => void` | No | - | Callback when value changes |
| `disabled` | `boolean` | No | `false` | Whether the field is disabled |
| `required` | `boolean` | No | `false` | Whether the field is required |
| `error` | `boolean` | No | `false` | Whether to show error state |
| `autoFocus` | `boolean` | No | `false` | Whether to auto-focus the field |
| `extraText` | `React.ReactNode` | No | - | Additional text to display |

## Value Handling

### Input Values
- **Valid RFD**: "RFD-1234" → Returns "RFD-1234"
- **Empty Field**: "" → Returns "Нет"
- **Only Prefix**: "RFD-" → Returns "Нет" (on blur)
- **Invalid Input**: "RFD-abc123" → Returns "RFD-123" (filters non-numeric)

### Display Values
- **"Нет"**: Shows as empty field
- **"RFD-1234"**: Shows as "RFD-1234"
- **null/undefined**: Shows as empty field

## Business Rules

1. **Two Possible Values**: 
   - "Нет" (No)
   - "RFD-NNNN" format (Available for user input)

2. **Input Mask**: 
   - Format: "RFD-" + N digits
   - User can only enter numbers after "RFD-"

3. **Character Restrictions**: 
   - Invalid characters are ignored
   - Only numeric input allowed after prefix

4. **Default Behavior**: 
   - Empty field → "Нет"
   - Incomplete input → "Нет"

## Architecture

### Organism Pattern
This component follows the organism pattern used in the application:
- Located in `src/shared/ui/organisms/RFDInput/`
- Exported through the main organisms index
- Can be used independently or through InputFactory

### Integration Points
- **InputFactory**: Automatically used when `INPUT_TYPE.RFD` is detected
- **Artifact System**: New `ArtifactType.RFD` for backend integration
- **Form System**: Compatible with existing form validation and submission

## Testing

Run tests with:
```bash
npm test RFDInput
```

## Examples

### Example 1: Basic Usage
```tsx
const [rfdValue, setRfdValue] = useState('');

<RFDInput
  id="rfd"
  label="RFD"
  value={rfdValue}
  onChange={setRfdValue}
/>
```

### Example 2: With Validation
```tsx
const [rfdValue, setRfdValue] = useState('');
const [error, setError] = useState(false);

<RFDInput
  id="rfd"
  label="RFD"
  value={rfdValue}
  onChange={(value) => {
    setRfdValue(value);
    setError(value === 'Нет' && isRequired);
  }}
  error={error}
  required={true}
/>
```

## Integration Notes

- The component is designed to work seamlessly with the existing `InputFactory` system
- It follows the same patterns as other organism components in the application
- Error handling and validation are consistent with other form components
- The component is fully typed with TypeScript for better development experience
- New artifact type `RFD` has been added to support backend integration 