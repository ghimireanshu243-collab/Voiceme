import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const AUTH_TOKEN_KEY = 'voiceme.authToken';
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.1.77:8000'
    : 'http://192.168.1.77:8000';

type Language = 'ne' | 'en';

interface StepCard {
    id: string;
    ne: string;
    en: string;
    icon: string;
    desc_ne: string;
    desc_en: string;
}

interface TimeContext {
    routine_title: string;
    time: string;
    items: StepCard[];
}

interface LocationContext {
    place_category: string;
    location_label: string | null;
    items: StepCard[];
}

// Lets the whole thing be demoed today, before the physical GPS band with
// its WiFi module exists — each button posts the same place_category the
// real band's coordinates will eventually resolve to server-side.
const TEST_LOCATIONS: { category: string; label: string; icon: string }[] = [
    { category: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { category: 'school', label: 'School', icon: '🏫' },
    { category: 'park', label: 'Park', icon: '🌳' },
    { category: 'hospital', label: 'Hospital', icon: '🏥' },
    { category: 'store', label: 'Store', icon: '🏪' },
    { category: 'home', label: 'Home', icon: '🏠' },
];

export default function AIFlashcardsPage() {
    const [lang, setLang] = useState<Language>('ne');
    const [timeContext, setTimeContext] = useState<TimeContext | null>(null);
    const [locationContext, setLocationContext] = useState<LocationContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const player = useAudioPlayer(null);
    const playerStatus = useAudioPlayerStatus(player);
    const isPlayingRef = useRef(false);
    const playRequestId = useRef(0);
    const lastPlaybackRef = useRef<{ requestId: number; step: StepCard; lang: Language } | null>(null);
    // Every step gets its one-time Nepali -> English intro the first time
    // it's played, so English is always actually heard rather than sitting
    // behind a toggle someone has to notice. After that, a tap just plays
    // whichever language is currently selected.
    const introPlayedRef = useRef<Set<string>>(new Set());

    const loadContext = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                setTimeContext(null);
                setLocationContext(null);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/assistant/flashcards/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTimeContext(data.time_context ?? null);
                setLocationContext(data.location_context ?? null);
            }
        } catch {
            // Offline or backend unreachable: keep showing whatever was last loaded.
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadContext();
        }, [loadContext])
    );

    const speakStep = async (step: StepCard, targetLang: Language) => {
        if (isPlayingRef.current) return;

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch { }

        const thisRequest = ++playRequestId.current;
        isPlayingRef.current = true;
        setPlayingId(step.id);

        try {
            player.pause();
            player.replace(`${API_BASE_URL}/api/assistant/flashcards/audio/${step.id}/${targetLang}/`);
            await player.seekTo(0);
            lastPlaybackRef.current = { requestId: thisRequest, step, lang: targetLang };
            player.play();
        } catch {
            isPlayingRef.current = false;
            setPlayingId(null);
        }
    };

    const handlePlayStep = (step: StepCard) => {
        speakStep(step, lang);
    };

    React.useEffect(() => {
        if (!playerStatus.didJustFinish) return;
        isPlayingRef.current = false;
        setPlayingId(null);

        const finished = lastPlaybackRef.current;
        if (
            finished &&
            finished.requestId === playRequestId.current &&
            finished.lang === 'ne' &&
            !introPlayedRef.current.has(finished.step.id)
        ) {
            introPlayedRef.current.add(finished.step.id);
            speakStep(finished.step, 'en');
        }
    }, [playerStatus.didJustFinish]);

    const handleSimulateLocation = async (category: string) => {
        try {
            Haptics.selectionAsync();
        } catch { }
        setSimulating(category);
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return;
            await fetch(`${API_BASE_URL}/api/child/gps/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ place_category: category }),
            });
            await loadContext();
        } catch {
        } finally {
            setSimulating(null);
        }
    };

    const renderSteps = (items: StepCard[]) => (
        <View style={styles.stepList}>
            {items.map((step, index) => {
                const isPlaying = playingId === step.id;
                return (
                    <Pressable
                        key={step.id}
                        accessibilityRole="button"
                        accessibilityLabel={lang === 'ne' ? step.ne : step.en}
                        style={({ pressed }) => [
                            styles.stepCard,
                            isPlaying && styles.stepCardActive,
                            pressed && styles.pressedState,
                        ]}
                        onPress={() => handlePlayStep(step)}
                    >
                        <Text style={styles.stepIndex}>{index + 1}</Text>
                        <Text style={styles.stepIcon}>{step.icon}</Text>
                        <View style={styles.stepTextBlock}>
                            <Text style={styles.stepTitle} numberOfLines={1}>
                                {lang === 'ne' ? step.ne : step.en}
                            </Text>
                            <Text style={styles.stepDesc} numberOfLines={2}>
                                {step.desc_ne}
                            </Text>
                            <Text style={styles.stepDescEn} numberOfLines={2}>
                                {step.desc_en}
                            </Text>
                        </View>
                        <View style={[styles.speakerBadge, isPlaying && styles.speakerBadgeActive]}>
                            <Text style={styles.speakerIcon}>{isPlaying ? '🔊' : '🔈'}</Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />

            <View style={styles.headerRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="Return to home" onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Home</Text>
                </Pressable>

                <View style={styles.togglePill}>
                    <Pressable
                        onPress={() => setLang('ne')}
                        style={[styles.toggleBtn, lang === 'ne' && styles.toggleBtnActive]}
                    >
                        <Text style={[styles.toggleBtnText, lang === 'ne' && styles.toggleBtnTextActive]}>ने</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setLang('en')}
                        style={[styles.toggleBtn, lang === 'en' && styles.toggleBtnActive]}
                    >
                        <Text style={[styles.toggleBtnText, lang === 'en' && styles.toggleBtnTextActive]}>EN</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.titleBlock}>
                <Text style={styles.title}>🤖 अहिलेको लागि</Text>
                <Text style={styles.subtitle}>Right now, based on time & location</Text>
            </View>

            {loading ? (
                <View style={styles.loadingBlock}>
                    <ActivityIndicator color="#8C461F" />
                </View>
            ) : (
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>⏰ अहिलेको समय (Right now)</Text>
                        {timeContext ? (
                            <>
                                <Text style={styles.sectionMeta}>{timeContext.time} · {timeContext.routine_title}</Text>
                                {renderSteps(timeContext.items)}
                            </>
                        ) : (
                            <Text style={styles.emptyHint}>
                                कुनै दिनचर्या फेला परेन। दिनचर्या पृष्ठमा थप्नुहोस्।{'\n'}
                                No routine found for now — add one on the Daily Routine page.
                            </Text>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>📍 यहाँ छौं (Here now)</Text>
                        {locationContext ? (
                            <>
                                <Text style={styles.sectionMeta}>
                                    {locationContext.location_label || locationContext.place_category}
                                </Text>
                                {renderSteps(locationContext.items)}
                            </>
                        ) : (
                            <Text style={styles.emptyHint}>
                                जीपीएस ब्याण्ड जडान भएपछि यो आफै देखिनेछ। अहिलेलाई तल परीक्षण गर्नुहोस्।{'\n'}
                                This fills in automatically once the GPS band is connected. Try a test location below for now.
                            </Text>
                        )}

                        <View style={styles.testLocationRow}>
                            {TEST_LOCATIONS.map((loc) => (
                                <Pressable
                                    key={loc.category}
                                    style={({ pressed }) => [
                                        styles.testLocationChip,
                                        locationContext?.place_category === loc.category && styles.testLocationChipActive,
                                        pressed && styles.pressedState,
                                    ]}
                                    onPress={() => handleSimulateLocation(loc.category)}
                                    disabled={simulating !== null}
                                >
                                    {simulating === loc.category ? (
                                        <ActivityIndicator color="#8C461F" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.testLocationIcon}>{loc.icon}</Text>
                                            <Text style={styles.testLocationText}>{loc.label}</Text>
                                        </>
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4EFE6' },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#E7E3D8' },
    backText: { color: '#342419', fontSize: 15, fontWeight: '700' },
    togglePill: {
        flexDirection: 'row',
        backgroundColor: '#DFD7C7',
        borderRadius: 24,
        padding: 3,
        alignItems: 'center',
    },
    toggleBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
    toggleBtnActive: { backgroundColor: '#9C532B' },
    toggleBtnText: { fontSize: 13, fontWeight: '700', color: '#6F5E52' },
    toggleBtnTextActive: { color: '#FFFFFF' },
    pressedState: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    titleBlock: { paddingHorizontal: 24, marginTop: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#342419' },
    subtitle: { marginTop: 4, fontSize: 14, color: '#76675B' },
    loadingBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { flex: 1, marginTop: 16 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 24 },
    section: {
        backgroundColor: '#FFFDF9',
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: '#342419' },
    sectionMeta: { marginTop: 4, fontSize: 13, fontWeight: '600', color: '#8C461F' },
    emptyHint: { marginTop: 10, fontSize: 13, color: '#76675B', lineHeight: 19 },
    stepList: { marginTop: 12, gap: 8 },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F5EFE6',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    stepCardActive: { backgroundColor: '#EEF4E9', borderColor: '#C6DBC3' },
    stepIndex: {
        width: 20,
        fontSize: 12,
        fontWeight: '800',
        color: '#A5937F',
        marginTop: 2,
    },
    stepIcon: { fontSize: 22, marginRight: 10 },
    stepTextBlock: { flex: 1, marginRight: 8 },
    stepTitle: { fontSize: 15, fontWeight: '800', color: '#342419' },
    stepDesc: { marginTop: 3, fontSize: 12.5, color: '#5B4E44', lineHeight: 17 },
    stepDescEn: { marginTop: 2, fontSize: 11.5, color: '#8A786C', fontStyle: 'italic', lineHeight: 16 },
    speakerBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
        marginTop: 1,
    },
    speakerBadgeActive: { backgroundColor: 'rgba(83, 110, 80, 0.2)' },
    speakerIcon: { fontSize: 14 },
    testLocationRow: {
        marginTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    testLocationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: '#F5EFE6',
        borderWidth: 1,
        borderColor: '#E7DDD0',
        columnGap: 6,
        minWidth: 90,
        justifyContent: 'center',
    },
    testLocationChipActive: { backgroundColor: '#FCE5D7', borderColor: '#E8B98F' },
    testLocationIcon: { fontSize: 15 },
    testLocationText: { fontSize: 12.5, fontWeight: '700', color: '#4B382A' },
});
