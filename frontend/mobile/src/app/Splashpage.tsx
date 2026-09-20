import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function Splashpage() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#C96F38" />
            <Pressable
                accessibilityLabel="Open Voice Me"
                accessibilityRole="button"
                onPress={() => router.replace('/Loginpage')}
                style={styles.content}
            >
                <View accessibilityLabel="Voice Me logo">
                    <Text style={styles.logoText}>Voice Me</Text>
                    <Text style={styles.tagline}>One tap opens Voice Me.</Text>
                </View>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C96F38',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFF1E5',
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    tagline: {
        color: '#FFF1E5',
        fontSize: 16,
        textAlign: 'center',
    },
});
