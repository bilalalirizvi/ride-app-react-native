import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  View,
  Text,
  StatusBar,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MenuDrawer from "react-native-side-drawer";
import { IconButton, Avatar } from "react-native-paper";
import carMarker from "../../assets/carMarker.png";
import {
  auth,
  driverInfo,
  driverDb,
  rejectRequest,
  acceptRequest,
  getDriver,
} from "../../config/firebase";
import { geohashForLocation } from "geofire-common";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Driver = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [driverData, setDriverData] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const docId = await AsyncStorage.getItem("@storage_Key");
        const doc = await getDriver().doc(docId).get();
        setDriverData({ ...doc.data() });
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  useEffect(() => {
    if (errorMsg) {
      Alert.alert(errorMsg);
    }
  }, [errorMsg]);

  useEffect(() => {
    listenToRequests();
  }, []);

  const listenToRequests = useCallback(async () => {
    let id;
    await auth.onAuthStateChanged((driver) => {
      if (driver !== null) {
        id = driver.uid;
      }
    });
    await driverDb()
      .doc(id)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data?.currentRequest?.type === "request" && !alreadyRequested) {
          setAlreadyRequested(true);
          Alert.alert(
            "Ride Request",
            `${data?.currentRequest?.userName} request a ride`,
            [
              {
                text: "Accept",
                onPress: () => {
                  setAlreadyRequested(false);
                  acceptRequest(id, "accepted");
                  navigation.navigate("RideDetail", data.currentRequest.userId);
                },
                style: "Ok",
              },
              {
                text: "Reject",
                onPress: () => {
                  setAlreadyRequested(false);
                  rejectRequest(id);
                },
                style: "cancel",
              },
            ],
            {
              cancelable: false,
              //   onDismiss: () =>
              //     Alert.alert(
              //       "This alert was dismissed  by tapping outside of the alert dialog"
              //     ),
            }
          );
        }
      });
  }, [alreadyRequested, setAlreadyRequested]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        await Location.watchPositionAsync(
          { distanceInterval: 1, timeInterval: 0 },
          ({ coords }) => {
            const { latitude, longitude } = coords;
            setRegion({ ...region, latitude, longitude });
            const lat = latitude;
            const lng = longitude;
            auth.onAuthStateChanged((driver) => {
              if (driver !== null) {
                (async () => {
                  try {
                    const _ref = await driverInfo().doc(driver.uid);
                    const check = await _ref.get();
                    const hash = geohashForLocation([lat, lng]);
                    if (check.data()) {
                      await _ref.update({
                        geohash: hash,
                        lat,
                        lng,
                        name: driver.displayName,
                      });
                    } else {
                      _ref.set({
                        geohash: hash,
                        lat,
                        lng,
                        name: driver.displayName,
                      });
                    }
                  } catch ({ message }) {
                    console.log(message);
                  }
                })();
              }
            });
          }
        );
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <MenuDrawer
        style={{ zIndex: 1 }}
        open={menuOpen}
        drawerContent={
          <View
            style={{
              backgroundColor: "white",
              flex: 1,
            }}
          >
            <View
              style={{ width: "100%", height: 260, backgroundColor: "black" }}
            >
              <View
                style={{
                  alignSelf: "flex-end",
                }}
              >
                <IconButton
                  icon="close"
                  size={16}
                  color="white"
                  onPress={() => setMenuOpen(false)}
                />
              </View>
              <View style={styles.avatar}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    navigation.navigate("Profile");
                    setMenuOpen(false);
                  }}
                >
                  <Avatar.Image
                    size={65}
                    source={{ uri: driverData?.profilePicture }}
                  />
                </TouchableWithoutFeedback>
                <Text style={styles.avatarText}>{driverData?.userName}</Text>
              </View>
              {/* <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Messages");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.message}>
                  <Text style={{ fontSize: 17, color: "white" }}>Messages</Text>
                  <IconButton icon="chevron-right" size={25} color="white" />
                </View>
              </TouchableOpacity> */}
              {/* <View style={styles.makeMoneyDrivingWrap}>
                <View style={styles.makeMoneyDriving}>
                  <Text style={{ fontSize: 14, color: "rgb(130,130,130)" }}>
                    Do more with your account
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.makeMoneyDriving}
                  onPress={() => {
                    navigation.navigate("MakeMoneyDriving");
                    setMenuOpen(false);
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, color: "white" }}>
                      Make money driving
                    </Text>
                  </View>
                </TouchableOpacity>
              </View> */}
            </View>
            {/* Drawer Bottom Body */}
            <View style={{ flex: 1, marginTop: 15 }}>
              {/* <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Your Trips");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Your Trips</Text>
                </View>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Help");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Help</Text>
                </View>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Wallet");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Wallet</Text>
                </View>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Settings");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Settings</Text>
                </View>
              </TouchableOpacity> */}
              {/* <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  // navigation.navigate("Settings");
                  Facebook.logOutAsync();
                  // setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Logout</Text>
                </View>
              </TouchableOpacity> */}
            </View>
            <View style={styles.footer}>
              <Text>Legal</Text>
              <Text>v4.380.10004</Text>
            </View>
          </View>
        }
        drawerPercentage={80}
        animationTime={250}
        overlay={true}
        opacity={0.4}
      ></MenuDrawer>
      {region.latitude !== null ? (
        <>
          <MapView style={styles.map} region={region}>
            <Marker coordinate={region} title="Driver" description="My Self">
              <Image source={carMarker} style={{ width: 50, height: 33 }} />
            </Marker>
          </MapView>
          <View style={styles.header}>
            <IconButton icon="menu" onPress={() => setMenuOpen(true)} />
            <Text style={{ fontSize: 18 }}>Driver</Text>
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="black" />
      )}
    </View>
  );
};

export default Driver;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 0,
  },
  whereTo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    height: 80,
    borderRadius: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 60,
    right: "auto",
  },
  select: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 2,
  },
  dropOff: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
    height: 50,
    width: 110,
    backgroundColor: "black",
  },
  avatar: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
  },
  avatarText: {
    fontSize: 19,
    color: "white",
    marginLeft: 10,
  },
  message: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
    paddingLeft: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: "rgb(90,90,90)",
    borderTopWidth: 0.3,
    borderTopColor: "rgb(90,90,90)",
  },
  makeMoneyDrivingWrap: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  makeMoneyDriving: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "center",
  },
  touchableButton: {
    flex: 0.11,
  },
  touchableButtonView: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "center",
  },
  touchableButtonText: {
    fontSize: 20,
  },
  footer: {
    flex: 0.12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
    borderTopWidth: 1,
    borderTopColor: "rgb(220,220,220)",
  },
});
