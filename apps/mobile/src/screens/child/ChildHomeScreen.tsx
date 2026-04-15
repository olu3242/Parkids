// ============================================================
// PAR-KIDS — Child Home Screen (Mobile)
// Age-appropriate dashboard for child users
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize, moodEmojis } from '@parkids/ui-tokens';
import type { Goal, MoodEntry, CheckIn } from '@parkids/shared-types';

export default function ChildHomeScreen() {
  const navigation = useNavigation<any>();
  const { parkidsUser } = useAuth();
  const [pendingCheckIn, setPendingCheckIn] = useState<CheckIn | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [lastMood, setLastMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildData = async () => {
      if (!parkidsUser) return;

      // Check for pending check-in (child's portion)
      const { data: checkIn } = await supabase
        .from('check_ins')
        .select('*')
        .eq('child_user_id', parkidsUser.id)
        .in('status', ['scheduled', 'in_progress'])
        .is('child_completed_at', null)
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();
      setPendingCheckIn(checkIn ?? null);

      // Active goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('child_user_id', parkidsUser.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .limit(3);
      setActiveGoals(goals ?? []);

      // Last mood
      const { data: mood } = await supabase
        .from('moods')
        .select('*')
        .eq('child_user_id', parkidsUser.id)
        .eq('logged_as', 'child')
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();
      setLastMood(mood ?? null);

      setLoading(false);
    };
    loadChildData();
  }, [parkidsUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.teal[400]} />
      </SafeAreaView>
    );
  }

  const firstName = parkidsUser?.first_name ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌤️ Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Greeting Header */}
        <LinearGradient
          colors={[colors.teal[400], colors.green[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.nameText}>{firstName}! 👋</Text>
          {lastMood && (
            <View style={styles.lastMoodBadge}>
              <Text style={styles.lastMoodEmoji}>
                {moodEmojis[lastMood.mood_level as keyof typeof moodEmojis]}
              </Text>
              <Text style={styles.lastMoodText}>Last mood</Text>
            </View>
          )}
        </LinearGradient>

        {/* Check-In Banner */}
        {pendingCheckIn && (
          <TouchableOpacity
            style={styles.checkInBanner}
            onPress={() => navigation.navigate('ChildCheckIn', {
              checkInId: pendingCheckIn.id,
              childId: parkidsUser?.id,
            })}
            activeOpacity={0.85}
          >
            <View style={styles.checkInBannerContent}>
              <Text style={styles.checkInIcon}>✅</Text>
              <View style={styles.checkInTextBlock}>
                <Text style={styles.checkInTitle}>It's Check-In Time!</Text>
                <Text style={styles.checkInSub}>
                  Takes about 15 minutes. Let's do it!
                </Text>
              </View>
            </View>
            <View style={styles.checkInArrow}>
              <Text style={styles.checkInArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* My Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 My Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChildGoals')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {activeGoals.length === 0 ? (
            <View style={styles.emptyGoals}>
              <Text style={styles.emptyGoalsText}>No goals yet!</Text>
              <Text style={styles.emptyGoalsSub}>
                Set a goal with your parent during check-in 🌱
              </Text>
            </View>
          ) : (
            activeGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
              >
                <View style={styles.goalLeft}>
                  <View style={[styles.goalDot, { backgroundColor: colors.green[400] }]} />
                  <View>
                    <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                    <Text style={styles.goalCategory}>{goal.category}</Text>
                  </View>
                </View>
                <Text style={styles.goalArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Mood Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 How Are You Feeling?</Text>
          <TouchableOpacity
            style={styles.moodLogBtn}
            onPress={() => navigation.navigate('LogMood')}
          >
            <Text style={styles.moodLogBtnText}>
              {lastMood
                ? `${moodEmojis[lastMood.mood_level as keyof typeof moodEmojis]} Log today's mood`
                : '+ Log how you feel'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[100] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand[100] },
  content: { paddingHorizontal: spacing[5], paddingBottom: spacing[10] },
  headerCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    marginTop: spacing[4],
    marginBottom: spacing[5],
  },
  greetingText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  nameText: { fontSize: fontSize['3xl'], color: colors.white, fontWeight: '800', marginTop: spacing[1] },
  lastMoodBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    marginTop: spacing[4], backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: borderRadius.full, alignSelf: 'flex-start',
  },
  lastMoodEmoji: { fontSize: 20 },
  lastMoodText: { fontSize: fontSize.xs, color: colors.white, fontWeight: '600' },
  checkInBanner: {
    backgroundColor: colors.green[500],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  checkInBannerContent: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  checkInIcon: { fontSize: 28 },
  checkInTextBlock: {},
  checkInTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  checkInSub: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  checkInArrow: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  checkInArrowText: { color: colors.white, fontWeight: '700', fontSize: fontSize.lg },
  section: { marginBottom: spacing[6] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.charcoal[800] },
  seeAll: { fontSize: fontSize.sm, color: colors.green[500], fontWeight: '600' },
  emptyGoals: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing[6], alignItems: 'center' },
  emptyGoalsText: { fontSize: fontSize.base, fontWeight: '600', color: colors.charcoal[500] },
  emptyGoalsSub: { fontSize: fontSize.sm, color: colors.charcoal[300], marginTop: spacing[1], textAlign: 'center' },
  goalCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing[4], flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing[2],
  },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  goalDot: { width: 10, height: 10, borderRadius: 5 },
  goalTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.charcoal[800] },
  goalCategory: { fontSize: fontSize.xs, color: colors.charcoal[400], marginTop: 2 },
  goalArrow: { fontSize: 20, color: colors.charcoal[300] },
  moodLogBtn: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing[4], alignItems: 'center',
    borderWidth: 2, borderColor: colors.teal[200], borderStyle: 'dashed',
  },
  moodLogBtnText: { fontSize: fontSize.base, color: colors.teal[500], fontWeight: '600' },
});
