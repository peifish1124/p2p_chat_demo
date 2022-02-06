import React from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const GoBackBtn = (props) => {
    return(
        <TouchableOpacity style={styles.goBack} onPress={props.onPress}>
            <FontAwesome name="chevron-left" style={styles.goBackBtn} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    goBack: {
        padding: 10,
        position: 'absolute',
        top: 72,
        left: 20,
    },
    goBackBtn: {
        color: '#9ACBFF',
        fontSize: 24
    }
});

export default GoBackBtn;