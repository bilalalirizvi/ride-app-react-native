import React from "react";
import { StyleSheet, Text, View } from "react-native";

const YourTrips = () => {
  return (
    <View style={styles.container}>
      <Text>Your Trips</Text>
    </View>
  );
};

export default YourTrips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
