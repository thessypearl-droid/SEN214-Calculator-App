/**
 * Pure TypeScript Mathematical Engine for the Scientific Calculator.
 * Implements Tokenizer, Shunting-Yard Algorithm, and RPN Evaluator.
 * No external imports.
 */

// Helper: Convert degrees to radians
const degToRad = (deg: number): number => (deg * Math.PI) / 180;

// Helper: Convert radians to degrees
const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

// Helper: Factorial function
const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("Factorial of negative or non-integer");
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Helper: Round to 10 significant figures to eliminate floating point noise
export const cleanFloat = (num: number): number => {
  if (Number.isNaN(num) || !Number.isFinite(num)) return num;
  // Convert to precision 10, then parse back to number
  return parseFloat(num.toPrecision(10));
};

export interface Token {
  type:
    | "NUMBER"
    | "OPERATOR"
    | "FUNCTION"
    | "CONSTANT"
    | "LPAREN"
    | "RPAREN"
    | "COMMA"
    | "POSTFIX";
  value: string;
}

// Tokenizer
export const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (ch: string) => /[0-9.]/.test(ch);
  const isLetter = (ch: string) => /[a-zA-Zπe²]/.test(ch);

  // We need to recognize multi-character functions and operators
  const functions = new Set([
    "sin", "cos", "tan",
    "asin", "acos", "atan",
    "sinh", "cosh", "tanh",
    "sqrt", "ln", "log",
    "nPr", "nCr"
  ]);

  const constants = new Set(["π", "e"]);

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers
    if (isDigit(ch)) {
      let numStr = "";
      while (i < expr.length && isDigit(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: numStr });
      continue;
    }

    // Constants & Functions (Identifiers)
    if (isLetter(ch)) {
      let ident = "";
      while (i < expr.length && isLetter(expr[i])) {
        ident += expr[i];
        i++;
      }

      if (constants.has(ident)) {
        tokens.push({ type: "CONSTANT", value: ident });
      } else if (ident === "x²") {
        // Treat x² as a postfix operator or map to ^2
        tokens.push({ type: "POSTFIX", value: "x²" });
      } else if (functions.has(ident)) {
        tokens.push({ type: "FUNCTION", value: ident });
      } else if (ident === "pi") {
        tokens.push({ type: "CONSTANT", value: "π" });
      } else {
        // Unknown identifier, try to split if it starts with a constant or function
        throw new Error(`Unknown identifier: ${ident}`);
      }
      continue;
    }

    // Parentheses & Comma
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    // Postfix factorial
    if (ch === "!") {
      tokens.push({ type: "POSTFIX", value: "!" });
      i++;
      continue;
    }

    // Operators (+, -, *, /, ^)
    if (["+", "-", "*", "/", "^"].includes(ch)) {
      // Determine if '-' is unary or binary
      if (ch === "-") {
        const prev = tokens[tokens.length - 1];
        const isUnary =
          !prev ||
          prev.type === "OPERATOR" ||
          prev.type === "LPAREN" ||
          prev.type === "COMMA";
        if (isUnary) {
          tokens.push({ type: "OPERATOR", value: "u-" });
          i++;
          continue;
        }
      }
      tokens.push({ type: "OPERATOR", value: ch });
      i++;
      continue;
    }

    // Prettified symbol fallbacks
    if (ch === "×") {
      tokens.push({ type: "OPERATOR", value: "*" });
      i++;
      continue;
    }
    if (ch === "÷") {
      tokens.push({ type: "OPERATOR", value: "/" });
      i++;
      continue;
    }
    if (ch === "√") {
      tokens.push({ type: "FUNCTION", value: "sqrt" });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
};

// Operator Precedence & Associativity
const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "u-": 3, // Unary minus
  "^": 4,  // Power
  "x²": 5, // Postfix square
  "!": 5   // Postfix factorial
};

const ASSOCIATIVITY: Record<string, "LEFT" | "RIGHT"> = {
  "+": "LEFT",
  "-": "LEFT",
  "*": "LEFT",
  "/": "LEFT",
  "u-": "RIGHT",
  "^": "RIGHT"
};

// Shunting-Yard Algorithm
export const shuntingYard = (tokens: Token[]): Token[] => {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === "NUMBER" || token.type === "CONSTANT") {
      outputQueue.push(token);
    } else if (token.type === "POSTFIX") {
      // Postfix operators like ! and x² go directly to output in RPN
      outputQueue.push(token);
    } else if (token.type === "FUNCTION") {
      operatorStack.push(token);
    } else if (token.type === "COMMA") {
      // Pop operators to output until we see a left parenthesis
      let hasLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === "LPAREN") {
          hasLparen = true;
          break;
        }
        outputQueue.push(operatorStack.pop()!);
      }
      if (!hasLparen) {
        throw new Error("Mismatched brackets or misplaced comma");
      }
    } else if (token.type === "OPERATOR") {
      const o1 = token.value;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type !== "OPERATOR") break;

        const o2 = top.value;
        const p1 = PRECEDENCE[o1];
        const p2 = PRECEDENCE[o2];

        if (
          (ASSOCIATIVITY[o1] === "LEFT" && p1 <= p2) ||
          (ASSOCIATIVITY[o1] === "RIGHT" && p1 < p2)
        ) {
          outputQueue.push(operatorStack.pop()!);
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token.type === "LPAREN") {
      operatorStack.push(token);
    } else if (token.type === "RPAREN") {
      let hasLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === "LPAREN") {
          hasLparen = true;
          operatorStack.pop(); // Remove LPAREN
          break;
        }
        outputQueue.push(operatorStack.pop()!);
      }
      if (!hasLparen) {
        throw new Error("Mismatched brackets");
      }
      // If the top of the stack is a function, pop it to the output queue
      if (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === "FUNCTION"
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack[operatorStack.length - 1];
    if (top.type === "LPAREN" || top.type === "RPAREN") {
      throw new Error("Mismatched brackets");
    }
    outputQueue.push(operatorStack.pop()!);
  }

  return outputQueue;
};

