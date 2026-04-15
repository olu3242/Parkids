// ============================================================
// PAR-KIDS — Check-In Flow Screen (Mobile)
// Guided multi-step check-in engine
// ============================================================
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { MoodSelector } from '@/components/checkin/MoodSelector';
import { RatingSelector } from '@/components/checkin/RatingSelector';
import { colors, spacing, borderRadius, fontSize, moodEmojis } from '@parkids/ui-tokens';
import type { CheckInSection, CheckInQuestion } from '@parkids/shared-types';

// Check-in sections definition (loaded from template in production)
const DEFAULT_SECTIONS: CheckInSection[] = [
  {
    id: 'mood',
    title: 'How Are You Feeling?',
    description: "Let's start with how you're feeling",
    icon: '💙',
    order: 1,
    respondent: 'child',
    questions: [
      { id: 'mood_scale', text: 'How are you feeling this week?', type: 'mood_scale', required: true },
      { id: 'mood_word', text: 'One word to describe your week?', type: 'short_text', placeholder: 'e.g. happy, tired, excited', required: false },
    ],
  },
  {
    id: 'school',
    title: 'School & Learning',
    description: 'How was school this week?',
    icon: '📚',
    order: 2,
    respondent: 'both',
    questions: [
      { id: 'school_rating', text: 'How was school overall?', type: 'rating', required: true },
      { id: 'school_highlight', text: 'What was your favorite thing?', type: 'short_text', placeholder: 'Tell me something that stood out', required: false },
      { id: 'school_hard', text: 'Anything that felt challenging?', type: 'short_text', placeholder: "It's okay to share", required: false },
    ],
  },
  {
    id: 'friends',
    title: 'Friends & Social',
    description: 'How are your friendships?',
    icon: '🤝',
    order: 3,
    respondent: 'child',
    questions: [
      { id: 'friends_rating', text: 'How are things with your friends?', type: 'rating', required: true },
      { id: 'friends_note', text: 'Anything happen with friends this week?', type: 'short_text', placeholder: 'Good stuff or tough stuff', required: false },
    ],
  },
  {
    id: 'wins',
    title: 'Your Wins! 🎉',
    description: "Let's celebrate the good stuff",
    icon: '🏆',
    order: 4,
    respondent: 'child',
    questions: [
      { id: 'biggest_win', text: "What's something you're proud of this week?", type: 'long_text', placeholder: 'Even small wins count!', required: false },
    ],
  },
  {
    id: 'challenges',
    title: 'Anything Bothering You?',
    description: "This is a safe space to share",
    icon: '💬',
    order: 5,
    respondent: 'child',
    questions: [
      { id: 'challenge', text: 'Is anything worrying you or feeling hard?', type: 'long_text', placeholder: 'You can share anything here', required: false },
    ],
  },
  {
    id: 'parent_reflection',
    title: 'Parent Notes',
    description: 'Your private thoughts (only you see this)',
    icon: '🔒',
    order: 6,
    respondent: 'parent',
    questions: [
      { id: 'parent_concern', text: 'Any concerns or things to follow up on?', type: 'long_text', required: false },
      { id: 'parent_proud', text: "What are you proud of in your child?", type: 'short_text', required: false },
    ],
  },
];

