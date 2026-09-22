import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

export interface ChildItem {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  age: number;
  status: string;
  updatedTime: string;
  avatarBg: string;
  emoji: string;
  cardBg: string;
}

export interface ParentsPageProps {
  navigation?: any;
  onSelectChild?: (child: ChildItem) => void;
  onAddChild?: () => void;
  onOpenSettings?: () => void;
  onViewCaregiver?: () => void;
}

export const ParentsPage: React.FC<ParentsPageProps> = ({
  navigation,
  onSelectChild,
  onAddChild,
  onOpenSettings,
  onViewCaregiver,
}) => {
  const childrenList: ChildItem[] = [
    {
      id: 'aarav',
      nameNepali: 'आरव',
      nameEnglish: 'Aarav K.',
      age: 7,
      status: 'At home',
      updatedTime: 'Location updated 2 min ago',
      avatarBg: '#EFE6D8',
      emoji: '👦',
      cardBg: '#D7EBD2', // Soft pastel green
    },
    {
      id: 'anu',
      nameNepali: 'अनु',
      nameEnglish: 'Anu S.',
      age: 5,
      status: 'At school',
      updatedTime: 'Location updated 5 min ago',
      avatarBg: '#EAE1D3',
      emoji: '👧',
      cardBg: '#F5EFE6', // Light neutral cream
    },
  ];

  const handleChildClick = (child: ChildItem) => {
    if (onSelectChild) {
      onSelectChild(child);
    } else {
      router.push('/Childpage');
    }
  };

  const handleAddChild = () => {
    if (onAddChild) {
      onAddChild();
    } else {
      router.push('/ChildRegistrationPage');
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      Alert.alert(
        'सेटिङ (Settings)',
        'अभिभावक खाता र सूचना प्राथमिकताहरू (Parent account & notification preferences)'
      );
    }
  };

  const handleCaregiverPress = () => {
    if (onViewCaregiver) {
      onViewCaregiver();
    } else {
      router.push('/Caregiverpage');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4EFE6"
        translucent={Platform.OS === 'android'}
      />

      {/* Top Header with Return Button */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/Homepage');
          }}
          style={styles.backButton}
          accessibilityLabel="Return to Homepage"
          accessibilityRole="button"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke="#342419"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitleNepali}>अभिभावक ड्यासबोर्ड</Text>
          <Text style={styles.headerSubtitleEnglish}>Parent & Child Profile</Text>
        </View>

        {/* Settings Cog Icon Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6F5D50" strokeWidth={2}>
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Parent Identity Card (Peach Tone) */}
        <View style={styles.parentCard}>
          <View style={styles.parentCardLeft}>
            <Text style={styles.parentCardLabel}>Parent</Text>
            <Text style={styles.parentName}>Sita Sharma</Text>
            <Text style={styles.parentId}>Parent ID • P001</Text>
          </View>

          {/* Green Checkmark Badge */}
          <View style={styles.checkWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#486044" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M20 6L9 17l-5-5" />
            </Svg>
          </View>
        </View>

        {/* My Children Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleAddChild}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#BD622D" strokeWidth={2.4} strokeLinecap="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Children List */}
        <View style={styles.childrenList}>
          {childrenList.map((child) => (
            <TouchableOpacity
              key={child.id}
              activeOpacity={0.85}
              style={[styles.childCard, { backgroundColor: child.cardBg }]}
              onPress={() => handleChildClick(child)}
            >
              <View style={styles.childCardLeft}>
                {/* Child Avatar Icon */}
                <View style={[styles.childAvatarCircle, { backgroundColor: child.avatarBg }]}>
                  <Text style={styles.childEmoji}>{child.emoji}</Text>
                </View>

                {/* Info Text */}
                <View style={styles.childDetails}>
                  <Text style={styles.childNepaliName}>{child.nameNepali}</Text>
                  <Text style={styles.childMetaText}>
                    {child.nameEnglish} • {child.age} years
                  </Text>

                  {/* Status Indicator */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{child.status}</Text>
                  </View>

                  <Text style={styles.updatedText}>{child.updatedTime}</Text>
                </View>
              </View>

              {/* Chevron Right */}
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#566851" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M9 18l6-6-6-6" />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>

        {/* Caregiver Connection Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.caregiverCard}
          onPress={handleCaregiverPress}
        >
          <View>
            <Text style={styles.caregiverLabel}>Caregiver connection</Text>
            <Text style={styles.caregiverName}>Maya Sharma</Text>
            <Text style={styles.caregiverId}>Caregiver ID • CG2048</Text>
          </View>

          <View style={styles.caregiverStatusDot} />
        </TouchableOpacity>

        {/* + Add Child Profile Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addButton}
          onPress={handleAddChild}
        >
          <Text style={styles.addButtonText}>+ Add Child Profile</Text>
        </TouchableOpacity>

        {/* Return Button to Homepage */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/Homepage');
          }}
          style={styles.bottomReturnBtn}
          accessibilityLabel="गृहपृष्ठमा फर्कनुहोस् (Return to Homepage)"
        >
          <Text style={styles.bottomReturnIcon}>🏠</Text>
          <Text style={styles.bottomReturnText}>गृहपृष्ठमा फर्कनुहोस् (Return to Homepage)</Text>
        </TouchableOpacity>

        {/* Disclaimer Note */}
        <Text style={styles.disclaimerText}>
          Children do not need their own phone.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentsPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE2D4',
    backgroundColor: '#F4EFE6',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitleNepali: {
    fontSize: 17,
    fontWeight: '800',
    color: '#322216',
  },
  headerSubtitleEnglish: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#7A6B5F',
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7E7DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCE1D4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  parentCardLeft: {
    gap: 2,
  },
  parentCardLabel: {
    fontSize: 11,
    color: '#7B5E4F',
    fontWeight: '500',
  },
  parentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C221A',
  },
  parentId: {
    fontSize: 12,
    color: '#7D6456',
    fontWeight: '500',
  },
  checkWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C221A',
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  childCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  childAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childEmoji: {
    fontSize: 22,
  },
  childDetails: {
    flex: 1,
    gap: 1.5,
  },
  childNepaliName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#263622',
  },
  childMetaText: {
    fontSize: 12,
    color: '#4F674A',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263622',
  },
  updatedText: {
    fontSize: 11,
    color: '#658060',
    marginTop: 1,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBE4D7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  caregiverLabel: {
    fontSize: 11.5,
    color: '#6E6257',
    fontWeight: '500',
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C221A',
    marginTop: 1,
  },
  caregiverId: {
    fontSize: 11.5,
    color: '#7D7166',
    fontWeight: '500',
    marginTop: 1,
  },
  caregiverStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4B7347',
  },
  addButton: {
    backgroundColor: '#BD622D',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#BD622D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#7C7065',
    marginTop: 2,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE0CE',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 6,
  },
  bottomReturnIcon: {
    fontSize: 16,
  },
  bottomReturnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4C3524',
  },
});

