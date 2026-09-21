import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";

export default function RoleSelectionpage() {
  const handleReturnToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/Loginpage");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5ECD9"
        translucent={Platform.OS === "android"}
      />

      {/* Top Header with Back / Return to Login Button */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to login"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedState,
          ]}
          onPress={handleReturnToLogin}
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
          <Text style={styles.backButtonText}>लगइन · Login</Text>
        </Pressable>

        <Text style={styles.brandTitle}>Voice Me</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.nepaliHeading}>भूमिका छान्नुहोस्</Text>
            <Text style={styles.englishHeading}>Choose your role</Text>
            <Text style={styles.subHeading}>
              तपाईं Voice Me कसरी प्रयोग गर्न चाहनुहुन्छ?{"\n"}
              How will you use Voice Me?
            </Text>
          </View>

          {/* Role 1: User / Child */}
          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              styles.userCardBg,
              pressed && styles.pressedCard,
            ]}
            onPress={() => router.push("/Parentspage")}
          >
            <View style={styles.iconCircleUser}>
              <Text style={styles.iconEmoji}>👤</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.cardTitleNepali}>
                प्रयोगकर्ता (अभिभावक / बालबालिका)
              </Text>
              <Text style={styles.cardTitleEnglish}>User (Child / Parent)</Text>
              <Text style={styles.cardDesc}>
                बालबालिकाको आवाज, सेटिङ र तालिका सहजीकरणका लागि
              </Text>
            </View>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </Pressable>

          {/* Role 2: Caregiver */}
          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              styles.caregiverCardBg,
              pressed && styles.pressedCard,
            ]}
            onPress={() => router.push("/Caregiverpage")}
          >
            <View style={styles.iconCircleCaregiver}>
              <Text style={styles.iconEmoji}>💚</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.cardTitleNepali}>हेरचाहकर्ता</Text>
              <Text style={styles.cardTitleEnglish}>Caregiver</Text>
              <Text style={styles.cardDesc}>
                I care for someone using Voice Me · हेरचाह र अलर्ट
              </Text>
            </View>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </Pressable>

          {/* Return to Login Section */}
          <View style={styles.returnSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to login page"
              style={({ pressed }) => [
                styles.returnButton,
                pressed && styles.pressedState,
              ]}
              onPress={handleReturnToLogin}
            >
              <Text style={styles.returnButtonNepali}>
                पहिले नै खाता छ? लगइन गर्नुहोस्
              </Text>
              <Text style={styles.returnButtonEnglish}>
                Already have an account? Return to Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5ECD9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE0CE",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    columnGap: 5,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#342419",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B2419",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
  },
  headingSection: {
    marginBottom: 26,
    alignItems: "center",
  },
  nepaliHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4B1C19",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  englishHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#54251B",
    marginTop: 4,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 13.5,
    color: "#7C6D5F",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  roleCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.04)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userCardBg: {
    backgroundColor: "#F8E0D2",
  },
  caregiverCardBg: {
    backgroundColor: "#DCECCE",
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircleUser: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFC9B6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconCircleCaregiver: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C3DFB0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitleNepali: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#342419",
  },
  cardTitleEnglish: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5E3628",
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: "#7A6B5E",
    marginTop: 4,
    lineHeight: 16,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#342419",
  },
  returnSection: {
    marginTop: 20,
    alignItems: "center",
  },
  returnButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "rgba(235, 224, 206, 0.6)",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0D3BE",
  },
  returnButtonNepali: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#4B1C19",
  },
  returnButtonEnglish: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#7C6D5F",
    marginTop: 2,
  },
  pressedState: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});