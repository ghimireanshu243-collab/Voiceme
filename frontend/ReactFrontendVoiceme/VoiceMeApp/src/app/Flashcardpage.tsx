import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2; // 2 columns with 16px screen padding and 12px gap

type Language = 'ne' | 'en';

interface Flashcard {
  id: string;
  wordNe: string;
  transliterationNe: string;
  wordEn: string;
  bgColor: string;
  accentColor: string;
  illustrationType: 'food' | 'water' | 'toilet' | 'help' | 'brush' | 'play' | 'medicine';
}

const FLASHCARDS: Flashcard[] = [
  {
    id: 'food',
    wordNe: 'खाना',
    transliterationNe: 'Khāna',
    wordEn: 'Food',
    bgColor: '#FADCD1', // Soft peach
    accentColor: '#8C461F',
    illustrationType: 'food',
  },
  {
    id: 'water',
    wordNe: 'पानी',
    transliterationNe: 'Pānī',
    wordEn: 'Water',
    bgColor: '#D9ECCA', // Soft mint green
    accentColor: '#2E613B',
    illustrationType: 'water',
  },
  {
    id: 'toilet',
    wordNe: 'शौचालय',
    transliterationNe: 'Shauchālaya',
    wordEn: 'Toilet',
    bgColor: '#E5DDD4', // Warm grey
    accentColor: '#3F5B4E',
    illustrationType: 'toilet',
  },
  {
    id: 'help',
    wordNe: 'सहयोग',
    transliterationNe: 'Sahayog',
    wordEn: 'Help me',
    bgColor: '#FAF0E3', // Soft warm cream
    accentColor: '#C26E36',
    illustrationType: 'help',
  },
  {
    id: 'brush',
    wordNe: 'ब्रश',
    transliterationNe: 'Brash',
    wordEn: 'Brush',
    bgColor: '#E0F2DC', // Soft pale mint
    accentColor: '#8A4118',
    illustrationType: 'brush',
  },
  {
    id: 'play',
    wordNe: 'खेल',
    transliterationNe: 'Khel',
    wordEn: 'Play',
    bgColor: '#EDE3D5', // Soft biscuit cream
    accentColor: '#A7521F',
    illustrationType: 'play',
  },
  {
    id: 'medicine',
    wordNe: 'औषधि',
    transliterationNe: 'Aushadhi',
    wordEn: 'Medicine',
    bgColor: '#FDEAE8', // Soft warm rose/coral
    accentColor: '#B33928',
    illustrationType: 'medicine',
  },
];

