import { Client, Avatars, Account, OAuthProvider } from "react-native-appwrite";
import * as  Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";
import { Alert } from 'react-native';
export const config = {
    platform: 'com.investor.investorland',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
    try {
        const redirectUri = Linking.createURL('/');
        console.log('Redirect URI:', redirectUri);

        const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);

        if (!response) throw new Error('Failed to login');

        const browserResult = await openAuthSessionAsync(response.toString(), redirectUri);

        console.log("Browser session result:", browserResult);

        if (browserResult.type === 'dismiss') {
            // Handle the dismissal gracefully
            Alert.alert('Authentication', 'You have canceled the login process.');
            return false;
        }

        if (browserResult.type !== 'success') {
            console.error('Browser session failedd:', browserResult);
            throw new Error(`Browser session failed: ${JSON.stringify(browserResult)}`);
        }


        const url = new URL(browserResult.url);

        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if (!secret || !userId) throw new Error('Failed to login!');

        const session = await account.createSession(userId, secret);

        if (!session) throw new Error('Failed to create a session!');

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const response = await account.get();

        if (response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return {
                ...response,
                avatar: userAvatar.toString(),
            }
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}