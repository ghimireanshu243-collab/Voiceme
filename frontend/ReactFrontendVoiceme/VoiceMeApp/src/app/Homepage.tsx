import React, { useEffect, useState } from 'react';
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
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 14) / 2; // 2 columns with 20px padding and 14px gap
const REGISTERED_NAME_KEY = 'voiceme.registeredName';
const REGISTERED_AGE_KEY = 'voiceme.registeredAge';

interface HomeDashboardProps {
    onNavigateToFlashcards?: () => void;
    onNavigateToGPS?: () => void;
    onNavigateToRoutine?: () => void;
}

export default function HomeDashboard({
    onNavigateToFlashcards,
    onNavigateToGPS,
    onNavigateToRoutine,
}: HomeDashboardProps) {
    const [bellActive, setBellActive] = useState(false);
    const [registeredName, setRegisteredName] = useState('User');
    const [registeredAge, setRegisteredAge] = useState('');

    useEffect(() => {
        AsyncStorage.multiGet([REGISTERED_NAME_KEY, REGISTERED_AGE_KEY])
            .then((entries) => {
                const name = entries[0][1];
                const age = entries[1][1];
                if (name?.trim()) setRegisteredName(name.trim());
                if (age?.trim()) setRegisteredAge(age.trim());
            })
            .catch(() => { });
    }, []);

    // Trigger attention chime & haptics when bell is pressed
    const handleRingAttentionBell = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch { }

        setBellActive(true);

        try {
            Speech.stop();
            Speech.speak('ध्यान दिनुहोस्', {
                language: 'ne-NP',
                pitch: 1.1,
                rate: 0.9,
                onDone: () => setBellActive(false),
                onError: () => setBellActive(false),
            });
        } catch {
            setTimeout(() => setBellActive(false), 1200);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F4EFE6"
                translucent={Platform.OS === 'android'}
            />

            <View style={styles.container}>
                {/* 1. Header Profile */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        {/* Child Avatar Disc */}
                        <View style={styles.avatarDisc}>
                            <Text style={styles.avatarEmoji}>👦</Text>
                        </View>

                        {/* Name & Age Info */}
                        <View style={styles.nameBlock}>
                            <Text style={styles.greetingTitle}>नमस्ते, {registeredName}</Text>
                            <Text style={styles.greetingSubtitle}>
                                {registeredName} · {registeredAge || 'Age not set'}
                            </Text>
                        </View>
                    </View>

                    {/* Top-Right Peach Clover Emblem Button */}
                    <Pressable
                        style={({ pressed }) => [styles.actionCircle, pressed && styles.pressedState]}
                        onPress={() => Haptics.selectionAsync()}
                    >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M12 2a3.5 3.5 0 0 0-3.5 3.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5A3.5 3.5 0 0 0 12 2Z"
                                fill="#9C532B"
                            />
                            <Path
                                d="M6.5 7.5A3.5 3.5 0 0 0 3 11c0 1.93 1.57 3.5 3.5 3.5S10 12.93 10 11a3.5 3.5 0 0 0-3.5-3.5Z"
                                fill="#9C532B"
                            />
                            <Path
                                d="M17.5 7.5A3.5 3.5 0 0 0 14 11c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-3.5-3.5Z"
                                fill="#9C532B"
                            />
                            <Path
                                d="M12 13a3.5 3.5 0 0 0-3.5 3.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5A3.5 3.5 0 0 0 12 13Z"
                                fill="#9C532B"
                            />
                        </Svg>
                    </Pressable>
                </View>

                {/* 2. Live Location Status Banner (घरमा · At home) */}
                <View style={styles.locationBanner}>
                    <View style={styles.locationLeft}>
                        {/* GPS Target / Crosshair Icon */}
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                            <Circle cx={12} cy={12} r={6.5} stroke="#3F5B39" strokeWidth={2.2} />
                            <Line x1={12} y1={2} x2={12} y2={5} stroke="#3F5B39" strokeWidth={2.2} strokeLinecap="round" />
                            <Line x1={12} y1={19} x2={12} y2={22} stroke="#3F5B39" strokeWidth={2.2} strokeLinecap="round" />
                            <Line x1={2} y1={12} x2={5} y2={12} stroke="#3F5B39" strokeWidth={2.2} strokeLinecap="round" />
                            <Line x1={19} y1={12} x2={22} y2={12} stroke="#3F5B39" strokeWidth={2.2} strokeLinecap="round" />
                        </Svg>

                        <View style={styles.locationTextBlock}>
                            <Text style={styles.locationMainText}>घरमा · At home</Text>
                            <Text style={styles.locationSubText}>live location · updated now</Text>
                        </View>
                    </View>

                    {/* Active status indicator dot */}
                    <View style={styles.statusDot} />
                </View>

                {/* 3. 2x2 Feature Cards Grid */}
                <View style={styles.grid}>
                    {/* Card 1: फ्लैशकार्ड (Flashcards) */}
                    <Pressable
                            onPress={onNavigateToFlashcards ?? (() => router.push('/Flashcardpage'))}
                            style={({ pressed }) => [
                                styles.card,
                                { backgroundColor: '#FCE6D9' },
                                pressed && styles.cardPressed,
                            ]}
                        >
                            <View style={styles.cardIconBox}>
                                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                                    <Rect x={3} y={3} width={18} height={18} rx={4} stroke="#8A4A28" strokeWidth={2.2} />
                                    <Rect x={8} y={8} width={8} height={8} rx={1.5} stroke="#8A4A28" strokeWidth={2} />
                                </Svg>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>फ्लैशकार्ड</Text>
                                <Text style={styles.cardSubtitle}>Flashcards</Text>
                                <Text style={styles.cardMeta}>48 cards · offline</Text>
                            </View>
                    </Pressable>

                    {/* Card 2: जीपीएस ब्याण्ड (GPS band) */}
                    <Pressable
                        onPress={onNavigateToGPS}
                        style={({ pressed }) => [
                            styles.card,
                            { backgroundColor: '#D8E9CA' },
                            pressed && styles.cardPressed,
                        ]}
                    >
                        <View style={styles.cardIconBox}>
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 2a3.5 3.5 0 0 0-3.5 3.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5A3.5 3.5 0 0 0 12 2Z"
                                    fill="#3E5C37"
                                />
                                <Path
                                    d="M6.5 7.5A3.5 3.5 0 0 0 3 11c0 1.93 1.57 3.5 3.5 3.5S10 12.93 10 11a3.5 3.5 0 0 0-3.5-3.5Z"
                                    fill="#3E5C37"
                                />
                                <Path
                                    d="M17.5 7.5A3.5 3.5 0 0 0 14 11c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-3.5-3.5Z"
                                    fill="#3E5C37"
                                />
                                <Path
                                    d="M12 13a3.5 3.5 0 0 0-3.5 3.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5A3.5 3.5 0 0 0 12 13Z"
                                    fill="#3E5C37"
                                />
                            </Svg>
                        </View>

                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>जीपीएस ब्याण्ड</Text>
                            <Text style={styles.cardSubtitle}>GPS band</Text>
                            <Text style={styles.cardMeta}>connected · 86%</Text>
                        </View>
                    </Pressable>

                    {/* Card 3: ध्यान घण्टी (Attention bell) */}
                    <Pressable
                            onPress={() => {
                                handleRingAttentionBell();
                                router.push('/Attentionbellpage');
                            }}
                            style={({ pressed }) => [
                                styles.card,
                                { backgroundColor: '#F8EBE3' },
                                bellActive && styles.bellCardActive,
                                pressed && styles.cardPressed,
                            ]}
                        >
                            {/* Bell graphic in circular badge */}
                            <View style={styles.bellBadge}>
                                <Svg width={30} height={30} viewBox="0 0 100 100" fill="none">
                                    <Circle cx={50} cy={24} r={9} stroke="#8C461F" strokeWidth={6} />
                                    <Path
                                        d="M26 62 C26 36, 74 36, 74 62 L82 72 L18 72 Z"
                                        fill="#FFFDF8"
                                        stroke="#8C461F"
                                        strokeWidth={6}
                                        strokeLinejoin="round"
                                    />
                                    <Circle cx={50} cy={80} r={7} fill="#8C461F" />
                                </Svg>
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.bellTitleRow}>
                                    <Text style={styles.cardTitle}>ध्यान घण्टी</Text>
                                    {/* Speaker icon */}
                                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                        <Path
                                            d="M11 5L6 9H2V15H6L11 19V5Z"
                                            stroke="#8A786C"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <Path
                                            d="M15.54 8.46C16.48 9.4 17 10.68 17 12"
                                            stroke="#8A786C"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                        />
                                    </Svg>
                                </View>
                                <Text style={styles.cardSubtitle}>Attention bell</Text>
                                <Text style={styles.cardMeta}>
                                    {bellActive ? 'chiming...' : 'tap to chime'}
                                </Text>
                            </View>
                        </Pressable>

                    {/* Card 4: दिनचर्या (Daily routine) */}
                    <Pressable
                            onPress={onNavigateToRoutine ?? (() => router.push('/Dailyroutinepage'))}
                            style={({ pressed }) => [
                                styles.card,
                                { backgroundColor: '#E7E3D8' },
                                pressed && styles.cardPressed,
                            ]}
                        >
                            <View style={styles.cardIconBox}>
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Polyline
                                        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                                        stroke="#574B40"
                                        strokeWidth={2.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </Svg>
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>दिनचर्या</Text>
                                <Text style={styles.cardSubtitle}>Daily routine</Text>
                                <Text style={styles.cardMeta}>3 of 7 done</Text>
                            </View>
                        </Pressable>

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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarDisc: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#C6DBC3',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#B3CDB0',
    },
    avatarEmoji: {
        fontSize: 24,
    },
    nameBlock: {
        marginLeft: 12,
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#342419',
        letterSpacing: -0.4,
    },
    greetingSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#76675B',
        marginTop: 1,
    },
    actionCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FCE5D7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressedState: {
        opacity: 0.8,
        transform: [{ scale: 0.96 }],
    },
    locationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#D6E7CA',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 8,
        marginBottom: 16,
    },
    locationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationTextBlock: {
        marginLeft: 12,
    },
    locationMainText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2F472A',
    },
    locationSubText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#55714F',
        marginTop: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3F6838',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 14,
    },
    card: {
        width: CARD_WIDTH,
        height: 178,
        borderRadius: 26,
        padding: 16,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 5,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    cardPressed: {
        transform: [{ scale: 0.97 }],
    },
    cardIconBox: {
        alignItems: 'flex-start',
    },
    bellBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFE3DA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellCardActive: {
        borderWidth: 2,
        borderColor: '#B85827',
    },
    bellTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        marginTop: 'auto',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#342419',
        letterSpacing: -0.3,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#664F40',
        marginTop: 2,
    },
    cardMeta: {
        fontSize: 11.5,
        fontWeight: '500',
        color: '#8A786C',
        marginTop: 2,
    },
});