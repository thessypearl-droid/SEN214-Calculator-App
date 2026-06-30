import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { THEME } from "../theme";
import { calculateStats, StatResult } from "../mathEngine";

interface InputModalProps {
  visible: boolean;
  type: "nPr" | "nCr" | "STAT" | null;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  type,
  onClose,
  onConfirm,
}) => {
  // States for nPr/nCr
  const [valN, setValN] = useState("");
  const [valR, setValR] = useState("");

  // States for STAT
  const [statInput, setStatInput] = useState("");
  const [statResult, setStatResult] = useState<StatResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset fields when modal visibility changes
  useEffect(() => {
    if (visible) {
      setValN("");
      setValR("");
      setStatInput("");
      setStatResult(null);
      setErrorMsg("");
    }
  }, [visible]);

  const handleStatsCalculate = () => {
    setErrorMsg("");
    try {
      // Parse comma-separated string
      const nums = statInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          const val = parseFloat(s);
          if (Number.isNaN(val)) {
            throw new Error(`Invalid number: ${s}`);
          }
          return val;
        });

      if (nums.length === 0) {
        throw new Error("Please enter at least one number.");
      }

      const results = calculateStats(nums);
      setStatResult(results);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to calculate stats");
      setStatResult(null);
    }
  };

  const handleConfirm = () => {
    setErrorMsg("");
    if (type === "nPr" || type === "nCr") {
      const n = parseInt(valN);
      const r = parseInt(valR);

      if (Number.isNaN(n) || Number.isNaN(r)) {
        setErrorMsg("Please enter valid integers for both n and r.");
        return;
      }

      if (n < 0 || r < 0) {
        setErrorMsg("Values must be positive integers.");
        return;
      }

      if (r > n) {
        setErrorMsg("r cannot be greater than n.");
        return;
      }

      // Format as func(n, r) for mathematical engine evaluation
      onConfirm(`${type}(${n},${r})`);
    } else if (type === "STAT") {
      if (!statResult) {
        handleStatsCalculate();
        return;
      }
      // STAT confirms by closing or inserting mean as a shortcut
      // Let's prompt user or insert the Mean as the default value
      onConfirm(statResult.mean.toString());
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Prevent clicks inside the modal card from closing it */}
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>
                {type === "nPr"
                  ? "Permutations (nPr)"
                  : type === "nCr"
                  ? "Combinations (nCr)"
                  : "Statistical Calculator (STAT)"}
              </Text>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* nPr / nCr Form */}
              {(type === "nPr" || type === "nCr") && (
                <View style={styles.formContainer}>
                  <Text style={styles.infoText}>
                    Formula: {type === "nPr" ? "n! / (n-r)!" : "n! / (r! * (n-r)!)"}
                  </Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter n (total items):</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      value={valN}
                      onChangeText={setValN}
                      placeholder="e.g. 5"
                      placeholderTextColor={THEME.colors.textMuted}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter r (selected items):</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      value={valR}
                      onChangeText={setValR}
                      placeholder="e.g. 2"
                      placeholderTextColor={THEME.colors.textMuted}
                    />
                  </View>
                </View>
              )}

              {/* STAT Form */}
              {type === "STAT" && (
                <View style={styles.formContainer}>
                  <Text style={styles.infoText}>
                    Enter numbers separated by commas to compute Mean, Variance, and Std Dev.
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Data set:</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numbers-and-punctuation"
                      value={statInput}
                      onChangeText={setStatInput}
                      placeholder="e.g. 10, 15, 20, 25, 30"
                      placeholderTextColor={THEME.colors.textMuted}
                      multiline
                    />
                  </View>

                  <Pressable style={styles.calculateBtn} onPress={handleStatsCalculate}>
                    <Text style={styles.calculateBtnText}>CALCULATE STATS</Text>
                  </Pressable>

                  {statResult && (
                    <View style={styles.statsDisplayContainer}>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Mean (Average):</Text>
                        <Text style={styles.statVal}>{statResult.mean}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Variance (σ²):</Text>
                        <Text style={styles.statVal}>{statResult.variance}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Std Dev (σ):</Text>
                        <Text style={styles.statVal}>{statResult.stdDev}</Text>
                      </View>
                      
                      <Text style={styles.statNote}>
                        * Press Confirm to insert Mean into the calculator expression.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <Pressable style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </Pressable>

                <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmBtnText}>
                    {type === "STAT" && !statResult ? "CALCULATE & CLOSE" : "CONFIRM"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "90%",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: "90%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 20,
    color: THEME.colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  errorText: {
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 13,
    color: THEME.colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  formContainer: {
    marginVertical: 10,
  },
  infoText: {
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: THEME.typography.fontFamily.medium,
    fontSize: 14,
    color: THEME.colors.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    padding: 12,
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 15,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
  },
  calculateBtn: {
    borderWidth: 1.5,
    borderColor: THEME.colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  calculateBtnText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 14,
    color: THEME.colors.accent,
  },
  statsDisplayContainer: {
    backgroundColor: THEME.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.colors.border,
  },
  statLabel: {
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  statVal: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 14,
    color: THEME.colors.accent,
  },
  statNote: {
    fontFamily: THEME.typography.fontFamily.regular,
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelBtnText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 14,
    color: THEME.colors.textMuted,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: THEME.colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmBtnText: {
    fontFamily: THEME.typography.fontFamily.bold,
    fontSize: 14,
    color: THEME.colors.background,
  },
});
