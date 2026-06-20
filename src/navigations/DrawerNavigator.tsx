import HomeScreen from '@/screens/HomeScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, View } from 'react-native';
import MainScreen from './MainScreen';

const Drawer = createDrawerNavigator();

function HomeScreenComponent() {
  return (
    <View>
      <Text>Home</Text>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="MainScreen" component={MainScreen} />
      {/* <Drawer.Screen name="Profile" component={ProfileScreen} /> */}
    </Drawer.Navigator>
  );
}