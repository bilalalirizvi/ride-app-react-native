import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import marker from "../../assets/marker.png";
import minicar from "../../assets/minicar.png";
import go from "../../assets/go.png";
import business from "../../assets/business.png";
import { addRide } from "../../config/firebase/index";
import { auth } from "../../config/firebase";
import { geohashForLocation } from "geofire-common";

export function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

const SelectCar = ({ navigation, route: { params } }) => {
  let mapRef = useRef(null);

  const coordinates = [
    {
      latitude: params.pickupLocation.latitude,
      longitude: params.pickupLocation.longitude,
    },
    {
      latitude: params.dropoffLocation.latitude,
      longitude: params.dropoffLocation.longitude,
    },
  ];
  const [spin, setSpin] = useState(false);
  const [distance, setDistance] = useState(0);
  const [selectedCar, setSelectedCar] = useState({
    type: 0,
    name: "Mini",
  });

  useEffect(() => {
    const {
      dropoffLocation: { latitude: lat0, longitude: lng0 },
      pickupLocation: { latitude: lat1, longitude: lng1 },
    } = params;
    setDistance(calcCrow(lat0, lng0, lat1, lng1));
  }, [params]);

  const addRideInDb = async () => {
    const lat = params.dropoffLocation.latitude;
    const lng = params.dropoffLocation.longitude;
    setSpin(true);
    try {
      let uid;
      await auth.onAuthStateChanged((user) => {
        if (user !== null) {
          uid = user.uid;
        }
      });
      const hash = geohashForLocation([lat, lng]);
      const add = await addRide().doc(uid);
      const get = await add.get();
      if (get.data()) {
        add.update({
          geohash: hash,
          lat,
          lng,
          selectedCar: selectedCar.name,
          userId: uid,
          locationName: params.dropoffLocation.name || "?",
          pickupLocation: {
            latitude: params.pickupLocation.latitude,
            longitude: params.pickupLocation.longitude,
            locationName: params.pickupLocation.name || "?",
          },
          rideDistance: calcCrow(
            lat,
            lng,
            params.pickupLocation.latitude,
            params.pickupLocation.longitude
          ),
        });
      } else {
        add.set({
          geohash: hash,
          lat,
          lng,
          selectedCar: selectedCar.name,
          userId: uid,
          locationName: params.dropoffLocation.name || "?",
          pickupLocation: {
            latitude: params.pickupLocation.latitude,
            longitude: params.pickupLocation.longitude,
            locationName: params.pickupLocation.name || "?",
          },
        });
      }
      setSpin(false);
      navigation.navigate("FindingRide", params.pickupLocation);
    } catch ({ message }) {
      console.log(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.directionMap}>
        <MapView
          ref={(map) => {
            mapRef = map;
          }}
          style={styles.map}
          onMapReady={() => {
            mapRef.fitToSuppliedMarkers(["mk1", "mk2"], {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            });
          }}
        >
          <Marker coordinate={coordinates[0]} identifier={"mk1"}>
            <Image source={marker} style={{ width: 60, height: 60 }} />
          </Marker>
          <Marker coordinate={coordinates[1]} identifier={"mk2"}>
            <Image source={marker} style={{ width: 60, height: 60 }} />
          </Marker>
        </MapView>
      </View>
      <View style={styles.detail}>
        <View>
          <Text>PickUp Location: {params?.pickupLocation?.name || "?"}</Text>
        </View>
        <View>
          <Text>DropOff Location: {params?.dropoffLocation?.name || "?"}</Text>
        </View>
        <View>
          <Text>Distance: {distance.toFixed(2)} km</Text>
        </View>
      </View>
      <View style={styles.carButton}>
        <TouchableWithoutFeedback
          onPress={() =>
            setSelectedCar({
              type: 0,
              name: "Mini",
            })
          }
        >
          <View
            style={{
              ...styles.dropOff,
              backgroundColor:
                selectedCar.type === 0 ? "orange" : "rgb(240,240,240)",
            }}
          >
            <View
              style={{
                width: 90,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={go}
                resizeMode={"center"}
                style={{ width: 70, height: 40 }}
              />
            </View>
            <Text style={{ color: "black", flex: 1, fontSize: 20 }}>Mini</Text>
            <Text style={{ color: "black" }}>
              Rs.{Math.trunc(distance * 25)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() =>
            setSelectedCar({
              type: 1,
              name: "Go",
            })
          }
        >
          <View
            style={{
              ...styles.dropOff,
              backgroundColor:
                selectedCar.type === 1 ? "orange" : "rgb(240,240,240)",
            }}
          >
            <View
              style={{
                width: 90,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={minicar}
                resizeMode={"center"}
                style={{ width: 70, height: 30 }}
              />
            </View>
            <Text style={{ color: "black", flex: 1, fontSize: 20 }}>Go</Text>
            <Text style={{ color: "black" }}>
              Rs.{Math.trunc(distance * 45)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() =>
            setSelectedCar({
              type: 2,
              name: "Business",
            })
          }
        >
          <View
            style={{
              ...styles.dropOff,
              backgroundColor:
                selectedCar.type === 2 ? "orange" : "rgb(240,240,240)",
            }}
          >
            <View
              style={{
                width: 90,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={business}
                resizeMode={"center"}
                style={{ width: 80, height: 32 }}
              />
            </View>
            <Text style={{ color: "black", flex: 1, fontSize: 20 }}>
              Business
            </Text>
            <Text style={{ color: "black" }}>
              Rs.{Math.trunc(distance * 60)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => addRideInDb()}>
          <View
            style={{
              ...styles.dropOff,
              backgroundColor: "black",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white" }}>Confirm {selectedCar.name}</Text>
            {!spin ? (
              <IconButton icon="check" size={18} color="white" />
            ) : (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginLeft: 15 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

export default SelectCar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  directionMap: {
    flex: 1,
    backgroundColor: "black",
  },
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  carButton: {
    width: "100%",
    paddingHorizontal: 7,
  },
  dropOff: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    width: "100%",
    marginTop: 7,
    paddingRight: 10,
  },
  detail: {
    width: "100%",
    backgroundColor: "rgb(240,240,240)",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
