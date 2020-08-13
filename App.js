
import React from 'react';
import { StyleSheet, Text, View,Image } from 'react-native';
import TransactionScreen from './screens/transactionscreen'
import SearchScreen from './screens/searchscreen'
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'


export default class App extends React.Component {
  render(){
  return (
  <AppContainer/>
  );
  }
}
 const Tabnavigator = createBottomTabNavigator({
   transaction:{screen:TransactionScreen},
   search:{screen:SearchScreen}
 },
 
  {
    defaultNavigationOptions:({navigation})=>({
      tabBarIcon:()=>{
      const routeName = navigation.state.routeName
      if(routeName==='transaction'){
        return(<Image source = {require('./assets/book.png')}
        style = {{width:50,height:50}}  />)
    
      }
      
      else if (routeName==="search") {
        return(
     <Image source = {require('./assets/searchingbook.png')} style = {{width:40,height:40}}  />
        )
      }
     }
   })} 
  );
 
 const AppContainer = createAppContainer(Tabnavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
