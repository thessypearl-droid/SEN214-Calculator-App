import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  SourceCodePro_400Regular,
  SourceCodePro_500Medium,
  SourceCodePro_700Bold,
} from "@expo-google-fonts/source-code-pro";
import * as SplashScreen from "expo-splash-screen";

import { THEME } from "./src/theme";
import { Display } from "./src/components/Display";
import { Keypad } from "./src/components/Keypad";
import { InputModal } from "./src/components/InputModal";
import { calculate } from "./src/mathEngine";
import { CalcKey } from "./src/keyLayouts";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SourceCodePro_400Regular,
    SourceCodePro_500Medium,
    SourceCodePro_700Bold,
  });

  const [mode, setMode] = useState<"basic" | "scientific">("basic");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isFinalResult, setIsFinalResult] = useState(false);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  
  // Modal states
  const [modalType, setModalType] = useState<"nPr" | "nCr" | "STAT" | null>(null);

  // Hide splash screen once fonts are loaded or failed
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      if (fontError) {
        console.warn("Error loading Google Fonts, using system fallback:", fontError);
      }
    }
  }, [fontsLoaded, fontError]);

  // Live preview update
  useEffect(() => {
    if (isFinalResult) return;

    if (!expression) {
      setResult("0");
      return;
    }

    // Try evaluating the expression for live preview.
    // If it yields an error, we keep the last successful preview or leave it as is,
    // so the UI does not constantly flash "Error" while the user is typing.
    const liveEval = calculate(expression);
    if (liveEval !== "Error") {
      setResult(liveEval);
    }
  }, [expression, isFinalResult]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Deletion logic that handles full tokens
  const deleteLastToken = (expr: string): string => {
    if (!expr) return "";

    const functions = [
      "asin(", "acos(", "atan(", "sinh(", "cosh(", "tanh(", "sqrt(", "nPr(", "nCr(", "sin(", "cos(", "tan(", "log(", "ln("
    ];

    for (const fn of functions) {
      if (expr.endsWith(fn)) {
        return expr.slice(0, -fn.length);
      }
    }

    if (expr.endsWith("x²")) {
      return expr.slice(0, -2);
    }

    return expr.slice(0, -1);
  };

  const handleKeyPress = (key: CalcKey) => {
    const { label, value, type } = key;

    if (isFinalResult) {
      setIsFinalResult(false);

      if (result === "Error") {
        setExpression("");
        setResult("0");
        setActiveOperator(null);

        if (type === "number" || type === "constant") {
          setExpression(value);
          return;
        }
        if (type === "function") {
          if (value === "nPr" || value === "nCr" || value === "STAT") {
            setModalType(value as any);
          } else {
            setExpression(value);
          }
          return;
        }
        if (type === "operator") {
          setExpression("0" + value);
          return;
        }
        return;
      }

      // If we have a successful result:
      if (type === "number" || type === "constant") {
        setExpression(value);
        setResult("0");
        setActiveOperator(null);
        return;
      }
      if (type === "function") {
        if (value === "nPr" || value === "nCr" || value === "STAT") {
          setModalType(value as any);
        } else {
          setExpression(value);
          setResult("0");
          setActiveOperator(null);
        }
        return;
      }
      if (type === "operator") {
        if (value === "!" || value === "x²") {
          setExpression(result + value);
        } else {
          setExpression(result + value);
          setActiveOperator(value);
        }
        return;
      }
    }

    // Normal typing mode
    if (type === "action") {
      if (value === "AC") {
        setExpression("");
        setResult("0");
        setIsFinalResult(false);
        setActiveOperator(null);
      } else if (value === "DEL") {
        const nextExpr = deleteLastToken(expression);
        setExpression(nextExpr);
        
        const lastChar = nextExpr.slice(-1);
        if (["+", "-", "×", "÷"].includes(lastChar)) {
          setActiveOperator(lastChar === "-" && nextExpr.length === 1 ? null : lastChar);
        } else {
          setActiveOperator(null);
        }
      } else if (value === "=") {
        if (!expression) return;
        const evalResult = calculate(expression);
        setResult(evalResult);
        setIsFinalResult(true);
        setActiveOperator(null);
      }
    } else if (type === "operator") {
      const lastChar = expression.slice(-1);
      const operators = ["+", "-", "×", "÷", "^"];

      if (operators.includes(lastChar) && operators.includes(value)) {
        // Swap operators or allow unary negative
        if (value === "-" && lastChar !== "-") {
          setExpression((prev) => prev + value);
          setActiveOperator(null);
        } else {
          setExpression((prev) => prev.slice(0, -1) + value);
          if (["+", "-", "×", "÷"].includes(value)) {
            setActiveOperator(value);
          } else {
            setActiveOperator(null);
          }
        }
      } else {
        setExpression((prev) => prev + value);
        if (["+", "-", "×", "÷"].includes(value)) {
          setActiveOperator(value);
        } else {
          setActiveOperator(null);
        }
      }
    } else if (type === "function") {
      if (value === "nPr" || value === "nCr" || value === "STAT") {
        setModalType(value as any);
      } else {
        setExpression((prev) => prev + value);
        setActiveOperator(null);
      }
    } else {
      setExpression((prev) => prev + value);
      setActiveOperator(null);
    }
  };

  const handleModalConfirm = (value: string) => {
    setModalType(null);
    if (isFinalResult) {
      setIsFinalResult(false);
      setResult("0");
      setExpression(value);
    } else {
      setExpression((prev) => prev + value);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={THEME.colors.background} />
        
        {/* Scrollable expression and result card */}
        <Display
          expression={expression}
          result={result}
          isFinalResult={isFinalResult}
        />

        {/* Dynamic Scientific/Basic keypad */}
        <Keypad
          mode={mode}
          setMode={setMode}
          onKeyPress={handleKeyPress}
          activeOperator={activeOperator}
        />

        {/* Modal for nPr, nCr, STAT inputs */}
        <InputModal
          visible={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
          onConfirm={handleModalConfirm}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: "space-between",
  },
});
