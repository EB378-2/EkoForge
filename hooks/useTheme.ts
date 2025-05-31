import { useColorMode } from "@contexts/color-mode";
import { getTheme } from "@theme/theme";

export function useTheme() {
  const { mode } = useColorMode();
  return getTheme(mode);
}