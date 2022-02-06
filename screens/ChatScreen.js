import React, { useState, useCallback, useEffect, useLayoutEffect }  from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Keyboard, Image, Platform} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GoBackBtn from '../components/GoBackBtn';
import { collection, addDoc, db, query, where, onSnapshot, orderBy, getAuth } from "../firebase";
import { GiftedChat, InputToolbar, Bubble, Send, Message} from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';
import * as FireStorage from "firebase/storage";

const ChatScreen = ({ route, navigation }) => {
    const [messages, setMessages] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;
    const {receiver} = route.params;
    useLayoutEffect(() => {
        const tokenAry = [user.displayName+receiver, receiver+user.displayName];
        const q = query(collection(db, "chat"), where("token", "in", tokenAry), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => setMessages(
            snapshot.docs.map((doc) => ({
                _id: doc.data()._id,
                text: doc.data().text,
                createdAt: doc.data().createdAt.toDate(),
                user: doc.data().user,
                receiver: doc.data().receiver,
                token: doc.data().token,
                image: doc.data().image,
            }))
        ))
        return unsubscribe;
    },[]);

    const onSend = (messages = [], imgUrl) => {
        const userObj = {
            _id: auth.currentUser.email,
            name : auth.currentUser.displayName
        };
        const id = auth.currentUser.uid + Date.now().toString();
        const userName = userObj.name;
        if(!messages.length){
            messages.push({
                _id: id,
                text: '',
                createdAt: new Date(),
                image: imgUrl,
                user:{...userObj},
                receiver: receiver,
                token: userName + receiver
            });
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        const{
            _id,
            text,
            createdAt,
            user,
        }=messages[0];
        try {
            const docRef = addDoc(collection(db, "chat"), {
                _id,
                text,
                createdAt,
                user,
                image: imgUrl? imgUrl: '',
                receiver: receiver,
                token: auth?.currentUser?.displayName+receiver,
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const customInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: "white",
                    borderTopColor: "#E8E8E8",
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    justifyContent: 'center',
                }}
            />
        );
    };

    const renderBubble = (props) => {
        const auth = getAuth();
        const currentUser = auth.currentUser.email;
        const {createdAt, user} = props.currentMessage;
        const messageUser = user._id;
        return (
            <View>
                {messageUser == currentUser ? 
                <Text style={{fontSize: 10, alignSelf: 'flex-end', color: '#BFBCBC'}}>18:25</Text>:
                <Text style={{fontSize: 10, color: '#BFBCBC'}}>18:25</Text>
                }
                <Bubble
                    {...props}
                    textStyle={{
                        left: {
                            color: '#484848',
                        },
                        right: {
                            color: '#fff',
                        },
                    }}
                    wrapperStyle={{
                        left: {
                            color: '#EDEDED',
                        },
                        right: {
                        backgroundColor: '#9ACBFF',
                        },
                    }}
                />
            </View>
        )
    };

    const customMessage = props => {
        return(
        <Message
            {...props}
            containerStyle={{
                left: {
                    alignItems: 'flex-start'
                }
            }}
        />
        )
    }

    const renderSend = (props) => {
        return(
            <Send {...props} >
                <View tyle={styles.sendBtn}>
                    <FontAwesome name="send" style={styles.icon} />
                </View>
            </Send>
        )
    };

    const customActions = (props) => {
        const choosePhotoFromLibrary = async () =>{
            // Ask the user for the permission to access the media library 
            if (Platform.OS !== 'web') {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
              };
            };
        
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
            }).then();

            if (!result.cancelled) {
                const name = result.uri.substring(result.uri.lastIndexOf('/') + 1);
                const {uri} = result;
                const file = {
                    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                    name, 
                    type: 'image/jpg'
                };
                uploadImage(file);
            };
        };
        return (
            <TouchableOpacity style={styles.iconBox} onPress={choosePhotoFromLibrary}>
                <FontAwesome name="image" style={styles.icon} />
            </TouchableOpacity>
        );
    };

    const getPictureBlob = (uri) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            reject(new TypeError('Network request failed'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
    };

    const uploadImage = async(file) => {
        const blob = await getPictureBlob(file.uri);
        const storage = FireStorage.getStorage();
        const sotrageRef = FireStorage.ref(storage, "Image/"+file.name);
        const metadata = {
            contentType: 'image/jpeg'
        };
        const uploadTask = FireStorage.uploadBytesResumable(sotrageRef, blob, metadata);
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, (error) => {
            // Handle unsuccessful uploads
            alert(error);
        }, () => {
            // Handle successful uploads on complete
            FireStorage.getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                onSend([], downloadURL);
            });
        });
    };
    return(
        <>
            <View style={styles.header}>
                <GoBackBtn onPress={() => navigation.goBack()}/>
                <Text style={styles.userName}>{receiver}</Text>
            </View>
            <View style={styles.container}>
                <GiftedChat
                    messages={messages}
                    onSend={messages => { onSend(messages)}}
                    renderInputToolbar={(props) => customInputToolbar(props)}
                    renderActions={(props) => customActions(props)}
                    renderBubble={(props) => renderBubble(props)}
                    renderSend={(props) => renderSend(props)}
                    renderMessage={(props) => customMessage(props)}
                    bottomOffset={-15}
                    textInputStyle={styles.replyChatText}
                    renderTime={() =>null}
                    user={{
                        _id: auth?.currentUser?.email,
                        name : auth?.currentUser?.displayName
                    }}
                />
            </View>
        </>
        // <View style={styles.container}>
        //     <View style={styles.header}>
        //         <GoBackBtn onPress={() => navigation.goBack()}/>
        //         <Text style={styles.userName}>shiuanping</Text>
        //     </View>
        //     <ScrollView style={styles.chatArea}>
        //         <View style={styles.sendBox}>
        //             <View style={styles.sendChatBox}>
        //                 <Text style={styles.sendChatText}>Hello!</Text>
        //             </View>
        //             <Text style={styles.sendChatTime}>18:30</Text>
        //         </View>
        //         <View style={styles.replyBox}>
        //             <View style={styles.replyChatBox}>
        //                 <Text style={styles.replyChatText}>Hello! How are you? Hello! How are you? Hello! How are you? Hello! How are you?</Text>
        //             </View>
        //             <Text style={styles.replyChatTime}>18:30</Text>
        //         </View>
        //     </ScrollView>
        //     <KeyboardAvoidingView 
        //         style={styles.inputArea}
        //         behavior={Platform.OS === "ios" ? "padding" : "height"}
        //     >
        //         <View style={styles.inputBoxWrapper}>
        //             <TextInput style={styles.inputBox} placeholder={"TYPE SOMETHING..."} returnKeyType="send"
        //                 onSubmitEditing={() => handleSend}
        //             />
        //         </View>
        //         <TouchableOpacity style={styles.iconBox} onPress={Keyboard.dismiss}>
        //             <FontAwesome name="image" style={styles.icon} />
        //         </TouchableOpacity>
        //     </KeyboardAvoidingView>
        // </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        width: '100%',
        height: 120,
        flexDirection: 'row',
        backgroundColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 4,
        shadowColor: '#484848',
        shadowOpacity: 0.2,
        elevation: 2,
    },
    userName: {
        position: 'absolute',
        fontSize: 24,
        color: '#484848',
        bottom: 10,
        left: 60
    },
    chatArea: {
        position: 'relative',
        width: '100%',
        paddingBottom: 120
    },
    sendBox: {
        maxWidth: '70%',
        height: 'auto',
        margin: 15,
        marginRight: 30,
        marginLeft: 'auto',
    },
    sendChatBox: {
        position: 'relative',
        width: 'auto',
        minHeight: 45,
        borderRadius: 22.5,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#EDEDED',
        justifyContent: 'center',
    },
    sendChatText: {
        fontSize: 18,
        color: '#484848'
    },
    sendChatTime: {
        fontSize: 12,
        color: '#939393',
        marginTop: 5,
        marginRight: 11.25,
        marginLeft: 'auto'
    },
    replyBox: {
        maxWidth: '70%',
        height: 'auto',
        margin: 15,
        marginLeft: 30,
        marginRight: 'auto',
    },
    replyChatBox: {
        position: 'relative',
        width: 'auto',
        minHeight: 45,
        borderRadius: 22.5,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#9ACBFF',
        justifyContent: 'center',
    },
    replyChatText: {
        fontSize: 18,
        color: '#484848'
    },
    replyChatTime: {
        fontSize: 12,
        color: '#939393',
        marginTop: 5,
        marginLeft: 11.25,
        marginRight: 'auto'
    },
    inputBoxWrapper: {
        width: '80%',
        height: 40,
        backgroundColor: '#EDEDED',
        borderRadius: 20,
        paddingLeft: 30,
        flexDirection: 'row'
    },
    inputBox: {
        position: 'relative',
        width: '100%',
        color: '#484848'
    },
    icon: {
        color: '#939393',
        fontSize: 18
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    inputArea: {
        position: 'absolute',
        flexDirection: 'row',
        width: '100%',
        bottom: 60,
        padding: 10,
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    sendBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#55A4F8',
        fontSize: 18
    }
});

export default ChatScreen;