// PAR-KIDS Mobile — Child Home Screen
// Age-appropriate, warm, emoji-first experience
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize, moodEmojis } from '@parkids/ui-tokens';

export default function ChildHomeScreen() {
  const [childName, setChildName] = useState('');
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [lastMood, setLastMood] = useState<number | null>(null);
  const [hasCheckIn, setHasCheckIn] = useState(false);

  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('first_name, child_profiles (nickname)')
      .eq('id', user.id)
      .single();

    if (profile) {
      setChildName((profile as any).child_profiles?.[0]?.nickname ?? (profile as any).first_name ?? 'Friend');
    }

    // Check for pending check-in
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('id, status, child_completed_at')
      .eq('child_user_id', user.id)
      .in('status', ['scheduled', 'in_progress'])
      .limit(1);

    setHasCheckIn((checkIns ?? []).length > 0 && !checkIns![0]?.child_completed_at);

    // Active goals
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, category')
      .eq('child_user_id', user.id)
      .eq('status', 'active')
      .limit(3);

    setActiveGoals(goals ?? []);

    // Last mood
    const { data: moods } = await supabase
      .from('moods')
      .select('mood_level')
      .eq('child_user_id', user.id)
      .eq('logged_as', 'child')
      .order('logged_at', { ascending: false })
      .limit(1);

    setLastMood(moods?.[0]?.mood_level ?? null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting */}
      <View style={styles.greetingArea}>
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.greeting}>Hi, {childName}!</Text>
        <Text style={styles.subGreeting}>How are you doing today?</Text>
      </View>

      {/* Check-In Banner */}
      {hasCheckIn && (
        <TouchableOpacity style={styles.checkInBanner} onPress={() => router.push('/child/check-in')} activeOpacity={0.9}>
          <Text style={styles.checkInIcon}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkInTitle}>It&apos;s Check-In Time!</Text>
            <Text style={styles.checkInSub}>Your parent is waiting — it only takes 15 min!</Text>
          </View>
          <Text style={styles.checkInArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Quick Mood Log */}
      <View style={styles.moodCard}>
        <Text style={styles.moodTitle}>How are you feeling right now?</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map(level => (
            <TouchableOpacity key={level} style={[styles.moodBtn, lastMood === level && styles.moodBtnActive]}
              onPress={() => router.push(`/child/mood?level=${level}`)} activeOpacity={0.8}>
              <Text style={styles.moodEmoji}>{moodEmojis[level]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* My Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 My Goals</Text>
          <TouchableOpacity onPress={() => router.push('/child/goals')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {activeGoals.length === 0 ? (
          <View style={styles.emptyGoals}>
            <Text style={{ fontSize: 32, marginBottom: spacing[2] }}>🌟</Text>
            <Text style={styles.emptyText}>No goals yet! Set one during your next check-in.</Text>
          </View>
        ) : activeGoals.map((goal: any) => (
          <TouchableOpacity key={goal.id} style={styles.goalCard} onPress={() => router.push(`/child/goals/${goal.id}`)} activeOpacity={0.85}>
            <Text style={styles.goalIcon}>🎯</Text>
            <Text style={styles.goalTitle} numberOfLines={2}>{goal.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Encourage message */}
      <View style={styles.encourageCard}>
        <Text style={styles.encourageText}>
          💪 You&apos;re doing great! Every check-in helps you grow stronger.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[100] },
  content: { padding: spacing[5], paddingBottom: 100 },
  greetingArea: { alignItems: 'center', marginBottom: spacing[6], marginTop: spacing[4] },
  wave: { fontSize: 40, marginBottom: spacing[2] },
  greeting: { fontSize: 28, fontWeight: '800', color: colors.charcoal[800], textAlign: 'center' },
  subGreeting: { fontSize: fontSize.base, color: colors.charcoal[500], marginTop: 4 },
  checkInBanner: { backgroundColor: colors.amber[400], borderRadius: borderRadius.xl, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[5], shadowColor: colors.amber[400], shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:5 },
  checkInIcon: { fontSize: 28 },
  checkInTitle: { fontSize: fontSize.base, fontWeight: '800', color: 'white' },
  checkInSub: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  checkInArrow: { fontSize: 20, color: 'white', fontWeight: '700' },
  moodCard: { backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing[5], marginBottom: spacing[5], shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.07, shadowRadius:8, elevation:3 },
  moodTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.charcoal[700], marginBottom: spacing[4], textAlign: 'center' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around' },
  moodBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sand[100], justifyContent: 'center', alignItems: 'center' },
  moodBtnActive: { backgroundColor: colors.green[100], borderWidth: 2, borderColor: colors.green[400] },
  moodEmoji: { fontSize: 28 },
  section: { marginBottom: spacing[5] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.charcoal[800] },
  sectionLink: { fontSize: fontSize.sm, color: colors.green[500], fontWeight: '600' },
  emptyGoals: { backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing[6], alignItems: 'center', borderWidth: 2, borderColor: colors.charcoal[100], borderStyle: 'dashed' },
  emptyText: { fontSize: fontSize.sm, color: colors.charcoal[500], textAlign: 'center' },
  goalCard: { backgroundColor: 'white', borderRadius: borderRadius.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2], shadowColor: '#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:2 },
  goalIcon: { fontSize: 20 },
  goalTitle: { flex: 1, fontSize: fontSize.base, fontWeight: '600', color: colors.charcoal[800] },
  encourageCard: { backgroundColor: colors.green[50], borderRadius: borderRadius.xl, padding: spacing[5], borderWidth: 1, borderColor: colors.green[200] },
  encourageText: { fontSize: fontSize.sm, color: colors.green[700], textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});
