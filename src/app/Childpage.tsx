import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AacCard {
  id: string;
  emoji: string;
  nepali: string;
  english: string;
  speakText: string;
  category: 'needs' | 'food' | 'emotions' | 'actions';
  bgColor: string;
  borderColor: string;
}

const AAC_CARDS: AacCard[] = [
  // Immediate Needs
  {
    id: 'water',
    emoji: '💧',
    nepali: 'पानी पिउनु छ',
    english: 'Want water',
    speakText: 'मलाई पानी पिउनु छ।',
    category: 'food',
    bgColor: '#E3F2FD',
    borderColor: '#90CAF9',
  },
  {
    id: 'food',
    emoji: '🍲',
    nepali: 'भोक लाग्यो / खाना',
    english: 'Hungry / Food',
    speakText: 'मलाई भोक लाग्यो, खाना खानु छ।',
    category: 'food',
    bgColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  {
    id: 'toilet',
    emoji: '🚻',
    nepali: 'शौचालय जानु छ',
    english: 'Need toilet',
    speakText: 'मलाई शौचालय जानु छ।',
    category: 'needs',
    bgColor: '#F3E5F5',
    borderColor: '#CE93D8',
  },
  {
    id: 'help',
    emoji: '🆘',
    nepali: 'मद्दत गर्नुहोस्',
    english: 'Help me',
    speakText: 'कृपया मलाई मद्दत गर्नुहोस्।',
    category: 'needs',
    bgColor: '#FFEBEE',
    borderColor: '#EF9A9A',
  },
  {
    id: 'happy',
    emoji: '😊',
    nepali: 'म खुशी छु',
    english: 'I am happy',
    speakText: 'म धेरै खुशी छु।',
    category: 'emotions',
    bgColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  {
    id: 'hurt',
    emoji: '🤕',
    nepali: 'मलाई दुख्यो',
    english: 'I am in pain',
    speakText: 'मलाई दुख्यो, असहज भयो।',
    category: 'emotions',
    bgColor: '#FBE9E7',
    borderColor: '#FFAB91',
  },
  {
    id: 'sleepy',
    emoji: '🥱',
    nepali: 'निन्द्रा लाग्यो',
    english: 'Sleepy / Tired',
    speakText: 'मलाई निन्द्रा लाग्यो, आराम गर्न चाहन्छु।',
    category: 'needs',
    bgColor: '#EDE7F6',
    borderColor: '#B39DDB',
  },
  {
    id: 'yes',
    emoji: '👍',
    nepali: 'हुन्छ / ठीक छ',
    english: 'Yes / Okay',
    speakText: 'हुन्छ, ठीक छ।',
    category: 'actions',
    bgColor: '#E8F8F5',
    borderColor: '#A2D9CE',
  },
  {
    id: 'no',
    emoji: '✋',
    nepali: 'हुँदैन / रोक्नुहोस्',
    english: 'No / Stop',
    speakText: 'नाइँ, मलाई यो मन परेन।',
    category: 'actions',
    bgColor: '#FDEDEC',
    borderColor: '#F5B7B1',
  },
  {
    id: 'mom',
    emoji: '👩‍👦',
    nepali: 'आमा चाहियो',
    english: 'Want Mom',
    speakText: 'मलाई आमा बोलाउनुहोस्।',
    category: 'needs',
    bgColor: '#FCE4EC',
    borderColor: '#F48FB1',
  },
  {
    id: 'play',
    emoji: '⚽',
    nepali: 'खेल्न मन लाग्यो',
    english: 'Want to play',
    speakText: 'मलाई खेल्न मन लाग्यो।',
    category: 'actions',
    bgColor: '#FFFDE7',
    borderColor: '#FFF59D',
  },
  {
    id: 'home',
    emoji: '🏠',
    nepali: 'घर जाऔं',
    english: 'Go home',
    speakText: 'मलाई घर जान मन छ।',
    category: 'actions',
    bgColor: '#E0F2F1',
    borderColor: '#80CBC4',
  },
];

export default function Childpage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSpeech, setCurrentSpeech] = useState<string>('मलाई पानी पिउनु छ।');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [childName, setChildName] = useState('आरव (Aarav)');
  const [childAvatar, setChildAvatar] = useState('👦');

  useEffect(() => {
    AsyncStorage.multiGet(['voiceme.registeredName', 'voiceme.registeredAvatar'])
      .then((entries) => {
        if (entries[0][1]?.trim()) setChildName(entries[0][1].trim());
        if (entries[1][1]?.trim()) setChildAvatar(entries[1][1].trim());
      })
      .catch(() => {});
  }, []);

  const speakPhrase = (phrase: string, cardId?: string) => {
    if (cardId) setActiveCardId(cardId);
    setCurrentSpeech(phrase);
    setIsSpeaking(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        utterance.lang = 'ne-NP';
        utterance.onend = () => {
          setIsSpeaking(false);
          setActiveCardId(null);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setActiveCardId(null);
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setActiveCardId(null);
      }
    } else {
      try {
        Speech.stop();
        Speech.speak(phrase, {
          language: 'ne-NP',
          pitch: 1.05,
          rate: 0.9,
          onDone: () => {
            setIsSpeaking(false);
            setActiveCardId(null);
          },
          onError: () => {
            setIsSpeaking(false);
            setActiveCardId(null);
          },
        });
      } catch {
        setIsSpeaking(false);
        setActiveCardId(null);
      }
    }
  };

  const handleClearSpeech = () => {
    setCurrentSpeech('');
    setActiveCardId(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else {
      Speech.stop();
    }
    setIsSpeaking(false);
  };

  const filteredCards = selectedCategory === 'all'
    ? AAC_CARDS
    : AAC_CARDS.filter((c) => c.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />

      {/* Header with return and child info */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/Homepage');
          }}
          style={styles.backButton}
          accessibilityLabel="Return to homepage"
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
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitleHindi}>मेरो आवाज (Voice Me AAC)</Text>
          <Text style={styles.headerSubtitle}>आवाज साथी · Tap cards to speak</Text>
        </View>

        <View style={styles.childAvatarPill}>
          <Text style={styles.avatarEmoji}>{childAvatar}</Text>
          <Text style={styles.avatarName}>{childName.split(' ')[0]}</Text>
        </View>
      </View>

      {/* Current Speech / Sentence Bar */}
      <View style={styles.speechBarCard}>
        <View style={styles.speechBarLeft}>
          <View style={[styles.speakerIconCircle, isSpeaking && styles.speakerSpeaking]}>
            <Text style={styles.speakerEmoji}>{isSpeaking ? '🔊' : '🗣️'}</Text>
          </View>
          <Text style={styles.speechText}>
            {currentSpeech || 'कुनै कार्ड छान्नुहोस् (Tap a card)...'}
          </Text>
        </View>

        <View style={styles.speechActionRow}>
          {currentSpeech ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.speakAgainBtn}
              onPress={() => speakPhrase(currentSpeech)}
            >
              <Text style={styles.speakAgainBtnText}>बजाउनुहोस् (Speak)</Text>
            </TouchableOpacity>
          ) : null}

          {currentSpeech ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.clearBtn}
              onPress={handleClearSpeech}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Selection Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {[
          { key: 'all', label: '🌟 सबै (All)' },
          { key: 'food', label: '🍲 खानपिन (Food)' },
          { key: 'needs', label: '🚻 आवश्यकता (Needs)' },
          { key: 'emotions', label: '😊 भावना (Feelings)' },
          { key: 'actions', label: '⚽ काम (Actions)' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(tab.key)}
            >
              <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* AAC Communication Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsGrid}>
          {filteredCards.map((card) => {
            const isSelected = activeCardId === card.id;
            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.7}
                style={[
                  styles.aacCard,
                  { backgroundColor: card.bgColor, borderColor: card.borderColor },
                  isSelected && styles.aacCardActive,
                ]}
                onPress={() => speakPhrase(card.speakText, card.id)}
              >
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                </View>
                <Text style={styles.cardNepaliText}>{card.nepali}</Text>
                <Text style={styles.cardEnglishText}>{card.english}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Help SOS Bar */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emergencyBar}
          onPress={() => speakPhrase('मलाई तुरुन्तै सहयोग चाहियो, आमा यता आउनुहोस्!')}
        >
          <View style={styles.emergencyIconWrapper}>
            <Text style={{ fontSize: 24 }}>🚨</Text>
          </View>
          <View style={styles.emergencyTextCol}>
            <Text style={styles.emergencyTitle}>आपतकालीन सहायता (Emergency Help)</Text>
            <Text style={styles.emergencySub}>Tap to call parent or alert caregiver</Text>
          </View>
          <View style={styles.emergencyPill}>
            <Text style={styles.emergencyPillText}>बोल्नुहोस् (Alert)</Text>
          </View>
        </TouchableOpacity>

        {/* Bottom Return Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.bottomReturnBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/Homepage');
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke="#342419"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.bottomReturnBtnText}>गृहपृष्ठमा फर्कनुहोस् · Return to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE2D4',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE1D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitleHindi: {
    fontSize: 17,
    fontWeight: '800',
    color: '#322216',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7A6B5F',
    marginTop: 1,
  },
  childAvatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F0E3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CEE3CA',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#28552F',
  },
  speechBarCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2D5C3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  speechBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  speakerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerSpeaking: {
    backgroundColor: '#D7E8D3',
    transform: [{ scale: 1.05 }],
  },
  speakerEmoji: {
    fontSize: 20,
  },
  speechText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A1F16',
    flex: 1,
  },
  speechActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakAgainBtn: {
    backgroundColor: '#28552F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  speakAgainBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAE0D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5C4A3E',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
    maxHeight: 44,
  },
  categoryTab: {
    backgroundColor: '#ECE3D4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    height: 36,
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#28552F',
  },
  categoryTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#544335',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  aacCard: {
    width: '48%',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  aacCardActive: {
    transform: [{ scale: 0.97 }],
    borderWidth: 3,
  },
  cardIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardNepaliText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#281E15',
    textAlign: 'center',
  },
  cardEnglishText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6F6052',
    marginTop: 2,
    textAlign: 'center',
  },
  emergencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDECE4',
    borderRadius: 20,
    padding: 14,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: '#F6B79D',
  },
  emergencyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextCol: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#BA3818',
  },
  emergencySub: {
    fontSize: 11,
    color: '#8A5848',
    marginTop: 1,
  },
  emergencyPill: {
    backgroundColor: '#BA3818',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  emergencyPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAE0CE',
    borderWidth: 1.5,
    borderColor: '#DAC9B8',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 16,
    columnGap: 8,
  },
  bottomReturnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#342419',
  },
});
