import React, { useState, useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RoutineItem {
  id: string;
  time: string;
  nepaliTitle: string;
  englishTitle: string;
  icon: string;
  completed: boolean;
}

const ROUTINE_STORAGE_KEY = 'voiceme.daily_routine_state';

const INITIAL_ROUTINE: RoutineItem[] = [
  {
    id: '1',
    time: '०७:३० AM',
    nepaliTitle: 'दाँत माझ्नु',
    englishTitle: 'Brush teeth',
    icon: '🪥',
    completed: true,
  },
  {
    id: '2',
    time: '०८:०० AM',
    nepaliTitle: 'बिहानको खाजा',
    englishTitle: 'Morning breakfast',
    icon: '🥣',
    completed: true,
  },
  {
    id: '3',
    time: '०८:३० AM',
    nepaliTitle: 'औषधि खानु',
    englishTitle: 'Morning medicine',
    icon: '💊',
    completed: true,
  },
  {
    id: '4',
    time: '१०:०० AM',
    nepaliTitle: 'पढाइ र सिकाइ',
    englishTitle: 'Learning & study',
    icon: '📚',
    completed: false,
  },
  {
    id: '5',
    time: '०१:०० PM',
    nepaliTitle: 'दिउँसोको खाना',
    englishTitle: 'Lunch time',
    icon: '🍱',
    completed: false,
  },
  {
    id: '6',
    time: '०४:३० PM',
    nepaliTitle: 'खेलकुद र रमाइलो',
    englishTitle: 'Playtime & activity',
    icon: '⚽',
    completed: false,
  },
  {
    id: '7',
    time: '०८:०० PM',
    nepaliTitle: 'साँझको खाना र सुत्ने',
    englishTitle: 'Dinner & bedtime',
    icon: '🌙',
    completed: false,
  },
];

export default function Dailyroutinepage() {
  const [routines, setRoutines] = useState<RoutineItem[]>(INITIAL_ROUTINE);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ROUTINE_STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          try {
            setRoutines(JSON.parse(saved));
          } catch { }
        }
      })
      .catch(() => { });
  }, []);

  const completedCount = routines.filter((r) => r.completed).length;
  const progressPercent = Math.round((completedCount / routines.length) * 100);

  const toggleRoutine = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch { }

    const updated = routines.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setRoutines(updated);
    AsyncStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(updated)).catch(() => { });
  };

  const speakRoutine = (item: RoutineItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch { }

    setSpeakingId(item.id);
    Speech.stop();
    Speech.speak(`${item.nepaliTitle}`, {
      language: 'ne-NP',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4EFE6"
        translucent={Platform.OS === 'android'}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to home"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressedState]}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke="#342419"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.backText}>गृहपृष्ठ · Home</Text>
        </Pressable>

        <Text style={styles.brandTitle}>Voice Me</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>दिनचर्या</Text>
          <Text style={styles.subtitle}>Daily Routine Schedule</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressMainText}>दैनिक प्रगति (Progress)</Text>
              <Text style={styles.progressSubText}>
                {completedCount} of {routines.length} कार्यहरू पूरा (completed)
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Bar track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Routine Checklist Items */}
        <View style={styles.routineList}>
          {routines.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.routineCard,
                item.completed && styles.routineCardDone,
                pressed && styles.pressedState,
              ]}
              onPress={() => toggleRoutine(item.id)}
            >
              {/* Checkbox indicator */}
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxDone,
                ]}
              >
                {item.completed && <Text style={styles.checkIcon}>✓</Text>}
              </View>

              {/* Emoji Icon */}
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>

              {/* Text info */}
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTime}>{item.time}</Text>
                <Text
                  style={[
                    styles.itemTitleNe,
                    item.completed && styles.itemTitleDone,
                  ]}
                >
                  {item.nepaliTitle}
                </Text>
                <Text style={styles.itemTitleEn}>{item.englishTitle}</Text>
              </View>

              {/* Speaker button to pronounce task */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Pronounce ${item.nepaliTitle}`}
                style={({ pressed }) => [
                  styles.speakerButton,
                  speakingId === item.id && styles.speakerButtonActive,
                  pressed && styles.pressedState,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  speakRoutine(item);
                }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M11 5L6 9H2V15H6L11 19V5Z"
                    stroke={speakingId === item.id ? '#FFFFFF' : '#4E3E33'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={speakingId === item.id ? '#FFFFFF' : 'none'}
                  />
                  <Path
                    d="M15.54 8.46C16.48 9.4 17 10.68 17 12C17 13.32 16.48 14.6 15.54 15.54"
                    stroke={speakingId === item.id ? '#FFFFFF' : '#4E3E33'}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EFE6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE2D5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    columnGap: 6,
  },
  backText: {
    color: '#342419',
    fontSize: 13.5,
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B2419',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  titleSection: {
    marginVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#342419',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#76675B',
    marginTop: 2,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#E5DDD4',
    borderRadius: 22,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#D8CDC2',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#342419',
  },
  progressSubText: {
    fontSize: 12,
    color: '#6F5E52',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#2E5936',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  percentText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E5936',
    borderRadius: 4,
  },
  routineList: {
    marginTop: 8,
    rowGap: 10,
  },
  routineCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  routineCardDone: {
    backgroundColor: '#EAEEDB',
    borderColor: '#C6DCBF',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#A8998C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: '#2E5936',
    borderColor: '#2E5936',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C461F',
    marginBottom: 2,
  },
  itemTitleNe: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#342419',
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    color: '#76675B',
  },
  itemTitleEn: {
    fontSize: 12,
    color: '#76675B',
    marginTop: 1,
  },
  speakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE5D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  speakerButtonActive: {
    backgroundColor: '#2E5936',
  },
  pressedState: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});