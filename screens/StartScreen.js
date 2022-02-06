import { doc } from '@firebase/firestore';
import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GoBackBtn from '../components/GoBackBtn';
import { getAuth, signOut, collection, addDoc, db, query, where, onSnapshot, orderBy } from "../firebase";

const StartScreen = ({ route,navigation }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [receiver, setReceiver] = useState('')
    const handleSignOut = async() => {
        await signOut(auth).then(() => {
            console.log('Sign-out successful.');
            navigation.goBack();
        }).catch(error => alert(error.message));
    };

    const handleChatStart = () =>{
        if (receiver === "") {
            return
        };
        const q = query(collection(db, "user"), where("name", "==", receiver));
        onSnapshot(q, (snapshot) => {
            const {docs} = snapshot;
            if(!docs.length) {
                alert("User not found.");
                return
            };
            const receiverDoc = {
                ...docs[0].data()
            };
            navigation.navigate('Chat', {receiver: receiverDoc.name});
        });
    };

    return(
        <KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={true} keyboardVerticalOffset={-500}>
            <ScrollView style={styles.containerScroll} >
                <View  style={styles.container}>
                <GoBackBtn onPress={() => handleSignOut()}/>
                <View style={styles.avatar}></View>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.subtitle}>Who you want to chat with?</Text>
                <View style={styles.inputBoxWrapper}>
                    <FontAwesome name="user" style={styles.icon} />
                    <TextInput style={styles.inputBox} placeholder={"USERNAME"} onChangeText={(text) => setReceiver(text)} returnKeyType="done"/>
                </View>
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={handleChatStart}
                >
                    <Text style={styles.btnText}>START</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    containerScroll: {
        width: '100%'
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#9ACBFF',
        marginTop: 160,
    },
    userName: {
        fontSize: 24,
        marginTop: 16,
        color: '#484848'
    },
    subtitle: {
        width: '80%',
        fontSize: 18,
        color: '#939393',
        marginTop: 60
    },
    inputBoxWrapper: {
        width: '80%',
        height: 40,
        marginTop: 20,
        backgroundColor: '#EDEDED',
        borderRadius: 5,
        paddingLeft: 40,
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
        marginTop: 60
    },
    btnText: {
        color: '#fff'
    }
});

export default StartScreen;