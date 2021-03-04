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

export default class HomeScreen extends Component {
  static navigationOptions = ({ navigation, route }) => ({
    title: "Chats",
    headerLeft: null,
    headerRight:
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Image
          source={require("../images/user.png")}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ width: 32, height: 32, marginRight: 10 }}
        />
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
    console.log(this.state.users);
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

          if (person) {
            this.setState((prevState) => {
              return {
                ids: [...prevState.ids, res.key],
                users: [...this.state.users],
                usersToFilter: [...this.state.usersToFilter, person],
              };
            });
          }
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
    console.log(User);
    this.test().then((res) => {
      firebase
        .database()
        .ref("Users")
        .on("child_added", (val) => {
          let person = val.val();

          if (person.perfil === 1)
            if (person.residencia != User.residencia) return;

          person.phone = val.key;
          this.usersToFilterHanlder(person);
          if (person.phone === User.phone) {
            User.name = person.name;
          } else {
            this.setState((prevState) => {
              return {
                users: [...prevState.users, person],
              };
            });
          }
        });

      firebase
        .database()
        .ref("Users")
        .on("child_changed", (val) => {
          let person = val.val();
          if (person.residencia != User.residencia) return;
          person.phone = val.key;
          this.usersToFilterHanlder(person);
          if (person.phone === User.phone) {
            User.name = person.name;
          } else {
            this.setState((prevState) => {
              return {
                users: [...prevState.users, person],
              };
            });
          }
        });
    });
  }

  _logOut = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate("Auth");
  };

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
        <Text style={{ fontSize: 20 }}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    if (!User.phone) {
      this.props.navigation.navigate("Auth");
    }

    return (
      <SafeAreaView>
        <View style={styles.position}>
          <Button
            onPress={() =>
              this.props.navigation.navigate({
                routeName: "Contacts",
              })
            }
            title="Contactos"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
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
