import react from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import { LogBox, View } from "react-native";

const Stack =createNativeStackNavigator();

LogBox.ignoreLogs([
    "Non - seriable values found"
])

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen 
                name="Home" 
                options={{
                    headerShown:false
                }}
                component={HomeScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
  }