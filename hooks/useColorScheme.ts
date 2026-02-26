import { useColorScheme as useNativeColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

export function useColorScheme(): ColorScheme {
  const colorScheme = useNativeColorScheme();
  if (colorScheme === "light" || colorScheme === "dark") {
    return colorScheme;
  }
  return "light";
}
