import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { THEME } from "../theme";
import { CalcButton } from "./CalcButton";
import { BASIC_LAYOUT, SCIENTIFIC_LAYOUT, BOTTOM_BAR_OPERATORS, CalcKey } from "../keyLayouts";

interface KeypadProps {
  mode: "basic" | "scientific";
  setMode: (mode: "basic" | "scientific") => void;
  onKeyPress: (key: CalcKey) => void;
  activeOperator: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  setMode,
  onKeyPress,
  activeOperator,
}) => {
  // Determine layout grid based on selected mode
  const currentLayout = mode === "basic" ? BASIC_LAYOUT : SCIENTIFIC_LAYOUT;

  return (
    <View style={styles.container}>
      {/* Segmented Mode Control Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleSegment,
            mode === "basic" && styles.toggleSegmentActive,
          ]}
          onPress={() => setMode("basic")}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "basic" && styles.toggleTextActive,
            ]}
          >
            BASIC
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleSegment,
            mode === "scientific" && styles.toggleSegmentActive,
          ]}
          onPress={() => setMode("scientific")}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "scientific" && styles.toggleTextActive,
            ]}
          >
            SCIENTIFIC
          </Text>
        </Pressable>
      </View>

      {/* Main Keys Grid */}
      {mode === "scientific" ? (
        // Wrap scientific in a scroll view or keep in flex depending on screen height.
        // On smaller screens, scientific mode has 10 rows + bottom bar + toggle.
        // A scrollable container ensures it never clips on smaller screens!
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollKeysContainer}
          style={styles.scrollWrapper}
        >
          {currentLayout.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((key, keyIndex) => (
                <CalcButton
                  key={`key-${rowIndex}-${keyIndex}`}
                  label={key.label}
                  type={key.type}
                  isActive={activeOperator !== null && key.value === activeOperator}
                  onPress={() => onKeyPress(key)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.keysContainer}>
          {currentLayout.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((key, keyIndex) => (
                <CalcButton
                  key={`key-${rowIndex}-${keyIndex}`}
                  label={key.label}
                  type={key.type}
                  isActive={activeOperator !== null && key.value === activeOperator}
                  onPress={() => onKeyPress(key)}
                />
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Bottom Bar Operators (Layout style constraint) */}
      <View style={styles.bottomBarRow}>
        {BOTTOM_BAR_OPERATORS.map((key, keyIndex) => (
          <CalcButton
            key={`bottom-key-${keyIndex}`}
            label={key.label}
            type={key.type}
            isActive={activeOperator !== null && key.value === activeOperator}
            onPress={() => onKeyPress(key)}
            style={styles.bottomBarButton}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: "flex-end",
  },
  toggleContainer: {
    flexDirection: "row",
    borderWidth: THEME.keyShape.borderWidth,
    borderColor: THEME.colors.border,
    borderRadius: 28,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "transparent",
  },
  toggleSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 24,
  },
  toggleSegmentActive: {
    backgroundColor: THEME.colors.accent,
  },
  toggleText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: THEME.typography.size.modeToggle,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: THEME.colors.background,
  },
  keysContainer: {
    width: "100%",
  },
  scrollWrapper: {
    flex: 1,
    maxHeight: 460, // Limit height of scroll section to keep layout proportioned
  },
  scrollKeysContainer: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  bottomBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  bottomBarButton: {
    height: 60, // slightly taller for primary operator bar
  },
});
