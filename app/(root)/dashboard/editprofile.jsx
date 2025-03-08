import { ScrollView, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import axios from 'axios';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfile = () => {
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [usertype, setUsertype] = useState('');
    const [companyDocs, setCompanyDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    // Fetch existing profile data
    useEffect(() => {

        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));

            if (!parsedUserData || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            const response = await axios.get(`https://investorlands.com/api/userprofile?id=${parsedUserData.id}`);
            const data = response.data.data;

            setUserId(data.id);
            setUsername(data.name);
            setUsertype(data.user_type);
            setEmail(data.email);
            setPhoneNumber(data.mobile);
            setCompanyName(data.company_name);

            let profileImage = data.profile_photo_path;

            // 🔹 Ensure profile_photo_path is a valid string before setting it
            if (typeof profileImage === 'number') {
                profileImage = profileImage.toString(); // Convert number to string
            }

            if (typeof profileImage === 'string' && profileImage.trim() !== '' && profileImage !== 'null' && profileImage !== 'undefined') {
                profileImage = profileImage.startsWith('http')
                    ? profileImage
                    : `https://investorlands.com/assets/images/Users/${profileImage}`;
            } else {
                profileImage = images.avatar; // Ensure default image is a valid source
            }

            // console.log('Final Image URL:', profileImage); // Debugging
            setImage(profileImage);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };



    // Handle image selection
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Handle document selection
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.type === 'success') {
                setCompanyDocs(prevDocs => [...prevDocs, result]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
        }
    };


    const downloadAndOpenFile = async (fileUri, fileName) => {
        if (!fileUri || !fileName) {
            Alert.alert('Error', 'Invalid file URL or file name.');
            return;
        }

        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                fileUri,
                FileSystem.documentDirectory + fileName
            );

            const { uri } = await downloadResumable.downloadAsync();
            console.log('Downloaded file to:', uri);

            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(uri);
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: 'application/pdf',
                });
            } else if (Platform.OS === 'ios') {
                await Linking.openURL(uri);
            } else {
                Alert.alert('Unsupported Platform', 'This feature is only supported on Android and iOS.');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download and open the document.');
        }
    };



    const handleSubmit = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', username);
            formData.append('email', email);
            formData.append('mobile', phoneNumber);
            formData.append('company_name', companyName);

            // ✅ Upload Image Only If It's New
            if (image && !image.startsWith('http')) {
                formData.append('profile_photo', {
                    uri: image,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                });
            }

            // ✅ Upload Only New Documents
            companyDocs.forEach((doc, index) => {
                if (doc.uri && !doc.uri.startsWith('http')) {
                    const fileType = doc.mimeType || 'application/pdf';
                    const fileName = doc.name || `document_${index + 1}.pdf`;

                    formData.append(`company_documents[${index}]`, {
                        uri: doc.uri,
                        name: fileName,
                        type: fileType,
                    });
                }
            });

            const response = await axios.post(`https://investorlands.com/api/updateuserprofile/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Profile updated successfully!');
            } else {
                throw new Error('Unexpected server response.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);

            if (error.response) {
                Alert.alert('Server Error', error.response.data.message || 'Something went wrong on the server.');
            } else {
                Alert.alert('Network Error', 'Please check your internet connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Image source={icons.backArrow} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.headerText} className="capitalize">Edit {usertype} Profile</Text>
                <View></View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.profileImageContainer}>
                        <Image source={image ? { uri: image } : images.avatar} style={styles.profileImage} />
                        <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
                            <Image source={icons.edit} style={styles.editIcon} />
                        </TouchableOpacity>
                        <Text style={styles.roleText} className="capitalize text-black font-rubik-bold">{username}</Text>
                        <Text style={styles.roleText} className="capitalize font-rubik">{usertype}</Text>
                    </View>

                    <View>
                        <Text style={styles.label}>Username</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your name" />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" />
                        {usertype === 'agent' && (
                            <View>
                                <Text style={styles.label}>Company Name</Text>
                                <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Enter company name" />

                                <Text style={styles.label}>Company Documents</Text>
                                {companyDocs.length > 0 ? (
                                    companyDocs.map((doc, index) => {
                                        const fileName = doc.name.length > 10 ? `${doc.name.substring(0, 10)}...` : doc.name;
                                        const fileExtension = doc.name.split('.').pop();
                                        return (
                                            <View key={index} style={styles.docItem}>
                                                <Text>{fileName}.{fileExtension}</Text>
                                                <TouchableOpacity onPress={() => downloadAndOpenFile(doc.uri, doc.name)} style={styles.dropbox}>
                                                    <Text style={styles.downloadText}>Download</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <Text>No documents available</Text>
                                )}

                                <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                                    <Text style={styles.downloadText}>Add Company Document</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'UPDATING...' : 'UPDATE PROFILE'}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    backButton: {
        backgroundColor: '#ccc',
        borderRadius: 20,
        padding: 10,
    },
    icon: {
        width: 20,
        height: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 70,
        right: 135,
    },
    editIcon: {
        width: 30,
        height: 30,
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'normal',
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        backgroundColor: '#edf5ff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    docItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropbox: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    downloadText: {
        color: '#8a4c00',
    },
    submitButton: {
        backgroundColor: '#8a4c00',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
