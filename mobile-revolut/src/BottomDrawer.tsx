import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";

// Keep mounted through the exit animation so the content cannot change mid-close.
export function BottomDrawer({
  open,
  onClose,
  onClosed,
  style,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onClosed: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const [height, setHeight] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [backdrop] = useState(() => new Animated.Value(0));
  const [slide] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const measured = height !== null;
  useEffect(() => {
    if (!measured) return;
    const animation = Animated.parallel([
      Animated.timing(backdrop, {
        toValue: open ? 1 : 0,
        duration: reduceMotion ? 0 : 180,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: open ? 0 : 1,
        duration: reduceMotion ? 0 : open ? 280 : 220,
        easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start(({ finished }) => {
      if (finished && !open) onClosed();
    });
    return () => animation.stop();
  }, [open, measured, reduceMotion, backdrop, slide, onClosed]);

  return (
    <Modal
      transparent
      visible
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Animated.View
        testID="drawer-backdrop"
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          { opacity: backdrop },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss sheet"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.layout}
      >
        <Animated.View
          testID="drawer-panel"
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            style,
            {
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height ?? windowHeight],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#0009" },
  layout: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
});
