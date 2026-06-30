import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { THEME } from "../theme";

interface DisplayProps {
  expression: string;
  result: string;
  isFinalResult: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  isFinalResult,
}) => {
  const exprScrollViewRef = useRef<ScrollView>(null);
  const resultScrollViewRef = useRef<ScrollView>(null);

  // Auto scroll expression and result to the right when they change
  useEffect(() => {
    exprScrollViewRef.current?.scrollToEnd({ animated: true });
  }, [expression]);

  useEffect(() => {
    resultScrollViewRef.current?.scrollToEnd({ animated: true });
  }, [result]);

  // Prettify expression for user-friendly display
  const prettify = (expr: string): string => {
    if (!expr) return "0";
    return expr
      .replace(/\*/g, "×")
      .replace(/\//g, "÷")
      .replace(/asin\(/g, "sin⁻¹(")
      .replace(/acos\(/g, "cos⁻¹(")
      .replace(/atan\(/g, "tan⁻¹(")
      .replace(/sinh\(/g, "sinh(")
      .replace(/cosh\(/g, "cosh(")
      .replace(/tanh\(/g, "tanh(")
      .replace(/sqrt\(/g, "√(")
      .replace(/pi/g, "π")
      .replace(/x²/g, "²");
  };

  return (
    <View style={styles.cardContainer}>
      {/* Expression Area (Top Line) */}
      <View style={styles.exprContainer}>
        <ScrollView
          ref={exprScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exprScrollContent}
        >
          <Text style={styles.expressionText}>
            {prettify(expression)}
          </Text>
        </ScrollView>
      </View>

      {/* Result Area (Bottom Line) */}
      <View style={styles.resultContainer}>
        <ScrollView
          ref={resultScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.resultScrollContent}
        >
          <Text
            style={[
              styles.resultText,
              { color: isFinalResult ? THEME.colors.accent : THEME.colors.textMuted }
            ]}
          >
            {result || "0"}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    minHeight: 140,
    justifyContent: "space-between",
    // Premium shadow for Floating Card style
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  exprContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  exprScrollContent: {
    alignItems: "center",
    paddingRight: 10,
  },
  expressionText: {
    fontFamily: THEME.typography.fontFamily.medium,
    fontSize: THEME.typography.size.expression,
    color: THEME.colors.text,
    letterSpacing: 0.5,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginTop: 12,
  },
  resultScrollContent: {
    alignItems: "flex-end",
    paddingRight: 10,
  },
  resultText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: THEME.typography.size.result,
    letterSpacing: 0.5,
  },
});
