import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MenuDrawer from "react-native-side-drawer";
import { IconButton, Avatar } from "react-native-paper";
import marker from "../../assets/marker.png";
import { getUser } from "../../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import axios from "axios";

const HomeScreen = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

  const [venuesSearch, setVenuesSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [errorMessage, setErrorMsg] = useState("");
  const [userData, setUserData] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const docId = await AsyncStorage.getItem("@storage_Key");
        const doc = await getUser().doc(docId).get();
        setUserData({ ...doc.data() });
      } catch ({ message }) {
        console.error(message);
      }
    })();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert(errorMessage);
    }
  }, [errorMessage]);

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
          }
        );
        // let location = await Location.getCurrentPositionAsync({
        //   // accuracy: Location.Accuracy.Highest,
        //   enableHighAccuracy: true,
        // });
        // const {
        //   coords: { latitude, longitude },
        // } = location;
        // setRegion({ ...region, latitude, longitude });
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  useEffect(() => {
    if (region.latitude !== null) {
      // LOCATION IQ API
      // https://api.locationiq.com/v1/autocomplete.php?key=pk.6999cb096a986396ee23f894287fd7de&q=Empire'

      fetch(
        `https://api.foursquare.com/v2/venues/search?client_id=JG2PA3ELXNHPR3AWVFTG0GGUBD45I4R001RFCKHJNWXQH3AN&client_secret=G4SZBH3GERRAIJDOE14FJR20ITULNNBCHS4AYDU4E0SKQ5TR&ll=${region?.latitude},${region?.longitude}&v=20210813`
      )
        .then((res) => res.json())
        .then((res) => {
          setVenuesSearch(res?.response?.venues && res?.response?.venues[0]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return () => {};
  }, [region]);

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
                    source={{ uri: userData?.profilePicture }}
                  />
                </TouchableWithoutFeedback>
                <Text style={styles.avatarText}>{userData?.userName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Messages");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.message}>
                  <Text style={{ fontSize: 17, color: "white" }}>Messages</Text>
                  <IconButton icon="chevron-right" size={25} color="white" />
                </View>
              </TouchableOpacity>
              <View style={styles.makeMoneyDrivingWrap}>
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
              </View>
            </View>
            <View style={{ flex: 1, marginTop: 15 }}>
              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Your Trips");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Your Trips</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Help");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Help</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Wallet");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Wallet</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => {
                  navigation.navigate("Settings");
                  setMenuOpen(false);
                }}
              >
                <View style={styles.touchableButtonView}>
                  <Text style={styles.touchableButtonText}>Settings</Text>
                </View>
              </TouchableOpacity>
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
            <Marker
              coordinate={region}
              title="Me"
              description="My Self"
              draggable={true}
              onDragEnd={(e) =>
                setRegion({
                  ...region,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                })
              }
            >
              <Image source={marker} style={{ width: 60, height: 60 }} />
            </Marker>
          </MapView>
          <View style={styles.header}>
            <IconButton icon="menu" onPress={() => setMenuOpen(true)} />
            <Text style={{ fontSize: 18 }}>Where to?</Text>
          </View>
          <View style={styles.whereTo}>
            <Text style={{ color: "white", marginBottom: 10 }}>
              Drag the marker and set your location
            </Text>
            <Text style={styles.select}>
              Selected Location: {venuesSearch?.name?.slice(0, 20)}
            </Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("DropOff", {
                pickupLocation: {
                  ...region,
                  name: venuesSearch?.name,
                },
              })
            }
          >
            <View style={styles.dropOff}>
              <Text style={{ color: "white", marginLeft: 15 }}>Drop Off</Text>
              <IconButton icon="chevron-right" size={18} color="white" />
            </View>
          </TouchableWithoutFeedback>
        </>
      ) : (
        <ActivityIndicator size="large" color="black" />
      )}
    </View>
  );
};

export default HomeScreen;

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
