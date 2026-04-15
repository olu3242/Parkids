// ============================================================
// PAR-KIDS — MoodSelector Component (Mobile)
// Emoji-based 1–5 mood scale for check-ins
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize, moodEmojis, moodColors } from '@parkids/ui-tokens';

interface MoodSelectorProps {
  value?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const moodLabels: Record<number, string> = {
  1: 'Not Great',
  2: 'A Bit Low',
  3: 'Okay',
  4: 'Pretty Good',
  5: 'Amazing!',
};

export function MoodSelector({ value, onChange, size = 'lg' }: MoodSelectorProps) {
  const emojiSize = size === 'lg' ? 40 : size === 'md' ? 32 : 24;

  const handleSelect = (level: number) => {
    Haptics.selectionAsync();
    onChange(level);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = value === level;
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.moodBtn,
                isSelected && {
                  backgroundColor: moodColors[level] + '20',
                  borderColor: moodColors[level],
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleSelect(level)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: emojiSize }}>
                {moodEmojis[level as keyof typeof moodEmojis]}
              </Text>
              {size === 'lg' && (
                <Text
                  style={[
                    styles.levelNum,
                    isSelected && { color: moodColors[level], fontWeight: '700' },
                  ]}
                >
                  {level}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {value && (
        <Text style={[styles.moodLabel, { color: moodColors[value] }]}>
          {moodLabels[value]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing[3] },
  row: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
  },
  moodBtn: {
    width: 60,
    height: 72,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.sand[200],
    gap: spacing[1],
  },
  levelNum: {
    fontSize: fontSize.xs,
    color: colors.charcoal[400],
    fontWeight: '500',
  },
  moodLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    marginTop: spacing[1],
  },
});