// Vector SVG Illustrations matching screenshot aesthetic
const CardIllustration: React.FC<{ type: string; accentColor: string }> = ({ type, accentColor }) => {
  switch (type) {
    case 'food':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Ellipse cx={50} cy={54} rx={38} ry={12} stroke={accentColor} strokeWidth={3} fill="#FFFDF8" />
          <Path d="M20 52 C20 30, 80 30, 80 52 Z" fill="#FFFDF8" stroke={accentColor} strokeWidth={3} />
          <Ellipse cx={50} cy={33} rx={7} ry={4} fill="#84A98C" stroke={accentColor} strokeWidth={2} />
        </Svg>
      );
    case 'water':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Rect x={24} y={18} width={22} height={46} rx={3} stroke={accentColor} strokeWidth={3} fill="#F4FAF0" />
          <Rect x={27} y={32} width={16} height={29} rx={2} fill="#B9DBBA" opacity={0.75} />
          <Ellipse cx={66} cy={30} rx={6} ry={10} fill="#588157" />
          <Ellipse cx={70} cy={52} rx={15} ry={14} fill="#C5D3C1" opacity={0.6} />
        </Svg>
      );
    case 'toilet':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Rect x={36} y={16} width={28} height={26} rx={5} fill="#F4EFE6" stroke="#635B4F" strokeWidth={2.5} />
          <Ellipse cx={50} cy={52} rx={24} ry={11} fill="#FFFDF9" stroke="#3F584C" strokeWidth={3} />
          <Ellipse cx={50} cy={52} rx={18} ry={7} fill="#C2D8CA" opacity={0.5} />
        </Svg>
      );
    case 'help':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Rect x={40} y={36} width={24} height={26} rx={8} fill={accentColor} />
          <Rect x={43} y={14} width={8} height={26} rx={4} fill={accentColor} />
          <Rect x={53} y={16} width={8} height={24} rx={4} fill={accentColor} />
          <Ellipse cx={39} cy={46} rx={5} ry={7} fill={accentColor} />
        </Svg>
      );
    case 'brush':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Rect x={36} y={20} width={18} height={14} rx={4} fill="#F5E8C8" stroke="#D6C49D" strokeWidth={2} transform="rotate(35 45 27)" />
          <Rect x={35} y={26} width={9} height={46} rx={4.5} fill={accentColor} transform="rotate(-40 39 49)" />
          <Circle cx={34} cy={22} r={4} fill="#E8F4E5" opacity={0.9} />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Circle cx={54} cy={36} r={22} fill="#FFFDF8" stroke="#4A3B32" strokeWidth={2.5} />
          <Circle cx={54} cy={36} r={7} fill="#3D4543" />
          <Rect x={24} y={42} width={14} height={14} rx={3} fill={accentColor} />
          <Rect x={64} y={44} width={13} height={13} rx={3} fill={accentColor} />
        </Svg>
      );
    case 'medicine':
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          {/* Capsule pill */}
          <Rect
            x={30}
            y={24}
            width={40}
            height={20}
            rx={10}
            fill="#E56B55"
            stroke={accentColor}
            strokeWidth={2.5}
            transform="rotate(-25 50 34)"
          />
          {/* White half cap */}
          <Path
            d="M31 28 L49 20 L58 37 L40 45 Z"
            fill="#FFFDF9"
          />
          {/* Medical cross */}
          <Rect x={47} y={27} width={6} height={14} rx={2} fill="#E56B55" />
          <Rect x={43} y={31} width={14} height={6} rx={2} fill="#E56B55" />
        </Svg>
      );
    default:
      return (
        <Svg width={74} height={56} viewBox="0 0 100 80">
          <Circle cx={50} cy={40} r={22} fill="#EAE5DC" />
        </Svg>
      );
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('ne');
  const [selectedCard, setSelectedCard] = useState<Flashcard>(FLASHCARDS[0]); // Default to Food / खाना
  const [speakingLanguage, setSpeakingLanguage] = useState<Language | null>(null);

  // Speech function for either Nepali or English
  const speakCard = async (card: Flashcard, targetLang: Language) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setSpeakingLanguage(targetLang);
    const speechText = targetLang === 'ne' ? card.wordNe : card.wordEn;
    const speechLang = targetLang === 'ne' ? 'ne-NP' : 'en-US';

    try {
      await Speech.stop();
      Speech.speak(speechText, {
        language: speechLang,
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setSpeakingLanguage(null),
        onError: () => setSpeakingLanguage(null),
      });
    } catch (e) {
      console.warn(e);
      setSpeakingLanguage(null);
    }
  };

  // When a card box is clicked
  const handleCardPress = (card: Flashcard) => {
    setSelectedCard(card);
    speakCard(card, lang); // Speaks in current active language
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4EFE6"
        translucent={Platform.OS === 'android'}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to home"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
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
        </Pressable>
        <View>
          <Text style={styles.title}>
            {lang === 'ne' ? 'फ्लैशकार्ड' : 'Flashcards'}
          </Text>
          <Text style={styles.subtitle}>tap a card to hear it</Text>
        </View>

        {/* Bilingual Switcher (ने / EN) */}
        <View style={styles.togglePill}>
          <Pressable
            onPress={() => {
              setLang('ne');
              try { Haptics.selectionAsync(); } catch {}
            }}
            style={[styles.toggleBtn, lang === 'ne' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleBtnText, lang === 'ne' && styles.toggleBtnTextActive]}>
              ने
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setLang('en');
              try { Haptics.selectionAsync(); } catch {}
            }}
            style={[styles.toggleBtn, lang === 'en' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleBtnText, lang === 'en' && styles.toggleBtnTextActive]}>
              EN
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2-Column Scrollable Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {FLASHCARDS.map((card) => {
            const isSelected = selectedCard.id === card.id;
            const isSpeakingThisCard = isSelected && speakingLanguage !== null;

            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardPress(card)}
                style={[
                  styles.card,
                  { backgroundColor: card.bgColor },
                  isSelected && styles.cardSelected,
                ]}
              >
                {/* Background ambient circles */}
                <View style={[styles.blob, styles.blobTopLeft]} />
                <View style={[styles.blob, styles.blobBottomRight]} />

                {/* Illustration */}
                <View style={styles.illustrationWrapper}>
                  <CardIllustration type={card.illustrationType} accentColor={card.accentColor} />
                </View>

                {/* Card labels */}
                <View style={styles.labelWrapper}>
                  <Text style={styles.primaryWord}>
                    {lang === 'ne' ? card.wordNe : card.wordEn}
                  </Text>
                  <Text style={styles.secondaryWord}>
                    {lang === 'ne' ? card.wordEn : card.transliterationNe}
                  </Text>
                </View>

                {/* Speaker icon in bottom right */}
                <View style={[styles.speakerBadge, isSpeakingThisCard && styles.speakerBadgeActive]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M11 5L6 9H2V15H6L11 19V5Z"
                      stroke={isSpeakingThisCard ? '#536E50' : '#4E3E33'}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={isSpeakingThisCard ? '#536E50' : 'none'}
                    />
                    <Path
                      d="M15.54 8.46C16.48 9.4 17 10.68 17 12C17 13.32 16.48 14.6 15.54 15.54"
                      stroke={isSpeakingThisCard ? '#536E50' : '#4E3E33'}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Persistent Bottom Speech Bar with Both English & Nepali Word Buttons */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomCard}>
          {/* Header indicator */}
          <View style={styles.bottomBarHeader}>
            <View style={styles.activeIndicatorRow}>
              <View style={styles.greenDot} />
              <Text style={styles.activeCardText}>
                {selectedCard.wordEn} · {selectedCard.wordNe}
              </Text>
            </View>
            <Text style={styles.tapPromptText}>Tap word to speak:</Text>
          </View>

          {/* Dual Language Buttons */}
          <View style={styles.buttonRow}>
            {/* Nepali Speech Button */}
            <Pressable
              onPress={() => speakCard(selectedCard, 'ne')}
              style={({ pressed }) => [
                styles.speechButton,
                speakingLanguage === 'ne' && styles.speechButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.buttonLanguageLabel,
                    speakingLanguage === 'ne' && styles.buttonLanguageLabelActive,
                  ]}
                >
                  🇳🇵 नेपाली
                </Text>
                <Text
                  style={[
                    styles.buttonWordNe,
                    speakingLanguage === 'ne' && styles.buttonWordActive,
                  ]}
                >
                  {selectedCard.wordNe}
                </Text>
              </View>

              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M11 5L6 9H2V15H6L11 19V5Z"
                  stroke={speakingLanguage === 'ne' ? '#FFFFFF' : '#536E50'}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={speakingLanguage === 'ne' ? '#FFFFFF' : '#536E50'}
                />
                <Path
                  d="M15.54 8.46C16.48 9.4 17 10.68 17 12C17 13.32 16.48 14.6 15.54 15.54"
                  stroke={speakingLanguage === 'ne' ? '#FFFFFF' : '#536E50'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>

            {/* English Speech Button */}
            <Pressable
              onPress={() => speakCard(selectedCard, 'en')}
              style={({ pressed }) => [
                styles.speechButton,
                speakingLanguage === 'en' && styles.speechButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.buttonLanguageLabel,
                    speakingLanguage === 'en' && styles.buttonLanguageLabelActive,
                  ]}
                >
                  🇬🇧 English
                </Text>
                <Text
                  style={[
                    styles.buttonWordEn,
                    speakingLanguage === 'en' && styles.buttonWordActive,
                  ]}
                >
                  {selectedCard.wordEn}
                </Text>
              </View>

              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M11 5L6 9H2V15H6L11 19V5Z"
                  stroke={speakingLanguage === 'en' ? '#FFFFFF' : '#536E50'}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={speakingLanguage === 'en' ? '#FFFFFF' : '#536E50'}
                />
                <Path
                  d="M15.54 8.46C16.48 9.4 17 10.68 17 12C17 13.32 16.48 14.6 15.54 15.54"
                  stroke={speakingLanguage === 'en' ? '#FFFFFF' : '#536E50'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EFE6', // Warm oatmeal
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE2D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#342419',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#76675B',
    marginTop: 2,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: '#DFD7C7',
    borderRadius: 24,
    padding: 3,
    alignItems: 'center',
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  toggleBtnActive: {
    backgroundColor: '#9C532B',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6F5E52',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: 172,
    borderRadius: 26,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardSelected: {
    borderColor: '#536E50',
    borderWidth: 2.5,
    transform: [{ scale: 0.99 }],
  },
  blob: {
    position: 'absolute',
    borderRadius: 60,
    backgroundColor: 'rgba(215, 217, 206, 0.45)',
  },
  blobTopLeft: {
    width: 48,
    height: 48,
    top: -6,
    left: -6,
  },
  blobBottomRight: {
    width: 58,
    height: 58,
    bottom: 14,
    right: -10,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  labelWrapper: {
    marginTop: 'auto',
  },
  primaryWord: {
    fontSize: 21,
    fontWeight: '800',
    color: '#342419',
    letterSpacing: -0.3,
  },
  secondaryWord: {
    fontSize: 12.5,
    color: '#76675B',
    marginTop: 2,
    fontWeight: '600',
  },
  speakerBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerBadgeActive: {
    backgroundColor: 'rgba(83, 110, 80, 0.2)',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    paddingTop: 8,
    backgroundColor: '#F4EFE6',
    borderTopWidth: 1,
    borderTopColor: '#E5DDD0',
  },
  bottomCard: {
    backgroundColor: '#E2D3B7',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D4C3A6',
  },
  bottomBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 195, 166, 0.6)',
    marginBottom: 10,
  },
  activeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#536E50',
  },
  activeCardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A3728',
    textTransform: 'uppercase',
  },
  tapPromptText: {
    fontSize: 11,
    color: '#6E5C4E',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  speechButton: {
    flex: 1,
    backgroundColor: '#FDF9F3',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D6C5A9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  speechButtonActive: {
    backgroundColor: '#536E50',
    borderColor: '#3D543B',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  buttonLanguageLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8C461F',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  buttonLanguageLabelActive: {
    color: '#DDEED9',
  },
  buttonWordNe: {
    fontSize: 18,
    fontWeight: '800',
    color: '#342419',
  },
  buttonWordEn: {
    fontSize: 17,
    fontWeight: '800',
    color: '#342419',
  },
  buttonWordActive: {
    color: '#FFFFFF',
  },
});