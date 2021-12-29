import React, { Component } from 'react'
import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
	DeviceEventEmitter,
	SafeAreaView,
	BackHandler,
	ScrollView,
} from 'react-native'
import CodePush from 'react-native-code-push'

const ignorePackageList = ['install']

const codePushOptions = {
	checkFrequency: CodePush.CheckFrequency.MANUAL,
}

const CodePushSyncEventKey = '_CodePushSyncEventKey'
const CodePushOpenDebugEventKey = '_CodePushOpenDebugEventKey'

export function CodePushSyncEvent() {
	DeviceEventEmitter.emit(CodePushSyncEventKey)
}

export function CodePushOpenDebugEvent() {
	DeviceEventEmitter.emit(CodePushOpenDebugEventKey)
}

export async function getAppVersion() {
	try {
		const nativeConfig = await CodePush.getConfiguration()
		if (!nativeConfig) return ''
		const { appVersion } = nativeConfig
		return `v${appVersion}`
	} catch (e) {
		return ''
	}
}

export async function getVersion() {
	try {
		const result = await CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
		if (!result) return '0'
		const { label } = result
		return label.replace('v', '')
	} catch (e) {
		return '0'
	}
}

export function Row(props) {
	const { title, content } = props
	return (
		<View style={styles.row}>
			<Text style={styles.rowTitle}>{String(title)}</Text>
			<Text style={styles.rowContent}>{String(content)}</Text>
		</View>
	)
}

class CodePushStatusView extends Component {
	constructor(props) {
		super(props)
		this.state = {
			buttons: [
				{
					title: '保存',
					onPress: this.applyUpdate,
				},
				{
					title: '后台更新',
					onPress: this.sync,
				},
				{
					title: '前台更新',
					onPress: this.syncImmediate,
				},
				{
					title: '包信息',
					onPress: this.getUpdateMetadata,
				},
			],
			showCodePush: false,
		}
	}

	componentDidMount = () => {
		this._pushEvent = DeviceEventEmitter.addListener(CodePushSyncEventKey, this.sync)
		this._debugEvent = DeviceEventEmitter.addListener(
			CodePushOpenDebugEventKey,
			this._onDebugPress,
		)
		BackHandler.addEventListener('hardwareBackPress', this._backAction)
	}

	componentWillUnmount = () => {
		this._pushEvent && this._pushEvent.remove()
		this._debugEvent && this._debugEvent.remove()
		BackHandler.removeEventListener('hardwareBackPress', this._backAction)
	}

