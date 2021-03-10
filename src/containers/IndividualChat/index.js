/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
    Button
} from 'react-native';
import firebase from 'firebase';
import styles from '../constants/style';
import User from '../User';

import ImagePicker from 'react-native-image-picker';

export default class ChatScreen extends Component {
    static navigationOptions = ({ navigation }) => {

        return {
            title: navigation.state.params.name,
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            person: {
                name: props.navigation.state.params.name,
                phone: props.navigation.state.params.phone,
            },
            textMessage: '',
            messageList: [],
        };
    }


    componentDidMount() {
        console.log(User)
        firebase
            .database()
            .ref('messages')
            .child(User.phone)
            .child(this.state.person.phone)
            .on('child_added', value => {
                const data = value.val();
                if (data.from !== User.phone) {
                    data.read = true;
                    firebase.database().ref('messages').child(User.phone).child(data.from).child(value.key).set({
                        from: data.from,
                        message: data.message,
                        time: data.time,
                        read: true
                    });
                }

                this.setState(prevState => {
                    return {
                        messageList: [...prevState.messageList, data],
                    };
                });
            });
        // firebase
        //     .database()
        //     .ref('messages')
        //     .child(User.phone)
        //     .child(this.state.person.phone)
        //     .on('child_changed', value => {
                
        //         const data = value.val();
        //         if (data.from !== User.phone) {
        //             data.read = true;
        //             firebase.database().ref('messages').child(User.phone).child(data.from).child(value.key).set({
        //                 from: data.from,
        //                 message: data.message,
        //                 time: data.time,
        //                 read: true
        //             });
        //         }

        //         this.setState(prevState => {
        //             return {
        //                 messageList: [...prevState.messageList, data],
        //             };
        //         });
        //     });
    }

    handleChange = key => val => {
        this.setState({ [key]: val });
    };

    convertTime = time => {
        let d = new Date(time);
        let c = new Date();
        let result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':';
        result += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        if (c.getDay() !== d.getDay()) {
            result = d.getDay() + ' ' + d.getMonth() + ' ' + result;
        }
        return result;
    };

    sendMessage = async () => {
        if (this.state.textMessage.length > 0) {
            let msgId = firebase
                .database()
                .ref('messages')
                .child(User.phone)
                .child(this.state.person.phone)
                .push().key;

            let updates = {};

            let message = {
                message: this.state.textMessage,
                time: firebase.database.ServerValue.TIMESTAMP,
                from: User.phone,
                read: false
            };

            updates[
                'messages/' + User.phone + '/' + this.state.person.phone + '/' + msgId
            ] = { ...message, read: true };

            updates[
                'messages/' + this.state.person.phone + '/' + User.phone + '/' + msgId
            ] = message;

            firebase
                .database()
                .ref()
                .update(updates);
            this.setState({ textMessage: '' });
        }
    };

    renderRow = ({ item }) => {
        console.log(item);
        return (
            <View
                style={{
                    flexDirection: 'row',
                    width: '70%',
                    alignSelf: item.from === User.phone ? 'flex-end' : 'flex-start',
                    backgroundColor: item.from === User.phone ? '#00A398' : '#7cb342',
                    borderRadius: 10,
                    marginBottom: 10,
                }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'space-between', width: '100%' }}>
                    <Text style={{ color: '#fff', padding: 7, fontSize: 16 }}>
                        {item.message}
                    </Text>
                    <Text style={{ color: '#eee', padding: 7, fontSize: 12 }}>
                        {this.convertTime(item.time)}
                    </Text>
                    {item.read ? <Text>
                        <Image
                            source={require('../images/doble_blue_check.png')}
                            style={{ width: 15, height: 15, marginRight: 0, marginLeft: 0 }}
                        />{item.lastMessage}</Text> : <Text style={{ color: 'gray' }}><Image
                            source={require('../images/check_blue.png')}
                            style={{ width: 15, height: 15, marginRight: 5, marginLeft: 5 }}
                        />{item.lastMessage}</Text>}
                </View>

            </View>
        );
    };

    chooseFile = () => {
        let options = {
            title: 'Select Image',
            customButtons: [
                {
                    name: 'customOptionKey',
                    title: 'Choose Photo from Custom Option'
                },
            ],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        console.log(ImagePicker.showImagePicker)
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log(
                    'User tapped custom button: ',
                    response.customButton
                );
                alert(response.customButton);
            } else {
                let source = response;
                // You can also display the image using data:
                // let source = {
                //   uri: 'data:image/jpeg;base64,' + response.data
                // };
                console.log(sourde);
            }
        });
    };


    render() {
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView>
                <FlatList
                    style={{ padding: 10, height: height * 0.8 }}
                    data={this.state.messageList}
                    renderItem={this.renderRow}
                    keyExtractor={(item, index) => index.toString()}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginHorizontal: 5,
                    }}>
                    {/* <Button title="Choose photo" onPress={this.chooseFile} /> */}
                    <TextInput
                        style={styles.input}
                        value={this.state.textMessage}
                        placeholder="type message here..."
                        onChangeText={this.handleChange('textMessage')}
                    />
                    <TouchableOpacity
                        onPress={this.sendMessage}
                        style={{ paddingBottom: 10, marginLeft: 5 }}>
                        <Image
                            source={require('../images/send-button.png')}
                            style={{ width: 32, height: 32, marginRight: 5, marginLeft: 5 }}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
}
