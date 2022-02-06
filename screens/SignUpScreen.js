import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GoBackBtn from '../components/GoBackBtn';
import { getAuth, createUserWithEmailAndPassword, collection, addDoc, db, query,where, onSnapshot, getDocs, doc } from "../firebase";

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const handleSignUp = async () => {
        const auth = getAuth();
        const q = query(collection(db, "user"), where("name", "==", name));
        const querySnapshot = await getDocs(q);
        if(querySnapshot.size != 0){
            alert("UserName has already existed.");
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then(userCredentials => {
                    const user = userCredentials.user;
                    console.log('Registered with:', user.email);
                    try{
                        const docRef = addDoc(collection(db, "user"), {
                            name: name,
                            email: email
                        });
                    } catch (e) {
                        console.error("Error adding document: ", e);
                        alert("Error adding document: ", e);
                    };
                    alert('Registration Successful');
                })
                .then( () => navigation.navigate('Login'))
                .catch(error => {
                    const errorText = error.message.split(/[/)]/g)[1];
                    alert(errorText);
                });
        }
    }

    return(
        <KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={true} keyboardVerticalOffset={-500}>
            <ScrollView  style={styles.container}> 
                <GoBackBtn onPress={() => navigation.goBack()}/>
                <View style={styles.titleBox}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}></Text>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="user" style={styles.icon} />
                    <TextInput style={styles.inputBox} placeholder={"USERNAME"} value={name} onChangeText={text => setName(text)} returnKeyType="next"/>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="envelope" style={[styles.icon, {fontSize: 14}]} />
                    <TextInput style={styles.inputBox} placeholder={"EMAIL"} value={email} onChangeText={text => setEmail(text)} keyboardType="email-address" returnKeyType="next"/>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="lock" style={styles.icon} />
                    <TextInput style={styles.inputBox} placeholder={"PASSWORD"} value={password} onChangeText={text => setPassword(text)} secureTextEntry={true} returnKeyType="next"/>
                </View>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="lock" style={styles.icon} />
                    <TextInput style={styles.inputBox} placeholder={"CONFIRM PASSWORD"} secureTextEntry={true} returnKeyType="done"/>
                </View>
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={handleSignUp}
                >
                    <Text style={styles.btnText}>SIGN UP</Text>
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text>Already have an account? </Text>
                    <Text
                        style={styles.actionText}
                        onPress={() => navigation.navigate('Login')}
                    >
                        Sign in
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    titleBox: {
        width: '80%',
        height: 60,
        position: 'relative',
        marginLeft: '10%',
        marginTop: 160,
        marginBottom: 20
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
        marginTop: 40,
        marginBottom: 60,
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

export default SignUpScreen;