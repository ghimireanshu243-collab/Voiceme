import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    BackHandler,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const AUTH_TOKEN_KEY = 'voiceme.authToken';
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.1.77:8000'
    : 'http://192.168.1.77:8000';

interface RoutineItem {
    id: string;
    time: string;
    slot_index: number;
    title: string;
    icon: string;
    completed: boolean;
}

// Every half hour across the full day, same slots offered during registration
// so a routine added here lines up with the ones set up at sign-up.
const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
    const hour24 = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour24 < 12 ? 'AM' : 'PM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
});

const ROUTINE_EMOJI_RULES: { keywords: string[]; icon: string }[] = [
    { keywords: ['teeth', 'brush', 'दाँत', 'माझ्'], icon: '🪥' },
    { keywords: ['medicine', 'aushadhi', 'औषधि'], icon: '💊' },
    { keywords: ['breakfast', 'नास्ता', 'खाजा', 'बिहान'], icon: '🥣' },
    { keywords: ['lunch', 'दिउँसो'], icon: '🍱' },
    { keywords: ['dinner', 'साँझ', 'रात'], icon: '🍽️' },
    { keywords: ['milk', 'दूध'], icon: '🥛' },
    { keywords: ['water', 'drink', 'पानी'], icon: '💧' },
    { keywords: ['snack', 'biscuit'], icon: '🍪' },
    { keywords: ['study', 'homework', 'पढ', 'school', 'विद्यालय'], icon: '📚' },
    { keywords: ['play', 'sport', 'football', 'खेल'], icon: '⚽' },
    { keywords: ['bath', 'shower', 'नुहाउ'], icon: '🛁' },
    { keywords: ['sleep', 'bed', 'nap', 'सुत', 'निद्रा'], icon: '🌙' },
    { keywords: ['exercise', 'yoga', 'run', 'walk', 'व्यायाम'], icon: '🏃' },
    { keywords: ['tv', 'cartoon', 'television'], icon: '📺' },
    { keywords: ['clean', 'tidy', 'सफा'], icon: '🧹' },
    { keywords: ['pray', 'पूजा'], icon: '🙏' },
];

function suggestRoutineEmoji(title: string): string {
    const lower = title.toLowerCase();
    for (const rule of ROUTINE_EMOJI_RULES) {
        if (rule.keywords.some((word) => lower.includes(word.toLowerCase()))) {
            return rule.icon;
        }
    }
    return '⏰';
}

