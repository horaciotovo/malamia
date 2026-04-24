import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthLoginProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';

export default function LoginScreen({ navigation }: AuthLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: unknown) {
      Alert.alert('Error al iniciar sesión', (err as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero area */}
          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(232,68,138,0.18)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={Colors.gradientPrimary}
                style={styles.logoGradient}
              >
                <Ionicons name="sparkles" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.brand}>Malamia</Text>
            <Text style={styles.tagline}>Belleza premium, a tu puerta.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={Typography.h2}>Bienvenido de nuevo</Text>
            <Text style={[Typography.bodySmall, { marginTop: 4, marginBottom: Spacing.xl }]}>
              Inicia sesión en tu cuenta
            </Text>

            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              placeholder="you@example.com"
              containerStyle={styles.field}
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
              containerStyle={styles.field}
            />

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button
              label="Iniciar sesión"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.lg }}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <Text style={styles.registerLink}>Crea una</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    overflow: 'hidden',
  },
  logoContainer: {
    marginBottom: Spacing.base,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing['3xl'],
  },
  field: {
    marginTop: Spacing.base,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  forgot: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
