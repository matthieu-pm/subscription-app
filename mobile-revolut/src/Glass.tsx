import { useTheme } from "./theme";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  View,
  type ViewProps,
} from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

const GlassContext = createContext({
  available: false,
  reduceTransparency: true,
});
export function GlassProvider({ children }: React.PropsWithChildren) {
  const [reduceTransparency, setReduceTransparency] = useState(
    Platform.OS === "ios",
  );
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(
      setReduceTransparency,
    );
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );
    return () => subscription.remove();
  }, []);
  const available =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();
  return (
    <GlassContext.Provider value={{ available, reduceTransparency }}>
      {children}
    </GlassContext.Provider>
  );
}
/** Real UIVisualEffectView on supported iOS; never imitate native refraction with CSS. */
export function GlassSurface({
  style,
  children,
  interactive = false,
  fallbackColor,
  ...props
}: ViewProps & { interactive?: boolean; fallbackColor?: string }) {
  const { available, reduceTransparency } = useContext(GlassContext);
  const theme = useTheme();
  if (available && !reduceTransparency)
    return (
      <GlassView
        {...props}
        glassEffectStyle="regular"
        colorScheme={theme.mode}
        isInteractive={interactive}
        style={[style, { backgroundColor: "transparent" }]}
      >
        {children}
      </GlassView>
    );
  return (
    <View
      {...props}
      style={[
        style,
        {
          backgroundColor: reduceTransparency
            ? theme.chromeSolid
            : (fallbackColor ?? theme.chrome),
        },
      ]}
    >
      {children}
    </View>
  );
}
