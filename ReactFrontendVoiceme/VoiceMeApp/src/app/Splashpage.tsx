import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_EMAIL_KEY } from '@/constants/email';

const AUTH_TOKEN_KEY = 'voiceme.authToken';
const BRAND_BACKGROUND_COLOR = '#C96F38';
const BRAND_TEXT_COLOR = '#FFF1E5';
const BRAND_SOFT_TEXT_COLOR = '#FFE4CF';

// Every app start asks for the password again (the email is pre-filled on
// the Login screen); only a device that has never signed in goes to Register.
async function goToNextScreen() {
  const [[, authToken], [, lastEmail]] = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, LAST_EMAIL_KEY]);
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.warn('Unable to clear the saved auth token.', error);
  }
  router.replace(authToken || lastEmail ? '/Loginpage' : '/Registerpage');
}

export default function Splashpage() {
  const hasNavigated = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterApp = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    void goToNextScreen();
  }, []);

  const handlePress = () => {
    enterApp();
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      enterApp();
    }, 2200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enterApp]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BACKGROUND_COLOR} />
      <Pressable
        accessibilityLabel="Voice Me - Tap to enter"
        accessibilityHint="Opens sign-in if you have used Voice Me before, or registration otherwise."
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [styles.content, pressed && styles.pressedContent]}
      >
        {/* Decorative central logo emblem */}
        <View style={styles.logoBadge}>
          <Text style={styles.badgeEmoji}>🎙️</Text>
        </View>

        <View accessibilityLabel="Voice Me logo" style={styles.titleContainer}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
            style={styles.logoText}
          >
            Voice Me
          </Text>
          <Text style={styles.nepaliTagline}>आवाज मेरो साथी</Text>
          <Text style={styles.tagline}>One tap opens Voice Me</Text>
        </View>

        <View style={styles.bottomPrompt}>
          <View style={styles.continueButton}>
            <Text style={styles.tapPrompt}>सुरु गर्नुहोस् · Tap to Start</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BACKGROUND_COLOR,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pressedContent: {
    opacity: 0.92,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 241, 229, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 241, 229, 0.4)',
  },
  badgeEmoji: {
    fontSize: 42,
  },
  titleContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: BRAND_TEXT_COLOR,
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  nepaliTagline: {
    color: BRAND_SOFT_TEXT_COLOR,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  tagline: {
    color: BRAND_TEXT_COLOR,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.85,
  },
  bottomPrompt: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
    width: '100%',
  },
  continueButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(69, 35, 20, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 241, 229, 0.65)',
    columnGap: 8,
  },
  tapPrompt: {
    color: BRAND_TEXT_COLOR,
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrowIcon: {
    color: '#FFF1E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
