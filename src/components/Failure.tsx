import React from 'React';
import { StyleSheet, SafeAreaView, StatusBar, View } from 'react-native';
import { Icon, Text } from 'react-native-elements';

interface FailureProps {
  error: string;
}

const FailureView : React.FC<FailureProps> = ({error}) => (
  <>
    <StatusBar barStyle="default" />
    <SafeAreaView style={styles.container}>
      <View style={styles.containerText}>
        <Icon name="ios-bug" type="ionicon" size={50} color="blue" />
        <Text h4 style={{ textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    </SafeAreaView>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  containerText: {
    alignItems: 'center',
    alignContent: 'center',
    padding: 20,
  },
});

export default FailureView;
