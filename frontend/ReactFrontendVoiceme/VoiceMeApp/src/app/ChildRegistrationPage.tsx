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
  ? "http://192.168.1.77:8000"
  : "http://192.168.1.77:8000";

interface CharacterOption {
  emoji: string;
  nepali: string;
  english: string;
}

interface DraftRoutineItem {
  id: string;
  slotIndex: number;
  time: string;
  title: string;
  icon: string;
}

const ROUTINE_STORAGE_KEY = "voiceme.daily_routine_state";

// Every half hour across the full day so the child can place a routine at
// any point, not just the hardcoded slots the dashboards used to default to.
const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
});

const ROUTINE_EMOJI_RULES: { keywords: string[]; icon: string }[] = [
  { keywords: ["teeth", "brush", "दाँत", "माझ्"], icon: "🪥" },
  { keywords: ["medicine", "aushadhi", "औषधि"], icon: "💊" },
  { keywords: ["breakfast", "नास्ता", "खाजा", "बिहान"], icon: "🥣" },
  { keywords: ["lunch", "दिउँसो"], icon: "🍱" },
  { keywords: ["dinner", "साँझ", "रात"], icon: "🍽️" },
  { keywords: ["milk", "दूध"], icon: "🥛" },
  { keywords: ["water", "drink", "पानी"], icon: "💧" },
  { keywords: ["snack", "biscuit"], icon: "🍪" },
  { keywords: ["study", "homework", "पढ", "school", "विद्यालय"], icon: "📚" },
  { keywords: ["play", "sport", "football", "खेल"], icon: "⚽" },
  { keywords: ["bath", "shower", "नुहाउ"], icon: "🛁" },
  { keywords: ["sleep", "bed", "nap", "सुत", "निद्रा"], icon: "🌙" },
  { keywords: ["exercise", "yoga", "run", "walk", "व्यायाम"], icon: "🏃" },
  { keywords: ["tv", "cartoon", "television"], icon: "📺" },
  { keywords: ["clean", "tidy", "सफा"], icon: "🧹" },
  { keywords: ["pray", "पूजा"], icon: "🙏" },
];

function suggestRoutineEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of ROUTINE_EMOJI_RULES) {
    if (rule.keywords.some((word) => lower.includes(word.toLowerCase()))) {
      return rule.icon;
    }
  }
  return "⏰";
}

const CHARACTERS: CharacterOption[] = [
  { emoji: "👦", nepali: "आरव", english: "Aarav" },
  { emoji: "👧", nepali: "माया", english: "Maya" },
  { emoji: "🧒", nepali: "रोशन", english: "Roshan" },
  { emoji: "👶", nepali: "बच्चा", english: "Baby" },
  { emoji: "🦊", nepali: "स्याल", english: "Fox" },
  { emoji: "🦁", nepali: "सिंह", english: "Lion" },
  { emoji: "🐼", nepali: "पाण्डा", english: "Panda" },
  { emoji: "🐶", nepali: "कुकुर", english: "Dog" },
  { emoji: "🐱", nepali: "बिरालो", english: "Cat" },
  { emoji: "🐰", nepali: "खरायो", english: "Rabbit" },
  { emoji: "🐯", nepali: "बाघ", english: "Tiger" },
  { emoji: "🐨", nepali: "कोआला", english: "Koala" },
  { emoji: "🐸", nepali: "भ्यागुतो", english: "Frog" },
  { emoji: "🦄", nepali: "युनिकर्न", english: "Unicorn" },
  { emoji: "🐵", nepali: "बाँदर", english: "Monkey" },
  { emoji: "🌟", nepali: "तारा", english: "Star" },
  { emoji: "🚀", nepali: "रकेट", english: "Rocket" },
  { emoji: "🌈", nepali: "इन्द्रेणी", english: "Rainbow" },
  { emoji: "⚽", nepali: "फुटबल", english: "Football" },
  { emoji: "🎈", nepali: "बेलुन", english: "Balloon" },
];

