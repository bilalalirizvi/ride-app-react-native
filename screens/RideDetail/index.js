import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import carMarker from "../../assets/carMarker.png";
import marker from "../../assets/marker.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  driverDb,
  currentRide,
  rideStart,
  rideEnd,
} from "../../config/firebase";
import { calcCrow } from "../SelectCar";

// Recursion
// Hacker Rank

const RideDetail = (props) => {
  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [coordinates, setCoordinates] = useState([]);
  const [inRange, setInRange] = useState(false);

  let mapRef = useRef(null);

  useEffect(() => {
    if (
      !inRange &&
      region.latitude !== null &&
      coordinates[0]?.latitude &&
      coordinates[0]?.longitude &&
      calcCrow(
        region.latitude,
        region.longitude,
        coordinates[0].latitude,
        coordinates[0].longitude
      ) < 0.1
    ) {
      setInRange(true);
    }
  }, [region, coordinates]);

  useEffect(() => {
    (async () => {
      const uid = await AsyncStorage.getItem("@storage_Key");
      try {
        if (uid) {
          driverDb()
            .doc(uid)
            .onSnapshot((doc) => {
              const data = doc.data();
              setRegion({
                ...region,
                latitude: data.lat,
                longitude: data.lng,
              });
            });
        }
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await currentRide()
          .doc(props.route.params)
          .onSnapshot((doc) => {
            const data = { ...doc.data() };
            setCoordinates([
              {
                latitude: data?.pickupLocation?.latitude,
                longitude: data?.pickupLocation?.longitude,
              },
              {
                latitude: data.lat,
                longitude: data.lng,
              },
              { car: data.selectedCar },
              {
                detail: {
                  dropOffName: data.locationName,
                  pickupName: data.pickupLocation.locationName,
                  distance: data.rideDistance,
                },
              },
            ]);
          });
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  const startRide = async () => {
    try {
      const uid = await AsyncStorage.getItem("@storage_Key");
      await rideStart(uid, "start");
      setInRange(false);
    } catch ({ message }) {
      console.log(message);
    }
  };
  const fare = {
    Mini: 25,
    Go: 45,
    Business: 60,
  };
  const endRide = async () => {
    try {
      const totalDistance = calcCrow(
        region.latitude,
        region.longitude,
        coordinates[0].latitude,
        coordinates[0].longitude
      );
      let _fare = fare[coordinates[2].car] * totalDistance;
      const uid = await AsyncStorage.getItem("@storage_Key");
      await rideEnd(uid, "end", totalDistance, _fare);
      Alert.alert(
        "Total Fare",
        `Distance Km ${totalDistance.toFixed(2)} Total Fare Pkr ${_fare.toFixed(
          2
        )}`
      );
      props.navigation.navigate("Driver");
    } catch ({ message }) {
      console.log(message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      {/* <View style={styles.header}>
        <Text style={{ fontSize: 18 }}>Ride Detail</Text>
      </View> */}

      <View style={styles.mapContainer}>
        {region.latitude !== null ? (
          <>
            <MapView
              style={styles.map}
              region={region}
              ref={(map) => {
                mapRef = map;
              }}
              onMapReady={() => {
                mapRef.fitToSuppliedMarkers(["mk1", "mk2", "mk3"], {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                });
              }}
            >
              <Marker
                coordinate={region}
                title="Driver"
                description=""
                identifier={"mk3"}
              >
                <Image source={carMarker} style={{ width: 50, height: 33 }} />
              </Marker>
              {coordinates.length > 0 && (
                <>
                  {inRange && (
                    <Marker
                      coordinate={coordinates[0]}
                      title="PickUp"
                      description=""
                      identifier={"mk2"}
                    >
                      <Image
                        source={marker}
                        style={{ width: 47, height: 40 }}
                      />
                    </Marker>
                  )}
                  <Marker
                    coordinate={coordinates[1]}
                    title="DropOff"
                    description=""
                    identifier={"mk1"}
                  >
                    <Image source={marker} style={{ width: 47, height: 40 }} />
                  </Marker>
                </>
              )}
            </MapView>
            <View style={styles.rideInfo}>
              <View>
                <Text>Pickup Location: {coordinates[3].detail.pickupName}</Text>
              </View>
              <View>
                <Text>
                  DropOff Location: {coordinates[3].detail.dropOffName}
                </Text>
              </View>
              <View>
                <Text>
                  Distance Km: {coordinates[3].detail.distance.toFixed(2)}
                </Text>
              </View>
            </View>
            {inRange && (
              <TouchableWithoutFeedback onPress={startRide}>
                <View style={styles.startRide}>
                  <Text style={{ color: "white" }}>Start Ride</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
            <TouchableWithoutFeedback
              onPress={() => {
                endRide();
              }}
            >
              <View style={styles.endRide}>
                <Text style={{ color: "white" }}>End Ride</Text>
              </View>
            </TouchableWithoutFeedback>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="black" />
            <Text style={{ marginTop: 10 }}>Loading Map....</Text>
          </>
        )}
      </View>
    </View>
  );
};

export default RideDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  rideInfo: {
    flex: 1,
    width: "100%",
    height: 80,
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  mapContainer: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  startRide: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    bottom: 20,
    left: 20,
    borderRadius: 30,
    height: 50,
    width: 110,
    backgroundColor: "black",
  },
  endRide: {
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
});
