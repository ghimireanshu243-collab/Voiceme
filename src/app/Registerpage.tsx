import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from "react-native";
import { router } from "expo-router";

export type UserRole = "user" | "caregiver";

export default function RoleSelectionScreen() {
    const [selectedRole, setSelectedRole] = useState<UserRole>("caregiver");

    const handleSelectRoleAndProceed = (role: UserRole) => {
        setSelectedRole(role);
        if (role === "caregiver") {
            router.push("/CaregiverRegistrationPage");
        } else {
            router.push("/ChildRegistrationPage");
        }
    };

    const handleContinue = () => {
        if (selectedRole === "caregiver") {
            router.push("/CaregiverRegistrationPage");
        } else {
            router.push("/ChildRegistrationPage");
        }
    };

    const handleReturnToLogin = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/Loginpage");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.topBar}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Return to login"
                            style={styles.backButton}
                            onPress={handleReturnToLogin}
                        >
                            <Text style={styles.backButtonText}>← लगइन · Login</Text>
                        </Pressable>
                        <Text style={styles.brandTitle}>Voice Me</Text>
                        <View style={styles.circleGreen} />
                    </View>

                    <View style={styles.headingSection}>
                        <Text style={styles.nepaliHeading}>भूमिका छान्नुहोस्</Text>
                        <Text style={styles.englishHeading}>Choose your role</Text>
                        <Text style={styles.subHeading}>How will you use Voice Me?</Text>
                    </View>

                    {/* 1. Parent / Child (User) */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.roleCard,
                            styles.userCardBg,
                            selectedRole === "user" && styles.selectedBorder,
                            pressed && styles.pressedState,
                        ]}
                        onPress={() => handleSelectRoleAndProceed("user")}
                    >
                        {selectedRole === "user" && (
                            <View style={styles.checkmarkBadge}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                        <View style={styles.userIconCircle}>
                            <Text style={styles.iconEmoji}>👤</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitleNepali}>प्रयोगकर्ता (अभिभावक/बालबालिका)</Text>
                            <Text style={styles.cardTitleEnglish}>Parent / Child</Text>
                            <Text style={styles.cardDesc}>बालबालिकाको आवाज र तालिका सहजीकरणका लागि</Text>
                        </View>
                        <Text style={styles.cardArrow}>→</Text>
                    </Pressable>

                    {/* 2. Caregiver */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.roleCard,
                            styles.caregiverCardBg,
                            selectedRole === "caregiver" && styles.selectedBorder,
                            pressed && styles.pressedState,
                        ]}
                        onPress={() => handleSelectRoleAndProceed("caregiver")}
                    >
                        {selectedRole === "caregiver" && (
                            <View style={styles.checkmarkBadge}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                        <View style={styles.heartIconCircle}>
                            <Text style={styles.iconEmoji}>💚</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.caregiverTitleNepali}>हेरचाहकर्ता</Text>
                            <Text style={styles.caregiverTitleEnglish}>Caregiver</Text>
                            <Text style={styles.caregiverDesc}>I care for someone using Voice Me</Text>
                        </View>
                        <Text style={styles.cardArrow}>→</Text>
                    </Pressable>

                    {/* Continue Button */}
                    <Pressable style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueNepali}>अघि बढ्नुहोस्</Text>
                        <Text style={styles.continueEnglish}>Continue</Text>
                    </Pressable>

                    {/* Return to Login Link */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Return to login"
                        style={styles.loginLink}
                        onPress={handleReturnToLogin}
                    >
                        <Text style={styles.loginNepali}>पहिले नै खाता छ? लगइन गर्नुहोस्</Text>
                        <Text style={styles.loginEnglish}>Already have an account? Return to Login</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F5ECD9" },
    scrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
    container: { width: "90%", maxWidth: 360 },
    topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backButton: { backgroundColor: "#EAE0CE", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
    backButtonText: { fontSize: 13, fontWeight: "700", color: "#342419" },
    circlePeach: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EBD5B7" },
    circleGreen: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D6ECC9" },
    brandTitle: { fontSize: 18, fontWeight: "800", color: "#4B2419" },
    headingSection: { marginTop: 32, marginBottom: 20 },
    nepaliHeading: { fontSize: 27, fontWeight: "900", color: "#4B1C19" },
    englishHeading: { fontSize: 20, fontWeight: "800", color: "#54251B", marginTop: 2 },
    subHeading: { fontSize: 14, color: "#7C6D5F", marginTop: 4 },
    roleCard: { borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 16, borderWidth: 2.5, borderColor: "transparent" },
    userCardBg: { backgroundColor: "#F8E0D2" },
    caregiverCardBg: { backgroundColor: "#DCECCE" },
    selectedBorder: { borderColor: "#205333" },
    checkmarkBadge: { position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: 12, backgroundColor: "#205333", alignItems: "center", justifyContent: "center" },
    checkmarkText: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
    userIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#EFC9B6", alignItems: "center", justifyContent: "center", marginRight: 14 },
    heartIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#C3DFB0", alignItems: "center", justifyContent: "center", marginRight: 14 },
    iconEmoji: { fontSize: 26 },
    textContainer: { flex: 1, paddingRight: 18 },
    cardTitleNepali: { fontSize: 18, fontWeight: "900", color: "#4B1C19" },
    cardTitleEnglish: { fontSize: 13, fontWeight: "700", color: "#5E3628" },
    cardDesc: { fontSize: 12, color: "#7A6B5E", marginTop: 3 },
    caregiverTitleNepali: { fontSize: 18, fontWeight: "900", color: "#205333" },
    caregiverTitleEnglish: { fontSize: 13, fontWeight: "700", color: "#2B5E39" },
    caregiverDesc: { fontSize: 12, color: "#586E53", marginTop: 3 },
    continueButton: { marginTop: 28, height: 60, borderRadius: 30, backgroundColor: "#235237", alignItems: "center", justifyContent: "center" },
    continueNepali: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
    continueEnglish: { color: "#D8ECCD", fontSize: 12, marginTop: 1 },
    loginLink: { marginTop: 18, alignItems: "center", paddingVertical: 10 },
    loginNepali: { fontSize: 14, fontWeight: "700", color: "#4B1C19" },
    loginEnglish: { fontSize: 12, fontWeight: "500", color: "#7C6D5F", marginTop: 2 },
    cardArrow: { fontSize: 20, fontWeight: "bold", color: "#342419", marginLeft: 4 },
    pressedState: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});