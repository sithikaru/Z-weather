import { StatusBar } from 'expo-status-bar';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from "../theme/index"

import { MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid"

import { useCallback, useState, useEffect } from 'react';

import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherimages } from '../constants';

import * as Progress from "react-native-progress";
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, setshowSearch] = useState(false);
  const [locations, setlocations] = useState([]);
  const [weather, setweather] = useState({});
  const [loading, setloading] = useState(true);

  const handleLocation = (loc) => {
    //console.log('location: ', loc)
    setlocations([])
    setshowSearch(false);
    setloading(true)
    storeData('city', loc.name);
    fetchWeatherForecast({
      cityName: loc.name,
    }).then(data => {
      setweather(data);
      setloading(false)
      //console.log("got forecast: ", data);
    })
  }

  const handleSearch = value => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then(data => {
        setlocations(data);
      })
    }
  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName= "Colombo";
    if(myCity) cityName=myCity;
    fetchWeatherForecast({
      cityName,
    }).then(data => {
      setweather(data);
      setloading(false);
    })

  }
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200, []))

  const { current, location } = weather;

  return (
    <View className="flex-1 relative bg-black">
      <StatusBar style="light" />
      <Image
        source={require("../assets/imgs/bg.png")}
        className="absolute h-full w-full opacity-80"
        blurRadius={120}
      />
{
      loading?(
        <View className="flex-1 flex-row justify-center items-center ">
          <Progress.Bar progress={0.3} width={300} color="#0bb3b2" indeterminate={true}/>
        </View>
      ):(
                <SafeAreaView className="flex flex-1 pt-10" >
                <View style={{ height: '7%' }} className="mx-4 relative z-50">
                  <View
                    className="flex-row justify-end items-center rounded-full"
                    style={{ backgroundColor: showSearch ? theme.bgwhite(0.2) : "transparent" }}>
                    {showSearch ? (
                      <TextInput
                        onChangeText={handleTextDebounce}
                        placeholder='Search City'
                        placeholderTextColor={"lightgray"}
                        className="pl-6 h-10 flex-1 text-base text-white pb-1"
                      />
                    ) : null
                    }

                    <TouchableOpacity
                      onPress={() => setshowSearch(!showSearch)}
                      style={{ backgroundColor: theme.bgwhite(0.3) }}
                      className="rounded-full p-3 m-1"
                    >
                      <MagnifyingGlassIcon color={"white"} size={25} />
                    </TouchableOpacity>
                  </View>
                  {
                    locations.length > 0 && showSearch ? (
                      <View className="absolute w-full bg-gray-300 top-16 rounded-3xl" >
                        {locations.map((loc, index) => {
                          let showBorder = index + 1 != locations.length;
                          let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : ''
                          return (
                            <TouchableOpacity
                              onPress={() => handleLocation(loc)}
                              key={index}
                              className={"flex-row items-center p-3 px-4 mb-1 " + borderClass}
                            >
                              <MapPinIcon size={20} color={"gray"} />
                              <Text className="text-black text-lg ml-2" >{loc?.name}, {loc?.country}</Text>
                            </TouchableOpacity>
                          )
                        })}

                      </View>
                    ) : null
                  }
                </View>

                <View className="mx-4 flex flex-1 justify-around mb-2" >
                  <Text className="text-white text-center text-2xl font-bold">
                    {location?.name},
                    <Text className="font-semibold text-gray-300"> {location?.country}</Text>
                  </Text>
                  <View className="flex-row justify-center">
                    <Image
                      source={weatherimages[current?.condition?.text]}
                      className="w-52 h-52"
                    />
                  </View>
                  <View className="space-y-2 ">
                    <Text className="text-white text-center text-6xl font-black ml-5" >
                      {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-gray-300 font-semibold text-center text-xl tracking-widest" >
                      {current?.condition?.text}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mx-4">
                    <View className="flex-rpw space-x-2 items-center">
                      <Image source={require("../assets/icons/wind.png")} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                    </View>

                    <View className="flex-rpw space-x-2 items-center">
                      <Image source={require("../assets/icons/drop.png")} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                    </View>

                    <View className="flex-rpw space-x-2 items-center">
                      <Image source={require("../assets/icons/sun.png")} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                    </View>

                  </View>
                </View>


                <View className="mb-2 space-y-3">
                  <View className="flex-row items-center mx-5 space-x-2" >
                    <CalendarDaysIcon size={22} color={"white"} />
                    <Text className="text-white text-base">Daily Forecast</Text>
                  </View>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    showsHorizontalScrollIndicator={false}
                    className="mb-5">

                    {
                      weather?.forecast?.forecastday?.map((item, index) => {
                        let date =new Date(item.date);
                        let options ={weekday: "long"};
                        let dayName= date.toLocaleDateString("en-US", options)
                        dayName=dayName.split(',')[0]
                        return (
                          <View
                          key={index}
                            className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                            style={{ backgroundColor: theme.bgwhite(0.15) }}>
                            <Image source={weatherimages[item?.day?.condition?.text]} className="h-11 w-11" />
                            <Text className="text-white">{dayName}</Text>
                            <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                          </View>
                        )
                      })
                    }


                  </ScrollView>


                </View>
              </SafeAreaView >
      )

}
    </View >
  );
}
