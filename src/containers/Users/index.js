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

  state = {
    users: [],
    usersToFilter: [],
    ids: [],
  };

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
            .child(res.key)
            .child(User.phone).limitToLast(1).once('value')
            .then(function (snapshot) {

              snapshot.forEach(function (childSnapshot) {
                const data = childSnapshot.val();
                person.lastMessage = data.message;
                person.read = data.read;

                if (person) {
                  el.setState((prevState) => {
                    return {
                      ids: [...prevState.ids, res.key],
                      users: [...el.state.users],
                      usersToFilter: [...el.state.usersToFilter, person],
                    };
                  });
                }

              });
            })

        } else {
          this.setState((prevState) => {
            return {
              ids: [...prevState.ids, res.key],
              users: [...this.state.users],
              usersToFilter: [...this.state.usersToFilter],
            };
          });
        }
      });
  };



  usersToFilterHanlder = (person) => {
    const ids = this.state.ids;
    if (!ids.includes(person.phone)) return;
    this.setState((prevState) => {
      return {
        ids: [...this.state.ids],
        users: [...this.state.users],
        usersToFilter: [...this.state.usersToFilter, person],
      };
    });
  };

  componentDidMount() {
    
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
            .child(val.key)
            .child(User.phone).limitToLast(1).once('value')
            .then(function (snapshot) {

              snapshot.forEach(function (childSnapshot) {
                const data = childSnapshot.val();
                person.lastMessage = data.message;
                person.read = data.read;
              });

            })
            .finally(fn => {
              
              el.usersToFilterHanlder(person);
              if (person.phone === User.phone) {
                User.name = person.name;
              } else {

                el.setState((prevState) => {
                  return {
                    users: [...prevState.users, person],
                  };
                });
              }
            });


        });
    });
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
