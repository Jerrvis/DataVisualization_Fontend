interface Mapping {
  [name: string]: Function
}

export default class SocketService {
  static instance: SocketService | null = null
  ws: WebSocket | null
  callBackMapping: Mapping
  connected: boolean = false

  sendRetryCount = 0

  connectRetryCount = 0
  static get Instance() {
    if (this.instance == null) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  constructor() {
    this.ws = null
    this.callBackMapping = {}
  }

  connect() {
    if (!window.WebSocket) {
      return console.warn('浏览器暂不支持websocket')
    }
    this.ws = new WebSocket(import.meta.env.VITE_WS_Url)

    this.ws.onopen = () => {
      console.log('连接服务端成功')
      this.connected = true
      this.connectRetryCount = 0
    }

    this.ws.onclose = () => {
      console.log('连接服务端失败')
      this.connected = false
      setTimeout(() => {
        this.connectRetryCount++
        this.connect()
      }, 500 * this.connectRetryCount)
    }

    this.ws.onmessage = msg => {
      console.log(msg, 'agag')
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)

          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType].call(this, recvData)
        }
      }
    }
  }

  registerCallBack(str: string, callback: Function) {
    this.callBackMapping[str] = callback
  }

  unRegisterCallBack(str: string) {
    delete this.callBackMapping[str]
  }

  send(data: any) {
    if (this.ws !== null && this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else if (this.ws !== null) {
      setTimeout(() => {
        this.sendRetryCount++
        this.send(data)
      }, 500 * this.sendRetryCount)
    }
  }
}
