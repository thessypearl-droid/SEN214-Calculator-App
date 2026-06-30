import React from "react";
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from "react-native";
import { THEME } from "../theme";

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  type: "number" | "operator" | "function" | "action" | "constant";
  isActive?: boolean; // Used for highlighting active operator
  style?: ViewStyle;
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onPress,
  type,
  isActive = false,
  style,
}) => {
  // Determine if this specific button gets the accent color treatment
  const isAccentButton = label === "=" || type === "action" && label === "=";
  const isClearDelete = label === "AC" || label === "DEL";

  // Base outline style
  const getOutlineStyles = (pressed: boolean) => {
    const stylesList: ViewStyle[] = [styles.buttonBase];

    if (isAccentButton || isActive) {
      stylesList.push({
        borderColor: THEME.colors.accent,
        backgroundColor: pressed ? THEME.colors.accent : "transparent",
      });
    } else if (isClearDelete) {
      // Clear/Delete buttons can have a slightly warmer/reddish border or normal border
      stylesList.push({
        borderColor: THEME.colors.border,
        backgroundColor: pressed ? THEME.colors.surface : "transparent",
      });
    } else {
      stylesList.push({
        borderColor: THEME.colors.border,
        backgroundColor: pressed ? THEME.colors.surface : "transparent",
      });
    }

    return stylesList;
  };

  // Text color based on button type, state, and active highlighting
  const getTextStyle = (pressed: boolean): TextStyle => {
    const textStyle: TextStyle = {
      fontFamily: THEME.typography.fontFamily.medium,
    };

    if (isAccentButton || isActive) {
      textStyle.color = pressed ? THEME.colors.background : THEME.colors.accent;
    } else if (isClearDelete) {
      textStyle.color = pressed ? THEME.colors.text : THEME.colors.accent; // Clear keys stand out with accent text
    } else if (type === "operator") {
      textStyle.color = THEME.colors.accent; // Operators stand out in accent text
    } else if (type === "function") {
      textStyle.color = THEME.colors.textMuted; // Functions are slightly muted
    } else {
      textStyle.color = THEME.colors.text; // Numbers and constants are primary text color
    }

    // Determine font size
    if (label.length > 3) {
      textStyle.fontSize = THEME.typography.size.buttonTextSmall;
    } else {
      textStyle.fontSize = THEME.typography.size.buttonText;
    }

    return textStyle;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        ...getOutlineStyles(pressed),
        style,
      ]}
    >
      {({ pressed }) => (
        <Text style={getTextStyle(pressed)} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flex: 1,
    height: 56,
    borderRadius: THEME.keyShape.borderRadius,
    borderWidth: THEME.keyShape.borderWidth,
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
    // Smooth transitions/animations feel
  },
});