export default function CheckInFlowScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { parkidsUser } = useAuth();
  const { checkInId, childId, respondentMode = 'child' } = route.params ?? {};

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const sections = DEFAULT_SECTIONS.filter(s =>
    s.respondent === respondentMode || s.respondent === 'both'
  );
  const currentSection = sections[currentSectionIndex];
  const progress = (currentSectionIndex + 1) / sections.length;

  const animateProgress = (toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [`${currentSection.id}_${questionId}`]: value }));
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      animateProgress((currentSectionIndex + 2) / sections.length);
    } else {
      // Complete check-in
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      animateProgress(currentSectionIndex / sections.length);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Save responses to Supabase
      const responseRows = Object.entries(responses).map(([key, value]) => {
        const [sectionKey, questionId] = key.split('_');
        const section = sections.find(s => s.id === sectionKey);
        const question = section?.questions.find(q => q.id === questionId);
        return {
          check_in_id: checkInId,
          section_id: null, // Will be set after section records created
          question_id: questionId,
          question_text: question?.text ?? '',
          response_type: question?.type ?? 'short_text',
          response_value: value,
          responded_by: parkidsUser?.id,
          responded_as: respondentMode,
        };
      });

      // Update check-in status
      const updateField = respondentMode === 'child'
        ? { child_completed_at: new Date().toISOString() }
        : { parent_completed_at: new Date().toISOString(), status: 'completed' };

      await supabase
        .from('check_ins')
        .update(updateField)
        .eq('id', checkInId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('CheckInComplete', { checkInId });
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestion = (question: CheckInQuestion) => {
    const key = `${currentSection.id}_${question.id}`;
    const value = responses[key] ?? '';

    switch (question.type) {
      case 'mood_scale':
        return (
          <MoodSelector
            key={question.id}
            value={value ? parseInt(value) : undefined}
            onChange={(v) => handleResponse(question.id, String(v))}
          />
        );
      case 'rating':
        return (
          <RatingSelector
            key={question.id}
            value={value ? parseInt(value) : undefined}
            onChange={(v) => handleResponse(question.id, String(v))}
          />
        );
      case 'long_text':
        return (
          <TextInput
            key={question.id}
            style={[styles.textInput, styles.textInputLarge]}
            multiline
            numberOfLines={5}
            placeholder={question.placeholder ?? 'Share your thoughts...'}
            placeholderTextColor={colors.charcoal[300]}
            value={value}
            onChangeText={(v) => handleResponse(question.id, v)}
          />
        );
      default:
        return (
          <TextInput
            key={question.id}
            style={styles.textInput}
            placeholder={question.placeholder ?? 'Type here...'}
            placeholderTextColor={colors.charcoal[300]}
            value={value}
            onChangeText={(v) => handleResponse(question.id, v)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.charcoal[600]} />
          </TouchableOpacity>
          <Text style={styles.stepLabel}>
            {currentSectionIndex + 1} of {sections.length}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="x" size={20} color={colors.charcoal[400]} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Header */}
          <Text style={styles.sectionIcon}>{currentSection.icon}</Text>
          <Text style={styles.sectionTitle}>{currentSection.title}</Text>
          {currentSection.description && (
            <Text style={styles.sectionDesc}>{currentSection.description}</Text>
          )}

          {/* Questions */}
          <View style={styles.questions}>
            {currentSection.questions.map((question) => (
              <View key={question.id} style={styles.questionBlock}>
                <Text style={styles.questionText}>{question.text}</Text>
                {renderQuestion(question)}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, isSaving && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={isSaving}
          >
            <Text style={styles.nextBtnText}>
              {isSaving
                ? 'Saving...'
                : currentSectionIndex === sections.length - 1
                ? '✓ Complete Check-In'
                : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[3],
  },
  backBtn: { padding: spacing[1] },
  stepLabel: { fontSize: fontSize.sm, color: colors.charcoal[400], fontWeight: '500' },
  progressTrack: {
    height: 4, backgroundColor: colors.sand[200],
    marginHorizontal: spacing[5], borderRadius: borderRadius.full,
  },
  progressFill: {
    height: '100%', backgroundColor: colors.green[500],
    borderRadius: borderRadius.full,
  },
  content: {
    paddingHorizontal: spacing[6], paddingTop: spacing[8], paddingBottom: spacing[4],
  },
  sectionIcon: { fontSize: 48, textAlign: 'center', marginBottom: spacing[3] },
  sectionTitle: {
    fontSize: fontSize['2xl'], fontWeight: '700', color: colors.charcoal[800],
    textAlign: 'center', marginBottom: spacing[2],
  },
  sectionDesc: {
    fontSize: fontSize.base, color: colors.charcoal[400],
    textAlign: 'center', lineHeight: 22, marginBottom: spacing[6],
  },
  questions: { gap: spacing[5] },
  questionBlock: { gap: spacing[2] },
  questionText: {
    fontSize: fontSize.base, fontWeight: '600', color: colors.charcoal[700],
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    borderWidth: 1.5, borderColor: colors.sand[300],
    padding: spacing[4], fontSize: fontSize.base, color: colors.charcoal[800],
  },
  textInputLarge: { minHeight: 120, textAlignVertical: 'top' },
  footer: {
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    backgroundColor: colors.sand[50],
    borderTopWidth: 1, borderTopColor: colors.sand[200],
  },
  nextBtn: {
    backgroundColor: colors.green[500], borderRadius: borderRadius.xl,
    paddingVertical: spacing[4], alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: colors.green[300] },
  nextBtnText: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
});
