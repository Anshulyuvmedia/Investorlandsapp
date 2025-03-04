import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import images from '@/constants/images';
import { Link } from 'expo-router';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDocument, setCompanyDocument] = useState(null);
  const [isUser, setIsUser] = useState(true);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });
      if (result.type === 'success') {
        setCompanyDocument(result);
      }
    } catch (error) {
      console.error('Document Picker Error:', error);
    }
  };

  const handleRegister = async () => {
    if (email && password && username && mobile && (isUser || (companyName))) {
      const formData = new FormData();
      formData.append('user_type', isUser ? 'user' : 'agent');
      formData.append('name', username);
      formData.append('mobile', mobile);
      formData.append('email', email);
      formData.append('password', password);

      if (!isUser && companyName) {
        formData.append('company_name', companyName);
        formData.append('company_document', {
          uri: companyDocument.uri,
          name: companyDocument.name,
          type: 'application/octet-stream',
        });
      }

      try {
        const response = await fetch('https://investorlands.com/api/register-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'User registered successfully!');
        } else if (result.message && result.message.includes('already registered')) {
          Alert.alert('Registration Error', 'This email is already registered.');
        } else {
          Alert.alert('Error', result.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration Error:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } else {
      Alert.alert('Validation Error', 'Please fill in all fields');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image source={images.appfavicon} className="w-full h-40" resizeMode="contain" />
        <View className='pt-5'>
          <Text className='font-rubik-bold text-center'>Join Us and Explore New Opportunities</Text>
        </View>

        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => setIsUser(true)}>
            <View className={`px-10 py-2 rounded-2xl ${isUser ? 'bg-yellow-800' : 'bg-white border'}`}>
              <Text className={`${isUser ? 'text-white' : 'text-black'} font-rubik-bold`} >User</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsUser(false)}>
            <View className={`px-10 py-2 rounded-2xl ${!isUser ? 'bg-yellow-800' : 'bg-white border'}`}>
              <Text className={`${!isUser ? 'text-white' : 'text-black'} font-rubik-bold`}>Agent</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-10">
          <Text className="text-lg font-regular text-gray-700 text-center mt-3">
            Register As {isUser ? 'User' : 'Agent'}
          </Text>

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} placeholder="Username" onChangeText={setUsername} />

          <Text style={styles.label}>Mobile No.</Text>
          <TextInput style={styles.input} placeholder="Mobile" onChangeText={setMobile} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          {!isUser && (
            <>
              <Text style={styles.label}>Company Name</Text>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Enter company name" />

              <Text style={styles.label}>Company Documents</Text>
              <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                <Text style={styles.downloadText}>Add Company Document</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            className="bg-yellow-700 rounded-2xl py-4 mt-5 items-center"
          >
            <Text className="text-lg font-rubik text-white">
              {isUser ? 'Register Now' : 'Sign Up as Agent'}
            </Text>
          </TouchableOpacity>
          <Link href="/signin" style={{ marginTop: 20, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Rubik-Regular',
                color: '#00000',
                textAlign: 'center',
              }}
            >
              Already have an account? Login now!
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
    fontFamily: 'Rubik-Regular',
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
});
