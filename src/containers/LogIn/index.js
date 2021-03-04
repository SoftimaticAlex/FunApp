import React, { Component } from "react";
import firebase from "firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  AsyncStorage,
} from "react-native";
import styles from "../constants/style";
import User from "../User";

class loginScrean extends Component {
  static navigationOption = {
    header: null,
  };
  state = {
    phone: "",
    name: "",
  };

 async componentDidMount() {
    const valuePhone = await AsyncStorage.getItem("userPhone");
    const valueUserName = await AsyncStorage.getItem("userName")
    if (valuePhone && valueUserName) {
      this.setState({ phone: valuePhone, name: valueUserName });
    }
    // AsyncStorage.getItem("userPhone").then((val) => {
    //   if (val) {
    //     this.setState({ phone: val });
    //   }
    // });
  }

  handleChange = (key) => (val) => {
    this.setState({ [key]: val });
  };

  handleSubmit = async () => {
    if (this.state.phone.length < 10) {
      Alert.alert("Error", "Wrong phone number");
      return;
    }
    if (this.state.name.length < 3) {
      Alert.alert("Error", "Enter name more than 5 Character");
      return;
    }

    AsyncStorage.getItem("userPhone").then((val) => {
      const db = firebase.database();
      if (val) {
        if (val === this.state.phone) {
          
          db.ref("/Users/" + val)
            .once("value")
            .then((res) => {
              const user = res.val();

              if (user.name === this.state.name && res) {
                User.phone = this.state.phone;
                User.name = user.name;
                User.residencia = user.residencia;
                this.props.navigation.navigate("Users");
              } else {
                db.ref("Users/" + val).set({
                  name: this.state.name,
                  residencia: user.residencia,
                  perfil: user.perfil
                });
                User.phone = this.state.phone;
                User.name = this.state.name;
                User.residencia = user.residencia;
                this.props.navigation.navigate("Users");
              }

            });
        }
        else {
          AsyncStorage.setItem("userPhone", this.state.phone);
          AsyncStorage.setItem("userName", this.state.name);
          User.phone = this.state.phone;
          db.ref("Users/" + this.state.phone).set({
            name: this.state.name,
            residencia: 1,
            perfil: 1
          });

          db.ref("/Users/" + this.state.phone)
            .once("value")
            .then((res) => {
              const user = res.val();
              User.name = user.name;
              User.residencia = user.residencia;
              this.props.navigation.navigate("Users");
            });


        }
      } else {
        AsyncStorage.setItem("userPhone", this.state.phone);
        AsyncStorage.setItem("userName", this.state.name);
        User.phone = this.state.phone;
        db.ref("Users/" + this.state.phone).set({
          name: this.state.name,
          residencia: 1,
          perfil: 1
        });

        db.ref("/Users/" + this.state.phone)
          .once("value")
          .then((res) => {
            const user = res.val();
            User.name = user.name;
            User.residencia = user.residencia;
            this.props.navigation.navigate("Users");
          });

      }
    });


  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>CHATING APP</Text>
        <TextInput
          keyboardType="number-pad"
          placeholder="Phone number"
          style={styles.input}
          onChangeText={this.handleChange("phone")}
          value={this.state.phone}
        />
        <TextInput
          placeholder="Name"
          style={styles.input}
          onChangeText={this.handleChange("name")}
          value={this.state.name}
        />
        <TouchableOpacity onPress={this.handleSubmit}>
          <Text style={styles.btnTextSubmit}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default loginScrean;
