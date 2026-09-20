import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function Dailyroutinepage() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4EFE6" />
            <View style={styles.content}>
                <Pressable accessibilityRole="button" accessibilityLabel="Return to home" onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Home</Text>
                </Pressable>
                <Text style={styles.title}>दिनचर्या</Text>
                <Text style={styles.subtitle}>Daily routine</Text>
                <Text style={styles.message}>Your daily routine will appear here.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4EFE6' },
    content: { flex: 1, padding: 24 },
    backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#E7E3D8' },
    backText: { color: '#342419', fontSize: 15, fontWeight: '700' },
    title: { marginTop: 48, fontSize: 30, fontWeight: '800', color: '#342419' },
    subtitle: { marginTop: 4, fontSize: 16, color: '#76675B' },
    message: { marginTop: 28, fontSize: 16, color: '#664F40' },
});