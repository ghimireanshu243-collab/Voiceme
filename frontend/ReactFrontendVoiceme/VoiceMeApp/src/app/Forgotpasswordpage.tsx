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
  Linking,
} from "react-native";
import { router } from "expo-router";

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

export default function Forgotpasswordpage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  // Only present while the backend runs with DEBUG on, so the reset link can
  // be tested without checking the server terminal or a real inbox.
  const [debugResetUrl, setDebugResetUrl] = useState<string | null>(null);

  const handleSendLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send a reset link right now.');
      }

      setLinkSent(true);
      setDebugResetUrl(data?.debug_reset_url || null);
    } catch (error: any) {
      alert(error?.message || 'Unable to send a reset link. Please try again.');
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
              <Text style={styles.nepaliHeading}>पासवर्ड बिर्सनुभयो?</Text>
              <Text style={styles.englishHeading}>Forgot Password</Text>
            </View>

            {!linkSent ? (
              <>
                <Text style={styles.helperText}>
                  तपाईंको इमेलमा पासवर्ड रिसेट लिंक पठाइनेछ।{"\n"}
                  We'll email you a link to reset your password.
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
                </View>

                {/* SEND LINK BUTTON */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (!isSubmitting) {
                      void handleSendLink();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryNepali}>लिंक पठाउनुहोस्</Text>
                  <Text style={styles.primaryEnglish}>
                    {isSubmitting ? "Sending…" : "Send reset link"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmNepali}>इमेल जाँच गर्नुहोस्</Text>
                  <Text style={styles.confirmEnglish}>
                    If an account exists for {email.trim()}, we've sent a password
                    reset link to that email. Open it to choose a new password,
                    then come back and log in.
                  </Text>
                </View>

                {/* Dev-only shortcut: lets the reset link be opened straight from
                    the app while the backend runs with DEBUG=True. */}
                {debugResetUrl && (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => Linking.openURL(debugResetUrl)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      (Debug) Open reset link
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setLinkSent(false);
                    setDebugResetUrl(null);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>
                    Use a different email or resend the link
                  </Text>
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
  primaryButton: {
    height: 61,
    backgroundColor: "#28552F",
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
  primaryNepali: {
    color: "#FFF8ED",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 25,
  },
  primaryEnglish: {
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
