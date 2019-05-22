import React from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { WebView } from './app/shared/components/HtmlView';

type Props = {};
export default class App extends React.Component<Props> {
  render() {
    return <WebView />;
  }
}

// commit to master to test rebase 8:28
