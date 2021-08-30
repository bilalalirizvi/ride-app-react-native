import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Wallet = () => {
  return (
    <View style={styles.container}>
      <Text>Wallet</Text>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
