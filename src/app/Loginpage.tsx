import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "caregiver">("user");

  useEffect(() => {
    AsyncStorage.getItem("voiceme.currentRole")
      .then((role) => {
        if (role === "caregiver") {
          setSelectedRole("caregiver");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    // Seamless login: if fields are empty, auto-fill defaults
    if (!email.trim() && !password.trim()) {
      if (selectedRole === "caregiver") {
        setEmail("caregiver@voiceme.np");
        setPassword("caregiver123");
      } else {
        setEmail("aarav@voiceme.np");
        setPassword("voiceme123");
      }
    }

    const isCaregiver =
      selectedRole === "caregiver" ||
      email.toLowerCase().includes("caregiver") ||
      email.toLowerCase().includes("maya") ||
      email.toLowerCase().includes("cg");

    if (isCaregiver) {
      try {
        await AsyncStorage.setItem("voiceme.currentRole", "caregiver");
      } catch {}
      // Directs to Caregiver Profile screen!
      router.replace("/Caregiverpage");
    } else {
      try {
        await AsyncStorage.setItem("voiceme.currentRole", "user");
      } catch {}
      router.replace("/Homepage");
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

            {/* LOGIN TITLE */}
            <View style={styles.headingContainer}>
              <Text style={styles.nepaliHeading}>लगइन गर्नुहोस्</Text>
              <Text style={styles.englishHeading}>Login</Text>
            </View>

            {/* WAVEFORM */}
            <View style={styles.waveform}>
              {[12, 20, 28, 16, 30, 40, 24, 35, 18, 28, 13].map(
                (height, index) => (
                  <View
                    key={index}
                    style={[styles.waveBar, { height }]}
                  />
                )
              )}
            </View>

            {/* ROLE SELECTOR */}
            <View style={styles.roleSelector}>
              <Pressable
                style={[
                  styles.roleTab,
                  selectedRole === "user" && styles.roleTabActiveUser,
                ]}
                onPress={() => setSelectedRole("user")}
              >
                <Text style={styles.roleIcon}>👤</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === "user" && styles.roleTabTextActive,
                  ]}
                >
                  प्रयोगकर्ता (User)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleTab,
                  selectedRole === "caregiver" && styles.roleTabActiveCaregiver,
                ]}
                onPress={() => setSelectedRole("caregiver")}
              >
                <Text style={styles.roleIcon}>💚</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === "caregiver" && styles.roleTabTextActive,
                  ]}
                >
                  हेरचाहकर्ता (Caregiver)
                </Text>
              </Pressable>
            </View>

            {/* FORM */}
            <View style={styles.formContainer}>
              {/* EMAIL */}
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

              {/* PASSWORD */}
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

            {/* FORGOT PASSWORD */}
            <Pressable
              style={styles.forgotContainer}
              onPress={() =>
                alert("Forgot password feature coming soon.")
              }
            >
              <Text style={styles.forgotNepali}>पासवर्ड बिर्सनुभयो?</Text>
              <Text style={styles.forgotEnglish}>Forgot Password?</Text>
            </Pressable>

            {/* LOGIN BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.loginNepali}>लगइन गर्नुहोस्</Text>
              <Text style={styles.loginEnglish}>Login</Text>
            </Pressable>

            {/* VOICE LOGIN */}
            <Pressable
              style={styles.voiceButton}
              onPress={() =>
                alert("Voice login will be added later.")
              }
            >
              <Text style={styles.voiceButtonText}>
                or use voice to log in
              </Text>
            </Pressable>

            {/* CREATE ACCOUNT */}
            <Pressable
              style={styles.createAccount}
              onPress={() => router.push("/Registerpage")}
            >
              <Text style={styles.createNepali}>
                नयाँ खाता सिर्जना गर्नुहोस्
              </Text>
              <Text style={styles.createEnglish}>
                Create new account
              </Text>
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
    minHeight: 630,
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
    marginBottom: 27,
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
  waveform: {
    position: "absolute",
    right: 30,
    top: 195,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    opacity: 0.25,
  },
  waveBar: {
    width: 3,
    borderRadius: 5,
    backgroundColor: "#9A6656",
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
  forgotContainer: {
    alignItems: "center",
    marginTop: 13,
    marginBottom: 16,
  },
  forgotNepali: {
    color: "#4A2520",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotEnglish: {
    color: "#4A2520",
    fontSize: 12,
    marginTop: 1,
  },
  loginButton: {
    height: 61,
    backgroundColor: "#28552F",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
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
  loginNepali: {
    color: "#FFF8ED",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 25,
  },
  loginEnglish: {
    color: "#FFF8ED",
    fontSize: 14,
  },
  voiceButton: {
    alignSelf: "center",
    backgroundColor: "#FFF4E3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 19,
    elevation: 2,
  },
  voiceButtonText: {
    color: "#3D302A",
    fontSize: 13,
  },
  createAccount: {
    alignItems: "center",
    marginTop: 25,
  },
  createNepali: {
    color: "#54231E",
    fontSize: 17,
    fontWeight: "600",
  },
  createEnglish: {
    color: "#54231E",
    fontSize: 12,
    marginTop: 2,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    marginBottom: 6,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#EFE6D7",
    borderWidth: 1.5,
    borderColor: "#E2D5C3",
  },
  roleTabActiveUser: {
    backgroundColor: "#FCE7DB",
    borderColor: "#BD622D",
  },
  roleTabActiveCaregiver: {
    backgroundColor: "#DDF0D5",
    borderColor: "#4B7A46",
  },
  roleIcon: {
    fontSize: 16,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D5F54",
  },
  roleTabTextActive: {
    fontWeight: "800",
    color: "#2C2018",
  },
});