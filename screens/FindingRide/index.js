import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  Image,
  AsyncStorage,
  Alert,
} from "react-native";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import {
  auth,
  getNearestDrivers,
  requestDriver,
  driverDb,
  currentRide,
  requestEndNull,
} from "../../config/firebase";
import MapView, { Marker } from "react-native-maps";
import carMarker from "../../assets/carMarker.png";
import marker from "../../assets/marker.png";
import { calcCrow } from "../SelectCar";

const FindingRide = ({ navigation, route: { params } }) => {
  const [findingText, setFindingText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accept, setAccept] = useState({ type: false, driverId: "" });
  const [inRange, setInRange] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  let mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });

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
      Alert.alert("Driver is in Range", "Ready to Ride");
    }
  }, [region, coordinates]);

  useEffect(() => {
    (async function () {
      const { latitude, longitude } = params;
      const center = [latitude, longitude];
      const radiusInM = 3000;

      const bounds = geohashQueryBounds(center, radiusInM);
      const promises = [];
      for (const b of bounds) {
        const q = getNearestDrivers(b);
        promises.push(q.get());
      }
      const snapshots = await Promise.all(promises);
      const matchingDocs = [];
      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const lat = doc.get("lat");
          const lng = doc.get("lng");
          const distanceInKm = distanceBetween([lat, lng], center);
          const distanceInM = distanceInKm * 1000;
          if (distanceInM <= radiusInM) {
            matchingDocs.push({ ...doc.data(), distanceInKm, docId: doc.id });
          }
        }
      }
      setFindingText(
        `${matchingDocs.length} driver found (Please wait for accept)`
      );
      requestDrivers(matchingDocs);
    })();
  }, []);

  const requestDrivers = (() => {
    let unsub;
    return async (matchingDocs, paramIndex) => {
      if (unsub) {
        unsub();
      }
      const _currentIndex = paramIndex || currentIndex;
      try {
        if (!matchingDocs[_currentIndex]) {
          setFindingText("No Driver Available For You!");
          return;
        }
        let userData;
        await auth.onAuthStateChanged((user) => {
          if (userData !== null) {
            userData = user;
          }
        });
        await requestDriver(matchingDocs[_currentIndex].docId, {
          userId: userData.uid,
          userName: userData.displayName,
          lat: params.latitude,
          lng: params.longitude,
          type: "request",
        });
        unsub = listenToRequestedDriver(
          matchingDocs[_currentIndex].docId,
          matchingDocs,
          paramIndex
        );
      } catch ({ message }) {
        console.log(message);
      }
    };
  })();

  const listenToRequestedDriver = (driverId, matchingDocs, paramIndex) => {
    const _paramsIndex = paramIndex || currentIndex;
    return driverDb()
      .doc(driverId)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (!data?.currentRequest) {
          setFindingText(
            `${_paramsIndex + 1} Driver Rejected! Finding another driver....`
          );
          requestDrivers(matchingDocs, _paramsIndex + 1);
          setCurrentIndex(_paramsIndex + 1);
        }
        if (data?.currentRequest?.type === "accepted") {
          setAccept({ type: true, driverId: driverId });
        }
        if (data?.currentRequest?.type === "start") {
          Alert.alert("Ride Start");
        }
        if (data?.currentRequest?.type === "end") {
          Alert.alert(
            "Ride End",
            ` Distance Km ${data.currentRequest.distance.toFixed(
              2
            )} \n Fare Pkr ${data.currentRequest.fare.toFixed(2)}`
          );
          requestEndNull(driverId);
          navigation.navigate("Home Map");
        }
      });
  };

  useEffect(() => {
    (async () => {
      try {
        if (accept.driverId) {
          await driverDb()
            .doc(accept.driverId)
            .onSnapshot((doc) => {
              const data = doc.data();
              if (data?.currentRequest?.type === "accepted") {
                setRegion({
                  ...region,
                  latitude: data.lat,
                  longitude: data.lng,
                });
              }
            });
        }
      } catch ({ message }) {
        console.error(message);
      }
    })();
  }, [accept]);

  useEffect(() => {
    (async () => {
      try {
        let userId;
        await auth.onAuthStateChanged((user) => {
          if (userId !== null) {
            userId = user.uid;
          }
        });

        await currentRide()
          .doc(userId)
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
            ]);
          });
      } catch ({ message }) {
        console.log(message);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {accept.type ? (
        <>
          {region.latitude !== null ? (
            <MapView
              style={styles.map}
              ref={(map) => {
                mapRef = map;
              }}
              onMapReady={() => {
                mapRef.fitToSuppliedMarkers(["mk1", "mk2"], {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                });
              }}
            >
              <Marker coordinate={region} title="Driver" description=" ">
                <Image source={carMarker} style={{ width: 50, height: 33 }} />
              </Marker>

              {coordinates.length > 0 && (
                <>
                  <Marker
                    coordinate={coordinates[0]}
                    title="PickUp"
                    description=""
                    identifier={"mk2"}
                  >
                    <Image source={marker} style={{ width: 47, height: 40 }} />
                  </Marker>
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
          ) : (
            <Text>Please Wait..</Text>
          )}
        </>
      ) : (
        <>
          {!findingText ? (
            <>
              <ActivityIndicator size="large" color="black" />
              <Text style={{ marginTop: 10 }}>Finding Ride</Text>
            </>
          ) : (
            <Text style={{ marginTop: 10 }}>{findingText}</Text>
          )}
        </>
      )}
    </View>
  );
};

export default FindingRide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