export default function ChildRegistrationPage() {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("👦");
  const [parentName, setParentName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(14); // 07:00 AM
  const [routineDraftTitle, setRoutineDraftTitle] = useState("");
  const [routineEntries, setRoutineEntries] = useState<DraftRoutineItem[]>([]);

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

  const handleAddRoutineEntry = () => {
    const title = routineDraftTitle.trim();
    if (!title) return;

    try {
      Haptics.selectionAsync();
    } catch {}

    setRoutineEntries((prev) =>
      [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          slotIndex: selectedSlotIndex,
          time: TIME_SLOTS[selectedSlotIndex],
          title,
          icon: suggestRoutineEmoji(title),
        },
      ].sort((a, b) => a.slotIndex - b.slotIndex)
    );
    setRoutineDraftTitle("");
  };

  const handleRemoveRoutineEntry = (id: string) => {
    setRoutineEntries((prev) => prev.filter((entry) => entry.id !== id));
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

    // Only touch the routine list if the child actually set one up here —
    // an empty submission should never wipe out routines saved earlier.
    if (routineEntries.length > 0) {
      const routinesToSave = routineEntries.map((entry) => ({
        id: entry.id,
        time: entry.time,
        nepaliTitle: entry.title,
        englishTitle: entry.title,
        icon: entry.icon,
        completed: false,
      }));

      try {
        await AsyncStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routinesToSave));
      } catch {}

      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          await fetch(`${API_BASE_URL}/api/routines/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: routineEntries.map((entry) => ({
                time: entry.time,
                slot_index: entry.slotIndex,
                title: entry.title,
                icon: entry.icon,
              })),
            }),
          });
        }
      } catch {}
    }

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

            {/* Daily Routine Setup */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                दैनिक दिनचर्या (Daily Routine)
              </Text>
              <Text style={styles.routineHint}>
                जति चाहिन्छ त्यति दिनचर्या थप्नुहोस् (Add as many routines as you like)
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeSlotScroll}
                contentContainerStyle={styles.timeSlotScrollContent}
              >
                {TIME_SLOTS.map((slot, index) => {
                  const isSelected = index === selectedSlotIndex;
                  return (
                    <Pressable
                      key={slot}
                      style={[
                        styles.timeSlotChip,
                        isSelected && styles.timeSlotChipSelected,
                      ]}
                      onPress={() => setSelectedSlotIndex(index)}
                    >
                      <Text
                        style={[
                          styles.timeSlotChipText,
                          isSelected && styles.timeSlotChipTextSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.inputPill}>
                <Text style={styles.inputIcon}>
                  {routineDraftTitle.trim() ? suggestRoutineEmoji(routineDraftTitle) : "📝"}
                </Text>

                <TextInput
                  style={styles.textInput}
                  value={routineDraftTitle}
                  onChangeText={setRoutineDraftTitle}
                  placeholder="e.g. Brush teeth"
                  placeholderTextColor="#7C6356"
                  returnKeyType="done"
                  onSubmitEditing={handleAddRoutineEntry}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.addRoutineButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAddRoutineEntry}
              >
                <Text style={styles.addRoutineButtonText}>
                  + थप्नुहोस् (Add Routine)
                </Text>
              </Pressable>

              {routineEntries.length > 0 && (
                <View style={styles.routineList}>
                  {routineEntries.map((entry) => (
                    <View key={entry.id} style={styles.routineRow}>
                      <Text style={styles.routineRowIcon}>{entry.icon}</Text>
                      <View style={styles.routineRowText}>
                        <Text style={styles.routineRowTime}>{entry.time}</Text>
                        <Text style={styles.routineRowTitle} numberOfLines={1}>
                          {entry.title}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${entry.title}`}
                        style={styles.routineRemoveBtn}
                        onPress={() => handleRemoveRoutineEntry(entry.id)}
                      >
                        <Text style={styles.routineRemoveBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
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
    fontSize: 28,
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

  routineHint: {
    fontSize: 11.5,
    color: "#7C6356",
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },

  timeSlotScroll: {
    marginBottom: 10,
  },

  timeSlotScrollContent: {
    columnGap: 8,
    paddingRight: 4,
  },

  timeSlotChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#F7D5C6",
  },

  timeSlotChipSelected: {
    backgroundColor: "#235237",
  },

  timeSlotChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#4B1C19",
  },

  timeSlotChipTextSelected: {
    color: "#FFFFFF",
  },

  addRoutineButton: {
    marginTop: 10,
    backgroundColor: "#B95928",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },

  addRoutineButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },

  routineList: {
    marginTop: 12,
    backgroundColor: "#EFE3D0",
    borderRadius: 18,
    padding: 8,
    rowGap: 6,
  },

  routineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFCC",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  routineRowIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  routineRowText: {
    flex: 1,
  },

  routineRowTime: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7C6356",
  },

  routineRowTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#3A2218",
    marginTop: 1,
  },

  routineRemoveBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F7D5C6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  routineRemoveBtnText: {
    color: "#B95928",
    fontSize: 13,
    fontWeight: "800",
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