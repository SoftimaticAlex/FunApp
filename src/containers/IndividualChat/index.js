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


export default class ChatScreen extends Component {
    static defaultNavigationOptions = ({ navigation }) => {
        console.log(navigation);
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
                this.setState(prevState => {
                    return {
                        messageList: [...prevState.messageList, value.val()],
                    };
                });
            });
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
            };
            updates[
                'messages/' + User.phone + '/' + this.state.person.phone + '/' + msgId
            ] = message;
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
                <Text style={{ color: '#fff', padding: 7, fontSize: 16 }}>
                    {item.message}
                </Text>
                <Text style={{ color: '#eee', padding: 3, fontSize: 12 }}>
                    {this.convertTime(item.time)}
                </Text>
            </View>
        );
    };

    handleChoosePhoto = () => {
        this.setState({loading: true});
    
        const options = {
          noData: true,
        };
        ImagePicker.launchImageLibrary(options, response => {
          console.log('Response = ', response);
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            // Create a root reference
            const storage = firebase.storage();
            const storageRef = storage.ref('images/').child('image');
    
            let uri = response.uri;
            let mime = 'image/jpg';
            const uploadUri =
              Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            let uploadBlob = null;
            const imageRef = storageRef;
            fs.readFile(uploadUri, 'base64')
              .then(data => {
                return Blob.build(data, {type: `${mime};BASE64`});
              })
              .then(blob => {
                uploadBlob = blob;
                return imageRef.put(blob, {contentType: mime});
              })
              .then(() => {
                uploadBlob.close();
                return imageRef.getDownloadURL();
              })
              .then(url => {
                console.log(url);
                User.image = url;
                if (User.image !== this.state.image) {
                  firebase
                    .database()
                    .ref('users')
                    .child(User.phone)
                    .set({name: User.name, image: url});
                }
              })
              .catch(error => {
                console.log(error.message);
              });
            this.setState({
              image: response,
            });
            User.image = response;
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
                    <Button title="Choose photo" onPress={this.handleChoosePhoto} />
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
