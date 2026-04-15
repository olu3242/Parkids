import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize } from '@parkids/ui-tokens';

export default function RegisterScreen() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!form.firstName || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    const { error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName, role: 'parent' } }
    });
    if (authError) { setError(authError.message); setLoading(false); }
    else router.replace('/onboarding');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.sand[100] }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: spacing[6], paddingTop: 60, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={{ marginBottom: spacing[6] }} onPress={() => router.back()}>
          <Text style={{ color: colors.charcoal[500], fontSize: fontSize.base }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.charcoal[800], marginBottom: spacing[1] }}>Create your account</Text>
        <Text style={{ fontSize: fontSize.base, color: colors.charcoal[500], marginBottom: spacing[6] }}>Free to start — no credit card needed</Text>

        {error ? <View style={{ backgroundColor: '#FEE2E2', borderRadius: borderRadius.md, padding: spacing[3], marginBottom: spacing[4] }}><Text style={{ color: '#DC2626', fontSize: fontSize.sm }}>{error}</Text></View> : null}

        <View style={{ gap: spacing[4], marginBottom: spacing[6] }}>
          <View style={{ flexDirection: 'row', gap: spacing[3] }}>
            {[['First Name*', 'firstName', 'Jane'], ['Last Name', 'lastName', 'Smith']].map(([label, field, placeholder]) => (
              <View key={field} style={{ flex: 1, gap: spacing[1] }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.charcoal[700] }}>{label}</Text>
                <TextInput style={{ borderWidth: 2, borderColor: colors.charcoal[200], borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.charcoal[800], backgroundColor: 'white' }}
                  value={(form as any)[field]} onChangeText={v => setForm(f => ({ ...f, [field]: v }))} placeholder={placeholder as string} placeholderTextColor={colors.charcoal[400]} />
              </View>
            ))}
          </View>
          {[['Email*', 'email', 'you@example.com', 'email-address'], ['Password*', 'password', 'Min. 8 characters', 'default']].map(([label, field, placeholder, kb]) => (
            <View key={field} style={{ gap: spacing[1] }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.charcoal[700] }}>{label}</Text>
              <TextInput style={{ borderWidth: 2, borderColor: colors.charcoal[200], borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.charcoal[800], backgroundColor: 'white' }}
                value={(form as any)[field]} onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
                autoCapitalize="none" secureTextEntry={field === 'password'} keyboardType={kb as any}
                placeholder={placeholder as string} placeholderTextColor={colors.charcoal[400]} />
            </View>
          ))}

          <TouchableOpacity style={[{ backgroundColor: colors.green[500], borderRadius: borderRadius.xl, paddingVertical: spacing[4], alignItems: 'center' }, loading && { opacity: 0.6 }]}
            onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <Text style={{ color: 'white', fontSize: fontSize.base, fontWeight: '700' }}>{loading ? 'Creating account...' : 'Create Free Account'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', color: colors.charcoal[500], fontSize: fontSize.sm }}>
          Already have an account?{' '}
          <Text style={{ color: colors.green[500], fontWeight: '600' }} onPress={() => router.push('/auth/login')}>Sign in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
