/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    AppState,
    TouchableOpacity,
} from 'react-native';

import {
    Colors,
    Header,
} from 'react-native/Libraries/NewAppScreen';

import {getAppVersion, getPromiseText} from "@/utils/native-util";
import CodePushStatusView, {CodePushOpenDebugEvent, CodePushSyncEvent} from '@/Component/CodePushStatusView'

class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            version: '',
            testText: '',
        }
    }

    async componentDidMount() {
        this._checkUpdate()

        this._checkUpdate()
        AppState.addEventListener('change', this._handleAppStateChange)

        const version = await getAppVersion()
        console.log('version:', version)
        const testText = await getPromiseText()
        this.setState({
            version,
            testText,
        })
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange)
    }

    _showCodePushView = () => {
        CodePushOpenDebugEvent()
    }

    _checkUpdate = () => {
        CodePushSyncEvent()
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState != null && nextAppState === 'active') {
            this._checkUpdate()
        }
    }

    render() {
        const {version, testText} = this.state
        const isDarkMode = false

        const backgroundStyle = {
            backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        }

        const render = (
            <SafeAreaView style={backgroundStyle}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={backgroundStyle}>
                    <TouchableOpacity
                        onLongPress={this._showCodePushView}
                    >
                        <Header/>
                    </TouchableOpacity>
                    <View
                        style={{
                            backgroundColor: isDarkMode ? Colors.black : Colors.white,
                        }}>
                        <Section title="app版本号">
                            {version}
                        </Section>
                        <Section title="获取promise方法返回值">
                            {testText}
                        </Section>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
        return (
            <CodePushStatusView>{render}</CodePushStatusView>
        )
    }
}

const Section: React.FC<{
    title: string;
}> = ({children, title}) => {
    const isDarkMode = useColorScheme() === 'dark';
    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}>
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}>
                {children}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default App;
