import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CaregiverRegistrationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [dialogInfo, setDialogInfo] = useState<{
    visible: boolean;
    titleNe: string;
    titleEn: string;
    message: string;
  }>({
    visible: false,
    titleNe: "",
    titleEn: "",
    message: "",
  });

  // Pre-fill existing caregiver info if set
  useEffect(() => {
    AsyncStorage.multiGet([
      "voiceme.caregiverName",
      "voiceme.caregiverPhone",
      "voiceme.caregiverEmail",
    ])
      .then((entries) => {
        const cName = entries[0][1];
        const cPhone = entries[1][1];
        const cEmail = entries[2][1];
        if (cName?.trim()) setName(cName.trim());
        if (cPhone?.trim()) setPhone(cPhone.trim());
        if (cEmail?.trim()) setEmail(cEmail.trim());
      })
      .catch(() => {});
  }, []);

  const handleContinue = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setDialogInfo({
        visible: true,
        titleNe: "अपूर्ण विवरण",
        titleEn: "Incomplete Details",
        message: "कृपया आफ्नो नाम, इमेल र पासवर्ड भर्नुहोस्\n(Please fill in all required fields)",
      });
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Caregiver registration completed - save caregiver specific details to AsyncStorage
    try {
      await AsyncStorage.multiSet([
        ["voiceme.caregiverName", name.trim()],
        ["voiceme.caregiverPhone", phone.trim() || "९८४१११२२३३"],
        ["voiceme.caregiverEmail", email.trim()],
        ["voiceme.currentRole", "caregiver"],
      ]);
    } catch {}

    router.replace("/Caregiverpage");
  };

  const handleGoToLogin = () => {
    router.replace("/Loginpage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>

            {/* Back Button */}
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>←</Text>
            </Pressable>

            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.topHeaderNepali}>
                खाता व्यवस्थापन
              </Text>

              <Text style={styles.topHeaderEnglish}>
                Account Management
              </Text>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitleNepali}>
                खाता सिर्जना गर्नुहोस्
              </Text>

              <Text style={styles.mainTitleEnglish}>
                Create Account (Caregiver)
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>नाम</Text>

                <View style={styles.inputPill}>
                  <Text style={styles.inputIcon}>👤</Text>

                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                    placeholderTextColor="#7C6356"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>इमेल</Text>

                <View style={styles.inputPill}>
                  <Text style={styles.inputIcon}>✉️</Text>

                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@email.com"
                    placeholderTextColor="#7C6356"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>पासवर्ड</Text>

                <View style={styles.inputPill}>
                  <Text style={styles.inputIcon}>🔒</Text>

                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#7C6356"
                    secureTextEntry
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  फोन नम्बर (ऐच्छिक)
                </Text>

                <View style={styles.inputPill}>
                  <Text style={styles.inputIcon}>📞</Text>

                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="98XXXXXXXX"
                    placeholderTextColor="#7C6356"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Continue Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleContinue}
              >
                <Text style={styles.continueNepali}>
                  अघि बढ्नुहोस्
                </Text>

                <Text style={styles.continueEnglish}>
                  Continue
                </Text>
              </Pressable>

              {/* Login Link */}
              <Pressable
                style={styles.loginLink}
                onPress={handleGoToLogin}
              >
                <Text style={styles.loginTextNepali}>
                  पहिले नै खाता छ? लगइन गर्नुहोस्
                </Text>

                <Text style={styles.loginTextEnglish}>
                  Already have an account? Login
                </Text>
              </Pressable>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Incomplete Details Modal Dialog */}
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
              <Text style={{ fontSize: 26 }}>⚠️</Text>
            </View>

            <Text style={styles.dialogTitleNe}>{dialogInfo.titleNe}</Text>
            <Text style={styles.dialogTitleEn}>{dialogInfo.titleEn}</Text>

            <Text style={styles.dialogMessage}>{dialogInfo.message}</Text>

            <Pressable
              style={styles.dialogCloseBtn}
              onPress={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
            >
              <Text style={styles.dialogCloseBtnText}>बुझें (Understood)</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6EBD6",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },

  container: {
    width: "90%",
    maxWidth: 360,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBD5B7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  backArrow: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B1C19",
  },

  headerSection: {
    marginBottom: 20,
  },

  topHeaderNepali: {
    fontSize: 27,
    fontWeight: "900",
    color: "#4B1C19",
    letterSpacing: -0.3,
  },

  topHeaderEnglish: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B2419",
    marginTop: 2,
  },

  titleSection: {
    marginBottom: 24,
  },

  mainTitleNepali: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4B1C19",
    letterSpacing: -0.3,
  },

  mainTitleEnglish: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B2419",
    marginTop: 2,
  },

  form: {
    width: "100%",
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4B1C19",
    marginBottom: 6,
    marginLeft: 4,
  },

  inputPill: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F7D5C6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#3A2218",
  },

  continueButton: {
    marginTop: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#235237",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  continueNepali: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  continueEnglish: {
    color: "#D8ECCD",
    fontSize: 12,
    marginTop: 1,
    fontWeight: "500",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  loginLink: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 6,
  },

  loginTextNepali: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4B1C19",
    textAlign: "center",
  },

  loginTextEnglish: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7C6E61",
    marginTop: 2,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFDF9",
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8DED2",
    elevation: 8,
  },
  dialogBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FDEAE0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  dialogTitleNe: {
    fontSize: 20,
    fontWeight: "900",
    color: "#342419",
    textAlign: "center",
  },
  dialogTitleEn: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8C461F",
    marginTop: 2,
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 13.5,
    color: "#5E4E42",
    textAlign: "center",
    marginVertical: 14,
    lineHeight: 20,
  },
  dialogCloseBtn: {
    backgroundColor: "#EFE6D8",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 28,
    alignItems: "center",
    marginTop: 6,
  },
  dialogCloseBtnText: {
    color: "#4B2419",
    fontSize: 13,
    fontWeight: "700",
  },
});