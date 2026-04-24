import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<Size, { height: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
    sm: { height: 36, paddingHorizontal: Spacing.md, fontSize: 13, borderRadius: BorderRadius.sm },
    md: { height: 48, paddingHorizontal: Spacing.xl, fontSize: 15, borderRadius: BorderRadius.md },
    lg: { height: 56, paddingHorizontal: Spacing['2xl'], fontSize: 16, borderRadius: BorderRadius.lg },
  };

  const sz = sizeStyles[size];

  const containerStyle: ViewStyle = {
    height: sz.height,
    borderRadius: sz.borderRadius,
    overflow: 'hidden',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: isDisabled ? 0.5 : 1,
    ...(variant === 'primary' ? Shadow.pink : Shadow.sm),
    ...style,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={containerStyle}
      >
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.inner, { paddingHorizontal: sz.paddingHorizontal }]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[styles.text, { fontSize: sz.fontSize }, textStyle]}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<Exclude<Variant, 'primary'>, { bg: string; border?: string; textColor: string }> = {
    secondary: { bg: Colors.surface, border: Colors.primaryBorder, textColor: Colors.primary },
    outline: { bg: Colors.transparent, border: Colors.primaryBorder, textColor: Colors.primary },
    ghost: { bg: Colors.transparent, textColor: Colors.textSecondary },
    danger: { bg: Colors.errorSoft, border: Colors.error, textColor: Colors.error },
  };

  const v = variantStyles[variant as Exclude<Variant, 'primary'>];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        containerStyle,
        styles.inner,
        {
          backgroundColor: v.bg,
          paddingHorizontal: sz.paddingHorizontal,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} size="small" />
      ) : (
        <Text style={[styles.text, { fontSize: sz.fontSize, color: v.textColor }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
