import React, { useEffect, useState } from "react";
import * as Facebook from "expo-facebook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { auth, _auth, addUser, addDriver } from "../../config/firebase";

const Login = ({ setIsSignedIn }) => {
  // useEffect(() => {
  //   (async function () {
  //     try {
  //       const uid = await AsyncStorage.getItem("@storage_Key");
  //       if (uid !== null) {
  //         setIsSignedIn(true);
  //       }
  //     } catch ({ message }) {
  //       console.log(message);
  //     }
  //   })();
  // }, []);

  const login = async (loginType) => {
    try {
      await Facebook.initializeAsync({
        appId: "414727816635450",
      });
      const { type, token } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile", "email"],
      });
      if (type === "success") {
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );
        await auth.setPersistence(_auth.Auth.Persistence.LOCAL);
        const credential = _auth.FacebookAuthProvider.credential(token);
        const facebookProfileData = await auth.signInWithCredential(credential);
        const uid = facebookProfileData.user.uid;
        await AsyncStorage.setItem("@storage_Key", uid);
        if (loginType === "user") {
          setIsSignedIn({
            type: true,
            loginAs: "user",
          });
          await addUser().doc(uid).set({
            userId: uid,
            userName: facebookProfileData.user.displayName,
            profilePicture: facebookProfileData.user.photoURL,
          });
        } else if (loginType === "driver") {
          setIsSignedIn({
            type: true,
            loginAs: "driver",
          });
          await addDriver().doc(uid).set({
            userId: uid,
            userName: facebookProfileData.user.displayName,
            profilePicture: facebookProfileData.user.photoURL,
          });
        }
        Alert.alert("Logged in!", `Hi ${(await response.json()).name}!`);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={{
          uri: "https://www.tedxjakarta.org/wp-content/uploads/2014/09/RIDE-Logo.png",
        }}
      />
      <View style={styles.btnWrap}>
        <TouchableOpacity onPress={() => login("user")} style={styles.btn}>
          <Text style={styles.text}>Login with Facebook</Text>
          <MaterialCommunityIcons
            name="hand-pointing-left"
            size={20}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => login("driver")} style={styles.btn}>
          <Text style={styles.text}>Login as Driver</Text>
          <MaterialCommunityIcons
            name="hand-pointing-left"
            size={20}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  btnWrap: {
    width: "100%",
    paddingHorizontal: 10,
  },
  btn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    width: "100%",
    height: 40,
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#fff",
  },
  icon: {
    marginLeft: 5,
  },
});