export default function Dailyroutinepage() {
    const [items, setItems] = useState<RoutineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(14); // 07:00 AM
    const [draftTitle, setDraftTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

    const loadRoutines = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                setItems([]);
                return;
            }
            const res = await fetch(`${API_BASE_URL}/api/routines/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data.items) ? data.items : []);
            }
        } catch {
            // Offline or backend unreachable: keep showing whatever was last loaded.
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadRoutines();
        }, [loadRoutines])
    );

    // A device can sit open overnight without ever navigating away, so a
    // focus-only refetch would miss the day rolling over. Re-check whenever
    // the app comes back to the foreground too — the backend does the actual
    // reset, this just makes sure the screen picks it up right away.
    const appState = useRef(AppState.currentState);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (appState.current.match(/inactive|background/) && nextState === 'active') {
                loadRoutines();
            }
            appState.current = nextState;
        });
        return () => subscription.remove();
    }, [loadRoutines]);

    const handleToggleItem = async (item: RoutineItem) => {
        try {
            Haptics.selectionAsync();
        } catch { }

        // Optimistic toggle so the tap feels instant.
        setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, completed: !i.completed } : i))
        );

        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/routines/${item.id}/toggle/`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.items)) setItems(data.items);
            }
        } catch { }
    };

    // POST replaces the whole list, so every save/delete sends the full set
    // of items back — each existing one keeps its id, so the backend can
    // match it up and preserve its completed state.
    const toPayloadItem = (i: RoutineItem) => ({
        id: i.id,
        time: i.time,
        slot_index: i.slot_index,
        title: i.title,
        icon: i.icon,
    });

    const postItems = async (payloadItems: Array<Partial<RoutineItem> & { title: string }>) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return false;

        const res = await fetch(`${API_BASE_URL}/api/routines/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: payloadItems }),
        });

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) setItems(data.items);
            return true;
        }
        return false;
    };

    const handleOpenAddModal = () => {
        try {
            Haptics.selectionAsync();
        } catch { }
        setEditingItemId(null);
        setDraftTitle('');
        setSelectedSlotIndex(14);
        setAddModalVisible(true);
    };

    const handleOpenEditModal = (item: RoutineItem) => {
        try {
            Haptics.selectionAsync();
        } catch { }
        setEditingItemId(item.id);
        setDraftTitle(item.title);
        const slotIndex = TIME_SLOTS.indexOf(item.time);
        setSelectedSlotIndex(slotIndex >= 0 ? slotIndex : item.slot_index || 14);
        setAddModalVisible(true);
    };

    const handleSaveRoutine = async () => {
        const title = draftTitle.trim();
        if (!title) return;

        setSaving(true);
        try {
            const editedFields = {
                time: TIME_SLOTS[selectedSlotIndex],
                slot_index: selectedSlotIndex,
                title,
                icon: suggestRoutineEmoji(title),
            };

            const payloadItems = editingItemId
                ? items.map((i) =>
                    i.id === editingItemId ? { id: i.id, ...editedFields } : toPayloadItem(i)
                )
                : [...items.map(toPayloadItem), editedFields];

            const ok = await postItems(payloadItems);
            if (ok) {
                try {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch { }
                setAddModalVisible(false);
                setEditingItemId(null);
            }
        } catch {
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = (item: RoutineItem) => {
        Alert.alert(
            'दिनचर्या हटाउनुहोस्? (Delete routine?)',
            `"${item.title}" हटाउने हो? (Remove "${item.title}" from the routine?)`,
            [
                { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
                {
                    text: 'हटाउनुहोस् (Delete)',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        } catch { }
                        setDeletingItemId(item.id);
                        try {
                            const payloadItems = items.filter((i) => i.id !== item.id).map(toPayloadItem);
                            await postItems(payloadItems);
                        } catch {
                        } finally {
                            setDeletingItemId(null);
                        }
                    },
                },
            ]
        );
    };

    // Falls back to the home screen when there's no navigation history to
    // pop (e.g. this page was opened directly), so the button/hardware back
    // action never silently does nothing and strands the user here.
    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/Homepage');
        }
    }, []);

    // The Android hardware/gesture back action should close the add/edit
    // modal first if it's open, rather than leaving the whole screen while
    // a routine is mid-edit.
    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (addModalVisible) {
                setAddModalVisible(false);
                setEditingItemId(null);
                return true;
            }
            handleGoBack();
            return true;
        });
        return () => subscription.remove();
    }, [addModalVisible, handleGoBack]);

    const doneCount = items.filter((i) => i.completed).length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />

            <View style={styles.headerRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="Return to home" onPress={handleGoBack} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Home</Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add a new routine"
                    onPress={handleOpenAddModal}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressedState]}
                >
                    <Text style={styles.addButtonText}>+ थप्नुहोस्</Text>
                </Pressable>
            </View>

            <View style={styles.titleBlock}>
                <Text style={styles.title}>दिनचर्या</Text>
                <Text style={styles.subtitle}>Daily routine</Text>
                {items.length > 0 && (
                    <Text style={styles.progress}>{doneCount} of {items.length} done</Text>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingBlock}>
                    <ActivityIndicator color="#8C461F" />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.emptyBlock}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyText}>
                        कुनै दिनचर्या थपिएको छैन। माथि "+ थप्नुहोस्" थिचेर थप्नुहोस्।
                    </Text>
                    <Text style={styles.emptyTextEnglish}>
                        No routines yet. Tap "+ Add" above to set one up.
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {items.map((item) => (
                        <View
                            key={item.id}
                            style={[styles.routineCard, item.completed && styles.routineCardDone]}
                        >
                            <Text style={styles.routineIcon}>{item.icon}</Text>
                            <View style={styles.routineTextBlock}>
                                <Text style={styles.routineTime}>{item.time}</Text>
                                <Text
                                    style={[styles.routineTitle, item.completed && styles.routineTitleDone]}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Edit ${item.title}`}
                                hitSlop={8}
                                style={({ pressed }) => [styles.iconButton, pressed && styles.pressedState]}
                                onPress={() => handleOpenEditModal(item)}
                            >
                                <Text style={styles.iconButtonText}>✏️</Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Delete ${item.title}`}
                                hitSlop={8}
                                style={({ pressed }) => [styles.iconButton, pressed && styles.pressedState]}
                                onPress={() => handleDeleteItem(item)}
                                disabled={deletingItemId === item.id}
                            >
                                {deletingItemId === item.id ? (
                                    <ActivityIndicator color="#B32517" size="small" />
                                ) : (
                                    <Text style={styles.iconButtonText}>🗑️</Text>
                                )}
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`${item.title}, ${item.completed ? 'completed' : 'not completed'}`}
                                hitSlop={8}
                                style={({ pressed }) => [
                                    styles.checkCircle,
                                    item.completed && styles.checkCircleDone,
                                    pressed && styles.pressedState,
                                ]}
                                onPress={() => handleToggleItem(item)}
                            >
                                {item.completed && <Text style={styles.checkMark}>✓</Text>}
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            )}

            {addModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            {editingItemId ? 'दिनचर्या सम्पादन गर्नुहोस् (Edit Routine)' : 'नयाँ दिनचर्या (New Routine)'}
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.timeSlotScroll}
                            contentContainerStyle={styles.timeSlotScrollContent}
                        >
                            {TIME_SLOTS.map((slot, index) => {
                                const isSelected = index === selectedSlotIndex;
                                return (
                                    <Pressable
                                        key={slot}
                                        style={[styles.timeSlotChip, isSelected && styles.timeSlotChipSelected]}
                                        onPress={() => setSelectedSlotIndex(index)}
                                    >
                                        <Text style={[styles.timeSlotChipText, isSelected && styles.timeSlotChipTextSelected]}>
                                            {slot}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.inputPill}>
                            <Text style={styles.inputIcon}>
                                {draftTitle.trim() ? suggestRoutineEmoji(draftTitle) : '📝'}
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={draftTitle}
                                onChangeText={setDraftTitle}
                                placeholder="e.g. Brush teeth"
                                placeholderTextColor="#7C6356"
                                returnKeyType="done"
                                onSubmitEditing={handleSaveRoutine}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Pressable
                                style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressedState]}
                                onPress={() => {
                                    setAddModalVisible(false);
                                    setEditingItemId(null);
                                }}
                            >
                                <Text style={styles.modalCancelText}>रद्द गर्नुहोस्</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalSaveButton,
                                    (!draftTitle.trim() || saving) && styles.modalSaveButtonDisabled,
                                    pressed && styles.pressedState,
                                ]}
                                onPress={handleSaveRoutine}
                                disabled={!draftTitle.trim() || saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFFDF9" size="small" />
                                ) : (
                                    <Text style={styles.modalSaveText}>
                                        {editingItemId ? 'सुरक्षित गर्नुहोस् (Save)' : '+ थप्नुहोस्'}
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
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
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: '#8C461F',
    },
    addButtonText: { color: '#FFFDF9', fontSize: 15, fontWeight: '800' },
    pressedState: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    titleBlock: { paddingHorizontal: 24, marginTop: 24 },
    title: { fontSize: 30, fontWeight: '800', color: '#342419' },
    subtitle: { marginTop: 4, fontSize: 16, color: '#76675B' },
    progress: { marginTop: 10, fontSize: 14, fontWeight: '700', color: '#8C461F' },
    loadingBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyText: { fontSize: 15, fontWeight: '700', color: '#342419', textAlign: 'center' },
    emptyTextEnglish: { marginTop: 6, fontSize: 13, color: '#76675B', textAlign: 'center' },
    list: { flex: 1, marginTop: 20 },
    listContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
    routineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFDF9',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    routineCardDone: { backgroundColor: '#EEF4E9', borderColor: '#C6DBC3' },
    routineIcon: { fontSize: 26, marginRight: 14 },
    routineTextBlock: { flex: 1 },
    routineTime: { fontSize: 12.5, fontWeight: '600', color: '#8A786C' },
    routineTitle: { marginTop: 2, fontSize: 16, fontWeight: '700', color: '#342419' },
    routineTitleDone: { color: '#5C7A54', textDecorationLine: 'line-through' },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },
    iconButtonText: { fontSize: 15 },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#D8CABB',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    checkCircleDone: { backgroundColor: '#3F6838', borderColor: '#3F6838' },
    checkMark: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(25, 14, 11, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFDF9',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    modalTitle: { fontSize: 17, fontWeight: '800', color: '#342419', marginBottom: 14 },
    timeSlotScroll: { flexGrow: 0, marginBottom: 14 },
    timeSlotScrollContent: { columnGap: 8, paddingRight: 8 },
    timeSlotChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: '#F5EFE6',
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    timeSlotChipSelected: { backgroundColor: '#8C461F', borderColor: '#8C461F' },
    timeSlotChipText: { fontSize: 13, fontWeight: '600', color: '#664F40' },
    timeSlotChipTextSelected: { color: '#FFFDF9' },
    inputPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5EFE6',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#E7DDD0',
    },
    inputIcon: { fontSize: 20, marginRight: 10 },
    textInput: { flex: 1, fontSize: 15, color: '#342419', paddingVertical: 10 },
    modalActions: { flexDirection: 'row', columnGap: 10, marginTop: 18 },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#EAE1D3',
        borderWidth: 1,
        borderColor: '#D8CABB',
    },
    modalCancelText: { fontSize: 14, fontWeight: '700', color: '#4B382A' },
    modalSaveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#8C461F',
    },
    modalSaveButtonDisabled: { opacity: 0.5 },
    modalSaveText: { fontSize: 14, fontWeight: '800', color: '#FFFDF9' },
});
