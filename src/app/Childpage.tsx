import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

interface ChildProfileProps {
  onBackPress?: () => void;
  onViewLocationHistory?: () => void;
  onEditProfile?: () => void;
}

export const ChildProfileScreen: React.FC<ChildProfileProps> = ({
  onBackPress,
  onViewLocationHistory,
  onEditProfile,
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

  const handleViewLocationHistory = () => {
    if (onViewLocationHistory) {
      onViewLocationHistory();
    } else {
      router.push('/Homepage');
    }
  };

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      router.push('/ChildRegistrationPage');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Top Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Return to Homepage"
            accessibilityRole="button"
          >
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Child Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👦</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameHindi}>आरव</Text>
            <Text style={styles.nameSub}>Aarav K. • 7 years</Text>
            <Text style={styles.managedBy}>Profile managed by parent</Text>
          </View>
        </View>

        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Current location</Text>

          {/* Map Graphic with Curved Road Path */}
          <View style={styles.mapContainer}>
            <Svg height="100%" width="100%" viewBox="0 0 320 120" style={StyleSheet.absoluteFill}>
              {/* Smooth S-curve route */}
              <Path
                d="M 0 75 Q 80 85 130 65 T 220 40 T 320 70"
                fill="none"
                stroke="#B8BEB2"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Location marker halo & active pin dot */}
              <Circle cx="150" cy="55" r="14" fill="rgba(189, 94, 46, 0.22)" />
              <Circle cx="150" cy="55" r="10" fill="#BD5E2E" />
            </Svg>

            {/* Location Badge */}
            <View style={styles.mapLabelRow}>
              <Text style={styles.pinIcon}>📍</Text>
              <Text style={styles.mapLabelText}>At home</Text>
            </View>
          </View>

          <Text style={styles.updatedText}>Updated 2 minutes ago</Text>
        </View>

        {/* Caregiver Information Row */}
        <View style={styles.caregiverRow}>
          {/* Caregiver Name Card */}
          <View style={[styles.caregiverCard, styles.caregiverPeachCard]}>
            <Text style={styles.caregiverLabel}>Caregiver</Text>
            <Text style={styles.caregiverValue} numberOfLines={1}>
              Maya Sharma
            </Text>
          </View>

          {/* Caregiver ID Card */}
          <View style={[styles.caregiverCard, styles.caregiverNeutralCard]}>
            <Text style={styles.caregiverLabel}>Caregiver ID</Text>
            <Text style={styles.caregiverValue} numberOfLines={1}>
              CG2048
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewLocationHistory}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>View Location History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleEditProfile}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Edit Child Profile</Text>
          </TouchableOpacity>

          {/* Return to Homepage Button */}
          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.returnButtonText}>🏠 Return to Homepage</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>Parent controls this profile.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChildProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6', // Soft warm cream canvas
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backChevron: {
    fontSize: 32,
    lineHeight: 34,
    color: '#342F2A',
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#342F2A',
    letterSpacing: -0.3,
    marginLeft: 6,
  },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDF0D5', // Pastel sage green
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F6F2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameHindi: {
    fontSize: 21,
    fontWeight: '700',
    color: '#243022',
    marginBottom: 2,
  },
  nameSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4D3A',
    marginBottom: 2,
  },
  managedBy: {
    fontSize: 12,
    color: '#5C6D5A',
  },

  /* Location Card */
  locationCard: {
    backgroundColor: '#FFFEFB',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#362E27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#342F2A',
    marginBottom: 12,
  },
  mapContainer: {
    height: 126,
    backgroundColor: '#E7E5DC',
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 14,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  mapLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#342F2A',
  },
  updatedText: {
    fontSize: 12,
    color: '#7C7872',
    marginTop: 10,
    marginLeft: 2,
  },

  /* Caregiver Row */
  caregiverRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  caregiverCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  caregiverPeachCard: {
    backgroundColor: '#FCE1D4', // Warm pastel peach
  },
  caregiverNeutralCard: {
    backgroundColor: '#E8E7E0', // Muted warm grey
  },
  caregiverLabel: {
    fontSize: 12,
    color: '#645B53',
    fontWeight: '500',
    marginBottom: 4,
  },
  caregiverValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2A25',
  },

  /* Action Buttons */
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#BD5E2E', // Terracotta rust
    height: 54,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD5E2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: '#F6EEE2', // Soft warm cream
    height: 54,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#322C27',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  returnButton: {
    backgroundColor: '#EAE1D2',
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8CEBE',
  },
  returnButtonText: {
    color: '#473628',
    fontSize: 14.5,
    fontWeight: '700',
  },

  /* Footer Note */
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8A847B',
    marginTop: 8,
  },
});
