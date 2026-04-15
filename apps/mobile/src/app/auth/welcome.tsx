import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, fontSize } from '@parkids/ui-tokens';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logoEmoji}>🌱</Text>
        <Text style={styles.logoText}>Par-Kids</Text>
        <Text style={styles.tagline}>Grow Together. Stay Connected.</Text>
      </View>

      <View style={styles.heroArea}>
        <Text style={styles.headline}>Some conversations{'\n'}change everything.</Text>
        <Text style={styles.subheadline}>
          A guided weekly check-in that helps parents and children connect intentionally — every single week.
        </Text>
      </View>

      <View style={styles.pillRow}>
        {['😊 Mood Tracking', '🎯 Goal Setting', '📊 Growth Reports'].map(pill => (
          <View key={pill} style={styles.pill}>
            <Text style={styles.pillText}>{pill}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaArea}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/register')} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Start Free — No Card Needed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.trustText}>🔒 Private & Secure · COPPA Compliant · No Ads</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[100], paddingHorizontal: spacing[6], paddingTop: 80, paddingBottom: spacing[8], alignItems: 'center' },
  logoArea: { alignItems: 'center', marginBottom: spacing[8] },
  logoEmoji: { fontSize: 52, marginBottom: spacing[2] },
  logoText: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.green[500] },
  tagline: { fontSize: fontSize.sm, color: colors.charcoal[400], marginTop: 4 },
  heroArea: { alignItems: 'center', marginBottom: spacing[8] },
  headline: { fontSize: 32, fontWeight: '800', color: colors.charcoal[800], textAlign: 'center', lineHeight: 42, marginBottom: spacing[4] },
  subheadline: { fontSize: fontSize.base, color: colors.charcoal[500], textAlign: 'center', lineHeight: 24 },
  pillRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[10], flexWrap: 'wrap', justifyContent: 'center' },
  pill: { backgroundColor: colors.green[50], borderWidth: 1, borderColor: colors.green[200], borderRadius: borderRadius.full, paddingHorizontal: spacing[3], paddingVertical: 6 },
  pillText: { fontSize: fontSize.xs, color: colors.green[600], fontWeight: '600' },
  ctaArea: { width: '100%', gap: spacing[3] },
  primaryBtn: { backgroundColor: colors.green[500], borderRadius: borderRadius.xl, paddingVertical: spacing[4], alignItems: 'center', shadowColor: colors.green[500], shadowOffset: {width:0,height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { color: 'white', fontSize: fontSize.base, fontWeight: '700' },
  secondaryBtn: { borderWidth: 2, borderColor: colors.charcoal[200], borderRadius: borderRadius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  secondaryBtnText: { color: colors.charcoal[600], fontSize: fontSize.base, fontWeight: '600' },
  trustText: { fontSize: fontSize.xs, color: colors.charcoal[400], marginTop: spacing[5], textAlign: 'center' },
});
