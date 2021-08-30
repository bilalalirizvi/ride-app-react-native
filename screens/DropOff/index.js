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
  TextInput,
} from "react-native";
import { Animated, AnimatedRegion, MarkerAnimated } from "react-native-maps";
import * as Location from "expo-location";
import { IconButton } from "react-native-paper";
import _ from "lodash";

const DropOff = ({ navigation, route: { params } }) => {
  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });
  const [venuesSearch, setVenuesSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const debouncedSearchLocation = useCallback(
    _.debounce((near) => {
      fetch(
        `https://api.foursquare.com/v2/venues/search?near=${near}&v=20210812&client_id=JG2PA3ELXNHPR3AWVFTG0GGUBD45I4R001RFCKHJNWXQH3AN&client_secret=
        G4SZBH3GERRAIJDOE14FJR20ITULNNBCHS4AYDU4E0SKQ5TR${
          region?.latitude ? `&ll=${region.latitude},${region.longitude}` : ""
        }`
      )
        .then((res) => res.json())
        .then((res) => {
          if (res?.response?.venues && res?.response?.venues[0]?.location) {
            const { lat: latitude, lng: longitude } =
              res?.response?.venues[0]?.location;
            setRegion({
              ...region,
              latitude,
              longitude,
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }, 1000),
    []
  );

  useEffect(() => {
    (async () => {
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
      // let location = await Location.getCurrentPositionAsync({});
      // const {
      //   coords: { latitude, longitude },
      // } = location;
      // setRegion({ ...region, latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    if (region.latitude !== null) {
      fetch(
        `https://api.foursquare.com/v2/venues/search?ll=${region.latitude},${region.longitude}&v=20210812&client_id=JG2PA3ELXNHPR3AWVFTG0GGUBD45I4R001RFCKHJNWXQH3AN&client_secret=
        G4SZBH3GERRAIJDOE14FJR20ITULNNBCHS4AYDU4E0SKQ5TR`
      )
        .then((res) => res.json())
        .then((res) => {
          setVenuesSearch(
            res?.response?.venues && res?.response?.venues[0]?.name
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [region]);

  useEffect(() => {
    if (searchLocation) {
      debouncedSearchLocation(searchLocation || "Karachi");
    }
  }, [searchLocation]);
  return (
    <View style={styles.container}>
      <StatusBar />
      {region.latitude !== null ? (
        <>
          <Animated
            style={styles.map}
            // initialRegion={{
            //   region: new AnimatedRegion(region),
            // }}
            region={new AnimatedRegion(region)}
          >
            <MarkerAnimated
              coordinate={new AnimatedRegion(region)}
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
              <Image
                source={{
                  uri: "https://www.iconpacks.net/icons/2/free-location-pin-icon-2964-thumb.png",
                }}
                style={{ width: 60, height: 60 }}
              />
            </MarkerAnimated>
          </Animated>

          <View style={styles.whereTo}>
            <TextInput
              placeholder="Search Location...."
              style={{
                backgroundColor: "#f1f1f1",
                width: "80%",
                paddingVertical: 2,
                paddingHorizontal: 10,
              }}
              value={searchLocation}
              onChangeText={(value) => setSearchLocation(value)}
            />
            <Text style={{ marginVertical: 5, color: "white" }}>
              Drag the marker and set your location
            </Text>
            <Text style={styles.select}>
              Selected Location: {venuesSearch?.slice(0, 20)}
            </Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("SelectCar", {
                ...params,
                dropoffLocation: {
                  ...region,
                  name: venuesSearch,
                },
              })
            }
          >
            <View style={styles.dropOff}>
              <Text style={{ color: "white", marginLeft: 15 }}>Select Car</Text>
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

export default DropOff;

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
    height: 110,
    borderRadius: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 10,
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
    width: 130,
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
