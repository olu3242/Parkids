import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors } from '@parkids/ui-tokens';

export default function IndexScreen() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check role and route accordingly
        supabase.from('users').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'child') router.replace('/child/home');
          else router.replace('/parent/home');
        });
      } else {
        router.replace('/auth/welcome');
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.sand[100] }}>
      <ActivityIndicator size="large" color={colors.green[500]} />
    </View>
  );
}
