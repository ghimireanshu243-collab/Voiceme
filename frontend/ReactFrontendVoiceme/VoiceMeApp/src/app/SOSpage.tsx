import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
  Linking,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import Svg, { Path } from 'react-native-svg';

const AUTH_TOKEN_KEY = 'voiceme.authToken';
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.1.77:8000'
  : 'http://192.168.1.77:8000';

// By default, a foreground notification is silently queued instead of shown —
// this makes sure the SOS alert actually pops up and plays its sound even
// while the app is open and already on this screen.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// A long, distinct pattern so the phone itself makes it unmistakable an
// emergency was triggered, independent of whatever ringtone/sound settings
// are in effect for the call that follows.
const SOS_VIBRATION_PATTERN = [0, 500, 250, 500, 250, 500];

async function firePopupAndVibrate() {
  try {
    Vibration.vibrate(SOS_VIBRATION_PATTERN);
  } catch {}

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sos-alerts', {
        name: 'Emergency SOS',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: SOS_VIBRATION_PATTERN,
        sound: 'default',
      });
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Emergency SOS Activated',
        body: 'आपतकालीन SOS सक्रिय भयो — स्याहारकर्तालाई कल गरिँदैछ',
        sound: 'default',
      },
      trigger: null,
    });
  } catch {
    // Notifications aren't available on every platform (e.g. web) — the
    // vibration above and the phone call that follows still go through.
  }
}

interface Contact {
  name?: string;
  phone?: string;
  id?: string;
}

