/**
 * LoadingState — Component hiển thị trạng thái đang tải.
 * Skeleton shimmer effect cho trải nghiệm tốt hơn.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radii } from '@/constants/tokens';

interface LoadingStateProps {
  /** Số dòng skeleton hiển thị */
  lines?: number;
  /** Tin nhắn loading (accessibility) */
  message?: string;
}

export function LoadingState({ lines = 3, message = 'Đang tải...' }: LoadingStateProps) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.border,
              opacity,
              width: i === lines - 1 ? '60%' : '100%',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonLine: {
    height: 16,
    borderRadius: radii.sm,
  },
});