// RPN Evaluator
export const evaluateRPN = (rpn: Token[]): number => {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === "NUMBER") {
      stack.push(parseFloat(token.value));
    } else if (token.type === "CONSTANT") {
      if (token.value === "π") {
        stack.push(Math.PI);
      } else if (token.value === "e") {
        stack.push(Math.E);
      }
    } else if (token.type === "POSTFIX") {
      if (stack.length < 1) throw new Error("Malformed expression");
      const val = stack.pop()!;
      if (token.value === "!") {
        stack.push(factorial(val));
      } else if (token.value === "x²") {
        stack.push(val * val);
      }
    } else if (token.type === "OPERATOR") {
      if (token.value === "u-") {
        if (stack.length < 1) throw new Error("Malformed expression");
        const val = stack.pop()!;
        stack.push(-val);
      } else {
        if (stack.length < 2) throw new Error("Malformed expression");
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.value) {
          case "+":
            stack.push(a + b);
            break;
          case "-":
            stack.push(a - b);
            break;
          case "*":
            stack.push(a * b);
            break;
          case "/":
            if (b === 0) throw new Error("Division by zero");
            stack.push(a / b);
            break;
          case "^":
            stack.push(Math.pow(a, b));
            break;
          default:
            throw new Error(`Unknown operator: ${token.value}`);
        }
      }
    } else if (token.type === "FUNCTION") {
      const func = token.value;

      if (func === "nPr" || func === "nCr") {
        if (stack.length < 2) throw new Error("Malformed expression");
        const r = stack.pop()!;
        const n = stack.pop()!;
        if (n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
          throw new Error("Invalid n or r for combinatorics");
        }
        if (func === "nPr") {
          stack.push(factorial(n) / factorial(n - r));
        } else {
          stack.push(factorial(n) / (factorial(r) * factorial(n - r)));
        }
      } else {
        if (stack.length < 1) throw new Error("Malformed expression");
        const val = stack.pop()!;
        switch (func) {
          case "sin":
            stack.push(Math.sin(degToRad(val)));
            break;
          case "cos":
            stack.push(Math.cos(degToRad(val)));
            break;
          case "tan":
            if (Math.abs(val % 180) === 90) {
              throw new Error("Division by zero");
            }
            stack.push(Math.tan(degToRad(val)));
            break;
          case "asin":
            if (val < -1 || val > 1) throw new Error("asin out of range");
            stack.push(radToDeg(Math.asin(val)));
            break;
          case "acos":
            if (val < -1 || val > 1) throw new Error("acos out of range");
            stack.push(radToDeg(Math.acos(val)));
            break;
          case "atan":
            stack.push(radToDeg(Math.atan(val)));
            break;
          case "sinh":
            stack.push(Math.sinh(val));
            break;
          case "cosh":
            stack.push(Math.cosh(val));
            break;
          case "tanh":
            stack.push(Math.tanh(val));
            break;
          case "sqrt":
            if (val < 0) throw new Error("sqrt of negative");
            stack.push(Math.sqrt(val));
            break;
          case "ln":
            if (val <= 0) throw new Error("ln out of range");
            stack.push(Math.log(val));
            break;
          case "log":
            if (val <= 0) throw new Error("log out of range");
            stack.push(Math.log10(val));
            break;
          default:
            throw new Error(`Unknown function: ${func}`);
        }
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error("Malformed expression");
  }

  return stack[0];
};

// Main Entry Point
export const calculate = (expression: string): string => {
  try {
    // Normalise expression
    let parsedExpr = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "sqrt")
      .replace(/π/g, "π");

    // Implicit multiplication: e.g. 5(3) -> 5*(3), 5π -> 5*π, 5sin(30) -> 5*sin(30)
    parsedExpr = parsedExpr.replace(/([0-9πe])([a-zA-Zπe\(])/g, (match, p1, p2) => {
      if (p2 === "²") return match;
      return `${p1}*${p2}`;
    });

    parsedExpr = parsedExpr.replace(/\)([\(0-9a-zA-Zπe])/g, ")*$1");

    const tokens = tokenize(parsedExpr);
    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn);
    const cleaned = cleanFloat(result);

    if (Number.isNaN(cleaned) || !Number.isFinite(cleaned)) {
      return "Error";
    }
    return cleaned.toString();
  } catch (error) {
    return "Error";
  }
};

// Statistics Functions
export interface StatResult {
  mean: number;
  variance: number;
  stdDev: number;
}

export const calculateStats = (numbers: number[]): StatResult => {
  if (numbers.length === 0) {
    throw new Error("No data");
  }
  const n = numbers.length;
  const mean = numbers.reduce((sum, val) => sum + val, 0) / n;
  const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    mean: cleanFloat(mean),
    variance: cleanFloat(variance),
    stdDev: cleanFloat(stdDev)
  };
};
