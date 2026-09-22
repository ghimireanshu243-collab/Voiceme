import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Platform,
  Switch,
  Modal,
  Linking,
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
const AUTH_TOKEN_KEY = 'voiceme.authToken';
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

const DEFAULT_ROUTINES: RoutineItem[] = [
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

export default function Caregiverpage() {
  const [childName, setChildName] = useState('आरव (Aarav)');
  const [childAge, setChildAge] = useState('६ वर्ष (6 yrs)');
  const [childAvatar, setChildAvatar] = useState('👦');
  const [parentName, setParentName] = useState('सिता शर्मा (Sita Sharma)');
  const [emergencyPhone, setEmergencyPhone] = useState('९८४१२३४५६७');
  const [caregiverName, setCaregiverName] = useState('माया घिमिरे (Maya Ghimire)');
  const [allowCaregiverEdit, setAllowCaregiverEdit] = useState(true);

  const [isBellActive, setIsBellActive] = useState(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES);
  const [isConnected, setIsConnected] = useState(false);

  const completedCount = routines.filter((r) => r.completed).length;
  const progressPercent = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

  // In-app modal state for Web & Native compatibility (since Alert.alert is silent on Web)
  const [dialogInfo, setDialogInfo] = useState<{
    visible: boolean;
    titleNe: string;
    titleEn: string;
    message: string;
    phone?: string;
    actionText?: string;
  }>({
    visible: false,
    titleNe: '',
    titleEn: '',
    message: '',
  });

  // Load registered child, caregiver info, routines & bell status from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.multiGet([
      'voiceme.registeredName',
      'voiceme.registeredAge',
      'voiceme.registeredAvatar',
      'voiceme.parentName',
      'voiceme.emergencyPhone',
      'voiceme.caregiverName',
      'voiceme.allowCaregiverEdit',
      'voiceme.bellActive',
      ROUTINE_STORAGE_KEY,
    ])
      .then((entries) => {
        const map = Object.fromEntries(entries);
        if (map['voiceme.registeredName']?.trim()) setChildName(map['voiceme.registeredName'].trim());
        if (map['voiceme.registeredAge']?.trim()) setChildAge(map['voiceme.registeredAge'].trim());
        if (map['voiceme.registeredAvatar']?.trim()) setChildAvatar(map['voiceme.registeredAvatar'].trim());
        if (map['voiceme.parentName']?.trim()) setParentName(map['voiceme.parentName'].trim());
        if (map['voiceme.emergencyPhone']?.trim()) setEmergencyPhone(map['voiceme.emergencyPhone'].trim());
        if (map['voiceme.caregiverName']?.trim()) setCaregiverName(map['voiceme.caregiverName'].trim());
        if (map['voiceme.allowCaregiverEdit'] !== undefined && map['voiceme.allowCaregiverEdit'] !== null) {
          setAllowCaregiverEdit(map['voiceme.allowCaregiverEdit'] === 'true');
        }
        if (map['voiceme.bellActive'] !== undefined) {
          setIsBellActive(map['voiceme.bellActive'] === 'true');
        }
        if (map[ROUTINE_STORAGE_KEY]) {
          try {
            const parsed = JSON.parse(map[ROUTINE_STORAGE_KEY]!);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRoutines(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});

    // The backend is the real link between this caregiver's account and the
    // child they connected to via CaregiverRegistrationPage's code; the
    // AsyncStorage values above are just same-device fallbacks/cache.
    (async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/caregiver/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const child = await res.json();
        setIsConnected(true);
        if (child.name?.trim()) setChildName(child.name.trim());
        if (child.age?.trim()) setChildAge(child.age.trim());
        if (child.avatar?.trim()) setChildAvatar(child.avatar.trim());
        if (child.parent?.name) setParentName(child.parent.name);
        if (child.parent?.phone) setEmergencyPhone(child.parent.phone);
        if (child.caregiver?.name) setCaregiverName(child.caregiver.name);
      } catch {
        // Offline or backend unreachable: keep whatever is currently shown.
      }
    })();

    // Only periodically poll the real-time Attention Bell alert status
    const interval = setInterval(() => {
      AsyncStorage.getItem('voiceme.bellActive')
        .then((val) => {
          setIsBellActive(val === 'true');
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  const handleToggleRoutine = (id: string) => {
    if (!allowCaregiverEdit) {
      setDialogInfo({
        visible: true,
        titleNe: 'अनुमति छैन',
        titleEn: 'Permission Restricted',
        message: 'अभिभावकले दिनचर्या सम्पादन बन्द गर्नुभएको छ।\n(Routine editing is turned off in Parents settings)',
      });
      return;
    }

    try {
      Haptics.selectionAsync();
    } catch {}

    const updated = routines.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setRoutines(updated);
    AsyncStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleAcknowledgeBell = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setIsBellActive(false);
    await AsyncStorage.setItem('voiceme.bellActive', 'false').catch(() => {});
    setDialogInfo({
      visible: true,
      titleNe: 'घण्टी स्वीकार गरियो!',
      titleEn: 'Bell Alert Acknowledged',
      message: 'तपाईंले बच्चाको ध्यान घण्टी स्वीकार गरी बन्द गर्नुभयो।',
    });
  };

  const handleRingBellForChild = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setIsBellActive(true);
    await AsyncStorage.setItem('voiceme.bellActive', 'true').catch(() => {});

    if (soundAlertsEnabled) {
      try {
        Speech.stop();
        Speech.speak('कृपया यता आउनुहोस्, हेरचाहकर्ताले बोलाउँदैछ।', {
          language: 'ne-NP',
          pitch: 1.0,
          rate: 0.95,
        });
      } catch {}
    }

    setDialogInfo({
      visible: true,
      titleNe: 'घण्टी बजाइयो!',
      titleEn: 'Bell Alert Triggered',
      message: 'बच्चालाई बोलाउन ध्यान घण्टी सक्रिय गरियो।',
    });
  };

  const handleCallParent = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setDialogInfo({
      visible: true,
      titleNe: 'अभिभावकलाई सम्पर्क',
      titleEn: 'Call Parent',
      message: `आमा/अभिभावक: ${parentName}\nफोन नम्बर: ${emergencyPhone}`,
      phone: emergencyPhone,
      actionText: 'कल गर्नुहोस् (Call Now)',
    });
  };

  const handleCallDoctor = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    setDialogInfo({
      visible: true,
      titleNe: 'डाक्टर / आपतकालीन क्लिनिक',
      titleEn: 'Doctor / Emergency Clinic',
      message: 'बालरोग विशेषज्ञ: डा. रमेश अधिकारी\nक्लिनिक सम्पर्क: ०१-४२५६७८९',
      phone: '014256789',
      actionText: 'क्लिनिकमा फोन गर्नुहोस् (Call Clinic)',
    });
  };

  const handleSendVoiceReassurance = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const cleanChildName = childName.replace(/\s*\([^)]*\)/g, '').trim() || 'आरव';
    const reassuranceText = `म नजिकै छु, चिन्ता नलिनुहोस् ${cleanChildName}।`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reassuranceText);
        utterance.rate = 0.95;
        utterance.lang = 'ne-NP';
        window.speechSynthesis.speak(utterance);
      } catch {}
    } else {
      try {
        Speech.stop();
        Speech.speak(reassuranceText, {
          language: 'ne-NP',
          pitch: 1.0,
          rate: 0.95,
        });
      } catch {}
    }

    setDialogInfo({
      visible: true,
      titleNe: 'सन्देश सफलतापूर्वक पठाइयो!',
      titleEn: 'Voice Reassurance Sent',
      message: `बालबालिकाको डिभाइसमा आवाज बजाइयो:\n"${reassuranceText}"`,
      actionText: 'बुझें (Understood)',
    });
  };

  const dialPhoneNumber = (phone?: string) => {
    if (!phone) {
      setDialogInfo((prev) => ({ ...prev, visible: false }));
      return;
    }
    const cleanNum = phone.replace(/[^0-9+]/g, '');
    if (Platform.OS === 'web') {
      window.location.href = `tel:${cleanNum}`;
    } else {
      Linking.openURL(`tel:${cleanNum}`).catch(() => {});
    }
    setDialogInfo((prev) => ({ ...prev, visible: false }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          style={({ pressed }) => [styles.backButton, pressed && styles.pressedState]}
          onPress={handleBack}
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
          <Text style={styles.backButtonText}>गृहपृष्ठ · Home</Text>
        </Pressable>

        {/* Quick link to Parents Page */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Parents Controls"
          style={({ pressed }) => [styles.parentsLinkBtn, pressed && styles.pressedState]}
          onPress={() => router.push('/Parentspage')}
        >
          <Text style={styles.parentsLinkText}>👨‍👩‍👧 अभिभावक सेटिङ ›</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Block */}
        <View style={styles.titleSection}>
          <View style={styles.caregiverBadgeRow}>
            <Text style={styles.caregiverBadgeText}>💚 हेरचाहकर्ता: {caregiverName}</Text>
          </View>
          <Text style={styles.nepaliTitle}>हेरचाहकर्ता ड्यासबोर्ड</Text>
          <Text style={styles.englishTitle}>Caregiver Dashboard</Text>
          <Text style={styles.subtitleDesc}>
            बालबालिकाको प्रत्यक्ष सुरक्षा, आवाज सन्देश र दिनचर्या निगरानी
          </Text>
        </View>

        {!isConnected && (
          <View style={styles.notConnectedBanner}>
            <Text style={styles.notConnectedText}>
              ⚠️ अझै कुनै बालबालिकासँग जोडिएको छैन। अभिभावकको जोड्ने कोड प्रयोग गरेर पुनः दर्ता गर्नुहोस्।
            </Text>
            <Text style={styles.notConnectedSubText}>
              Not connected to a child yet — register again with the parent's connect code.
            </Text>
          </View>
        )}

        {/* 1. Child Live Status Card */}
        <View style={styles.childStatusCard}>
          <View style={styles.childHeaderRow}>
            <View style={styles.childAvatarCircle}>
              <Text style={styles.avatarEmoji}>{childAvatar}</Text>
            </View>

            <View style={styles.childInfoText}>
              <Text style={styles.childName}>{childName}</Text>
              <Text style={styles.childMeta}>उमेर: {childAge}</Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>लाइभ (Live)</Text>
            </View>
          </View>

          {/* Location & GPS line */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>📍 स्थान (Location):</Text>
            <Text style={styles.statusValue}>घर · बैठक कोठा (Living Room)</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>⌚ जीपीएस ब्याण्ड:</Text>
            <Text style={styles.statusValue}>सक्रिय · सुरक्षित क्षेत्र भित्र (Active)</Text>
          </View>

          {/* Quick Voice Reassurance Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send voice reassurance"
            style={({ pressed }) => [
              styles.reassuranceButton,
              pressed && styles.pressedState,
            ]}
            onPress={handleSendVoiceReassurance}
          >
            <Text style={styles.reassuranceText}>
              🔊 आवाज पठाउनुहोस् (Send Voice: "म नजिकै छु")
            </Text>
          </Pressable>
        </View>

        {/* 2. Attention Bell Alert Card */}
        <View style={[styles.bellAlertCard, isBellActive && styles.bellAlertCardActive]}>
          <View style={styles.bellCardHeader}>
            <View style={[styles.bellIconCircle, isBellActive && styles.bellIconCircleActive]}>
              <Text style={styles.bellEmoji}>{isBellActive ? '🔔' : '🔕'}</Text>
            </View>
            <View style={styles.bellTextContainer}>
              <Text style={[styles.bellAlertTitle, isBellActive && styles.bellAlertTitleActive]}>
                {isBellActive ? '⚠️ ध्यान दिनुहोस्: बच्चाले बोलाउँदैछ!' : 'ध्यान घण्टी स्थिति (Bell Alert)'}
              </Text>
              <Text style={styles.bellAlertStatus}>
                {isBellActive
                  ? 'बच्चाको डिभाइसबाट ध्यान घण्टी बजिरहेको छ'
                  : 'सामान्य · कुनै घण्टी बजेको छैन'}
              </Text>
            </View>
          </View>

          <View style={styles.bellActionBtnRow}>
            {isBellActive ? (
              <Pressable
                style={styles.bellAckButton}
                onPress={handleAcknowledgeBell}
              >
                <Text style={styles.bellAckButtonText}>✓ घण्टी स्वीकार गरी बन्द गर्नुहोस्</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.bellRingButton}
                onPress={handleRingBellForChild}
              >
                <Text style={styles.bellRingButtonText}>🔔 बच्चालाई बोलाउनुहोस् (Ring Bell)</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.bellToggleRow}>
            <Text style={styles.toggleLabel}>आवाज अलर्टहरू (Sound Alerts)</Text>
            <Switch
              value={soundAlertsEnabled}
              onValueChange={setSoundAlertsEnabled}
              trackColor={{ false: '#D4C5B0', true: '#2E5936' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 3. Care Tasks & Routine Tracking */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>दिनचर्या र हेरचाह (Daily Routine)</Text>
            <Text style={styles.sectionSub}>
              {completedCount} / {routines.length} पूरा भयो ({progressPercent}%)
            </Text>
          </View>

          <Pressable
            style={styles.fullRoutineBtn}
            onPress={() => router.push('/Dailyroutinepage')}
          >
            <Text style={styles.fullRoutineBtnText}>पूरा तालिका ›</Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>

        {!allowCaregiverEdit && (
          <View style={styles.lockedNotice}>
            <Text style={styles.lockedNoticeText}>
              🔒 दिनचर्या सम्पादन अभिभावकद्वारा सुरक्षित गरिएको छ (View only)
            </Text>
          </View>
        )}

        <View style={styles.taskCard}>
          {routines.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.taskItem, index > 0 && styles.taskItemBorder]}
              onPress={() => handleToggleRoutine(item.id)}
            >
              <View style={[styles.taskCheckbox, item.completed && styles.taskCheckboxDone]}>
                {item.completed && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <View style={styles.taskEmojiCircle}>
                <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>
                  {item.nepaliTitle} ({item.englishTitle})
                </Text>
                <Text style={styles.taskTime}>{item.time}</Text>
              </View>
              <Text style={[styles.statusTag, item.completed && styles.statusTagDone]}>
                {item.completed ? 'पूरा भयो' : 'बाँकी'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 4. Quick Emergency Contacts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>आपतकालीन सम्पर्क (Emergency Contacts)</Text>
        </View>

        <View style={styles.contactRow}>
          <Pressable
            style={({ pressed }) => [styles.contactButton, pressed && styles.pressedState]}
            onPress={handleCallParent}
          >
            <Text style={styles.contactIcon}>👩‍👦</Text>
            <Text style={styles.contactTitle}>आमा / अभिभावक</Text>
            <Text style={styles.contactSubtitle}>{parentName}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.contactButton, pressed && styles.pressedState]}
            onPress={handleCallDoctor}
          >
            <Text style={styles.contactIcon}>🩺</Text>
            <Text style={styles.contactTitle}>डाक्टर / क्लिनिक</Text>
            <Text style={styles.contactSubtitle}>डा. रमेश (Clinic)</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Universal Action / Dialog Modal */}
      <Modal
        visible={dialogInfo.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
        >
          <View style={styles.dialogCard}>
            <View style={styles.dialogBadge}>
              <Text style={{ fontSize: 24 }}>💚</Text>
            </View>

            <Text style={styles.dialogTitleNe}>{dialogInfo.titleNe}</Text>
            <Text style={styles.dialogTitleEn}>{dialogInfo.titleEn}</Text>

            <Text style={styles.dialogMessage}>{dialogInfo.message}</Text>

            <View style={styles.dialogBtnGroup}>
              {dialogInfo.phone ? (
                <Pressable
                  style={styles.dialogActionBtn}
                  onPress={() => dialPhoneNumber(dialogInfo.phone)}
                >
                  <Text style={styles.dialogActionBtnText}>
                    📞 {dialogInfo.actionText || 'सम्पर्क गर्नुहोस्'}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                style={styles.dialogCloseBtn}
                onPress={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.dialogCloseBtnText}>बन्द गर्नुहोस् (Close)</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAE0CE',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    columnGap: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#342419',
  },
  parentsLinkBtn: {
    backgroundColor: '#EDE1D1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DAC9B8',
  },
  parentsLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B2419',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginVertical: 12,
  },
  nepaliTitle: {
    fontSize: 27,
    fontWeight: '900',
    color: '#342419',
    letterSpacing: -0.4,
  },
  englishTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#28552F',
    marginTop: 2,
  },
  subtitleDesc: {
    fontSize: 13,
    color: '#76675B',
    marginTop: 4,
    lineHeight: 18.5,
  },
  notConnectedBanner: {
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5C2BC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  notConnectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8F2F22',
    lineHeight: 18,
  },
  notConnectedSubText: {
    fontSize: 11.5,
    color: '#8F2F22',
    marginTop: 3,
  },
  childStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E8DED2',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  childHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  childAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5ECE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E0C8B3',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  childInfoText: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#342419',
  },
  childMeta: {
    fontSize: 12.5,
    color: '#76675B',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    columnGap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E5936',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E5936',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#F4ECE2',
  },
  statusLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6E5C50',
  },
  statusValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#342419',
  },
  reassuranceButton: {
    marginTop: 12,
    backgroundColor: '#2E5936',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reassuranceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  caregiverBadgeRow: {
    backgroundColor: '#E4F2E1',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C8E2C2',
  },
  caregiverBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#27522B',
  },
  bellAlertCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E8DED2',
  },
  bellAlertCardActive: {
    backgroundColor: '#FFF0ED',
    borderColor: '#F2A188',
  },
  bellCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bellIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bellIconCircleActive: {
    backgroundColor: '#FCD8CC',
  },
  bellEmoji: {
    fontSize: 22,
  },
  bellTextContainer: {
    flex: 1,
  },
  bellAlertTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#342419',
  },
  bellAlertTitleActive: {
    color: '#B83811',
  },
  bellAlertStatus: {
    fontSize: 12,
    color: '#76675B',
    marginTop: 2,
  },
  bellActionBtnRow: {
    marginVertical: 8,
  },
  bellAckButton: {
    backgroundColor: '#B83811',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bellAckButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bellRingButton: {
    backgroundColor: '#EBE0D0',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7C7B2',
  },
  bellRingButtonText: {
    color: '#4A2A1A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  bellToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBE0D3',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#342419',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#342419',
  },
  sectionSub: {
    fontSize: 12,
    color: '#76675B',
    marginTop: 2,
    fontWeight: '600',
  },
  fullRoutineBtn: {
    backgroundColor: '#E8DFD3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  fullRoutineBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4A2A1A',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5DBD0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E5936',
    borderRadius: 3,
  },
  lockedNotice: {
    backgroundColor: '#F8F1E5',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8DBC9',
  },
  lockedNoticeText: {
    fontSize: 11.5,
    color: '#7A5B3E',
    textAlign: 'center',
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DED2',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  taskItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F4EFE6',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B0A294',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskCheckboxDone: {
    backgroundColor: '#2E5936',
    borderColor: '#2E5936',
  },
  taskEmojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#342419',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8A7B70',
  },
  taskTime: {
    fontSize: 11.5,
    color: '#8A7B70',
    marginTop: 2,
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8572A',
    backgroundColor: '#FDEAE0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusTagDone: {
    color: '#2E5936',
    backgroundColor: '#E6F4E4',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DED2',
  },
  contactIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#342419',
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 11,
    color: '#76675B',
    marginTop: 2,
    textAlign: 'center',
  },
  pressedState: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFDF9',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DED2',
    elevation: 8,
  },
  dialogBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dialogTitleNe: {
    fontSize: 20,
    fontWeight: '900',
    color: '#342419',
    textAlign: 'center',
  },
  dialogTitleEn: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#28552F',
    marginTop: 2,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 13.5,
    color: '#5E4E42',
    textAlign: 'center',
    marginVertical: 14,
    lineHeight: 20,
  },
  dialogBtnGroup: {
    width: '100%',
    rowGap: 10,
  },
  dialogActionBtn: {
    backgroundColor: '#28552F',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dialogActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dialogCloseBtn: {
    backgroundColor: '#EFE6D8',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dialogCloseBtnText: {
    color: '#4B2419',
    fontSize: 13,
    fontWeight: '700',
  },
});
