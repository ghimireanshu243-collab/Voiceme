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
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

export interface CaregiverScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export const CaregiverScreen: React.FC<CaregiverScreenProps> = ({
  navigation,
  onBack,
}) => {
  // Caregiver notification & alert preferences
  const [instantSosCall, setInstantSosCall] = useState(true);
  const [geofenceBreachAlert, setGeofenceBreachAlert] = useState(true);
  const [lowBatteryBuzzer, setLowBatteryBuzzer] = useState(true);
  const [routineReminder, setRoutineReminder] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/Homepage');
    }
  };

  const handleCallEmergency = (label: string, number: string) => {
    Alert.alert(`Call ${label}`, `Initiating emergency call to ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => console.log(`Calling ${number}`) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4EFE6"
        translucent={Platform.OS === 'android'}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Return"
          accessibilityRole="button"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
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
          <Text style={styles.headerTitleHindi}>स्याहारकर्ता प्रोफाइल</Text>
          <Text style={styles.headerTitleEnglish}>Caregiver Dashboard</Text>
        </View>

        <View style={styles.headerRightBadge}>
          <View style={styles.verifiedDot} />
          <Text style={styles.verifiedText}>Active</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Caregiver Hero Profile Card */}
        <View style={styles.caregiverCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <Text style={styles.caregiverNameHindi}>सुनिता शर्मा</Text>
          <Text style={styles.caregiverNameEnglish}>Sunita Sharma · Primary Caregiver</Text>
          <Text style={styles.caregiverRelation}>Mother of Aarav K. (७ वर्ष)</Text>

          <View style={styles.metaBadgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>मुख्य स्याहारकर्ता · Primary</Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: CG-84920</Text>
            </View>
          </View>
        </View>

        {/* Assigned Child Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>जिम्मेवार बालबालिका · Assigned Child</Text>
            <TouchableOpacity
              onPress={() => router.push('/Childpage')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewLink}>View profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.childRow}>
            <View style={styles.childIconBox}>
              <Text style={styles.childIconText}>👦</Text>
            </View>
            <View style={styles.childDetails}>
              <Text style={styles.childName}>आरव के. सी. · Aarav K.</Text>
              <Text style={styles.childLocation}>वर्तमान स्थान: घरमा (Ward 4)</Text>
            </View>
            <View style={styles.liveTag}>
              <View style={styles.livePulse} />
              <Text style={styles.liveTagText}>Live</Text>
            </View>
          </View>
        </View>

        {/* Smart Band Hardware Diagnostics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>स्मार्ट ब्याण्ड स्थिति · GPS Band Health</Text>

          <View style={styles.diagGrid}>
            <View style={styles.diagBox}>
              <Text style={styles.diagLabel}>Battery Level</Text>
              <Text style={[styles.diagValue, { color: '#275225' }]}>86%</Text>
              <Text style={styles.diagSub}>Normal health</Text>
            </View>
            <View style={styles.diagBox}>
              <Text style={styles.diagLabel}>GPS Signal</Text>
              <Text style={[styles.diagValue, { color: '#275225' }]}>Strong</Text>
              <Text style={styles.diagSub}>±3m accuracy</Text>
            </View>
          </View>

          <View style={styles.statusList}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Sim Connection</Text>
              <Text style={styles.statusValue}>Ncell 4G · Connected</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Safe Zone</Text>
              <Text style={styles.statusValue}>Inside Home Zone (200m)</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Synced</Text>
              <Text style={styles.statusValue}>12 seconds ago</Text>
            </View>
          </View>
        </View>

        {/* Caregiver Alert Settings / Toggles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>अलर्ट सेटिङहरू · Emergency Alerts</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>तुरुन्त कल · Instant SOS Call</Text>
              <Text style={styles.toggleSubtitle}>Band SOS triggers instant voice call</Text>
            </View>
            <Switch
              value={instantSosCall}
              onValueChange={setInstantSosCall}
              trackColor={{ false: '#D9D0C3', true: '#B7DCB2' }}
              thumbColor={instantSosCall ? '#2E5A2A' : '#F4EFE6'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>सिमाना अलर्ट · Safe Zone Breach</Text>
              <Text style={styles.toggleSubtitle}>Notify when child leaves 200m perimeter</Text>
            </View>
            <Switch
              value={geofenceBreachAlert}
              onValueChange={setGeofenceBreachAlert}
              trackColor={{ false: '#D9D0C3', true: '#B7DCB2' }}
              thumbColor={geofenceBreachAlert ? '#2E5A2A' : '#F4EFE6'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>ब्याट्री चेतावनी · Low Battery (&lt;20%)</Text>
              <Text style={styles.toggleSubtitle}>Warn before band discharges</Text>
            </View>
            <Switch
              value={lowBatteryBuzzer}
              onValueChange={setLowBatteryBuzzer}
              trackColor={{ false: '#D9D0C3', true: '#B7DCB2' }}
              thumbColor={lowBatteryBuzzer ? '#2E5A2A' : '#F4EFE6'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>दिनचर्या रिमाइन्डर · Routine Chime</Text>
              <Text style={styles.toggleSubtitle}>Send mindfulness bell reminder</Text>
            </View>
            <Switch
              value={routineReminder}
              onValueChange={setRoutineReminder}
              trackColor={{ false: '#D9D0C3', true: '#B7DCB2' }}
              thumbColor={routineReminder ? '#2E5A2A' : '#F4EFE6'}
            />
          </View>
        </View>

        {/* Emergency Dispatch Contacts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>आपतकालीन सम्पर्कहरू · Quick Contacts</Text>

          <TouchableOpacity
            style={styles.contactItem}
            activeOpacity={0.7}
            onPress={() => handleCallEmergency('Ambulance', '102')}
          >
            <View style={styles.contactLeft}>
              <View style={[styles.contactDot, { backgroundColor: '#E24C4C' }]} />
              <View>
                <Text style={styles.contactLabel}>एम्बुलेन्स सेवा · Nepal Red Cross</Text>
                <Text style={styles.contactSub}>Toll Free: 102</Text>
              </View>
            </View>
            <View style={styles.callPill}>
              <Text style={styles.callPillText}>102</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            activeOpacity={0.7}
            onPress={() => handleCallEmergency('Nepal Police', '100')}
          >
            <View style={styles.contactLeft}>
              <View style={[styles.contactDot, { backgroundColor: '#32598D' }]} />
              <View>
                <Text style={styles.contactLabel}>नेपाल प्रहरी · Nepal Police</Text>
                <Text style={styles.contactSub}>Emergency: 100</Text>
              </View>
            </View>
            <View style={styles.callPill}>
              <Text style={styles.callPillText}>100</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            activeOpacity={0.7}
            onPress={() => handleCallEmergency('Childline Nepal', '1098')}
          >
            <View style={styles.contactLeft}>
              <View style={[styles.contactDot, { backgroundColor: '#4C7D44' }]} />
              <View>
                <Text style={styles.contactLabel}>बाल हेल्पलाइन · Childline Nepal</Text>
                <Text style={styles.contactSub}>National Helpline: 1098</Text>
              </View>
            </View>
            <View style={styles.callPill}>
              <Text style={styles.callPillText}>1098</Text>
            </View>
          </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default CaregiverScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE2D4',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAE1D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitleHindi: {
    fontSize: 17,
    fontWeight: '800',
    color: '#322216',
  },
  headerTitleEnglish: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#7A6B5F',
  },
  headerRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D9ECD4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#358231',
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#245620',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
  caregiverCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D4',
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D7E8D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#275225',
  },
  caregiverNameHindi: {
    fontSize: 21,
    fontWeight: '800',
    color: '#281E15',
  },
  caregiverNameEnglish: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6F6052',
    marginTop: 2,
  },
  caregiverRelation: {
    fontSize: 12,
    color: '#8A7B6E',
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: '#E2EEDF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A5826',
  },
  idBadge: {
    backgroundColor: '#ECE3D4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#655546',
  },
  card: {
    backgroundColor: '#FAF5EE',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D4',
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D1F15',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#366933',
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDE2',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  childIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4DAC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childIconText: {
    fontSize: 22,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#2D1F15',
  },
  childLocation: {
    fontSize: 11.5,
    color: '#67584A',
    marginTop: 2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D9ECD4',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  livePulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#358231',
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#275823',
  },
  diagGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  diagBox: {
    flex: 1,
    backgroundColor: '#F3EDE2',
    borderRadius: 16,
    padding: 12,
  },
  diagLabel: {
    fontSize: 11,
    color: '#78685A',
    fontWeight: '600',
  },
  diagValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  diagSub: {
    fontSize: 10.5,
    color: '#8A7B6E',
    marginTop: 1,
  },
  statusList: {
    gap: 8,
    paddingTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE5D6',
  },
  statusLabel: {
    fontSize: 12.5,
    color: '#766759',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2E2016',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DA',
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2F2016',
  },
  toggleSubtitle: {
    fontSize: 11,
    color: '#7C6C5E',
    marginTop: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EDE2',
    padding: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  contactDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#281E15',
  },
  contactSub: {
    fontSize: 11,
    color: '#736355',
    marginTop: 1,
  },
  callPill: {
    backgroundColor: '#274E28',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  callPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
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
    marginTop: 10,
    marginBottom: 10,
    columnGap: 8,
  },
  bottomReturnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#342419',
  },
});
