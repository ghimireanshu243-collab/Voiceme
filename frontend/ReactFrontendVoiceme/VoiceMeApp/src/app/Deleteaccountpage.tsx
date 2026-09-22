import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'voiceme.authToken';
const AUTH_USER_KEY = 'voiceme.user';
const REGISTERED_NAME_KEY = 'voiceme.registeredName';
const REGISTERED_AGE_KEY = 'voiceme.registeredAge';
const SELECTED_ROLE_KEY = 'voiceme.selectedRole';
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://192.168.1.77:8000'
  : 'http://192.168.1.77:8000';

const clearLocalSession = async () => {
  await AsyncStorage.multiRemove([
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    REGISTERED_NAME_KEY,
    REGISTERED_AGE_KEY,
    SELECTED_ROLE_KEY,
  ]);
};

export default function Deleteaccountpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleDeleteAccount = async () => {
    setFormError('');

    if (!email.trim() || !password.trim()) {
      setFormError('कृपया इमेल र पासवर्ड दुवै प्रविष्ट गर्नुहोस् (Please enter both email and password)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(data?.error || 'Unable to delete account right now.');
        return;
      }

      await clearLocalSession();
      setDeleted(true);
      setConfirming(false);
    } catch (error: any) {
      console.error('Delete account request failed:', error);
      setFormError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* TOP LOGO */}
            <View style={styles.topRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.handIcon}>♧</Text>
              </View>

              <Text style={styles.voiceMe}>Voice Me</Text>

              <View style={styles.earCircle}>
                <Text style={styles.earIcon}>◉</Text>
              </View>
            </View>

            {/* TITLE */}
            <View style={styles.headingContainer}>
              <Text style={styles.nepaliHeading}>खाता मेटाउनुहोस्</Text>
              <Text style={styles.englishHeading}>Delete Account</Text>
            </View>

            {deleted ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmNepali}>खाता मेटाइयो</Text>
                <Text style={styles.confirmEnglish}>
                  Your account has been permanently deleted.
                </Text>
              </View>
            ) : confirming ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmNepali}>पक्का हो?</Text>
                <Text style={styles.confirmEnglish}>
                  This will permanently delete your account and all of your data.
                  This cannot be undone.
                </Text>

                {formError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{formError}</Text>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && styles.buttonPressed,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (!isSubmitting) {
                      void handleDeleteAccount();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.dangerNepali}>
                    {isSubmitting ? 'मेटाउँदै...' : 'हो, मेटाउनुहोस्'}
                  </Text>
                  <Text style={styles.dangerEnglish}>
                    {isSubmitting ? 'Deleting…' : 'Yes, delete my account'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    if (!isSubmitting) {
                      setConfirming(false);
                      setFormError('');
                    }
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.helperText}>
                  तपाईंको खाता स्थायी रूपमा मेटाउन इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।{"\n"}
                  Enter your email and password to delete your account.
                </Text>

                {/* FORM */}
                <View style={styles.formContainer}>
                  <Text style={styles.fieldLabel}>इमेल</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#443F32"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>पासवर्ड</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#443F32"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? "◉" : "◌"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {formError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{formError}</Text>
                  </View>
                ) : null}

                {/* CONTINUE BUTTON */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setFormError('');
                    if (!email.trim() || !password.trim()) {
                      setFormError('कृपया इमेल र पासवर्ड दुवै प्रविष्ट गर्नुहोस् (Please enter both email and password)');
                      return;
                    }
                    setConfirming(true);
                  }}
                >
                  <Text style={styles.dangerNepali}>अगाडि बढ्नुहोस्</Text>
                  <Text style={styles.dangerEnglish}>Continue</Text>
                </Pressable>
              </>
            )}

            {/* BACK TO LOGIN */}
            <Pressable
              style={styles.backToLogin}
              onPress={() => router.replace("/Loginpage")}
            >
              <Text style={styles.backNepali}>लगइनमा फर्कनुहोस्</Text>
              <Text style={styles.backEnglish}>Back to login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#292A27",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  card: {
    width: "94%",
    minHeight: 500,
    backgroundColor: "#F6E9D0",
    borderRadius: 38,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "#D8C7AA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0D4B4",
    alignItems: "center",
    justifyContent: "center",
  },
  handIcon: {
    fontSize: 27,
    color: "#54231D",
  },
  voiceMe: {
    color: "#321F1C",
    fontSize: 21,
    marginLeft: 9,
    fontWeight: "500",
  },
  earCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDEBCB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  earIcon: {
    fontSize: 20,
    color: "#486044",
  },
  headingContainer: {
    marginTop: 35,
    marginBottom: 10,
  },
  nepaliHeading: {
    color: "#4B1C19",
    fontSize: 31,
    fontWeight: "700",
    lineHeight: 40,
  },
  englishHeading: {
    color: "#3C211E",
    fontSize: 21,
  },
  helperText: {
    color: "#5A3A33",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  formContainer: {
    backgroundColor: "rgba(216, 235, 192, 0.65)",
    borderRadius: 23,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 15,
  },
  fieldLabel: {
    color: "#3B211D",
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 3,
  },
  inputContainer: {
    height: 43,
    backgroundColor: "#C9D7AA",
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 9,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#30241F",
    fontSize: 15,
    paddingHorizontal: 5,
  },
  eyeButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    color: "#4B201D",
    fontSize: 20,
  },
  errorBanner: {
    backgroundColor: "#FBDCDC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E4A0A0",
  },
  errorBannerText: {
    color: "#8A1F1F",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  dangerButton: {
    height: 61,
    backgroundColor: "#8A1F1F",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dangerNepali: {
    color: "#FFF8ED",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 25,
  },
  dangerEnglish: {
    color: "#FFF8ED",
    fontSize: 14,
  },
  confirmBox: {
    backgroundColor: "rgba(216, 235, 192, 0.65)",
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  confirmNepali: {
    color: "#3B211D",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
  },
  confirmEnglish: {
    color: "#3B211D",
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    alignSelf: "center",
    backgroundColor: "#FFF4E3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 15,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#3D302A",
    fontSize: 13,
  },
  backToLogin: {
    alignItems: "center",
    marginTop: 25,
  },
  backNepali: {
    color: "#54231E",
    fontSize: 17,
    fontWeight: "600",
  },
  backEnglish: {
    color: "#54231E",
    fontSize: 12,
    marginTop: 2,
  },
});
