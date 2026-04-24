import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';
import { FontSize } from '../../theme/typography';

type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primarySoft, text: Colors.primary },
  success: { bg: Colors.successSoft, text: Colors.success },
  error: { bg: Colors.errorSoft, text: Colors.error },
  warning: { bg: Colors.warningSoft, text: Colors.warning },
  info: { bg: Colors.infoSoft, text: Colors.info },
  neutral: { bg: Colors.surface, text: Colors.textSecondary },
};

export default function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
