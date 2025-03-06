import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from '@/constants/images';
import icons from '@/constants/icons';
import * as WebBrowser from "expo-web-browser";
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from "expo-constants";
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;
  const WEB_CLIENT_ID = Constants.expoConfig.extra.WEB_CLIENT_ID;
  const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
  const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    expoClientId: EXPO_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),  // FIX HERE
  });
  

  // console.log("ANDROID_CLIENT_ID", ANDROID_CLIENT_ID);
  // Handle Email Login
  const emaillogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://investorlands.com/api/login-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.data));

        router.push('/'); // Redirect to dashboard
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details from Google API
  const getUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      setUserInfo(user);
      await SecureStore.setItemAsync("user", JSON.stringify(user)); // Store user info securely
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Handle Google Sign-In Response
  useEffect(() => {
    if (response?.type === "success") {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={images.appfavicon} style={styles.logo} resizeMode="contain" />

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            Let's Get You Closer To <Text style={styles.highlight}>Your Dream Home</Text>
          </Text>

          <Text style={styles.subtitle}>Login to Investor Lands</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={emaillogin} style={styles.loginButton} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL("https://investorlands.com/resetpassword")}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or with</Text>

          <TouchableOpacity onPress={() => promptAsync()} style={styles.googleButton} disabled={!request}>
            <View style={styles.googleContent}>
              <Image source={icons.google} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <Link href="/signup" style={styles.registerLink}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.highlight}>Register now</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signin;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '15%' },
  formContainer: { paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', fontFamily: 'Rubik-Bold', color: '#333', marginTop: 10 },
  highlight: { color: '#854d0e' },
  subtitle: { fontSize: 18, fontFamily: 'Rubik-Regular', color: '#555', textAlign: 'center', marginVertical: 15 },
  input: { height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10, width: '100%' },
  loginButton: { backgroundColor: '#854d0e', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 10, width: '100%' },
  loginButtonText: { fontSize: 18, fontFamily: 'Rubik-Medium', color: 'white' },
  forgotPassword: { color: "#854d0e", textDecorationLine: "underline", marginTop: 10 },
  orText: { fontSize: 14, fontFamily: 'Rubik-Regular', color: '#555', textAlign: 'center', marginTop: 30 },
  googleButton: { backgroundColor: 'lightgrey', borderRadius: 50, paddingVertical: 15, marginTop: 20, alignItems: 'center', width: '100%' },
  googleContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { width: 20, height: 20 },
  googleText: { fontSize: 18, fontFamily: 'Rubik-Medium', color: '#333', marginLeft: 10 },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 16, fontFamily: 'Rubik-Regular', color: '#000', textAlign: 'center' },
});
