import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, Clover, Check } from 'lucide-react-native';

export interface ConnectedChild {
  id: string;
  name: string;
  parentName: string;
  avatarEmoji: string;
  status: string;
}

export interface CaregiverData {
  id: string;
  name: string;
  role: string;
  isAvailable: boolean;
  connectedChildren: ConnectedChild[];
}

const DEFAULT_CAREGIVER: CaregiverData = {
  id: 'CG2048',
  name: 'Maya Sharma',
  role: 'Caregiver',
  isAvailable: true,
  connectedChildren: [
    {
      id: '1',
      name: 'Aarav K.',
      parentName: 'Sita Sharma',
      avatarEmoji: '👦',
      status: 'Connected',
    },
  ],
};

// ==========================================
// 2. SCREEN 1: Caregiver Profile Screen
// ==========================================
export interface CaregiverProfileViewProps {
  caregiver?: CaregiverData;
  onNavigateToConnect: () => void;
  onBackPress?: () => void;
  onSelectChild?: (child: ConnectedChild) => void;
  onToggleAvailability?: () => void;
}

export const CaregiverProfileScreen: React.FC<CaregiverProfileViewProps> = ({
  caregiver = DEFAULT_CAREGIVER,
  onNavigateToConnect,
  onBackPress,
  onSelectChild,
  onToggleAvailability,
}) => {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  const handleSelectChild = (child: ConnectedChild) => {
    if (onSelectChild) {
      onSelectChild(child);
    } else {
      router.push('/Childpage');
    }
  };

  const handleShareId = () => {
    Alert.alert(
      'Share Caregiver ID',
      `Your Caregiver ID is: ${caregiver.id}\nA parent can use this ID to send a connection request.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="फर्कनुहोस् (Return)"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color="#342F2A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caregiver Profile</Text>
        </View>

        {/* Caregiver Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.caregiverName}>{caregiver.name}</Text>
            <Text style={styles.roleLabel}>{caregiver.role}</Text>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>Caregiver ID </Text>
              <Text style={styles.idValue}>{caregiver.id}</Text>
            </View>
          </View>
        </View>

        {/* Availability Status Card */}
        <TouchableOpacity
          style={styles.statusCard}
          onPress={onToggleAvailability}
          activeOpacity={0.85}
        >
          <View style={[styles.statusDot, !caregiver.isAvailable && styles.statusDotOffline]} />
          <View style={styles.statusTextWrapper}>
            <Text style={styles.statusTitle}>
              {caregiver.isAvailable ? 'Available' : 'Busy / Away'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {caregiver.isAvailable
                ? 'Ready to support connected children'
                : 'Currently unavailable for alerts'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Connected profiles</Text>
        </View>

        {/* Connected Children List */}
        {caregiver.connectedChildren.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            onPress={() => handleSelectChild(child)}
            activeOpacity={0.8}
          >
            <View style={styles.childAvatarCircle}>
              <Text style={styles.childAvatarEmoji}>{child.avatarEmoji}</Text>
            </View>
            <View style={styles.childDetails}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childParent}>Parent: {child.parentName}</Text>
            </View>
            <Text style={styles.connectedBadge}>{child.status}</Text>
          </TouchableOpacity>
        ))}

        {/* Action Button: Connect to Profile */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onNavigateToConnect}
          activeOpacity={0.85}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Connect to Profile</Text>
        </TouchableOpacity>

        {/* Return Button to Homepage */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.bottomReturnBtn}
          accessibilityLabel="गृहपृष्ठमा फर्कनुहोस् (Return to Homepage)"
          accessibilityRole="button"
        >
          <Text style={styles.bottomReturnIcon}>🏠</Text>
          <Text style={styles.bottomReturnText}>गृहपृष्ठमा फर्कनुहोस् (Return to Homepage)</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <TouchableOpacity onPress={handleShareId} activeOpacity={0.7} style={styles.footerNoteWrap}>
          <Text style={styles.shareIdTitle}>Share your Caregiver ID: {caregiver.id}</Text>
          <Text style={styles.shareIdDescription}>
            A parent can use this ID to send a connection request.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// 3. SCREEN 2: Connect Caregiver Screen
// ==========================================
export interface ConnectCaregiverViewProps {
  onBackPress: () => void;
  onRequestSent: (newChildName: string, caregiverId: string) => void;
  defaultId?: string;
  matchedUserName?: string;
}

export const ConnectCaregiverScreen: React.FC<ConnectCaregiverViewProps> = ({
  onBackPress,
  onRequestSent,
  defaultId = 'CG2048',
  matchedUserName = 'Aarav k',
}) => {
  const [userIdInput, setUserIdInput] = useState(defaultId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Match condition (e.g. caregiver ID pattern)
  const isMatchFound = userIdInput.trim().toUpperCase() === 'CG2048' || userIdInput.trim().length >= 4;

  const handleSendRequest = () => {
    if (!isMatchFound) {
      Alert.alert('ID Not Found', 'Please enter a valid Caregiver ID.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Request Sent Successfully',
        `Connection request sent to caregiver (${userIdInput}). Awaiting approval.`,
        [
          {
            text: 'OK',
            onPress: () => onRequestSent(matchedUserName, userIdInput),
          },
        ]
      );
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={28} color="#342F2A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Caregiver</Text>
        </View>

        {/* Top 3-Leaf Clover Emblem Badge */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemCircle}>
            <Clover size={46} color="#465743" strokeWidth={1.8} />
          </View>
        </View>

        {/* Headings */}
        <View style={styles.connectHeadingWrap}>
          <Text style={styles.connectMainHeading}>Enter to user ID</Text>
          <Text style={styles.connectSubHeading}>Use the ID provided by the caregiver</Text>
        </View>

        {/* User ID Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>User ID</Text>
          <TextInput
            style={styles.textInput}
            value={userIdInput}
            onChangeText={setUserIdInput}
            placeholder="e.g. CG2048"
            placeholderTextColor="#A8A196"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Matched User Green Card with Checkmark */}
        {isMatchFound && (
          <View style={styles.matchedCard}>
            <View>
              <Text style={styles.matchedLabel}>User</Text>
              <Text style={styles.matchedName}>{matchedUserName}</Text>
            </View>
            <Check size={22} color="#263324" strokeWidth={2.8} />
          </View>
        )}

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.primaryActionButton, !isMatchFound && styles.buttonDisabled]}
          onPress={handleSendRequest}
          disabled={isSubmitting || !isMatchFound}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Send Connection Request</Text>
          )}
        </TouchableOpacity>

        {/* Return to Profile Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBackPress}
          activeOpacity={0.8}
          accessibilityLabel="फर्कनुहोस् (Return to Profile)"
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>फर्कनुहोस् (Return to Profile)</Text>
        </TouchableOpacity>

        {/* Explanatory Footer */}
        <View style={styles.footerNoteWrap}>
          <Text style={styles.footerApprovalTitle}>The caregiver must accept the request.</Text>
          <Text style={styles.footerApprovalDesc}>
            After approval, they can access the permissions you choose for the child's profile.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// 4. MAIN NAVIGATOR COMPONENT
// Handles page transition between both screens
// ==========================================
export default function CaregiverFlowApp() {
  const [currentScreen, setCurrentScreen] = useState<'profile' | 'connect'>('profile');
  const [caregiver, setCaregiver] = useState<CaregiverData>(DEFAULT_CAREGIVER);

  const handleBackToPrevious = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  const handleConnectionAccepted = (newChildName: string) => {
    const exists = caregiver.connectedChildren.some(
      (c) => c.name.toLowerCase() === newChildName.toLowerCase()
    );

    if (!exists) {
      setCaregiver((prev) => ({
        ...prev,
        connectedChildren: [
          ...prev.connectedChildren,
          {
            id: String(Date.now()),
            name: newChildName,
            parentName: 'Sita Sharma',
            avatarEmoji: '👦',
            status: 'Connected',
          },
        ],
      }));
    }
    // Return back to caregiver profile after sending request
    setCurrentScreen('profile');
  };

  const handleToggleAvailability = () => {
    setCaregiver((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  if (currentScreen === 'connect') {
    return (
      <ConnectCaregiverScreen
        onBackPress={() => setCurrentScreen('profile')}
        onRequestSent={handleConnectionAccepted}
        defaultId={caregiver.id}
        matchedUserName="Aarav k"
      />
    );
  }

  return (
    <CaregiverProfileScreen
      caregiver={caregiver}
      onNavigateToConnect={() => setCurrentScreen('connect')}
      onBackPress={handleBackToPrevious}
      onSelectChild={() => router.push('/Childpage')}
      onToggleAvailability={handleToggleAvailability}
    />
  );
}

// ==========================================
// 5. UNIFIED STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6', // Soft warm cream canvas
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE0CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#342F2A',
    letterSpacing: -0.3,
    marginLeft: 10,
  },

  // Caregiver Profile Card Styles
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE1D4', // Pastel peach card
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F6F2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E2A25',
    marginBottom: 2,
  },
  roleLabel: {
    fontSize: 13,
    color: '#685F56',
    fontWeight: '500',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  idLabel: {
    fontSize: 12,
    color: '#7C746B',
  },
  idValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BD5E2E', // Terracotta orange
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDF0D5', // Gentle pastel sage green
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5C6E5A',
    marginRight: 12,
  },
  statusDotOffline: {
    backgroundColor: '#A0988E',
  },
  statusTextWrapper: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A3528',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#556952',
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#342F2A',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFEFB',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2ECE1',
  },
  childAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F6F2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  childAvatarEmoji: {
    fontSize: 24,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2A25',
  },
  childParent: {
    fontSize: 12,
    color: '#7C7872',
    marginTop: 2,
  },
  connectedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C6E5A',
  },

  // Connect Caregiver Styles
  emblemContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  emblemCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DDF0D5', // Gentle sage emblem
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectHeadingWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  connectMainHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#342F2A',
    letterSpacing: -0.2,
  },
  connectSubHeading: {
    fontSize: 14,
    color: '#716A62',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#453F38',
    marginBottom: 8,
    marginLeft: 2,
  },
  textInput: {
    height: 56,
    backgroundColor: '#FFFEFB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E2D7',
    paddingHorizontal: 18,
    fontSize: 17,
    fontWeight: '700',
    color: '#2E2A25',
  },
  matchedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DDF0D5', // Sage card
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CEE4C5',
  },
  matchedLabel: {
    fontSize: 12,
    color: '#566853',
    fontWeight: '500',
  },
  matchedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263324',
    marginTop: 2,
  },

  // Common Action Buttons & Footers
  primaryActionButton: {
    flexDirection: 'row',
    backgroundColor: '#BD5E2E', // Terracotta orange
    height: 54,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD5E2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
    marginBottom: 12,
  },
  bottomReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAE0CE',
    borderWidth: 1.5,
    borderColor: '#DAC9B8',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  bottomReturnIcon: {
    fontSize: 16,
  },
  bottomReturnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4C3524',
  },
  cancelButton: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DAC9B8',
    backgroundColor: '#EAE0CE',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C4A3C',
  },
  buttonDisabled: {
    backgroundColor: '#D8D2C5',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerNoteWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  shareIdTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#342F2A',
  },
  shareIdDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8A847B',
    marginTop: 4,
    lineHeight: 18,
  },
  footerApprovalTitle: {
    fontSize: 13,
    color: '#6E675E',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerApprovalDesc: {
    fontSize: 12,
    color: '#847E74',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});