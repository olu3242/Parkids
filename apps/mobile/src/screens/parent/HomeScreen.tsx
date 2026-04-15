// ============================================================
// PAR-KIDS — Parent Home Screen (Mobile)
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChildSummaryCard } from '@/components/parent/ChildSummaryCard';
import { NextCheckInCard } from '@/components/parent/NextCheckInCard';
import { colors, spacing, borderRadius, fontSize } from '@parkids/ui-tokens';
import type { CheckIn } from '@parkids/shared-types';

export default function ParentHomeScreen() {
  const navigation = useNavigation<any>();
  const { parkidsUser } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [nextCheckIn, setNextCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!parkidsUser) return;

    // Fetch household
    const { data: household } = await supabase
      .from('households')
      .select('id')
      .eq('primary_user_id', parkidsUser.id)
      .single();

    if (!household) { setLoading(false); return; }

    // Fetch children
    const { data: members } = await supabase
      .from('household_members')
      .select(`
        users(
          id, first_name, last_name, avatar_url, date_of_birth,
          child_profiles(avatar_color, grade, nickname)
        )
      `)
      .eq('household_id', household.id)
      .eq('role', 'child');

    setChildren(members?.map((m: any) => m.users).filter(Boolean) ?? []);

    // Fetch next scheduled check-in
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select('*, users!check_ins_child_user_id_fkey(first_name)')
      .eq('household_id', household.id)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    setNextCheckIn(checkIn ?? null);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [parkidsUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.green[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green[500]} />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}! 👋</Text>
            <Text style={styles.greetingName}>{parkidsUser?.first_name}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Feather name="bell" size={20} color={colors.charcoal[600]} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Next Check-In */}
        {nextCheckIn && (
          <NextCheckInCard
            checkIn={nextCheckIn}
            onPress={() => navigation.navigate('CheckInFlow', { checkInId: nextCheckIn.id })}
          />
        )}

        {/* Children */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddChild')}>
              <Text style={styles.sectionAction}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {children.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('AddChild')}
            >
              <Feather name="user-plus" size={32} color={colors.green[400]} />
              <Text style={styles.emptyText}>Add your first child to get started</Text>
              <Text style={styles.emptyAction}>Add Child →</Text>
            </TouchableOpacity>
          ) : (
            children.map((child) => (
              <ChildSummaryCard
                key={child.id}
                child={child}
                onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}
                onCheckIn={() => navigation.navigate('NewCheckIn', { childId: child.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[100],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand[100],
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.charcoal[400],
    fontWeight: '500',
  },
  greetingName: {
    fontSize: fontSize['3xl'],
    color: colors.charcoal[800],
    fontWeight: '700',
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[1],
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  section: {
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.charcoal[800],
  },
  sectionAction: {
    fontSize: fontSize.sm,
    color: colors.green[500],
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.green[100],
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.charcoal[400],
    textAlign: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  emptyAction: {
    fontSize: fontSize.sm,
    color: colors.green[500],
    fontWeight: '600',
  },
});