	getUpdateMetadata = () => {
		CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING).then(
			(metadata) => {
				const syncMessage = 'Running binary version'
				const _getRowInfo = () => {
					if (!metadata || typeof metadata !== 'object') return ''

					return Object.entries(metadata).reduce((result, next) => {
						const key = next[0]
						if (!ignorePackageList.includes(key)) {
							result.push({
								title: key,
								content: next[1],
							})
						}
						return result
					}, [])
				}
				this.setState({
					syncMessage: metadata ? _getRowInfo(metadata) : syncMessage,
					progress: false,
				})
			},
			(error) => {
				this.setState({ syncMessage: `Error: ${error}`, progress: false })
			},
		)
	}

	sync = async () => {
		if (__DEV__) return
		const deploymentKey = await this._getDeploymentKey()
		if (!deploymentKey || deploymentKey === '') {
			this.setState({ syncMessage: 'No DeploymentKey Set', progress: false })
			return
		}
		CodePush.sync(
			{
				deploymentKey,
			},
			this._codePushStatusDidChange,
			this._codePushDownloadDidProgress,
		).catch((err) => {
			this.setState({ syncMessage: err.message, progress: false })
		})
	}

	syncImmediate = async () => {
		const deploymentKey = await this._getDeploymentKey()
		if (!deploymentKey || deploymentKey === '') {
			this.setState({ syncMessage: 'No DeploymentKey Set', progress: false })
			return
		}
		CodePush.sync(
			{
				installMode: CodePush.InstallMode.IMMEDIATE,
				updateDialog: true,
				deploymentKey,
			},
			this._codePushStatusDidChange,
			this._codePushDownloadDidProgress,
		).catch((err) => {
			this.setState({ syncMessage: err.message, progress: false })
		})
	}

	applyUpdate = () => {
		CodePush.restartApp(false)
	}

	_backAction = () => {
		const status = this.state.showCodePush
		if (status) {
			this.setState({
				showCodePush: false,
			})
		}
		return status
	}

	_codePushStatusDidChange = (syncStatus, msg) => {
		switch (syncStatus) {
			case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
				this.setState({ syncMessage: 'Checking for update.' })
				break
			case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
				this.setState({ syncMessage: 'Downloading package.' })
				break
			case CodePush.SyncStatus.AWAITING_USER_ACTION:
				this.setState({ syncMessage: 'Awaiting user action.' })
				break
			case CodePush.SyncStatus.INSTALLING_UPDATE:
				this.setState({ syncMessage: 'Installing update.' })
				break
			case CodePush.SyncStatus.UP_TO_DATE:
				this.setState({ syncMessage: 'App up to date.', progress: false })
				break
			case CodePush.SyncStatus.UPDATE_IGNORED:
				this.setState({ syncMessage: 'Update cancelled by user.', progress: false })
				break
			case CodePush.SyncStatus.UPDATE_INSTALLED:
				this.setState({
					syncMessage: 'Update installed and will be applied on restart.',
					progress: false,
				})
				break
			case CodePush.SyncStatus.UNKNOWN_ERROR:
				this.setState({ syncMessage: 'An unknown error occurred.', progress: false })
				break
			default:
				break
		}
	}

	_codePushDownloadDidProgress = (progress) => {
		this.setState({ progress })
	}

	_getDeploymentKey = async () => {
		const { deploymentKey } = this.props
		if (deploymentKey) return deploymentKey
		const result = await CodePush.getConfiguration()
		return result.deploymentKey
	}

	_onDebugPress = () => {
		this._switchStatus()
	}

	_switchStatus = () => {
		this.setState({
			showCodePush: !this.state.showCodePush,
		})
	}

	_renderButton = (item) => (
		<TouchableOpacity key={item.title} onPress={item.onPress}>
			<Text style={styles.button}>{item.title}</Text>
		</TouchableOpacity>
	)

	render() {
		const { syncMessage, progress } = this.state

		const codePushView = this.state.showCodePush ? (
			<SafeAreaView style={styles.codePushContainer}>
				<View style={styles.codePushContent}>
					<View style={styles.mainContent}>
						{this.state.buttons.map(this._renderButton)}
					</View>
					<ScrollView style={styles.showContent}>
						{progress && (
							<Text style={styles.messages}>
								{progress.receivedBytes} of {progress.totalBytes} bytes received
							</Text>
						)}
						{typeof syncMessage === 'string' && (
							<Text style={styles.messages}>{this.state.syncMessage || ''}</Text>
						)}
						{Array.isArray(syncMessage) &&
							syncMessage.map((sub, index) => (
								<Row key={index} title={sub.title} content={sub.content} />
							))}
					</ScrollView>
				</View>
				<TouchableOpacity style={styles.codePushCloseBtn} onPress={this._switchStatus}>
					<Text style={styles.codePushCloseBtnText}>关闭</Text>
				</TouchableOpacity>
			</SafeAreaView>
		) : null

		return (
			<View style={styles.containerWrapper}>
				<View style={styles.contentContainer}>
					{React.Children.map(this.props.children, (child) => child)}
				</View>
				{codePushView}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	containerWrapper: {
		flex: 1,
		position: 'relative',
	},
	codePushContainer: {
		backgroundColor: 'gray',
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	codePushContent: {
		flex: 1,
		marginTop: 50,
	},
	codePushCloseBtn: {
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	codePushCloseBtnText: {
		fontSize: 16,
		color: 'black',
	},
	mainContent: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	messages: {
		fontSize: 13,
		lineHeight: 20,
		padding: 10,
		textAlign: 'center',
	},
	button: {
		textAlign: 'center',
		color: 'blue',
		borderRadius: 5,
		fontSize: 17,
		borderWidth: 1,
		margin: 5,
		padding: 5,
	},
	contentContainer: {
		flex: 1,
		backgroundColor: 'white',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		marginTop: 15,
	},
	rowTitle: {
		width: 140,
	},
	rowContent: {
		flex: 1,
		marginLeft: 5,
	},
	showContent: {
		flex: 1,
	},
})

export default CodePush(codePushOptions)(CodePushStatusView)
