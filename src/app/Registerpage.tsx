import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTERED_NAME_KEY = 'voiceme.registeredName';
const REGISTERED_AGE_KEY = 'voiceme.registeredAge';

export default function CreateAccountScreen() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleContinue = async () => {
        if (!name.trim()) {
            Alert.alert('आवश्यक विवरण (Required)', 'कृपया आफ्नो नाम प्रविष्ट गर्नुहोस् (Please enter your name)');
            return;
        }
        if (!age.trim()) {
            Alert.alert('उमेर आवश्यक छ (Age required)', 'कृपया आफ्नो उमेर प्रविष्ट गर्नुहोस् (Please enter your age)');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('अमान्य इमेल (Invalid Email)', 'कृपया मान्य इमेल प्रविष्ट गर्नुहोस् (Please enter a valid email)');
            return;
        }
        if (!password || password.length < 6) {
            Alert.alert('सुरक्षित पासवर्ड (Password)', 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ (Password must be at least 6 characters)');
            return;
        }

        try {
            await AsyncStorage.setItem(REGISTERED_NAME_KEY, name.trim());
            await AsyncStorage.setItem(REGISTERED_AGE_KEY, age.trim());
            Alert.alert(
                'खाता सिर्जना (Success)',
                `नमस्ते ${name.trim()}! तपाईँको खाता सफलतापूर्वक तयार हुँदैछ।`,
                [{ text: 'OK', onPress: () => router.replace('/Loginpage') }]
            );
        } catch {
            Alert.alert('Error', 'Unable to save your name. Please try again.');
        }
    };

    const handleLoginPress = () => {
        router.push('/Loginpage');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7EEDA" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section: Account Management */}
                    <View style={styles.headerBlock}>
                        <Text style={styles.mainHeaderNepali}>खाता व्यवस्थापन</Text>
                        <Text style={styles.mainHeaderEnglish}>Account Management</Text>
                    </View>

                    {/* Sub Header Section: Create Account */}
                    <View style={styles.sectionHeaderBlock}>
                        <Text style={styles.sectionHeaderNepali}>खाता सिर्जना गर्नुहोस्</Text>
                        <Text style={styles.sectionHeaderEnglish}>Create Account</Text>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        {/* Field 1: Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>नाम</Text>
                            <View style={styles.inputPill}>
                                {/* User Avatar Icon */}
                                <View style={styles.iconWrapper}>
                                    <View style={styles.avatarHead} />
                                    <View style={styles.avatarBody} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Name"
                                    placeholderTextColor="#7C5044"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Field 2: Age */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>उमेर</Text>
                            <View style={styles.inputPill}>
                                <View style={styles.iconWrapper}>
                                    <Text style={styles.ageIcon}>#</Text>
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Age"
                                    placeholderTextColor="#7C5044"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Field 3: Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>इमेल</Text>
                            <View style={styles.inputPill}>
                                {/* Padlock Icon */}
                                <View style={styles.iconWrapper}>
                                    <View style={styles.lockShackle} />
                                    <View style={styles.lockBody} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="name@email.com"
                                    placeholderTextColor="#7C5044"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Field 4: Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>पासवर्ड</Text>
                            <View style={styles.inputPill}>
                                {/* Padlock Icon */}
                                <View style={styles.iconWrapper}>
                                    <View style={styles.lockShackle} />
                                    <View style={styles.lockBody} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Password"
                                    placeholderTextColor="#7C5044"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    style={styles.eyeToggle}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.eyeToggleText}>
                                        {isPasswordVisible ? 'लुकाउनुहोस्' : 'हेर्नुहोस्'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.buttonTextNepali}>अघि बढ्नुहोस्</Text>
                            <Text style={styles.buttonTextEnglish}>Continue</Text>
                        </TouchableOpacity>

                        {/* Footer: Already have an account? Login */}
                        <TouchableOpacity
                            onPress={handleLoginPress}
                            style={styles.footerLinkContainer}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.footerTextNepali}>पहिल्यै खाता छ? लगइन गर्नुहोस्</Text>
                            <Text style={styles.footerTextEnglish}>
                                Already have an account? <Text style={styles.footerLoginHighlight}>Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7EEDA', // Warm cream background from design
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: Platform.OS === 'ios' ? 24 : 40,
        paddingBottom: 32,
    },
    headerBlock: {
        marginBottom: 26,
    },
    mainHeaderNepali: {
        fontSize: 27,
        fontWeight: '800',
        color: '#3E1C14', // Deep dark maroon brown
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    mainHeaderEnglish: {
        fontSize: 18,
        fontWeight: '500',
        color: '#3E1C14',
        letterSpacing: 0.1,
    },
    sectionHeaderBlock: {
        marginBottom: 28,
    },
    sectionHeaderNepali: {
        fontSize: 27,
        fontWeight: '800',
        color: '#3E1C14',
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    sectionHeaderEnglish: {
        fontSize: 18,
        fontWeight: '500',
        color: '#3E1C14',
        letterSpacing: 0.1,
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 18,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#3E1C14',
        marginBottom: 7,
        marginLeft: 18,
    },
    inputPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3CFC2', // Soft blush peach from design
        borderRadius: 30,
        height: 54,
        paddingHorizontal: 18,
    },
    iconWrapper: {
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarHead: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#3E1C14',
        marginBottom: 2,
    },
    avatarBody: {
        width: 15,
        height: 8,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        backgroundColor: '#3E1C14',
    },
    ageIcon: {
        color: '#3E1C14',
        fontSize: 18,
        fontWeight: '800',
    },
    lockShackle: {
        width: 10,
        height: 7,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderWidth: 2,
        borderColor: '#3E1C14',
        borderBottomWidth: 0,
        marginBottom: -1,
    },
    lockBody: {
        width: 14,
        height: 10,
        borderRadius: 2.5,
        backgroundColor: '#3E1C14',
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#3E1C14',
        fontWeight: '500',
    },
    eyeToggle: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    eyeToggleText: {
        fontSize: 11,
        color: '#7C5044',
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: '#26533A', // Deep evergreen forest
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 26,
        marginBottom: 24,
        shadowColor: '#173624',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonTextNepali: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    buttonTextEnglish: {
        color: '#CFE0D5',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },
    footerLinkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    footerTextNepali: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3E1C14',
        textAlign: 'center',
        marginBottom: 4,
    },
    footerTextEnglish: {
        fontSize: 13,
        fontWeight: '500',
        color: '#3E1C14',
        textAlign: 'center',
    },
    footerLoginHighlight: {
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});