import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import { WebViewSourceHtml } from 'react-native-webview/lib/WebViewTypes';

type Props = {
  onHeightChange?: (height: string) => void;
  height?: number;
  // TODO: Source is currently hard-coded for proof of concept.
  // Eventually, it will be the Html source as coming from the API.
  source?: WebViewSourceHtml;
  // TODO: until the API is in place, we might want to pass in the message text and create
  // an 'html' file.
  text?: string;
};

class WebView extends Component<Props> {
  // The following private ref & 'run' are used if you want to injectjavascript.
  private webref: any = '';
  render() {
    const run = `
    const data = 'hello there!';
    window.ReactNativeWebView.postMessage(data);
      true;
    `;

    // Using this for injectedjavascript will return the window size - but it is
    // not reliable as the window may not have resized based on the content.
    const webViewScript = `
  setTimeout(function() {
    const height = JSON.stringify(window.outerHeight);
    window.ReactNativeWebView.postMessage(height);
  }, 3000);
  true; // note: this is required, or you'll sometimes get silent failures
`;

    // This is the code I want to get running - injecting it into the actual HTML file as
    // a script to run.  But the event listener never gets filed; even if I put in an
    // click, scroll, or other events.  This code has been tested for integrity in an
    // actual HTML file running in a browser (except the window message is replaced by
    // an alert.)
    const runFirst = `<html><head><script>
window.addEventListener('DOMContentLoaded', (e) => {
  const data = JSON.stringify(window.outerHeight);
  window.ReactNativeWebView.postMessage(data);
});
true;
</script></head><body>`;

    // This is proof of concept that the injected HTML script does work as it should.
    // The webview will receive the message appropriately at this point.
    const runSecond = `<html><head><script>
      const melissa = "Hellowww World!";
      window.ReactNativeWebView.postMessage(melissa);
      </script></head><body>`;
    // 'DOMContentLoaded'
    // 'DOM_complete'

    const myPage: WebViewSourceHtml = {
      html:
        runSecond +
        '<span style="font-family:Verdana; font-size:10pt; color:rgb(0,0,0);">This is message text.&nbsp; I am testing out the meditor.<br></span><div style="margin:auto auto auto auto; text-align:center;"><img src="data:image/jpg;base64,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" alt="document embedded image" title="document embedded image"></div><span style="font-family:Verdana; font-size:10pt; color:rgb(0,0,0);"><br></span><span style="font-family:Verdana; font-size:10pt; color:rgb(0,0,0);">www.google.com<br></span><span style="font-family:Verdana; font-size:10pt; color:rgb(0,0,0);"><br></span><span style="font-family:Verdana; font-size:10pt; font-weight:bold; color:rgb(0,0,0);">Bold<br></span><span style="font-family:Verdana; font-size:10pt; text-decoration:line-through; color:rgb(0,0,0);">Strikethrough<br></span><div style="text-align:center;"><table style="border-collapse:collapse; margin:0 auto auto auto; text-align:left; border:1px solid #666;" cellspacing="0"><tbody><tr><td style="border:1px solid #666; vertical-align:top; padding:2px 10px;"><span style="font-family:Verdana; font-size:10pt; text-decoration:line-through; color:rgb(0,0,0);">This is a table</span></td></tr><tr><td style="border:1px solid #666; vertical-align:top; padding:2px 10px;"><div style="text-align:center;"><span style="font-family:Verdana; font-size:10pt; color:rgb(0,0,0);">this is a table</span></div></td></tr></tbody></table></div>' +
        '</body></html>'
    };

    // setTimeout(() => {
    //   this.webref.injectJavaScript(runSecond);
    // }, 500);

    return (
      <View
        style={[
          styles.bodyContent,
          { height: this.props.height ? this.props.height : 400 }
        ]}
      >
        <RNWebView
          ref={r => (this.webref = r)}
          originWhitelist={['*']}
          source={this.props.source ? this.props.source : myPage}
          // note: setting this to false will enable pinch/zoom, but if set to true, this scales
          // the entire webview to fit the page, resulting in a very small initial view.
          scalesPageToFit={false}
          dataDetectorTypes={'link'}
          // onMessage={event => this.props.onHeightChange(event.nativeEvent.data)}
          onMessage={event => console.log(event.nativeEvent.data)}
          javaScriptEnabled={true}
          incognito={true}
          //         onLoadEnd={e => {
          //           if (this.webref) {
          //             this.webref.injectJavaScript(
          //               `window.ReactNativeWebView.postMessage
          //  ( JSON.stringify(document.documentElement.clientHeight))`
          //             );
          //           }
          //         }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContent: {
    padding: 16
  }
});

export { WebView };
