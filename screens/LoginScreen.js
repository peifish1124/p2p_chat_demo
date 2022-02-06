import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getAuth, signInWithEmailAndPassword, updateProfile, query, collection, getDocs, db, where, onSnapshot } from "../firebase";

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();

    const handleLogin = async() => {
        await signInWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Logged in with:', user.email);
            navigation.navigate('Start');
        }).catch(error => {
            const errorText = error.message.split(/[/)]/g)[1];
            alert(errorText);
            return
        });

        const user = auth.currentUser;
        const q = query(collection(db, "user"), where("email", "==", email));
        onSnapshot(q, async(snapshot) => {
            const {docs} = snapshot;
            await updateProfile(user, {
                displayName: docs[0].data().name
            }).then(() => {
                // Profile updated!
            }).catch(error => {
                alert(error.message);
            });
        });
    };

    return(
        <KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={true} keyboardVerticalOffset={-500}>
            <ScrollView>
                <View style={styles.titleBox}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>Please sign in to continue.</Text>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="envelope" style={[styles.icon, {fontSize: 14}]} />
                    <TextInput style={styles.inputBox} placeholder={"EMAIL"} value={email} onChangeText={text => setEmail(text)} keyboardType="email-address" returnKeyType="next"/>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="lock" style={styles.icon} />
                    <TextInput style={styles.inputBox} placeholder={"PASSWORD"} value={password} onChangeText={text => setPassword(text)} secureTextEntry={true} returnKeyType="done"/>
                </View>
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={handleLogin}
                >
                    <Text style={styles.btnText}>LOGIN</Text>
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text>Don’t have an account? </Text>
                    <Text
                        style={styles.actionText}
                        onPress={() => navigation.navigate('SignUp')}
                    >
                        Sign up
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleBox: {
        width: '80%',
        height: 60,
        position: 'relative',
        marginLeft: '10%',
        marginTop: 160,
        marginBottom: 60
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#484848'
    },
    subtitle: {
        fontSize: 18,
        color: '#939393',
        marginTop: 5
    },
    inputBoxWrapper: {
        width: '80%',
        height: 40,
        marginLeft: '10%',
        marginTop: 20,
        backgroundColor: '#EDEDED',
        borderRadius: 5,
        paddingLeft: 30,
        flexDirection: 'row'
    },
    inputBox: {
        position: 'relative',
        width: '100%',
        color: '#484848'
    },
    icon: {
        position: 'absolute',
        color: '#939393',
        fontSize: 18,
        top: 11,
        left: 11
    },
    actionBtn: {
        width: 120,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9ACBFF',
        borderRadius: 20,
        marginLeft: 'auto',
        marginRight: '10%',
        marginVertical: 50
    },
    btnText: {
        color: '#fff'
    },
    footer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#55A4F8',
        padding: 10
    }
});

export default LoginScreen;