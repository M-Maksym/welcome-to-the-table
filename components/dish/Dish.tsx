import React, { Component } from 'react';
import { Image, StyleSheet } from 'react-native';

interface DishProps {
  imageSources: object[];
}

interface DishState {
  selectedImage: object;
}

export default class Dish extends Component<DishProps, DishState> {
  constructor(props: DishProps) {
    super(props);
    const randomIndex = Math.floor(Math.random() * props.imageSources.length);
    this.state = {
      selectedImage: props.imageSources[randomIndex],
    };
  }

  render() {
    const { selectedImage } = this.state;

    return <Image source={selectedImage} style={styles.dishImage} />;
  }
}

const styles = StyleSheet.create({
  dishImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});
