/**
 * Design theme tokens based on randomized selections.
 * Selection:
 * - Color Scheme: 2 (Charcoal Slate)
 * - Key Shape: 5 (Outlined/Wireframe)
 * - Layout: 4 (Bottom Bar)
 * - Typography: 6 (Source Code Pro)
 * - Accent Color: 1 (Coral)
 * - Display Style: 1 (Floating Card)
 */

export const THEME = {
  colors: {
    background: "#1B1B1F",
    surface: "#2D2D35",
    text: "#CACAD0",
    border: "#3A3A45",
    accent: "#FF6B6B",        // Coral
    accentPressed: "#FF8E8E", // Lightened Coral
    textMuted: "#888890",     // Live preview/expression color
    error: "#FF4D4D",
    cardBackground: "#25252B", // Slightly lighter for floating card depth
  },
  keyShape: {
    borderRadius: 12,
    borderWidth: 1.5,
    isWireframe: true,
  },
  typography: {
    fontFamily: {
      regular: "SourceCodePro_400Regular",
      medium: "SourceCodePro_500Medium",
      bold: "SourceCodePro_700Bold",
    },
    // General sizing
    size: {
      result: 40,
      expression: 20,
      buttonText: 20,
      buttonTextSmall: 15,
      modeToggle: 14,
    }
  },
  displayStyle: {
    type: "Floating Card", // Inset Panel, Floating Card, Full-Width Flush, Gradient Fade
  },
  layout: {
    type: "Bottom Bar", // Classic Right, Classic Left, Top-Heavy, Split Grid, Bottom Bar, Compact Two-Panel
  }
};
