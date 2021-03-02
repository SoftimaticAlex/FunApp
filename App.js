import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Home from "./src/containers/Home";
import Chat from "./src/containers/Chat";
import LogIn from "./src/containers/LogIn";
import Users from "./src/containers/Users";
import Contacts from "./src/containers/Contacts";
import IndividualChat from "./src/containers/IndividualChat";

const AppNavigator = createStackNavigator(
  {
    Home: { screen: Home },
    Chat: { screen: Chat },
    LogIn: { screen: LogIn },
    Users: { screen: Users, options: Users.navigationOptions },
    Contacts: { screen: Contacts },
    IndividualChat: {
      screen: IndividualChat,
      options: IndividualChat.navigationOptions,
    },
  },
  {
    initialRouteName: "LogIn",
    headerMode: "none",
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}
