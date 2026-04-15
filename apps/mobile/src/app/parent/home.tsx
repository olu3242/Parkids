import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, borderRadius, fontSize } from '@parkids/ui-tokens';

export default function ParentHomeScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [upcomingCheckIn, setUpcomingCheckIn] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/auth/welcome'); return; }

    const { data: rels } = await supabase
      .from('parent_child_relationships')
      .select('child_user_id, users:child_user_id (id, first_name, child_profiles (nickname, grade, avatar_color))')
      .eq('parent_user_id', user.id);
    setChildren((rels ?? []).map((r: any) => r.users).filter(Boolean));

    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('*, users:child_user_id (first_name)')
      .eq('parent_user_id', user.id)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_at', { ascending: true })
      .limit(1);
    setUpcomingCheckIn(checkIns?.[0] ?? null);
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green[500]} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.subGreeting}>Check in with your family today</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Banner */}
      {upcomingCheckIn && (
        <TouchableOpacity style={styles.checkInBanner} onPress={() => router.push(`/parent/check-in/${upcomingCheckIn.id}`)} activeOpacity={0.9}>
          <View>
            <Text style={styles.bannerLabel}>📅 Upcoming Check-In</Text>
            <Text style={styles.bannerTitle}>With {upcomingCheckIn.users?.first_name}</Text>
            <Text style={styles.bannerDate}>{new Date(upcomingCheckIn.scheduled_at).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</Text>
          </View>
          <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Start →</Text></View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[['✅','Check-In','/parent/check-in/new'],['🎯','Goals','/parent/goals'],['📊','Growth','/parent/growth'],['😊','Mood','/parent/mood']].map(([icon,label,href]) => (
          <TouchableOpacity key={label} style={styles.quickAction} onPress={() => router.push(href as any)} activeOpacity={0.8}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
            <Text style={styles.quickActionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Children */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Children</Text>
          <TouchableOpacity onPress={() => router.push('/parent/children/add')}>
            <Text style={styles.sectionLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/parent/children/add')} activeOpacity={0.8}>
            <Text style={{ fontSize: 40, marginBottom: spacing[3] }}>👶</Text>
            <Text style={styles.emptyTitle}>Add your first child</Text>
            <Text style={styles.emptySubtitle}>Tap to create a profile and start check-ins</Text>
          </TouchableOpacity>
        ) : children.map((child: any) => (
          <TouchableOpacity key={child.id} style={styles.childCard} onPress={() => router.push(`/parent/children/${child.id}`)} activeOpacity={0.85}>
            <View style={[styles.childAvatar, { backgroundColor: child.child_profiles?.[0]?.avatar_color ?? colors.teal[400] }]}>
              <Text style={styles.childAvatarText}>{child.first_name?.[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.childName}>{child.child_profiles?.[0]?.nickname ?? child.first_name}</Text>
              <Text style={styles.childGrade}>{child.child_profiles?.[0]?.grade ?? 'Grade not set'}</Text>
            </View>
            <Text style={{ fontSize: 24 }}>😊</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[100] },
  content: { padding: spacing[5], paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[6] },
  greeting: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.charcoal[800] },
  subGreeting: { fontSize: fontSize.sm, color: colors.charcoal[500], marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:3 },
  checkInBanner: { backgroundColor: colors.green[500], borderRadius: borderRadius.xl, padding: spacing[5], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6], shadowColor: colors.green[500], shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:10, elevation:6 },
  bannerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs, fontWeight: '600', marginBottom: 4 },
  bannerTitle: { color: 'white', fontSize: fontSize.lg, fontWeight: '700' },
  bannerDate: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 2 },
  bannerBtn: { backgroundColor: 'white', paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.md },
  bannerBtnText: { color: colors.green[600], fontWeight: '700', fontSize: fontSize.sm },
  quickActions: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] },
  quickAction: { flex: 1, backgroundColor: 'white', borderRadius: borderRadius.lg, padding: spacing[4], alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:2 },
  quickActionLabel: { fontSize: fontSize.xs, color: colors.charcoal[600], fontWeight: '600', textAlign: 'center', marginTop: 4 },
  section: { marginBottom: spacing[6] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.charcoal[800] },
  sectionLink: { fontSize: fontSize.sm, color: colors.green[500], fontWeight: '600' },
  emptyCard: { backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing[8], alignItems: 'center', borderWidth: 2, borderColor: colors.charcoal[100], borderStyle: 'dashed' },
  emptyTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.charcoal[800], marginBottom: spacing[1] },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.charcoal[500], textAlign: 'center' },
  childCard: { backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing[4], flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3], shadowColor: '#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:2 },
  childAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  childAvatarText: { color: 'white', fontWeight: '700', fontSize: fontSize.lg },
  childName: { fontSize: fontSize.base, fontWeight: '700', color: colors.charcoal[800] },
  childGrade: { fontSize: fontSize.xs, color: colors.charcoal[500], marginTop: 2 },
});
