/**
 * Keypad button definitions and layouts.
 * Supported modes: Basic and Scientific.
 * Key layout style: Bottom Bar.
 */

export interface CalcKey {
  label: string;      // The text displayed on the button
  value: string;      // The value inserted/evaluated (e.g., 'sin(')
  type: "number" | "operator" | "function" | "action" | "constant";
}

// Basic mode layout
export const BASIC_LAYOUT: CalcKey[][] = [
  [
    { label: "AC", value: "AC", type: "action" },
    { label: "DEL", value: "DEL", type: "action" },
    { label: "(", value: "(", type: "operator" },
    { label: ")", value: ")", type: "operator" }
  ],
  [
    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" }
  ],
  [
    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" }
  ],
  [
    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" }
  ],
  [
    { label: "0", value: "0", type: "number" },
    { label: ".", value: ".", type: "number" },
    { label: "=", value: "=", type: "action" }
  ]
];

// Bottom bar row of operators (common to both modes under "Bottom Bar" layout)
export const BOTTOM_BAR_OPERATORS: CalcKey[] = [
  { label: "+", value: "+", type: "operator" },
  { label: "−", value: "-", type: "operator" },
  { label: "×", value: "×", type: "operator" },
  { label: "÷", value: "÷", type: "operator" }
];

// Scientific mode layout (excludes bottom bar operators which are appended at the bottom)
export const SCIENTIFIC_LAYOUT: CalcKey[][] = [
  // Scientific functions
  [
    { label: "sin", value: "sin(", type: "function" },
    { label: "cos", value: "cos(", type: "function" },
    { label: "tan", value: "tan(", type: "function" },
    { label: "^", value: "^", type: "operator" }
  ],
  [
    { label: "sin⁻¹", value: "asin(", type: "function" },
    { label: "cos⁻¹", value: "acos(", type: "function" },
    { label: "tan⁻¹", value: "atan(", type: "function" },
    { label: "x²", value: "x²", type: "operator" }
  ],
  [
    { label: "sinh", value: "sinh(", type: "function" },
    { label: "cosh", value: "cosh(", type: "function" },
    { label: "tanh", value: "tanh(", type: "function" },
    { label: "√", value: "√(", type: "function" }
  ],
  [
    { label: "ln", value: "ln(", type: "function" },
    { label: "log", value: "log(", type: "function" },
    { label: "π", value: "π", type: "constant" },
    { label: "e", value: "e", type: "constant" }
  ],
  [
    { label: "nPr", value: "nPr", type: "function" },
    { label: "nCr", value: "nCr", type: "function" },
    { label: "STAT", value: "STAT", type: "function" },
    { label: "!", value: "!", type: "operator" }
  ],
  // Basic keys follow below in the renderer
  ...BASIC_LAYOUT
];
