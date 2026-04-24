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
import { Ionicons } from '@expo/vector-icons';
import { AuthRegisterProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function RegisterScreen({ navigation }: AuthRegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      await register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined });
    } catch (err: unknown) {
      Alert.alert('Error al registrarse', (err as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={Typography.h1}>Crear cuenta</Text>
            <Text style={[Typography.bodySmall, { marginTop: Spacing.xs, marginBottom: Spacing.xl }]}>
              Únete a Malamia y empieza a comprar
            </Text>

            <View style={styles.nameRow}>
              <Input
                label="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                placeholder="Amara"
                containerStyle={{ flex: 1 }}
              />
              <Input
                label="Apellido"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                placeholder="Diallo"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              placeholder="you@example.com"
              containerStyle={styles.field}
            />

            <Input
              label="Teléfono (opcional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              placeholder="+1 555 000 0000"
              containerStyle={styles.field}
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              placeholder="Mín. 8 caracteres"
              hint="Debe tener al menos 8 caracteres"
              containerStyle={styles.field}
            />

            <Button
              label="Crear cuenta"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.xl }}
            />

            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },
  header: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.base },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  nameRow: { flexDirection: 'row', gap: Spacing.md },
  field: { marginTop: Spacing.base },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  loginText: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
