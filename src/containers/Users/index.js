/* eslint-disable react-native/no-inline-styles */
import React, { Component } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  FlatList,
  AsyncStorage,
  View,
  StyleSheet,
  Button,
} from "react-native";

import firebase from "firebase";
import User from "../User";
{/* <Button
onPress={() =>
  this.props.navigation.navigate({
    routeName: "Contacts",
  })
}
title="Contactos"
color="#841584"
accessibilityLabel="Learn more about this purple button"
/> */}

export default class HomeScreen extends Component {
  _isMounted = false;

  _logOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate({
      routeName: "LogIn"
    });
  };

  static navigationOptions = ({ navigation, route }) => ({
    title: "Chats",
    headerLeft: <TouchableOpacity onPress={this._logOut}>
      <Text>  LogOut  </Text>
    </TouchableOpacity>,
    headerRight:
      <TouchableOpacity onPress={() => navigation.navigate({
        routeName: "Contacts",
      })}>
        <Text>Nuevo Chat +  </Text>
      </TouchableOpacity>
    ,
  });

  constructor(props) {
    super(props);
    User.actual = 'users';
    this.state = state = {
      users: [],
      usersToFilter: [],
      ids: [],
    };
    console.log(User);
  }




  validateUsersExistence = () => {
    if (this.state.users.length === 0) return false;
    return true;
  };

  validateUser = (key) => {
    return this.state.usersToFilter.filter((c) => c.phone === key).length > 0;
  };

  getUserData = (key) => {
    return this.state.users.filter((c) => c.phone === key)[0];
  };

  test = async () => {
    return await firebase
      .database()
      .ref("messages")
      .child(User.phone)
      .on("child_added", (res) => {
        if (this.validateUsersExistence()) {
          const person = this.getUserData(res.key);
          if (this.validateUser(res.key)) return;
          const el = this;
          firebase.database().ref('messages')
            .child(User.phone)
            .child(res.key).limitToLast(1).once('value')
            .then(function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                const data = childSnapshot.val();
                person.lastMessage = data.message;
                person.read = data.read;
                person.countUnreadMessage = 0;
                if (person) {
                  el.setState((prevState) => {
                    return {
                      ids: [...prevState.ids, res.key],
                      users: [...el.state.users],
                      usersToFilter: [...el.state.usersToFilter, person],
                    };
                  });
                }
              })
            });
        } else {
          if (this._isMounted) {
            this.setState((prevState) => {
              return {
                ids: [...prevState.ids, res.key],
                users: [...this.state.users],
                usersToFilter: [...this.state.usersToFilter],
              };
            });
          }
        }
      });
  };



  usersToFilterHanlder = (person) => {
    const ids = this.state.ids;
    if (!ids.includes(person.phone)) return;
    if (this._isMounted) {
      this.setState((prevState) => {
        return {
          ids: [...this.state.ids],
          users: [...this.state.users],
          usersToFilter: [...this.state.usersToFilter, person],
        };
      });
    }
  };

  componentDidMount() {
    this._isMounted = true;
    this.test().then((res) => {
      firebase
        .database()
        .ref("Users")
        .on("child_added", (val) => {
          const el = this;

          let person = val.val();
          if (person.perfil === 1)
            if (person.residencia != User.residencia) return;

          person.phone = val.key;

          firebase.database().ref('messages')
            .child(User.phone)
            .child(val.key).limitToLast(1).once('value')
            .then(function (snapshot) {

              snapshot.forEach(function (childSnapshot) {
                const data = childSnapshot.val();
                person.lastMessage = data.message;
                person.read = data.read;
                person.countUnreadMessage = 0;
              });

            })
            .finally(fn => {
              
              el.usersToFilterHanlder(person);
              if (person.phone === User.phone) {
                User.name = person.name;
              } else {
                if (el._isMounted) {
                  el.setState((prevState) => {
                    return {
                      users: [...prevState.users, person],
                    };
                  });
                }
              }
            }).then(res => {
              firebase.database().ref('messages')
                .child(User.phone)
                .child(val.key).on('child_added', res => {
                  const data = res.val();
                  const users = this.state.usersToFilter;

                  const user = users.findIndex(c => c.phone === data.from);
                  if (user >= 0) {
                    if (!data.read) {
                      console.log('added', data)
                      users[user].countUnreadMessage += 1;
                      users[user].lastMessage = data.message;
                      users[user].read = data.read;
                      if (this._isMounted) {
                        this.setState((prevState) => {
                          return {
                            usersToFilter: [...users],
                          };
                        });
                      }
                    }
                  }
                });
            }).then(res => {
              firebase.database().ref('messages')
                .child(User.phone)
                .child(val.key).on('child_changed', res => {
                  const data = res.val();
                  const users = this.state.usersToFilter;
                  const user = users.findIndex(c => c.phone === data.from);
                  if (user >= 0) {
                    console.log(data)
                    if (data.read) {
                      users[user].countUnreadMessage = 0;
                    } else {
                      users[user].countUnreadMessage += 1;
                    }
                    users[user].read = data.read;
                    if (this._isMounted) {
                      this.setState((prevState) => {
                        return {
                          usersToFilter: [...users],
                        };
                      });
                    }
                  }
                });
            });
        });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }



  renderRow = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate({
            routeName: "IndividualChat",
            params: item,
          })
        }
        style={{ padding: 10, borderBottomColor: "#ccc", borderBottomWidth: 1 }}
      >
        <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text style={{ fontSize: 20 }}>{item.name}</Text>
          {item.read ? <Text>
            <Image
              source={require('../images/doble_blue_check.png')}
              style={{ width: 15, height: 15, marginRight: 0, marginLeft: 0 }}
            />{item.lastMessage}</Text> : <Text style={{ color: 'gray' }}><Image
              source={require('../images/check_blue.png')}
              style={{ width: 15, height: 15, marginRight: 5, marginLeft: 5 }}
            />{item.lastMessage}</Text>}
          <Text>{item.countUnreadMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    if (!User.phone) {
      this.props.navigation.navigate("Auth");
    }
    return (
      <SafeAreaView>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate({
              routeName: "Chat"
            })
          }
          style={{ padding: 10, borderBottomColor: "#ccc", borderBottomWidth: 1 }}
        >
          <Text style={{ fontSize: 20 }}>CHAT GRUPAL</Text>
        </TouchableOpacity>
        <FlatList
          data={this.state.usersToFilter}
          renderItem={this.renderRow}
          keyExtractor={(item) => item.phone}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  position: {
    display: "flex",
    flexDirection: "row-reverse",
  },
});
