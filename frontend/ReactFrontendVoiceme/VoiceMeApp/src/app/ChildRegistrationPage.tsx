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

const AUTH_TOKEN_KEY = "voiceme.authToken";
const API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:8000"
  : "http://localhost:8000";

interface CharacterOption {
  emoji: string;
  nepali: string;
  english: string;
}

const CHARACTERS: CharacterOption[] = [
  { emoji: "👦", nepali: "आरव", english: "Aarav" },
  { emoji: "👧", nepali: "माया", english: "Maya" },
  { emoji: "🧒", nepali: "रोशन", english: "Roshan" },
  { emoji: "🦊", nepali: "स्याल", english: "Fox" },
  { emoji: "🦁", nepali: "सिंह", english: "Lion" },
  { emoji: "🐼", nepali: "पाण्डा", english: "Panda" },
  { emoji: "🌟", nepali: "तारा", english: "Star" },
  { emoji: "🚀", nepali: "रकेट", english: "Rocket" },
];

export default function ChildRegistrationPage() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("👦");
  const [parentName, setParentName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [dialogInfo, setDialogInfo] = useState<{
    visible: boolean;
    titleNe: string;
    titleEn: string;
    message: string;
    isSuccess?: boolean;
  }>({
    visible: false,
    titleNe: "",
    titleEn: "",
    message: "",
  });

  // Preload existing child/parent info if previously set
  useEffect(() => {
    AsyncStorage.multiGet([
      "voiceme.registeredName",
      "voiceme.registeredAge",
      "voiceme.registeredAvatar",
      "voiceme.parentName",
      "voiceme.emergencyPhone",
    ])
      .then((entries) => {
        const name = entries[0][1];
        const age = entries[1][1];
        const avatar = entries[2][1];
        const parent = entries[3][1];
        const phone = entries[4][1];

        if (name?.trim()) setChildName(name.trim());
        if (age?.trim()) {
          // Extract digits if previously saved as "7 वर्ष (7 yrs)"
          const digits = age.replace(/[^0-9]/g, "");
          setChildAge(digits || age.trim());
        }
        if (avatar?.trim()) setSelectedAvatar(avatar.trim());
        if (parent?.trim()) setParentName(parent.trim());
        if (phone?.trim()) setEmergencyPhone(phone.trim());
      })
      .catch(() => {});

    // Backend may already have a profile (e.g. editing from Childpage); prefer
    // it over the AsyncStorage cache above when it's reachable.
    (async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/child/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const profile = await res.json();
        if (profile.name?.trim()) setChildName(profile.name.trim());
        if (profile.age?.trim()) {
          const digits = String(profile.age).replace(/[^0-9]/g, "");
          setChildAge(digits || String(profile.age).trim());
        }
        if (profile.avatar?.trim()) setSelectedAvatar(profile.avatar.trim());
        if (profile.parent?.name) setParentName(profile.parent.name);
        if (profile.parent?.phone) setEmergencyPhone(profile.parent.phone);
      } catch {
        // Offline or backend unreachable: keep the AsyncStorage-loaded values.
      }
    })();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/RoleSelectionpage");
    }
  };

  const handleCompleteRegistration = async () => {
    if (!childName.trim()) {
      setDialogInfo({
        visible: true,
        titleNe: "अपूर्ण विवरण",
        titleEn: "Incomplete Details",
        message: "कृपया बालबालिकाको नाम लेख्नुहोस् (Please enter child's name)",
      });
      return;
    }

    if (!childAge.trim()) {
      setDialogInfo({
        visible: true,
        titleNe: "अपूर्ण विवरण",
        titleEn: "Incomplete Details",
        message: "कृपया उमेर राख्नुहोस् (Please enter child's age)",
      });
      return;
    }

    if (!parentName.trim()) {
      setDialogInfo({
        visible: true,
        titleNe: "अपूर्ण विवरण",
        titleEn: "Incomplete Details",
        message: "कृपया अभिभावकको नाम लेख्नुहोस् (Please enter parent's name)",
      });
      return;
    }

    if (!emergencyPhone.trim()) {
      setDialogInfo({
        visible: true,
        titleNe: "अपूर्ण विवरण",
        titleEn: "Incomplete Details",
        message: "कृपया सम्पर्क नम्बर राख्नुहोस् (Please enter emergency contact)",
      });
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Save registered info to AsyncStorage so Homepage, Caregiverpage, and Parentspage display it
    try {
      await AsyncStorage.multiSet([
        ["voiceme.registeredName", childName.trim()],
        ["voiceme.registeredAge", `${childAge.trim()} वर्ष (${childAge.trim()} yrs)`],
        ["voiceme.registeredAvatar", selectedAvatar],
        ["voiceme.parentName", parentName.trim()],
        ["voiceme.emergencyPhone", emergencyPhone.trim()],
        ["voiceme.currentRole", "user"],
      ]);
    } catch {}

    // Also persist to the backend so other devices/screens reading
    // /api/child/profile/ (Homepage, Childpage) see this profile too.
    // AsyncStorage above already succeeded, so registration proceeds even if
    // this fails (offline, backend down, or not logged in yet).
    let connectCode: string | undefined;
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/child/profile/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: childName.trim(),
            age: `${childAge.trim()} वर्ष (${childAge.trim()} yrs)`,
            avatar: selectedAvatar,
            parent: { name: parentName.trim(), phone: emergencyPhone.trim() },
          }),
        });
        if (res.ok) {
          const profile = await res.json();
          connectCode = profile.connect_code;
        }
      }
    } catch {}

    setDialogInfo({
      visible: true,
      titleNe: "दर्ता सम्पन्न भयो!",
      titleEn: "Registration Complete",
      message: connectCode
        ? `${childName.trim()} र अभिभावक ${parentName.trim()} को विवरण सुरक्षित गरियो।\n\nस्याहारकर्ता (Caregiver) जोड्न यो कोड सेयर गर्नुहोस्:\nConnect code: ${connectCode}`
        : `${childName.trim()} र अभिभावक ${parentName.trim()} को विवरण सुरक्षित गरियो।`,
      isSuccess: true,
    });
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
                बालबालिका तथा अभिभावक दर्ता
              </Text>

              <Text style={styles.topHeaderEnglish}>
                Child & Parent Registration
              </Text>
            </View>

            {/* Child Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                बालबालिकाको नाम (Child's Name)
              </Text>

              <View style={styles.inputPill}>
                <Text style={styles.inputIcon}>🧒</Text>

                <TextInput
                  style={styles.textInput}
                  value={childName}
                  onChangeText={setChildName}
                  placeholder="e.g. Aarav"
                  placeholderTextColor="#7C6356"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Child Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                उमेर (Child's Age)
              </Text>

              <View style={styles.inputPill}>
                <Text style={styles.inputIcon}>🎂</Text>

                <TextInput
                  style={styles.textInput}
                  value={childAge}
                  onChangeText={setChildAge}
                  placeholder="e.g. 7"
                  placeholderTextColor="#7C6356"
                  keyboardType="numeric"
                  maxLength={2}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Character Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                साथी/पात्र छान्नुहोस् (Choose Character)
              </Text>

              <View style={styles.avatarGrid}>
                {CHARACTERS.map((char) => {
                  const isSelected = selectedAvatar === char.emoji;

                  return (
                    <Pressable
                      key={char.emoji}
                      style={[
                        styles.avatarItem,
                        isSelected && styles.avatarItemSelected,
                      ]}
                      onPress={() => setSelectedAvatar(char.emoji)}
                    >
                      <Text style={styles.avatarEmoji}>
                        {char.emoji}
                      </Text>

                      <Text
                        style={[
                          styles.avatarText,
                          isSelected && styles.avatarTextSelected,
                        ]}
                      >
                        {char.nepali}
                      </Text>

                      {isSelected && (
                        <View style={styles.miniCheck}>
                          <Text style={styles.miniCheckText}>
                            ✓
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Parent Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                अभिभावकको नाम (Parent's Name)
              </Text>

              <View style={styles.inputPill}>
                <Text style={styles.inputIcon}>👤</Text>

                <TextInput
                  style={styles.textInput}
                  value={parentName}
                  onChangeText={setParentName}
                  placeholder="e.g. Sita Sharma"
                  placeholderTextColor="#7C6356"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                सम्पर्क नम्बर (Emergency Contact)
              </Text>

              <View style={styles.inputPill}>
                <Text style={styles.inputIcon}>📞</Text>

                <TextInput
                  style={styles.textInput}
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#7C6356"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Complete Registration */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCompleteRegistration}
            >
              <Text style={styles.submitNepali}>
                दर्ता सम्पन्न गर्नुहोस्
              </Text>

              <Text style={styles.submitEnglish}>
                Complete Registration
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Universal Message / Success Modal */}
      <Modal
        visible={dialogInfo.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!dialogInfo.isSuccess) {
              setDialogInfo((prev) => ({ ...prev, visible: false }));
            }
          }}
        >
          <View style={styles.dialogCard}>
            <View style={[styles.dialogBadge, dialogInfo.isSuccess && styles.dialogBadgeSuccess]}>
              <Text style={{ fontSize: 26 }}>{dialogInfo.isSuccess ? "✓" : "⚠️"}</Text>
            </View>

            <Text style={styles.dialogTitleNe}>{dialogInfo.titleNe}</Text>
            <Text style={styles.dialogTitleEn}>{dialogInfo.titleEn}</Text>

            <Text style={styles.dialogMessage}>{dialogInfo.message}</Text>

            {dialogInfo.isSuccess ? (
              <View style={styles.dialogBtnGroup}>
                <Pressable
                  style={styles.dialogActionBtn}
                  onPress={() => {
                    setDialogInfo((prev) => ({ ...prev, visible: false }));
                    router.replace("/Homepage");
                  }}
                >
                  <Text style={styles.dialogActionBtnText}>गृहपृष्ठ जानुहोस् (Go to Home)</Text>
                </Pressable>

                <Pressable
                  style={styles.dialogSecondaryBtn}
                  onPress={() => {
                    setDialogInfo((prev) => ({ ...prev, visible: false }));
                    router.replace("/Parentspage");
                  }}
                >
                  <Text style={styles.dialogSecondaryBtnText}>अभिभावक सेटिङ (Parent Controls)</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.dialogCloseBtn}
                onPress={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.dialogCloseBtnText}>बुझें (Understood)</Text>
              </Pressable>
            )}
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
    fontSize: 25,
    fontWeight: "900",
    color: "#4B1C19",
    letterSpacing: -0.3,
  },

  topHeaderEnglish: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B2419",
    marginTop: 2,
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
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F7D5C6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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

  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#EFE3D0",
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },

  avatarItem: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFFCC",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatarItemSelected: {
    backgroundColor: "#205333",
  },

  avatarEmoji: {
    fontSize: 22,
  },

  avatarText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4B1C19",
    marginTop: 2,
  },

  avatarTextSelected: {
    color: "#FFFFFF",
  },

  miniCheck: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#B95928",
    alignItems: "center",
    justifyContent: "center",
  },

  miniCheckText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },

  submitButton: {
    marginTop: 24,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#235237",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  submitNepali: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  submitEnglish: {
    color: "#D8ECCD",
    fontSize: 12,
    marginTop: 1,
    fontWeight: "500",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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

  dialogBadgeSuccess: {
    backgroundColor: "#E4F3E1",
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

  dialogBtnGroup: {
    width: "100%",
    rowGap: 10,
  },

  dialogActionBtn: {
    backgroundColor: "#235237",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
  },

  dialogActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  dialogSecondaryBtn: {
    backgroundColor: "#EFE6D8",
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
  },

  dialogSecondaryBtnText: {
    color: "#4B2419",
    fontSize: 13,
    fontWeight: "700",
  },

  dialogCloseBtn: {
    backgroundColor: "#EFE6D8",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 28,
    alignItems: "center",
  },

  dialogCloseBtnText: {
    color: "#4B2419",
    fontSize: 13,
    fontWeight: "700",
  },
});