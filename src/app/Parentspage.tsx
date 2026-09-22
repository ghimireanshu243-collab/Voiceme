import React, { useState } from 'react';
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
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export interface ParentProfileScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export const ParentProfileScreen: React.FC<ParentProfileScreenProps> = ({
  navigation,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'log' | 'settings'>('home');

  const handleSosHistory = () => {
    Alert.alert('SOS Alerts History', 'No active emergency. Last alert was 2 days ago (Safe zone reached).');
  };

  const handleOpenMap = () => {
    Alert.alert('GPS Live Location', 'Aarav is at Home (Ward 4). Coordinates: 27.7172° N, 85.3240° E. Band battery: 86%.');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4EFE6"
        translucent={Platform.OS === 'android'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeftGroup}>
            {/* Return / Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Return"
              accessibilityRole="button"
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
            </TouchableOpacity>

            {/* P Avatar Circle */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>P</Text>
            </View>

            <View style={styles.headerTitles}>
              <Text style={styles.greetingTitle}>अभिभावक ड्यासबोर्ड</Text>
              <Text style={styles.greetingSubtitle}>Parent Dashboard · नियन्त्रण</Text>
            </View>
          </View>

          {/* Bell Icon with Red Notification Dot */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.bellButton}
            onPress={() => Alert.alert('Notifications', '1 new alert: Daily routine completed at 8:05 AM')}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="#78462B">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
            <View style={styles.redBadgeDot} />
          </TouchableOpacity>
        </View>

        {/* Child Connected Pill Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.childBanner}
          onPress={() => router.push('/Childpage')}
        >
          <View style={styles.childBannerLeft}>
            <View style={styles.childIconWrapper}>
              <Text style={styles.childEmoji}>👦</Text>
            </View>
            <View>
              <Text style={styles.childNameTitle}>आरव · Aarav K.</Text>
              <Text style={styles.childMetaText}>Connected · 7 years</Text>
            </View>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.greenLiveDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </TouchableOpacity>

        {/* SOS Alert Card */}
        <View style={styles.sosCard}>
          <View style={styles.sosLeftRow}>
            <View style={styles.sosCircle}>
              <Text style={styles.sosText}>SOS</Text>
            </View>
            <View>
              <Text style={styles.sosTitle}>एसओएस अलर्ट</Text>
              <Text style={styles.sosSubtitle}>SOS alerts · none active</Text>
              <Text style={styles.sosMeta}>Last alert: 2 days ago</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.historyButton}
            onPress={handleSosHistory}
          >
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* GPS Location Card (342 x 222 card) */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsHeader}>
            <View>
              <Text style={styles.gpsTitle}>जीपीएस स्थान</Text>
              <Text style={styles.gpsSubtitle}>GPS location</Text>
            </View>
            <View style={styles.bandBadge}>
              <Text style={styles.bandText}>Band 86%</Text>
            </View>
          </View>

          {/* Stylized Map View Canvas */}
          <View style={styles.mapCanvas}>
            <Svg width="100%" height={124} viewBox="0 0 320 124" style={StyleSheet.absoluteFill}>
              <Rect width="320" height="124" fill="#DDEFD2" rx={18} />
              <Path
                d="M -10 58 Q 120 52 200 64 T 340 58"
                stroke="#FFFFFF"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
              />
              <Path d="M 85 -10 L 85 140" stroke="#FFFFFF" strokeWidth={7} fill="none" />
              <Path d="M 235 -10 L 235 140" stroke="#FFFFFF" strokeWidth={7} fill="none" />
              <Path d="M -10 22 L 340 30" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.7} />
              <Circle cx={160} cy={58} r={34} fill="#B8D6B0" opacity={0.5} />
              <Circle cx={160} cy={58} r={22} fill="#A6CA9C" opacity={0.65} />
            </Svg>

            <View style={styles.pinWrapper}>
              <View style={styles.redPin}>
                <View style={styles.whitePinHole} />
              </View>
            </View>
          </View>

          <View style={styles.gpsBottomRow}>
            <View>
              <Text style={styles.gpsLocationStatus}>घरमा · At home</Text>
              <Text style={styles.gpsUpdatedTime}>Live · updated now</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.openMapButton}
              onPress={handleOpenMap}
            >
              <Text style={styles.openMapButtonText}>Open map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Log Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeaderRow}>
            <View style={styles.activityTitleGroup}>
              <Text style={styles.activityTitleHindi}>गतिविधि लग</Text>
              <Text style={styles.activityTitleEnglish}>Activity log</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Activity Logs', 'Showing full history...')}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Activity 1 */}
            <View style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityDotCircle, { backgroundColor: '#D9ECD4' }]}>
                  <View style={[styles.activityDotInner, { backgroundColor: '#4C7D44' }]} />
                </View>
                <View>
                  <Text style={styles.activityItemTitle}>घर आइपुग्यो</Text>
                  <Text style={styles.activityItemSubtitle}>Arrived home</Text>
                </View>
              </View>
              <Text style={styles.activityTime}>12:45 PM</Text>
            </View>

            {/* Activity 2 */}
            <View style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityDotCircle, { backgroundColor: '#FBE4D4' }]}>
                  <View style={[styles.activityDotInner, { backgroundColor: '#A25F39' }]} />
                </View>
                <View>
                  <Text style={styles.activityItemTitle}>ध्यान घण्टी थिचियो</Text>
                  <Text style={styles.activityItemSubtitle}>Attention bell tapped</Text>
                </View>
              </View>
              <Text style={styles.activityTime}>9:15 AM</Text>
            </View>

            {/* Activity 3 */}
            <View style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityDotCircle, { backgroundColor: '#FBE4D4' }]}>
                  <View style={[styles.activityDotInner, { backgroundColor: '#A25F39' }]} />
                </View>
                <View>
                  <Text style={styles.activityItemTitle}>फ्ल्यासकार्ड अभ्यास</Text>
                  <Text style={styles.activityItemSubtitle}>Flashcards · 12 cards</Text>
                </View>
              </View>
              <Text style={styles.activityTime}>8:40 AM</Text>
            </View>

            {/* Activity 4 */}
            <View style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityDotCircle, { backgroundColor: '#FBE4D4' }]}>
                  <View style={[styles.activityDotInner, { backgroundColor: '#A25F39' }]} />
                </View>
                <View>
                  <Text style={styles.activityItemTitle}>दैनिक दिनचर्या पूरा</Text>
                  <Text style={styles.activityItemSubtitle}>Routine · brushed teeth</Text>
                </View>
              </View>
              <Text style={styles.activityTime}>8:05 AM</Text>
            </View>
          </View>

          {/* Bottom Return Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.bottomReturnBtn}
            onPress={handleBack}
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
            <Text style={styles.bottomReturnBtnText}>गृहपृष्ठमा फर्कनुहोस् · Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navTab}
          onPress={() => {
            setActiveTab('home');
            handleBack();
          }}
        >
          <View style={[styles.tabPill, activeTab === 'home' && styles.tabPillActive]}>
            <View style={[styles.tabDot, { backgroundColor: activeTab === 'home' ? '#2E5A2A' : '#9E9184' }]} />
          </View>
          <Text style={[styles.tabLabelHindi, activeTab === 'home' && styles.tabLabelActive]}>
            गृह
          </Text>
          <Text style={[styles.tabLabelEnglish, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navTab}
          onPress={() => {
            setActiveTab('map');
            handleOpenMap();
          }}
        >
          <View style={[styles.tabPill, activeTab === 'map' && styles.tabPillActive]}>
            <View style={[styles.tabDot, { backgroundColor: activeTab === 'map' ? '#2E5A2A' : '#9E9184' }]} />
          </View>
          <Text style={[styles.tabLabelHindi, activeTab === 'map' && styles.tabLabelActive]}>नक्सा</Text>
          <Text style={[styles.tabLabelEnglish, activeTab === 'map' && styles.tabLabelActive]}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navTab}
          onPress={() => {
            setActiveTab('log');
            Alert.alert('गतिविधि लग (Activity Logs)', 'आरवको आजको पूर्ण गतिविधि इतिहास:\n• 12:45 PM - घर आइपुग्यो\n• 09:15 AM - ध्यान घण्टी थिचियो\n• 08:40 AM - फ्ल्यासकार्ड अभ्यास (१२ कार्ड)\n• 08:05 AM - दिनचर्या पूरा');
          }}
        >
          <View style={[styles.tabPill, activeTab === 'log' && styles.tabPillActive]}>
            <View style={[styles.tabDot, { backgroundColor: activeTab === 'log' ? '#2E5A2A' : '#9E9184' }]} />
          </View>
          <Text style={[styles.tabLabelHindi, activeTab === 'log' && styles.tabLabelActive]}>लग</Text>
          <Text style={[styles.tabLabelEnglish, activeTab === 'log' && styles.tabLabelActive]}>Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.navTab}
          onPress={() => {
            setActiveTab('settings');
            Alert.alert('अभिभावक सेटिङ (Parent Settings)', 'तपाईं के सम्पादन गर्न चाहनुहुन्छ?', [
              { text: 'बच्चाको आवाज प्रोफाइल (Child AAC Page)', onPress: () => router.push('/Childpage') },
              { text: 'हेरचाहकर्ता ड्यासबोर्ड (Caregiver)', onPress: () => router.push('/Caregiverpage') },
              { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
            ]);
          }}
        >
          <View style={[styles.tabPill, activeTab === 'settings' && styles.tabPillActive]}>
            <View style={[styles.tabDot, { backgroundColor: activeTab === 'settings' ? '#2E5A2A' : '#9E9184' }]} />
          </View>
          <Text style={[styles.tabLabelHindi, activeTab === 'settings' && styles.tabLabelActive]}>सेटिङ</Text>
          <Text style={[styles.tabLabelEnglish, activeTab === 'settings' && styles.tabLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ParentProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginTop: 14,
    columnGap: 8,
  },
  bottomReturnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#342419',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D7E8D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#285325',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#281E15',
    letterSpacing: -0.2,
  },
  greetingSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#76675B',
    marginTop: 1,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F6E6D8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C52828',
    borderWidth: 2,
    borderColor: '#F6E6D8',
  },
  childBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEBD7',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  childBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE1D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childEmoji: {
    fontSize: 18,
  },
  childNameTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#22381F',
  },
  childMetaText: {
    fontSize: 11.5,
    color: '#557251',
    fontWeight: '500',
    marginTop: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  greenLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#358231',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#265C23',
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDE7DC',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F6D4C2',
  },
  sosLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sosCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C22828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#762B1A',
  },
  sosSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#894634',
    marginTop: 1,
  },
  sosMeta: {
    fontSize: 11,
    color: '#A26959',
    marginTop: 1,
  },
  historyButton: {
    backgroundColor: '#FAF5EE',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  historyButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6F3D29',
  },
  gpsCard: {
    backgroundColor: '#D3E8C8',
    borderRadius: 26,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C3DDB6',
    gap: 10,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22391F',
  },
  gpsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4C6847',
    marginTop: 1,
  },
  bandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  bandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#355231',
  },
  mapCanvas: {
    height: 124,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CADFC0',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CE2929',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  whitePinHole: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  gpsBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  gpsLocationStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B3218',
  },
  gpsUpdatedTime: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#466642',
    marginTop: 1,
  },
  openMapButton: {
    backgroundColor: '#274E28',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  openMapButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  activitySection: {
    gap: 8,
    marginTop: 4,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  activityTitleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  activityTitleHindi: {
    fontSize: 16,
    fontWeight: '800',
    color: '#322317',
  },
  activityTitleEnglish: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A6B5F',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B6636',
  },
  activityList: {
    gap: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6EE',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE2D2',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityDotCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2F2116',
  },
  activityItemSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#7A6A5C',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8C7E72',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F4EFE6',
    borderTopWidth: 1,
    borderTopColor: '#EAE0D2',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navTab: {
    alignItems: 'center',
    gap: 2,
    minWidth: 60,
  },
  tabPill: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#CEE3D0',
    width: 52,
  },
  tabDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tabLabelHindi: {
    fontSize: 11,
    fontWeight: '600',
    color: '#665749',
  },
  tabLabelEnglish: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#867667',
    marginTop: -2,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#2A5226',
  },
});
