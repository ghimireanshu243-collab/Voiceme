import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    StatusBar,
    Pressable,
    Platform,
    Dimensions,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';

const API_BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.1.77:8000'
    : 'http://192.168.1.77:8000';

interface AttentionBellScreenProps {
    onBack?: () => void;
}

export default function AttentionBellScreen({ onBack }: AttentionBellScreenProps) {
    const [isRinging, setIsRinging] = useState(true);
    // Both the chime and the spoken prompt are generated and served by the
    // backend (see backend/attentionbell) instead of an externally hosted
    // sound file and on-device text-to-speech.
    const bellSound = useAudioPlayer(`${API_BASE_URL}/api/bell/ring/`);
    const voicePrompt = useAudioPlayer(`${API_BASE_URL}/api/tts/bell/ne/`);

    // Play the backend bell chime + Nepali attention prompt, with a haptic loop, while ringing
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isRinging) {
            const ring = () => {
                bellSound.seekTo(0).then(() => bellSound.play()).catch(() => { });
                voicePrompt.seekTo(0).then(() => voicePrompt.play()).catch(() => { });

                try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                } catch { }
            };

            ring();
            interval = setInterval(ring, 2200);
        } else {
            bellSound.pause();
            voicePrompt.pause();

            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch { }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRinging]);

    const handleToggleBell = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch { }
        setIsRinging(!isRinging);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F4EFE6"
                translucent={Platform.OS === 'android'}
            />

            <View style={styles.container}>
                {/* 1. Top Header Navigation */}
                <View style={styles.header}>
                    <Pressable
                        style={({ pressed }) => [styles.backButton, pressed && styles.pressedState]}
                        onPress={onBack ?? (() => router.back())}
                    >
                        {/* Left chevron arrow */}
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M15 18L9 12L15 6"
                                stroke="#342419"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </Pressable>

                    <View style={styles.headerTitleBlock}>
                        <Text style={styles.headerTitle}>ध्यान घण्टी</Text>
                        <Text style={styles.headerSubtitle}>Attention bell</Text>
                    </View>
                </View>

                {/* 2. Top Card: Bell Graphic & Ringing Status */}
                <View style={styles.bellCard}>
                    {/* Subtle top capsule */}
                    <View style={styles.topCapsule} />

                    {/* Sound Radiation Dashes & Center Disc */}
                    <View style={styles.bellDiscWrapper}>
                        {/* Radiation Dashes */}
                        <View style={[styles.dash, styles.dashTopLeft, !isRinging && styles.dashDim]} />
                        <View style={[styles.dash, styles.dashBottomLeft, !isRinging && styles.dashDim]} />
                        <View style={[styles.dash, styles.dashTopRight, !isRinging && styles.dashDim]} />
                        <View style={[styles.dash, styles.dashBottomRight, !isRinging && styles.dashDim]} />

                        {/* Circular Cream Disc */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.bellDisc,
                                pressed && styles.pressedState,
                            ]}
                            onPress={handleToggleBell}
                        >
                            <Svg width={76} height={76} viewBox="0 0 100 100" fill="none">
                                {/* Top loop */}
                                <Circle cx={50} cy={18} r={5} fill="#BA6433" />
                                {/* Bell body */}
                                <Path
                                    d="M50 24 C36 24 30 38 30 52 C30 64 24 72 24 74 C24 76 26 78 30 78 L70 78 C74 78 76 76 76 74 C76 72 70 64 70 52 C70 38 64 24 50 24 Z"
                                    fill="#BA6433"
                                />
                                {/* Flared lip */}
                                <Rect x={22} y={74} width={56} height={5} rx={2.5} fill="#A75527" />
                                {/* Clapper */}
                                <Circle cx={50} cy={85} r={7} fill="#8E431B" />
                            </Svg>
                        </Pressable>
                    </View>

                    {/* Status Label */}
                    <View style={styles.statusLabelBox}>
                        <Text style={styles.statusMainText}>
                            {isRinging ? 'घण्टी बज्दैछ' : 'घण्टी बन्द छ'}
                        </Text>
                        <Text style={styles.statusSubText}>
                            {isRinging ? 'Bell is ringing' : 'Bell is stopped'}
                        </Text>
                    </View>
                </View>

                {/* 3. Audio Visualizer Card (Ringing sound) */}
                <Pressable
                    style={({ pressed }) => [styles.soundCard, pressed && styles.pressedState]}
                    onPress={handleToggleBell}
                >
                    <View style={styles.soundCardHeader}>
                        <View style={styles.speakerCircle}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M11 5L6 9H2V15H6L11 19V5Z"
                                    stroke="#2F472A"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="#2F472A"
                                />
                                <Path
                                    d="M15.54 8.46C16.48 9.4 17 10.68 17 12C17 13.32 16.48 14.6 15.54 15.54"
                                    stroke="#2F472A"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                />
                            </Svg>
                        </View>

                        <View style={styles.soundTextContainer}>
                            <Text style={styles.soundTitle}>Ringing sound</Text>
                            <Text style={styles.soundSubtitle}>
                                {isRinging ? 'Tap again to stop' : 'Tap to start ringing'}
                            </Text>
                        </View>
                    </View>

                    {/* Sound wave visualizer bars */}
                    <View style={styles.waveContainer}>
                        {[14, 22, 32, 18, 36, 28, 38, 16, 32, 24, 36, 20, 14].map((height, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.waveBar,
                                    { height: isRinging ? height : 7 },
                                    !isRinging && styles.waveBarDim,
                                ]}
                            />
                        ))}
                    </View>
                </Pressable>

                {/* 4. Action Button (Stop bell) */}
                <View style={styles.actionSection}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            !isRinging && styles.actionButtonStart,
                            pressed && styles.pressedState,
                        ]}
                        onPress={handleToggleBell}
                    >
                        {isRinging ? (
                            <>
                                {/* Stop icon (Square) */}
                                <View style={styles.stopIcon} />
                                <Text style={styles.actionButtonText}>घण्टी बन्द गर्नु · Stop bell</Text>
                            </>
                        ) : (
                            <>
                                {/* Play triangle */}
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFFFFF">
                                    <Path d="M5 3L19 12L5 21V3Z" />
                                </Svg>
                                <Text style={styles.actionButtonText}>घण्टी बजाउनु · Ring bell</Text>
                            </>
                        )}
                    </Pressable>

                    {/* Bottom helper note */}
                    <Text style={styles.footerNote}>
                        The bell can help get attention quickly.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4EFE6', // Warm oatmeal background
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EAE2D5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleBlock: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#342419',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12.5,
        fontWeight: '500',
        color: '#76675B',
        marginTop: 1,
    },
    bellCard: {
        backgroundColor: '#FCE6DA',
        borderRadius: 28,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 280,
        borderWidth: 1,
        borderColor: '#F2D2BF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    topCapsule: {
        width: '84%',
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(244, 214, 196, 0.55)',
    },
    bellDiscWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 14,
    },
    dash: {
        position: 'absolute',
        height: 3.5,
        backgroundColor: '#96522B',
        borderRadius: 2,
    },
    dashTopLeft: {
        left: -28,
        top: 24,
        width: 14,
    },
    dashBottomLeft: {
        left: -32,
        bottom: 30,
        width: 16,
    },
    dashTopRight: {
        right: -28,
        top: 24,
        width: 14,
    },
    dashBottomRight: {
        right: -32,
        bottom: 30,
        width: 16,
    },
    dashDim: {
        opacity: 0.3,
    },
    bellDisc: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FFF7EE',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statusLabelBox: {
        alignItems: 'center',
        marginTop: 6,
    },
    statusMainText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#342419',
        letterSpacing: -0.3,
    },
    statusSubText: {
        fontSize: 13.5,
        fontWeight: '600',
        color: '#664F40',
        marginTop: 2,
    },
    soundCard: {
        backgroundColor: '#D8E9CA',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: '#C6DCB4',
        marginVertical: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    soundCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    speakerCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#CADFBA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    soundTextContainer: {
        marginLeft: 10,
    },
    soundTitle: {
        fontSize: 14.5,
        fontWeight: '700',
        color: '#2F472A',
    },
    soundSubtitle: {
        fontSize: 11.5,
        fontWeight: '500',
        color: '#55714F',
        marginTop: 1,
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 5,
        height: 38,
    },
    waveBar: {
        width: 4,
        borderRadius: 2,
        backgroundColor: '#3F5B39',
    },
    waveBarDim: {
        opacity: 0.4,
    },
    actionSection: {
        width: '100%',
        rowGap: 10,
    },
    actionButton: {
        backgroundColor: '#BA6433',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#BA6433',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    actionButtonStart: {
        backgroundColor: '#3F5B39',
    },
    stopIcon: {
        width: 13,
        height: 13,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#8A786C',
    },
    pressedState: {
        opacity: 0.88,
        transform: [{ scale: 0.98 }],
    },
});