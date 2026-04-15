import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize } from '@parkids/ui-tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); }
    else router.replace('/parent/home');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.logoArea}>
          <Text style={{ fontSize: 40 }}>🌱</Text>
          <Text style={styles.logoText}>Par-Kids</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your family account</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com"
              placeholderTextColor={colors.charcoal[400]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              secureTextEntry placeholder="••••••••" placeholderTextColor={colors.charcoal[400]} />
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.linkText} onPress={() => router.push('/auth/register')}>Start free</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[100] },
  scroll: { padding: spacing[6], paddingTop: 60, flexGrow: 1 },
  backBtn: { marginBottom: spacing[6] },
  backText: { color: colors.charcoal[500], fontSize: fontSize.base },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[6] },
  logoText: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.green[500] },
  title: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.charcoal[800], marginBottom: spacing[1] },
  subtitle: { fontSize: fontSize.base, color: colors.charcoal[500], marginBottom: spacing[6] },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: borderRadius.md, padding: spacing[3], marginBottom: spacing[4] },
  errorText: { color: '#DC2626', fontSize: fontSize.sm },
  form: { gap: spacing[4], marginBottom: spacing[6] },
  inputGroup: { gap: spacing[1] },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.charcoal[700] },
  input: { borderWidth: 2, borderColor: colors.charcoal[200], borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.charcoal[800], backgroundColor: 'white' },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: colors.green[500], fontSize: fontSize.sm, fontWeight: '600' },
  primaryBtn: { backgroundColor: colors.green[500], borderRadius: borderRadius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: 'white', fontSize: fontSize.base, fontWeight: '700' },
  footerText: { textAlign: 'center', color: colors.charcoal[500], fontSize: fontSize.sm },
  linkText: { color: colors.green[500], fontWeight: '600' },
});
