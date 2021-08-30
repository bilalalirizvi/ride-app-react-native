import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import Login from "../../screens/Login";
import HomeScreen from "../../screens/HomeScreen";
import Profile from "../../screens/Profile";
import YourTrips from "../../screens/YourTrips";
import Help from "../../screens/Help";
import Wallet from "../../screens/Wallet";
import Settings from "../../screens/Settings";
import Messages from "../../screens/Messages";
import MakeMoneyDriving from "../../screens/MakeMoneyDriving";
import DropOff from "../../screens/DropOff";
import SelectCar from "../../screens/SelectCar";
import FindingRide from "../../screens/FindingRide";
import Driver from "../../screens/Driver";
import RideDetail from "../../screens/RideDetail";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [isSignedIn, setIsSignedIn] = useState({
    type: false,
    loginAs: "",
  });
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn.type ? (
          <Stack.Screen name="LoginScreen">
            {() => <Login setIsSignedIn={setIsSignedIn} />}
          </Stack.Screen>
        ) : (
          <>
            {isSignedIn.loginAs === "user" && (
              <Stack.Screen name="App" component={AppNavigator} />
            )}
            {isSignedIn.loginAs === "driver" && (
              <Stack.Screen name="App" component={DriverNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const AppNavigator = ({ navigation }) => {
  return (
    <Stack.Navigator
      // initialRouteName="SelectCar"
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 22,
        },
        headerLeft: () => (
          <Ionicons
            name={"chevron-back-outline"}
            color="white"
            size={30}
            onPress={() => {
              navigation.goBack();
            }}
            style={{ marginRight: 20 }}
          />
        ),
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Home Map"
        component={HomeScreen}
      />
      <Stack.Screen
        name="Profile"
        options={{
          title: "Edit Profile",
        }}
        component={Profile}
      />
      <Stack.Screen name="Your Trips" component={YourTrips} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen
        name="Settings"
        options={{
          title: "Account Settings",
        }}
        component={Settings}
      />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen
        name="MakeMoneyDriving"
        options={{
          title: "Ride",
        }}
        component={MakeMoneyDriving}
      />
      <Stack.Screen
        name="DropOff"
        options={{
          title: "Drop Off",
        }}
        component={DropOff}
      />
      <Stack.Screen
        name="SelectCar"
        options={{
          title: "Select Car",
        }}
        component={SelectCar}
      />
      <Stack.Screen
        name="FindingRide"
        options={{
          title: "Find and Ride",
        }}
        component={FindingRide}
      />
    </Stack.Navigator>
  );
};

const DriverNavigator = ({ navigation }) => {
  return (
    <Stack.Navigator
      initialRouteName="Driver"
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 22,
        },
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Driver"
        component={Driver}
      />
      <Stack.Screen
        // options={{ headerShown: false }}
        options={{ title: "Ride Detail" }}
        name="RideDetail"
        component={RideDetail}
      />
    </Stack.Navigator>
  );
};