export default function SOSpage() {
  const [caregiver, setCaregiver] = useState<Contact | null>(null);
  const [parent, setParent] = useState<Contact | null>(null);
  const [locationLabel, setLocationLabel] = useState('घर (Ward 4 Home Safe Zone)');

  useEffect(() => {
    firePopupAndVibrate();

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}

    try {
      Speech.stop();
      Speech.speak('आपतकालीन मद्दत सतर्कता सक्रिय छ', {
        language: 'ne-NP',
        pitch: 1.1,
        rate: 0.95,
      });
    } catch {}

    // Arriving on this screen means SOS has been triggered: log the alert and
    // fetch the real caregiver/parent contacts to notify/display/dial.
    (async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/sos/trigger/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;

        const alert = await res.json();
        if (alert.caregiver) setCaregiver(alert.caregiver);
        if (alert.parent) setParent(alert.parent);
        if (alert.location_label) setLocationLabel(alert.location_label);

        // This screen only exists because SOS was just triggered, so the
        // call happens immediately and automatically — an emergency isn't
        // the moment to make someone find and tap a "call" button too.
        const emergencyPhone = alert.caregiver?.phone || alert.parent?.phone;
        if (emergencyPhone) dialNumber(emergencyPhone);
      } catch {
        // Offline or backend unreachable: fall back to the placeholder contacts below.
      }
    })();
  }, []);

  const dialNumber = (phone?: string) => {
    if (!phone) return;
    const cleanNum = phone.replace(/[^0-9+]/g, '');
    if (Platform.OS === 'web') {
      window.location.href = `tel:${cleanNum}`;
    } else {
      Linking.openURL(`tel:${cleanNum}`).catch(() => {});
    }
  };

  const handleCall = (label: string, number: string) => {
    Alert.alert(
      `📞 ${label}`,
      `Initiating emergency call to ${number}?`,
      [
        { text: 'रद्द (Cancel)', style: 'cancel' },
        { text: 'कल गर्नुहोस् (Call Now)', onPress: () => dialNumber(number) },
      ]
    );
  };

  const handleSafeReturn = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#8F1D11" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Return Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleSafeReturn}
            activeOpacity={0.7}
            accessibilityLabel="Return"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke="#FFFFFF"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Me SOS</Text>
        </View>

        {/* Pulsing SOS Emblem */}
        <View style={styles.emblemContainer}>
          <View style={styles.outerGlow}>
            <View style={styles.innerCircle}>
              <Text style={styles.sosSymbol}>🚨</Text>
              <Text style={styles.sosWord}>SOS</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.titleNepali}>आपतकालीन सतर्कता सक्रिय!</Text>
        <Text style={styles.titleEnglish}>Emergency SOS Broadcast Active</Text>

        {/* Location & Status Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoHeading}>📍 वर्तमान स्थान (Current Location):</Text>
          <Text style={styles.infoLocation}>{locationLabel}</Text>

          <View style={styles.divider} />

          <Text style={styles.notifiedHeader}>👥 सम्पर्कमा सूचना पठाइयो (Notified Contacts):</Text>
          <Text style={styles.notifiedItem}>
            ✓ स्याहारकर्ता: {caregiver?.name || 'Not assigned yet'}
            {caregiver?.id ? ` (ID: ${caregiver.id})` : ''}
          </Text>
          <Text style={styles.notifiedItem}>
            ✓ अभिभावक: {parent?.name || 'Not assigned yet'}
            {parent?.id ? ` (${parent.id})` : ''}
          </Text>
        </View>

        {/* Emergency Dispatch Calls */}
        <View style={styles.callsContainer}>
          <TouchableOpacity
            style={[styles.callBtn, styles.callCaregiverBtn]}
            onPress={() => handleCall(
              `स्याहारकर्ता (${caregiver?.name || 'Caregiver'})`,
              caregiver?.phone || parent?.phone || '९८४१११२२३३'
            )}
            activeOpacity={0.85}
          >
            <Text style={styles.callIcon}>💚</Text>
            <View style={styles.callTexts}>
              <Text style={styles.callTitle}>स्याहारकर्तालाई तुरुन्त कल</Text>
              <Text style={styles.callSub}>
                Call Caregiver • {caregiver?.phone || parent?.phone || '९८४१११२२३३'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, styles.callPoliceBtn]}
            onPress={() => handleCall('नेपाल प्रहरी (Police)', '100')}
            activeOpacity={0.85}
          >
            <Text style={styles.callIcon}>🚓</Text>
            <View style={styles.callTexts}>
              <Text style={styles.callTitle}>नेपाल प्रहरी (Police Emergency)</Text>
              <Text style={styles.callSub}>Toll Free • Dial 100</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, styles.callAmbulanceBtn]}
            onPress={() => handleCall('एम्बुलेन्स सेवा (Ambulance)', '102')}
            activeOpacity={0.85}
          >
            <Text style={styles.callIcon}>🚑</Text>
            <View style={styles.callTexts}>
              <Text style={styles.callTitle}>एम्बुलेन्स सेवा (Red Cross)</Text>
              <Text style={styles.callSub}>Toll Free • Dial 102</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Safe / Dismiss Button */}
        <TouchableOpacity
          style={styles.safeButton}
          onPress={handleSafeReturn}
          activeOpacity={0.85}
        >
          <Text style={styles.safeButtonText}>✓ म सुरक्षित छु · गृहपृष्ठमा फर्कनुहोस्</Text>
          <Text style={styles.safeButtonSub}>(I am Safe / Return to Homepage)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#9F2316',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  emblemContainer: {
    marginVertical: 14,
  },
  outerGlow: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  sosSymbol: {
    fontSize: 34,
  },
  sosWord: {
    fontSize: 18,
    fontWeight: '900',
    color: '#A82114',
    letterSpacing: 1.5,
  },
  titleNepali: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  titleEnglish: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F9D1CD',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFDFB',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  infoHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#342419',
  },
  infoLocation: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9F2316',
    marginTop: 2,
  },
  infoCoordinates: {
    fontSize: 12,
    color: '#6F6358',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE2D5',
    marginVertical: 12,
  },
  notifiedHeader: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#342419',
    marginBottom: 4,
  },
  notifiedItem: {
    fontSize: 12,
    color: '#286B26',
    fontWeight: '600',
    marginTop: 2,
  },
  callsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  callCaregiverBtn: {
    backgroundColor: '#E8F5E5',
    borderWidth: 1.5,
    borderColor: '#BEE0B7',
  },
  callPoliceBtn: {
    backgroundColor: '#E6EFFB',
    borderWidth: 1.5,
    borderColor: '#BCD6F6',
  },
  callAmbulanceBtn: {
    backgroundColor: '#FDECEB',
    borderWidth: 1.5,
    borderColor: '#F8BDBA',
  },
  callIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  callTexts: {
    flex: 1,
  },
  callTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#231D19',
  },
  callSub: {
    fontSize: 11.5,
    color: '#655A51',
    fontWeight: '500',
    marginTop: 1,
  },
  safeButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  safeButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#286B26',
  },
  safeButtonSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#557253',
    marginTop: 1,
  },
});
